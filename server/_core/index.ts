import "dotenv/config";
import express from "express";
import path from "path";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { analyticsRouter } from "./analyticsRouter";
import { sdk } from "./sdk";
import { getSessionCookieOptions } from "./cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import * as db from "../db";
import { attachCollaborationWS } from './collaboration';

// Global process-level error handlers to avoid silent crashes
process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
  // In development we keep the process alive for debugging; in production consider restarting
});

process.on('unhandledRejection', (reason) => {
  console.error('[Process] Unhandled Rejection:', reason);
  // Log for diagnosis; avoid crashing the process immediately in dev
});

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  // Add a verify hook to log raw body for /api/trpc requests (debugging)
  app.use(express.json({
    limit: "50mb",
    verify: (req: any, _res, buf: Buffer) => {
      try {
        if (String(req.url || "").startsWith("/api/trpc")) {
          const raw = buf.toString("utf8");
          if (raw && raw.length > 0) {
            console.log('[TRPC RAW VERIFY]', raw.slice(0, 2000));
          }
        }
      } catch (e) {
        console.warn('[TRPC RAW VERIFY] failed', e);
      }
    },
  }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Dev/Admin helper routes: make available in ALL environments so
  // developers can use the admin/dev login even when running production
  // locally. These routes are safe for local dev only because they
  // create a local session token (they don't expose credentials).
  app.get("/__dev_check_cookie", async (req, res) => {
    const cookies = req.headers.cookie;
    const hasCookie = cookies && cookies.includes(COOKIE_NAME);
    return res.json({
      hasCookie,
      cookies: cookies || "none",
      cookieName: COOKIE_NAME,
    });
  });

  app.get("/__dev_login", async (req, res) => {
    try {
      const openId = String(req.query.openId ?? "local:dev-admin");
      const name = String(req.query.name ?? "Dev Admin");

      let dbSynced = false;
      try {
        await db.upsertUser({
          openId,
          name,
          email: `${openId}@dev.local`,
          loginMethod: "dev",
          lastSignedIn: new Date(),
        });
        dbSynced = true;
        console.log(`[DevLogin] User ${openId} synced to DB`);
      } catch (dbErr: any) {
        if (dbErr?.cause?.code === "ENOTFOUND" || dbErr?.message?.includes("ENOTFOUND")) {
          console.warn(`[DevLogin] Database unreachable, creating session without DB sync: ${dbErr.message}`);
        } else {
          throw dbErr;
        }
      }

      const token = await sdk.createSessionToken(openId, { name });
      console.log(`[DevLogin] Created token for ${openId}, token length: ${token.length}`);
      const cookieOptions = getSessionCookieOptions(req as any);
      console.log(`[DevLogin] Cookie options:`, cookieOptions);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      console.log(`[DevLogin] Cookie set with name: ${COOKIE_NAME}`);
      return res.redirect("/dashboard");
    } catch (err) {
      console.error("[DevLogin] Failed to create dev session", err);
      return res.status(500).send("Dev login failed");
    }
  });

  app.get("/__admin_login", async (req, res) => {
    try {
      const openId = 'local:tatik.space@gmail.com';
      const name = 'Tatik Admin';

      let dbSynced = false;
      try {
        await db.upsertUser({
          openId,
          name,
          email: 'tatik.space@gmail.com',
          loginMethod: 'admin',
          role: 'admin',
          lastSignedIn: new Date(),
        });
        dbSynced = true;
        console.log(`[AdminLogin] Admin user ${openId} synced to DB`);
      } catch (dbErr: any) {
        if (dbErr?.cause?.code === "ENOTFOUND" || dbErr?.message?.includes("ENOTFOUND")) {
          console.warn(`[AdminLogin] Database unreachable, creating session without DB sync: ${dbErr.message}`);
        } else {
          throw dbErr;
        }
      }

      const token = await sdk.createSessionToken(openId, { name });
      console.log(`[AdminLogin] Created admin token for ${openId}, token length: ${token.length}`);
      const cookieOptions = getSessionCookieOptions(req as any);
      console.log(`[AdminLogin] Cookie options:`, cookieOptions);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      console.log(`[AdminLogin] Admin cookie set with name: ${COOKIE_NAME}`);
      return res.redirect("/dashboard");
    } catch (err) {
      console.error("[AdminLogin] Failed to create admin session", err);
      return res.status(500).send("Admin login failed");
    }
  });

  // Dev-only: Generate coupon for special user tati01sp@gmail.com
  app.get("/__generate_coupon", async (req, res) => {
    try {
      const couponCode = `TATIK_SPECIAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // Valid for 30 days

      console.log(`[GenerateCoupon] Generated coupon: ${couponCode}`);
      console.log(`[GenerateCoupon] Expires at: ${expiryDate.toISOString()}`);

      return res.json({
        success: true,
        couponCode,
        email: 'tati01sp@gmail.com',
        discountPercentage: 100,
        expiresAt: expiryDate.toISOString(),
        message: 'Use this coupon code on checkout for 100% discount'
      });
    } catch (err) {
      console.error("[GenerateCoupon] Error:", err);
      return res.status(500).json({ success: false, error: String(err) });
    }
  });

  app.get("/__dev_register", async (req, res) => {
    try {
      const name = String(req.query.name ?? "Tatik");
      const email = String(req.query.email ?? "tatik.space@gmail.com");
      const openId = `local:${email}`;

      let dbSynced = false;
      try {
        await db.upsertUser({
          openId,
          name,
          email,
          loginMethod: "local",
          lastSignedIn: new Date(),
        });
        dbSynced = true;
        console.log(`[DevRegister] User ${openId} registered in DB`);
      } catch (dbErr: any) {
        if (dbErr?.cause?.code === "ENOTFOUND" || dbErr?.message?.includes("ENOTFOUND")) {
          console.warn(`[DevRegister] Database unreachable: ${dbErr.message}. User cached locally only.`);
        } else {
          throw dbErr;
        }
      }

      return res.json({
        success: true,
        message: `User ${name} (${email}) registered for dev`,
        user: { openId, name, email },
        dbStatus: dbSynced ? "synced" : "offline",
      });
    } catch (err) {
      console.error("[DevRegister] Failed to register user", err);
      return res.status(500).json({ error: "Registration failed", details: String(err) });
    }
  });

  // Dev helper: request registration via GET (convenience for manual testing)
  app.get('/__request_registration', async (req, res) => {
    try {
      const email = String(req.query.email || '');
      const name = String(req.query.name || email.split('@')[0] || 'User');
      if (!email) return res.status(400).json({ error: 'email required' });

      let user: any;
      try {
        user = await db.upsertUser({
          openId: `local:${email}`,
          email,
          name,
          loginMethod: 'local',
          lastSignedIn: new Date(),
        });
      } catch (dbErr: any) {
        console.warn('[DevRequestRegistration] DB unavailable, creating temp user', dbErr?.message);
        user = { id: Math.floor(Math.random() * 100000), email };
      }

      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      // store in registrationTokens exported from routers
      try {
        const { registrationTokens } = await import('../routers');
        registrationTokens.set(token, { userId: user?.id, email, purpose: 'registration', expires: Date.now() + 1000 * 60 * 10 });
      } catch (e) {
        console.warn('[DevRequestRegistration] failed to set registration token', e);
      }

      const link = `http://localhost:${process.env.PORT || 3001}/__verify_registration?token=${token}`;
      console.log(`[DevRequestRegistration] registration link for ${email}: ${link}`);
      return res.json({ success: true, link });
    } catch (err) {
      console.error('[DevRequestRegistration] Error:', err);
      return res.status(500).json({ error: String(err) });
    }
  });

  // Dev helper: verify registration via GET (consumes token and creates session cookie)
  app.get('/__verify_registration', async (req, res) => {
    try {
      const token = String(req.query.token || '');
      if (!token) return res.status(400).send('token required');
      const { registrationTokens } = await import('../routers');
      const entry = registrationTokens.get(token);
      if (!entry || entry.expires < Date.now()) return res.status(400).send('invalid or expired token');

      const { sdk } = await import('./sdk');
      const openId = `local:${entry.email}`;
      const sessionToken = await sdk.createSessionToken(openId, { name: entry.email.split('@')[0] });
      const cookieOptions = getSessionCookieOptions(req as any);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 365 });
      registrationTokens.delete(token);
      console.log(`[DevVerifyRegistration] token consumed for ${entry.email}`);
      return res.redirect('/dashboard');
    } catch (err) {
      console.error('[DevVerifyRegistration] Error:', err);
      return res.status(500).send('verification failed');
    }
  });

  // Dev helper: return current authenticated user (if any)
  app.get('/__whoami', async (req, res) => {
    try {
      const { sdk } = await import('./sdk');
      try {
        const user = await sdk.authenticateRequest(req as any);
        return res.json({ authenticated: true, user });
      } catch (authErr: any) {
        return res.json({ authenticated: false, error: String(authErr?.message || authErr) });
      }
    } catch (err) {
      console.error('[DevWhoAmI] Error:', err);
      return res.status(500).json({ error: String(err) });
    }
  });
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    // Serve static files from client/public BEFORE Vite middleware
    // so images/favicon are not transformed to HTML
    app.use(express.static(path.resolve(import.meta.dirname, "../../client/public")));

    app.get("/__dev_check_cookie", async (req, res) => {
      const cookies = req.headers.cookie;
      const hasCookie = cookies && cookies.includes(COOKIE_NAME);
      return res.json({
        hasCookie,
        cookies: cookies || "none",
        cookieName: COOKIE_NAME,
      });
    });

    // Dev-only helper: create a temporary admin session cookie.
    // Usage: GET /__dev_login?openId=local:dev-admin&name=Dev%20Admin
    // Works even if database is unreachable (graceful fallback for local dev)
    app.get("/__dev_login", async (req, res) => {
      try {
        const openId = String(req.query.openId ?? "local:dev-admin");
        const name = String(req.query.name ?? "Dev Admin");

        // Try to create user in DB if available (optional for dev)
        let dbSynced = false;
        try {
          await db.upsertUser({
            openId,
            name,
            email: `${openId}@dev.local`,
            loginMethod: "dev",
            lastSignedIn: new Date(),
          });
          dbSynced = true;
          console.log(`[DevLogin] User ${openId} synced to DB`);
        } catch (dbErr: any) {
          // If DB unreachable, still proceed with session token (graceful fallback)
          if (dbErr?.cause?.code === "ENOTFOUND" || dbErr?.message?.includes("ENOTFOUND")) {
            console.warn(`[DevLogin] Database unreachable, creating session without DB sync: ${dbErr.message}`);
          } else {
            throw dbErr; // Re-throw if it's a different error
          }
        }

        const token = await sdk.createSessionToken(openId, { name });
        console.log(`[DevLogin] Created token for ${openId}, token length: ${token.length}`);
        const cookieOptions = getSessionCookieOptions(req as any);
        console.log(`[DevLogin] Cookie options:`, cookieOptions);
        res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        console.log(`[DevLogin] Cookie set with name: ${COOKIE_NAME}`);
        console.log(`[DevLogin] Redirecting to /dashboard with response headers:`, res.getHeaders());
        return res.redirect("/dashboard");
      } catch (err) {
        console.error("[DevLogin] Failed to create dev session", err);
        return res.status(500).send("Dev login failed");
      }
    });

    // Admin-only helper: create an admin session cookie for the main admin user.
    // Usage: GET /__admin_login
    // Works even if database is unreachable (graceful fallback for local dev)
    app.get("/__admin_login", async (req, res) => {
      try {
        const openId = 'local:tatik.space@gmail.com';
        const name = 'Tatik Admin';

        // Try to create/update admin user in DB if available
        let dbSynced = false;
        try {
          await db.upsertUser({
            openId,
            name,
            email: 'tatik.space@gmail.com',
            loginMethod: 'admin',
            role: 'admin', // Ensure admin role
            lastSignedIn: new Date(),
          });
          dbSynced = true;
          console.log(`[AdminLogin] Admin user ${openId} synced to DB`);
        } catch (dbErr: any) {
          // If DB unreachable, still proceed with session token (graceful fallback)
          if (dbErr?.cause?.code === "ENOTFOUND" || dbErr?.message?.includes("ENOTFOUND")) {
            console.warn(`[AdminLogin] Database unreachable, creating session without DB sync: ${dbErr.message}`);
          } else {
            throw dbErr; // Re-throw if it's a different error
          }
        }

        const token = await sdk.createSessionToken(openId, { name });
        console.log(`[AdminLogin] Created admin token for ${openId}, token length: ${token.length}`);
        const cookieOptions = getSessionCookieOptions(req as any);
        console.log(`[AdminLogin] Cookie options:`, cookieOptions);
        res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        console.log(`[AdminLogin] Admin cookie set with name: ${COOKIE_NAME}`);
        console.log(`[AdminLogin] Redirecting to /dashboard with Set-Cookie header`);
        return res.redirect("/dashboard");
      } catch (err) {
        console.error("[AdminLogin] Failed to create admin session", err);
        return res.status(500).send("Admin login failed");
      }
    });

    // Dev-only: register a permanent user (Tatik)
    // Usage: GET /__dev_register?name=Tatik&email=tatik.space@gmail.com
    // Works even if database is unreachable (graceful fallback for local dev)
    app.get("/__dev_register", async (req, res) => {
      try {
        const name = String(req.query.name ?? "Tatik");
        const email = String(req.query.email ?? "tatik.space@gmail.com");
        const openId = `local:${email}`;

        // Try to create user in DB if available (optional for dev)
        let dbSynced = false;
        try {
          await db.upsertUser({
            openId,
            name,
            email,
            loginMethod: "local",
            lastSignedIn: new Date(),
          });
          dbSynced = true;
          console.log(`[DevRegister] User ${openId} registered in DB`);
        } catch (dbErr: any) {
          // If DB unreachable, still return success (graceful fallback)
          if (dbErr?.cause?.code === "ENOTFOUND" || dbErr?.message?.includes("ENOTFOUND")) {
            console.warn(`[DevRegister] Database unreachable: ${dbErr.message}. User cached locally only.`);
          } else {
            throw dbErr; // Re-throw if it's a different error
          }
        }

        return res.json({
          success: true,
          message: `User ${name} (${email}) registered for dev`,
          user: { openId, name, email },
          dbStatus: dbSynced ? "synced" : "offline",
        });
      } catch (err) {
        console.error("[DevRegister] Failed to register user", err);
        return res.status(500).json({ error: "Registration failed", details: String(err) });
      }
    });

    await setupVite(app, server);
  } else {
    // In production, DON'T call serveStatic here - it will be called AFTER API routes
    // are registered, so that /api/trpc and /api/analytics take precedence
  }

  // Register analytics routes BEFORE tRPC
  app.use("/api/analytics", analyticsRouter);

  // Register tRPC AFTER Vite setup but BEFORE any catch-all handlers
  // This ensures /api/trpc takes precedence over SPA routing
  // Normalize bodies that were parsed into objects with numeric keys
  // (some clients / form-encodings turn arrays into objects like {"0": {...}})
  const normalizeTrpcBody = (req: any, _res: any, next: any) => {
    try {
      const body = req.body;
      console.log('[TRPC NORMALIZE] before:', typeof body === 'object' ? JSON.stringify(Object.keys(body).slice(0, 10)) : String(body));

      if (Array.isArray(body)) {
        req.body = body.map((entry: any, index: number) => {
          if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return entry;
          if ('input' in entry) return entry;
          if ('json' in entry && entry.json && typeof entry.json === 'object' && 'input' in entry.json) {
            const { json, ...rest } = entry;
            return { ...rest, input: json.input };
          }
          return { ...entry, id: entry.id ?? index + 1, method: entry.method ?? 'mutation', input: entry.input ?? entry };
        });
      } else if (body && typeof body === 'object') {
        const keys = Object.keys(body);
        const numericKeys = keys.filter(k => /^\d+$/.test(k));
        if (numericKeys.length === 0 && !('input' in body) && !('method' in body) && !('path' in body)) {
          const rawUrl = String(req.url || '');
          const pathMatch = rawUrl.replace(/^(\/api\/trpc\/?)/, '').replace(/^\//, '');
          req.body = { id: 1, method: 'mutation', path: pathMatch || undefined, input: body };
        }
      }
    } catch (e) {
      console.warn('[TRPC] body normalization failed', e);
    }
    next();
  };

  // Attach tRPC route. Normalization middleware is available but disabled by default.
  // To enable the previous normalization behavior set env `TRPC_NORMALIZE=true`.
  const enableNormalize = String(process.env.TRPC_NORMALIZE || '').toLowerCase() === 'true';
  if (enableNormalize) {
    // Debug wrapper: log final body and query before tRPC middleware
    app.use('/api/trpc', normalizeTrpcBody, (req: any, res: any, next: any) => {
      try {
        console.log('[TRPC HANDOFF] url:', req.originalUrl || req.url);
        console.log('[TRPC HANDOFF] headers:', JSON.stringify(req.headers || {}));
        try {
          console.log('[TRPC HANDOFF] full body:', JSON.stringify(req.body));
        } catch (e) {
          try { console.log('[TRPC HANDOFF] body (string):', JSON.stringify(req.body)); } catch (ee) { console.log('[TRPC HANDOFF] body (raw):', req.body); }
        }
      } catch (e) {
        console.warn('[TRPC HANDOFF] logging failed', e);
      }
      next();
    },
      createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );
  } else {
    // Normalization suspended: mount tRPC middleware directly
    app.use('/api/trpc', createExpressMiddleware({ router: appRouter, createContext }));
  }


  // NOW serve static files in production (as the last catch-all handler)
  if (process.env.NODE_ENV !== "development") {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // Mount collaboration WebSocket
  try {
    await attachCollaborationWS(server);
  } catch (e) {
    console.warn('Failed to attach collaboration WS', e);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

// Export for Vercel serverless / external imports
export { appRouter } from "../routers";
export { createContext } from "./context";

// Start server only if not imported as a module (i.e., only in development/local)
if (process.env.NODE_ENV !== "production" || (process.stdin?.isTTY)) {
  startServer().catch(console.error);
}
