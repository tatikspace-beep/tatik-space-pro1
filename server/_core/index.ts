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
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import * as db from "../db";
import { attachCollaborationWS } from './collaboration';

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
    serveStatic(app);
  }

  // Register analytics routes BEFORE tRPC
  app.use("/api/analytics", analyticsRouter);

  // Register tRPC AFTER Vite setup but BEFORE any catch-all handlers
  // This ensures /api/trpc takes precedence over SPA routing
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

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

startServer().catch(console.error);
