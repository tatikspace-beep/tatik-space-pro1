import { safeReturnPath } from "../shared/authRedirect";
import { COOKIE_NAME } from "../shared/const";

console.log("[Server] Routers loaded - using relative imports (cache bust - no errors)...");

// simple in-memory store for password reset tokens and registration tokens; production should persist
const passwordResetTokens: Map<string, { userId: number; expires: number }> = new Map();
export const registrationTokens: Map<string, { userId?: number; email: string; name?: string; purpose: 'registration' | 'access'; expires: number }> = new Map();
import crypto from 'crypto';
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { pricingRouter } from "./_core/pricingRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import {
  marketplaceBalanceEntries,
  marketplaceDisputes,
  marketplaceListingFiles,
  marketplaceListings,
  marketplaceOrders,
  marketplaceReviews,
  marketplaceSellers,
  schoolPrograms,
  schoolInvites,
  schoolMembers,
  schoolAuditEvents,
  templatePurchases,
  users,
} from "../drizzle/schema";
import { eq, gt, and, or, desc, gte, lte, isNull, sql } from "drizzle-orm";
import { hashPassword, isAdminEmail, isStaffUser, normalizeEmail, verifyPassword } from "./auth-utils";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { createSignedEmailAccessToken, verifySignedEmailAccessToken } from "./email-access-token";
import { scanMarketplaceTemplate } from "./marketplace-scan";
import { hasActiveSchoolAccess } from "./school-access";

async function sendAuthEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email delivery is not configured');
    }
    console.log(`[Auth email development fallback] to=${to} subject=${subject}\n${text}`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!response.ok) throw new Error(`Email delivery failed (${response.status})`);
}

function authBaseUrl() {
  return process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
}
const MARKETPLACE_COMMISSION_RATE = 0.15;
const MAX_MARKETPLACE_UPLOAD_BYTES = 2 * 1024 * 1024;
const MARKETPLACE_SELLER_TERMS_VERSION = "2026-09-30-screening-v1";

const SCHOOL_TERMS_VERSION = "2026-09-15";
const SCHOOL_INVITE_DAYS = 7;

function hashSchoolInviteToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}


export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  pricing: pricingRouter,
  auth: router({
    me: publicProcedure.query(async opts => {
      console.log(`[Auth.me] Query called, user: ${opts.ctx.user?.email || 'not authenticated'}`);
      if (!opts.ctx.user) return null;
      const schoolAccess = await hasActiveSchoolAccess(opts.ctx.user.id);
      return { ...opts.ctx.user, isStaff: isStaffUser(opts.ctx.user), hasProAccess: isStaffUser(opts.ctx.user) || schoolAccess };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      (ctx.res as any).clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
      }))
      .mutation(async ({ input, ctx }) => {
        const { sdk } = await import("./_core/sdk");

        try {
          if (process.env.ENABLE_LEGACY_PASSWORD_AUTH !== 'true') {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Use the email access code' });
          }
          const normalizedEmail = normalizeEmail(input.email);
          console.log(`[Auth Login] Attempting login - email: ${normalizedEmail}`);

          const hostHeader = String(ctx.req.headers.host || '') || '';
          const allowDevLogin = process.env.NODE_ENV === 'development'
            || hostHeader.includes('localhost')
            || hostHeader.includes('127.0.0.1')
            || hostHeader.includes('::1')
            || process.env.ALLOW_DEV_ADMIN === 'true';
          const isAdminRequest = isAdminEmail(normalizedEmail);
          const loginRole: "user" | "admin" = isAdminRequest ? "admin" : "user";

          let user: any;
          try {
            user = await db.getUserByEmail(normalizedEmail);
          } catch (getUserErr: any) {
            console.error(`[Auth Login] getUserByEmail failed: ${(getUserErr as any).message}`, getUserErr);
            user = null;
          }

          if (!user) {
            console.log(`[Auth Login] User not found, creating new user for ${normalizedEmail}`);
            const newUser = {
              openId: `local:${normalizedEmail}`,
              email: normalizedEmail,
              name: normalizedEmail.split('@')[0],
              password: hashPassword(input.password),
              loginMethod: 'local',
              role: loginRole,
              lastSignedIn: new Date(),
            };
            try {
              user = await db.upsertUser(newUser);
            } catch (dbError: any) {
              console.warn('[Auth Login] Database unavailable, using fallback:', dbError?.message);
              user = {
                ...newUser,
                id: Math.floor(Math.random() * 100000),
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            }
          }

          if (user.password && !verifyPassword(input.password, user.password)) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: 'Credenziali non valide',
            });
          }

          if (isAdminRequest || user.role === 'admin') {
            const adminUser = await db.upsertUser({
              openId: user.openId || `local:${normalizedEmail}`,
              name: user.name || 'Admin',
              email: normalizedEmail,
              loginMethod: user.loginMethod || 'admin',
              role: 'admin',
              password: user.password || hashPassword(input.password),
              lastSignedIn: new Date(),
            });
            user = adminUser ?? user;
          }

          let twoFactorSettings: any;
          try {
            twoFactorSettings = await db.getTwoFactorSettings(user.id);
            console.log(`[Auth Login] 2FA settings retrieved for user ${user.id}`);
          } catch (twoFaErr: any) {
            console.warn(`[Auth Login] Failed to get 2FA settings: ${(twoFaErr as any).message}`);
            twoFactorSettings = null;
          }

          try {
            console.log(`[Auth Login] Creating session token for user ${user.id}`);
            const openId = user.openId || `local:${normalizedEmail}`;
            const token = await sdk.createSessionToken(openId, { name: user.name || (isAdminRequest ? 'Admin' : undefined) });
            console.log(`[Auth Login] Token created, length: ${token.length}`);

            const cookieOptions = getSessionCookieOptions(ctx.req);
            (ctx.res as any).cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 365 });
            console.log(`[Auth Login] Token cookie set for ${normalizedEmail}`);
          } catch (stdTokenErr: any) {
            console.error(`[Auth Login] Token creation failed: ${(stdTokenErr as any).message}`, stdTokenErr);
            throw stdTokenErr;
          }

          const responseObject = { success: true, requires2fa: twoFactorSettings?.enabled === 1, user: { id: user.id, name: user.name, email: user.email, role: user.role || loginRole } };
          console.log(`[Auth Login] Login successful, returning:`, JSON.stringify(responseObject));
          return responseObject;
        } catch (err: any) {
          const errMsg = (err as any).message || String(err);
          console.error(`[Auth Login] MUTATION ERROR (caught at outer level): ${errMsg}`, err);
          throw new TRPCError({
            code: err instanceof TRPCError ? err.code : 'INTERNAL_SERVER_ERROR',
            message: errMsg,
          });
        }
      }),
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        // find user
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          // don't reveal missing email
          return { success: true };
        }
        const token = Math.random().toString(36).substring(2) + Date.now();
        // store token in memory map with expiration
        // token valid for 10 minutes
        passwordResetTokens.set(token, { userId: user.id, expires: Date.now() + 1000 * 60 * 10 });
        const link = `https://your-app.com/profile?reset=${token}`;
        // In real app send email with link containing token
        console.log(`[Auth] password reset link: ${link}`);
        return { success: true, link };
      }),

    resetPassword: publicProcedure
      .input(z.object({ token: z.string(), newPassword: z.string().min(8) }))
      .mutation(async ({ input }) => {
        const entry = passwordResetTokens.get(input.token);
        if (!entry || entry.expires < Date.now()) {
          throw new Error('Invalid or expired token');
        }
        // Here we'd hash the password; placeholder:
        const hashed = input.newPassword;
        await db.updatePassword(entry.userId, hashed);
        passwordResetTokens.delete(input.token);
        return { success: true };
      }),

    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
      }))
      .mutation(async ({ input }) => {
        try {
          if (process.env.ENABLE_LEGACY_PASSWORD_AUTH !== 'true') {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Use the email access code' });
          }
          const normalizedEmail = normalizeEmail(input.email);
          const hashedPassword = hashPassword(input.password);
          const role = isAdminEmail(normalizedEmail) ? 'admin' : 'user';

          let newUser: any;
          try {
            newUser = await db.upsertUser({
              openId: `local:${normalizedEmail}`,
              email: normalizedEmail,
              name: input.name,
              password: hashedPassword,
              loginMethod: 'local',
              role,
              lastSignedIn: new Date(),
            });
          } catch (dbError: any) {
            console.warn('[Auth Register] Database unavailable, using fallback:', (dbError as any).message);
            newUser = {
              id: Math.floor(Math.random() * 100000),
              openId: `local:${normalizedEmail}`,
              email: normalizedEmail,
              name: input.name,
              password: hashedPassword,
              loginMethod: 'local',
              role,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastSignedIn: new Date(),
            };
          }

          return {
            success: true,
            message: 'Utente registrato con successo',
            user: {
              id: newUser?.id,
              name: newUser?.name,
              email: newUser?.email,
              role,
            }
          };
        } catch (err: any) {
          console.error('[Auth Register] Error:', err);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message || 'Errore durante la registrazione',
          });
        }
      }),
    // New flow: request registration token by email. Server creates or upserts a user record
    // and sends a time-limited token (logged here) valid for 10 minutes.
    requestRegistration: publicProcedure
      .input(z.object({ email: z.string().email(), name: z.string().optional(), redirectTo: z.string().max(2048).optional() }))
      .mutation(async ({ input }) => {
        try {
          const normalizedEmail = normalizeEmail(input.email);

          // Create or ensure user exists (no password yet)
          let user: any;
          try {
            user = await db.upsertUser({
              openId: `local:${normalizedEmail}`,
              email: normalizedEmail,
              name: input.name ?? normalizedEmail.split('@')[0],
              loginMethod: 'local',
              lastSignedIn: new Date(),
            });
          } catch (dbErr: any) {
            console.warn('[Auth requestRegistration] DB unavailable, creating temporary entry', dbErr?.message);
            user = { id: Math.floor(Math.random() * 100000), email: normalizedEmail };
          }

          // Generate secure token and save (10 minutes)
          const token = crypto.randomBytes(32).toString('hex');
          registrationTokens.set(token, { userId: user?.id, email: normalizedEmail, name: input.name, purpose: 'registration', expires: Date.now() + 1000 * 60 * 10 });

          const returnTo = safeReturnPath(input.redirectTo);
          const link = `${authBaseUrl()}/complete-registration?token=${encodeURIComponent(token)}&next=${encodeURIComponent(returnTo)}`;
          await sendAuthEmail(
            normalizedEmail,
            'Complete your Tatik Space registration',
            `Open this link within 10 minutes to complete your registration:\n${link}`,
          );

          return { success: true, message: 'Registration token generated', link };
        } catch (err: any) {
          console.error('[Auth requestRegistration] Error:', err);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate registration token' });
        }
      }),

    completeRegistration: publicProcedure
      .input(z.object({ token: z.string(), password: z.string().min(8) }))
      .mutation(async ({ input, ctx }) => {
        const entry = registrationTokens.get(input.token);
        if (!entry || entry.purpose !== 'registration' || entry.expires < Date.now()) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired registration token' });
        }

        const user = await db.getUserByEmail(entry.email);
        if (!user?.id) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Registration record not found' });
        await db.updatePassword(user.id, hashPassword(input.password));

        const { sdk } = await import('./_core/sdk');
        const sessionToken = await sdk.createSessionToken(`local:${entry.email}`, { name: entry.name || entry.email.split('@')[0] });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        (ctx.res as any).cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 365 });
        registrationTokens.delete(input.token);
        return { success: true };
      }),

    requestAccessCode: publicProcedure
      .input(z.object({ email: z.string().trim().email(), redirectTo: z.string().max(2048).optional() }))
      .mutation(async ({ input }) => {
        const normalizedEmail = normalizeEmail(input.email);
        const user = await db.getUserByEmail(normalizedEmail);
        if (user) {
          const token = await createSignedEmailAccessToken(normalizedEmail);
          const returnTo = safeReturnPath(input.redirectTo);
          const link = `${authBaseUrl()}/access?token=${encodeURIComponent(token)}&next=${encodeURIComponent(returnTo)}`;
          await sendAuthEmail(normalizedEmail, 'Your Tatik Space access link', `Open this link within 10 minutes to access your account:\n${link}`);
        }
        return { success: true };
      }),

    verifyAccessCode: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input, ctx }) => {
        let entry;
        try {
          entry = await verifySignedEmailAccessToken(input.token);
        } catch {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired access token" });
        }
        const user = await db.getUserByEmail(entry.email);
        if (!user) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired access token" });
        }
        const { sdk } = await import('./_core/sdk');
        const sessionToken = await sdk.createSessionToken(user.openId || `local:${entry.email}`, { name: user.name || entry.email.split('@')[0] });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        (ctx.res as any).cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 365 });
        return { success: true };
      }),

    verifyRegistration: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const entry = registrationTokens.get(input.token);
          if (!entry || entry.purpose !== 'registration' || entry.expires < Date.now()) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid or expired registration token' });
          }

          // Optionally create session for user
          const { sdk } = await import('./_core/sdk');
          const openId = `local:${entry.email}`;
          const sessionToken = await sdk.createSessionToken(openId, { name: entry.email.split('@')[0] });
          const cookieOptions = getSessionCookieOptions(ctx.req);
          (ctx.res as any).cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 365 });

          // mark token used
          registrationTokens.delete(input.token);

          return { success: true };
        } catch (err: any) {
          console.error('[Auth verifyRegistration] Error:', err);
          throw new TRPCError({ code: err instanceof TRPCError ? err.code : 'INTERNAL_SERVER_ERROR', message: err?.message || 'Verification failed' });
        }
      }),
  }),

  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      let userId: number;

      // If ctx.user.id is already a number (production), use it directly
      if (typeof ctx.user.id === 'number') {
        userId = ctx.user.id;
      } else {
        // In dev, ctx.user.id is a string - sync user to get numeric ID
        try {
          const syncedUser = await db.upsertUser({
            openId: ctx.user.openId || (ctx.user.id as string),
            name: ctx.user.name ?? null,
            email: ctx.user.email ?? null,
            lastSignedIn: new Date(),
          });
          if (!syncedUser || !syncedUser.id) {
            console.warn('[Projects.list] No user ID after sync, returning empty projects');
            return [];
          }
          userId = syncedUser.id;
        } catch (err) {
          console.warn('[Projects.list] Failed to sync user for listing projects:', err);
          return [];
        }
      }

      return db.getUserProjects(userId);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let userId: number;

        // If ctx.user.id is already a number (production), use it directly
        if (typeof ctx.user.id === 'number') {
          userId = ctx.user.id;
        } else {
          // In dev, ctx.user.id is a string like "local-local:email"
          // Sync the user to database to get a numeric ID
          try {
            const syncedUser = await db.upsertUser({
              openId: ctx.user.openId || (ctx.user.id as string),
              name: ctx.user.name ?? null,
              email: ctx.user.email ?? null,
              lastSignedIn: new Date(),
            });
            if (!syncedUser || !syncedUser.id) {
              throw new Error('Failed to sync user: no ID returned');
            }
            userId = syncedUser.id;
            console.log('[Projects.create] User synced to DB:', { userId, openId: ctx.user.openId });
          } catch (syncErr) {
            console.error('[Projects.create] Failed to sync user:', syncErr);
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: `Failed to sync user to database: ${(syncErr as any)?.message}`
            });
          }
        }

        try {
          const projectId = await db.createProject({
            userId: userId,
            name: input.name,
            description: input.description,
          });
          console.log('[Projects.create] Project created:', { projectId, userId });
          return { id: projectId };
        } catch (err) {
          console.error('[Projects.create] Error creating project:', err);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create project: ${(err as any)?.message || 'Unknown error'}`
          });
        }
      }),
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return db.getProjectById(input.projectId);
      }),
  }),

  files: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return db.getProjectFiles(input.projectId);
      }),
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string(),
        path: z.string(),
        content: z.string().optional(),
        language: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        console.log('[DEBUG] files.create called with input:', { projectId: input.projectId, name: input.name, path: input.path, contentLength: input.content ? input.content.length : 0, language: input.language });
        const fileId = await db.createFile(input);
        return { fileId };
      }),
    update: protectedProcedure
      .input(z.object({
        fileId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateFileContent(input.fileId, input.content);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ fileId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFile(input.fileId);
        return { success: true };
      }),
  }),

  backups: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      // Ensure we pass a numeric userId to DB queries. In dev fallback the ctx.user.id
      // may be a string (e.g. "dev-local:..."), so resolve the numeric id via openId.
      let userId: number | undefined = undefined;
      if (typeof ctx.user.id === 'number') {
        userId = ctx.user.id;
      } else if (ctx.user.openId) {
        try {
          let u = await db.getUserByOpenId(ctx.user.openId);
          if (!u) {
            // Create or sync a DB user for this openId (ensures numeric id)
            u = await db.upsertUser({
              openId: ctx.user.openId,
              name: (ctx.user as any).name ?? null,
              email: (ctx.user as any).email ?? null,
              lastSignedIn: new Date(),
            });
          }
          if (u) userId = u.id as number;
        } catch (err) {
          console.warn('[Backups] Failed to get/sync user for backup list:', err);
          // If DB is unavailable, return empty backups list rather than error
          return [];
        }
      }
      if (!userId) {
        console.warn('[Backups] User id not available for backups, returning empty list');
        return [];
      }
      try {
        return await db.getUserBackups(userId);
      } catch (err) {
        console.warn('[Backups] Failed to list backups:', err);
        return [];
      }
    }),
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        snapshot: z.string(), // JSON stringified files
        backupType: z.enum(['local', 'online']).default('local').optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Resolve numeric userId similar to list
        let userId: number | undefined = undefined;
        if (typeof ctx.user.id === 'number') {
          userId = ctx.user.id;
        } else if (ctx.user.openId) {
          try {
            let u = await db.getUserByOpenId(ctx.user.openId);
            if (!u) {
              u = await db.upsertUser({
                openId: ctx.user.openId,
                name: (ctx.user as any).name ?? null,
                email: (ctx.user as any).email ?? null,
                lastSignedIn: new Date(),
              });
            }
            if (u) userId = u.id as number;
          } catch (err) {
            console.error('[Backups.create] Failed to sync user:', err);
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable, cannot create backup' });
          }
        }
        if (!userId) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User id not available for backups' });

        try {
          const backupId = await db.createBackup({
            userId,
            projectId: input.projectId,
            name: input.name,
            description: input.description,
            snapshot: input.snapshot,
            backupType: input.backupType || 'local',
          });
          return { backupId };
        } catch (err) {
          console.error('[Backups.create] Failed to create backup:', err);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create backup, database may be unavailable' });
        }
      }),
    get: protectedProcedure
      .input(z.object({ backupId: z.number() }))
      .query(async ({ input }) => {
        return db.getBackupById(input.backupId);
      }),
    delete: protectedProcedure
      .input(z.object({ backupId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Derive numeric user id
        let userId: number | undefined = undefined;
        if (typeof ctx.user.id === 'number') {
          userId = ctx.user.id;
        } else if (ctx.user.openId) {
          try {
            let u = await db.getUserByOpenId(ctx.user.openId);
            if (!u) {
              u = await db.upsertUser({
                openId: ctx.user.openId,
                name: (ctx.user as any).name ?? null,
                email: (ctx.user as any).email ?? null,
                lastSignedIn: new Date(),
              });
            }
            if (u) userId = u.id as number;
          } catch (err) {
            console.error('[Backups.delete] Failed to sync user:', err);
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable, cannot delete backup' });
          }
        }
        if (!userId) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User id not available for backups' });
        try {
          await db.deleteBackup(input.backupId, userId);
          return { success: true };
        } catch (err) {
          console.error('[Backups.delete] Failed to delete backup:', err);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete backup' });
        }
      }),
    restore: protectedProcedure
      .input(z.object({ backupId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const backup = await db.getBackupById(input.backupId);
          // Ensure numeric comparison for ownership
          let userId: number | undefined = undefined;
          if (typeof ctx.user.id === 'number') {
            userId = ctx.user.id;
          } else if (ctx.user.openId) {
            try {
              let u = await db.getUserByOpenId(ctx.user.openId);
              if (!u) {
                u = await db.upsertUser({
                  openId: ctx.user.openId,
                  name: (ctx.user as any).name ?? null,
                  email: (ctx.user as any).email ?? null,
                  lastSignedIn: new Date(),
                });
              }
              if (u) userId = u.id as number;
            } catch (err) {
              console.error('[Backups.restore] Failed to sync user:', err);
              throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable, cannot restore backup' });
            }
          }
          if (!backup || !userId || backup.userId !== userId) {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: "Backup not found or unauthorized" });
          }
          // Return snapshot for client-side restoration
          return { snapshot: backup.snapshot };
        } catch (err) {
          if (err instanceof TRPCError) throw err;
          console.error('[Backups.restore] Failed to restore backup:', err);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to restore backup' });
        }
      }),
  }),

  twoFactor: router({
    generateSecret: protectedProcedure.query(async ({ ctx }) => {
      const secret = speakeasy.generateSecret({
        name: `Tatik.space Pro (${ctx.user.email})`,
        issuer: "Tatik.space Pro",
        length: 32,
      });

      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      return {
        secret: secret.base32,
        qrCode,
        backupCodes: Array.from({ length: 10 }, () =>
          Math.random().toString(36).substring(2, 10).toUpperCase()
        ),
      };
    }),

    enable: protectedProcedure
      .input(z.object({
        secret: z.string(),
        code: z.string(),
        backupCodes: z.array(z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        const verified = speakeasy.totp.verify({
          secret: input.secret,
          encoding: "base32",
          token: input.code,
          window: 2,
        });

        if (!verified) {
          throw new Error("Invalid verification code");
        }

        await db.createOrUpdateTwoFactorSettings({
          userId: ctx.user.id,
          secret: input.secret,
          backupCodes: JSON.stringify(input.backupCodes),
          enabled: 1,
        });

        return { success: true };
      }),

    disable: protectedProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ ctx }) => {
        await db.disableTwoFactor(ctx.user.id);
        return { success: true };
      }),

    verify: publicProcedure
      .input(z.object({
        userId: z.number(),
        code: z.string(),
      }))
      .query(async ({ input }) => {
        const settings = await db.getTwoFactorSettings(input.userId);
        if (!settings || !settings.enabled) {
          return { verified: false };
        }

        const verified = speakeasy.totp.verify({
          secret: settings.secret,
          encoding: "base32",
          token: input.code,
          window: 2,
        });

        return { verified };
      }),
  }),

  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        subject: z.string().min(5),
        message: z.string().min(10),
      }))
      .mutation(async ({ input }) => {
        const messageId = await db.createContactMessage({
          name: input.name,
          email: input.email,
          subject: input.subject,
          message: input.message,
          status: "new",
        });
        return { messageId, success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      // Only admins can view all messages
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return db.getContactMessages();
    }),

    updateStatus: protectedProcedure
      .input(z.object({
        messageId: z.number(),
        status: z.enum(["new", "read", "replied"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await db.updateContactMessageStatus(input.messageId, input.status);
        return { success: true };
      }),
  }),

  ai: router({
    generateCode: publicProcedure
      .input(z.object({
        prompt: z.string(),
      }))
      .query(async ({ input }) => {
        try {
          // Import LLM helper
          const { invokeLLM } = await import('./_core/llm');

          const response = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: 'Sei un assistente esperto di programmazione. Genera codice HTML, CSS e JavaScript di alta qualità. Rispondi sempre con codice ben formattato e commenti chiari.',
              },
              {
                role: 'user',
                content: input.prompt,
              },
            ],
          });

          const content = response.choices?.[0]?.message?.content || '';
          return { content };
        } catch (error) {
          console.error('LLM Error:', error);
          // Fallback to empty response
          return { content: '' };
        }
      }),

    analyzeBugAndSuggestFix: publicProcedure
      .input(z.object({
        code: z.string(),
        error: z.string(),
        language: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { invokeLLM } = await import('./_core/llm');

          const response = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: `Sei un esperto debugger di programmazione specializzato in ${input.language}. Analizza il codice e l'errore fornito. Fornisci:
1. Una spiegazione breve della causa del bug (in italiano)
2. Il codice corretto con commenti che evidenziano i cambiamenti
3. Suggerimenti per evitare errori simili in futuro

Rispondi in modo chiaro e conciso, formattando il codice corretto in un blocco di codice.`,
              },
              {
                role: 'user',
                content: `Linguaggio: ${input.language}
Errore: ${input.error}

Codice:
\`\`\`
${input.code}
\`\`\``,
              },
            ],
          });

          const analysis = response.choices?.[0]?.message?.content || '';

          // Extract corrected code section if available
          const codeBlockMatch = analysis.match(/\`\`\`[\s\S]*?\n([\s\S]*?)\n\`\`\`/);
          const correctedCode = codeBlockMatch ? codeBlockMatch[1] : '';

          return {
            analysis,
            correctedCode,
            success: true,
          };
        } catch (error) {
          console.error('Bug Analysis Error:', error);
          return {
            analysis: 'Non è stato possibile analizzare il bug. Riprova più tardi.',
            correctedCode: '',
            success: false,
          };
        }
      }),

    optimizeCode: publicProcedure
      .input(z.object({
        code: z.string(),
        language: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { invokeLLM } = await import('./_core/llm');

          const response = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: `Sei un esperto di ottimizzazione del codice specializzato in ${input.language}. Analizza il codice fornito e identifica opportunità di miglioramento. Fornisci:
1. Una lista numerata di problemi/inefficienze (con descrizione breve)
2. Per ogni problema, una spiegazione del perché è importante ottimizzarlo
3. Complessità computazionale e suggerimenti di refactoring

Sii pragmatico e fornisci solo suggerimenti che faranno veramente differenza in performance, leggibilità e mantenibilità.`,
              },
              {
                role: 'user',
                content: `Linguaggio: ${input.language}

Codice:
\`\`\`${input.language}
${input.code}
\`\`\`

Analizza e suggerisci ottimizzazioni.`,
              },
            ],
          });

          const suggestions = response.choices?.[0]?.message?.content || '';

          // Extract optimization suggestions
          const suggestionsList = suggestions
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => line.trim());

          return {
            suggestions,
            count: suggestionsList.length,
            success: true,
          };
        } catch (error) {
          console.error('Code Optimization Error:', error);
          return {
            suggestions: 'Non è stato possibile analizzare il codice. Riprova più tardi.',
            count: 0,
            success: false,
          };
        }
      }),
  }),

  schools: router({
    terms: publicProcedure.query(() => ({
      version: SCHOOL_TERMS_VERSION,
      terms: [
        "Il programma scuola concede accesso una tantum per un mese dalla data di approvazione.",
        "Ogni istituto può attivare al massimo 30 studenti.",
        "La scuola è responsabile della verifica degli studenti invitati e dei relativi consensi.",
        "Gli inviti sono temporanei, personali e non trasferibili.",
        "Tatik può revocare l'accesso in caso di abuso, violazione o dati non verificabili.",
      ],
    })),

    isStaff: protectedProcedure.query(({ ctx }) => isStaffUser(ctx.user)),

    register: protectedProcedure
      .input(z.object({
        institutionName: z.string().trim().min(2).max(255),
        institutionEmail: z.string().email(),
        acceptedTerms: z.literal(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const existing = (await database.select().from(schoolPrograms).where(eq(schoolPrograms.ownerUserId, ctx.user.id)).limit(1))[0];
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Hai già registrato un istituto." });
        const now = new Date();
        const school = (await database.insert(schoolPrograms).values({
          ownerUserId: ctx.user.id,
          institutionName: input.institutionName,
          institutionEmail: normalizeEmail(input.institutionEmail),
          status: "pending",
          termsVersion: SCHOOL_TERMS_VERSION,
          termsAcceptedAt: now,
          maxStudents: 30,
        }).returning())[0];
        await database.insert(schoolAuditEvents).values({
          schoolId: school.id, actorUserId: ctx.user.id, action: "school_registered",
          targetType: "school", targetId: school.id, details: JSON.stringify({ termsVersion: SCHOOL_TERMS_VERSION }),
        });
        return school;
      }),

    mySchool: protectedProcedure.query(async ({ ctx }) => {
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      const school = (await database.select().from(schoolPrograms).where(eq(schoolPrograms.ownerUserId, ctx.user.id)).limit(1))[0];
      if (!school) return null;
      const invites = await database.select({
        id: schoolInvites.id,
        studentEmail: schoolInvites.studentEmail,
        status: schoolInvites.status,
        expiresAt: schoolInvites.expiresAt,
        createdAt: schoolInvites.createdAt,
      }).from(schoolInvites).where(eq(schoolInvites.schoolId, school.id)).orderBy(desc(schoolInvites.createdAt));
      const members = await database.select({ member: schoolMembers, email: users.email, name: users.name })
        .from(schoolMembers).innerJoin(users, eq(schoolMembers.userId, users.id))
        .where(eq(schoolMembers.schoolId, school.id)).orderBy(desc(schoolMembers.createdAt));
      return { school, invites, members };
    }),

    myMembership: protectedProcedure.query(async ({ ctx }) => {
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      const now = new Date();
      return (await database.select({ member: schoolMembers, school: schoolPrograms })
        .from(schoolMembers)
        .innerJoin(schoolPrograms, eq(schoolMembers.schoolId, schoolPrograms.id))
        .where(and(
          eq(schoolMembers.userId, ctx.user.id),
          isNull(schoolMembers.revokedAt),
          eq(schoolPrograms.status, "approved"),
          lte(schoolMembers.accessStartsAt, now),
          gte(schoolMembers.accessEndsAt, now),
        ))
        .orderBy(desc(schoolMembers.accessEndsAt))
        .limit(1))[0] || null;
    }),

    adminPending: protectedProcedure.query(async ({ ctx }) => {
      if (!isStaffUser(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Solo lo staff può approvare gli istituti." });
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      return database.select().from(schoolPrograms).where(eq(schoolPrograms.status, "pending")).orderBy(desc(schoolPrograms.createdAt));
    }),

    adminSetStatus: protectedProcedure
      .input(z.object({ schoolId: z.number().int().positive(), status: z.enum(["approved", "rejected", "revoked"]) }))
      .mutation(async ({ ctx, input }) => {
        if (!isStaffUser(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Solo lo staff può approvare gli istituti." });
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const school = (await database.select().from(schoolPrograms).where(eq(schoolPrograms.id, input.schoolId)).limit(1))[0];
        if (!school) throw new TRPCError({ code: "NOT_FOUND", message: "Istituto non trovato." });
        const allowedTransition = school.status === "pending"
          ? input.status === "approved" || input.status === "rejected"
          : school.status === "approved" && input.status === "revoked";
        if (!allowedTransition) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Transizione di stato non consentita per questo istituto." });
        }
        const now = new Date();
        const values = input.status === "approved"
          ? { status: "approved", accessStartsAt: now, accessEndsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), updatedAt: now }
          : { status: input.status, updatedAt: now };
        const updated = (await database.update(schoolPrograms).set(values).where(eq(schoolPrograms.id, school.id)).returning())[0];
        await database.insert(schoolAuditEvents).values({
          schoolId: school.id, actorUserId: ctx.user.id, action: `school_${input.status}`,
          targetType: "school", targetId: school.id,
        });
        return updated;
      }),

    createInvite: protectedProcedure
      .input(z.object({ studentEmail: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const email = normalizeEmail(input.studentEmail);
        return database.transaction(async (tx) => {
          const school = (await tx.select().from(schoolPrograms)
            .where(eq(schoolPrograms.ownerUserId, ctx.user.id))
            .for("update").limit(1))[0];
          const now = new Date();
          if (!school || school.status !== "approved" || !school.accessEndsAt || school.accessEndsAt <= now) {
            throw new TRPCError({ code: "FORBIDDEN", message: "L'istituto non è approvato o l'accesso è scaduto." });
          }
          const existingInvite = (await tx.select({ id: schoolInvites.id }).from(schoolInvites)
            .where(and(
              eq(schoolInvites.schoolId, school.id),
              eq(schoolInvites.studentEmail, email),
              or(eq(schoolInvites.status, "pending"), eq(schoolInvites.status, "approved")),
              gt(schoolInvites.expiresAt, now),
            )).limit(1))[0];
          if (existingInvite) {
            throw new TRPCError({ code: "CONFLICT", message: "Esiste già un invito valido per questo indirizzo." });
          }
          const existingMember = (await tx.select({ id: schoolMembers.id }).from(schoolMembers)
            .innerJoin(users, eq(schoolMembers.userId, users.id))
            .where(and(
              eq(schoolMembers.schoolId, school.id),
              sql`lower(${users.email}) = ${email}`,
              isNull(schoolMembers.revokedAt),
              lte(schoolMembers.accessStartsAt, now),
              gte(schoolMembers.accessEndsAt, now),
            )).limit(1))[0];
          if (existingMember) {
            throw new TRPCError({ code: "CONFLICT", message: "Questo studente ha già accesso all'istituto." });
          }
          const activeMembers = await tx.select({ count: sql<number>`count(*)` }).from(schoolMembers)
            .where(and(
              eq(schoolMembers.schoolId, school.id),
              isNull(schoolMembers.revokedAt),
              lte(schoolMembers.accessStartsAt, now),
              gte(schoolMembers.accessEndsAt, now),
            ));
          const outstandingInvites = await tx.select({ count: sql<number>`count(*)` }).from(schoolInvites)
            .where(and(
              eq(schoolInvites.schoolId, school.id),
              or(eq(schoolInvites.status, "pending"), eq(schoolInvites.status, "approved")),
              gt(schoolInvites.expiresAt, now),
            ));
          if (Number(activeMembers[0]?.count || 0) + Number(outstandingInvites[0]?.count || 0) >= school.maxStudents) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Limite di ${school.maxStudents} studenti raggiunto.` });
          }
          const invite = (await tx.insert(schoolInvites).values({
            schoolId: school.id,
            studentEmail: email,
            status: "pending",
            expiresAt: new Date(now.getTime() + SCHOOL_INVITE_DAYS * 24 * 60 * 60 * 1000),
          }).returning())[0];
          await tx.insert(schoolAuditEvents).values({
            schoolId: school.id, actorUserId: ctx.user.id, action: "invite_created", targetType: "invite", targetId: invite.id,
          });
          return invite;
        });
      }),

    approveInvite: protectedProcedure
      .input(z.object({ inviteId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        return database.transaction(async (tx) => {
          const school = (await tx.select().from(schoolPrograms)
            .where(eq(schoolPrograms.ownerUserId, ctx.user.id))
            .for("update").limit(1))[0];
          const invite = school ? (await tx.select().from(schoolInvites).where(and(
            eq(schoolInvites.id, input.inviteId),
            eq(schoolInvites.schoolId, school.id),
          )).for("update").limit(1))[0] : null;
          const now = new Date();
          if (!school || !invite) throw new TRPCError({ code: "NOT_FOUND", message: "Invito non trovato." });
          if (school.status !== "approved" || !school.accessEndsAt || school.accessEndsAt <= now ||
            invite.status !== "pending" || invite.expiresAt <= now) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Invito o accesso scuola non più valido." });
          }
          const token = crypto.randomBytes(32).toString("hex");
          const updated = (await tx.update(schoolInvites).set({
            status: "approved",
            approvedAt: now,
            tokenHash: hashSchoolInviteToken(token),
            expiresAt: new Date(now.getTime() + SCHOOL_INVITE_DAYS * 24 * 60 * 60 * 1000),
          }).where(eq(schoolInvites.id, invite.id)).returning())[0];
          await tx.insert(schoolAuditEvents).values({ schoolId: school.id, actorUserId: ctx.user.id, action: "invite_approved", targetType: "invite", targetId: invite.id });
          return {
            invite: {
              id: updated.id,
              studentEmail: updated.studentEmail,
              status: updated.status,
              expiresAt: updated.expiresAt,
            },
            token,
          };
        });
      }),

    redeemInvite: protectedProcedure
      .input(z.object({ token: z.string().length(64) }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        return database.transaction(async (tx) => {
          const matchingInvite = (await tx.select({
            id: schoolInvites.id,
            schoolId: schoolInvites.schoolId,
          }).from(schoolInvites)
            .where(eq(schoolInvites.tokenHash, hashSchoolInviteToken(input.token)))
            .limit(1))[0];
          if (!matchingInvite) throw new TRPCError({ code: "FORBIDDEN", message: "Invito non valido per questo account." });
          const school = (await tx.select().from(schoolPrograms)
            .where(eq(schoolPrograms.id, matchingInvite.schoolId))
            .for("update").limit(1))[0];
          const invite = (await tx.select().from(schoolInvites).where(and(
            eq(schoolInvites.id, matchingInvite.id),
            eq(schoolInvites.tokenHash, hashSchoolInviteToken(input.token)),
          )).for("update").limit(1))[0];
          const now = new Date();
          if (!invite || invite.status !== "approved" || invite.expiresAt <= now ||
            normalizeEmail(ctx.user.email) !== normalizeEmail(invite.studentEmail)) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Invito non valido per questo account." });
          }
          if (!school || school.status !== "approved" || !school.accessEndsAt || school.accessEndsAt <= now) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Accesso scuola scaduto." });
          }
          const activeMembers = await tx.select({ count: sql<number>`count(*)` }).from(schoolMembers)
            .where(and(
              eq(schoolMembers.schoolId, school.id),
              isNull(schoolMembers.revokedAt),
              lte(schoolMembers.accessStartsAt, now),
              gte(schoolMembers.accessEndsAt, now),
            ));
          if (Number(activeMembers[0]?.count || 0) >= school.maxStudents) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Limite di ${school.maxStudents} studenti raggiunto.` });
          }
          const existingMember = (await tx.select().from(schoolMembers).where(and(
            eq(schoolMembers.schoolId, school.id),
            eq(schoolMembers.userId, ctx.user.id),
          )).limit(1))[0];
          if (existingMember && !existingMember.revokedAt &&
            existingMember.accessStartsAt <= now && existingMember.accessEndsAt >= now) {
            throw new TRPCError({ code: "CONFLICT", message: "Questo account è già iscritto all'istituto." });
          }
          const member = existingMember
            ? (await tx.update(schoolMembers).set({
              inviteId: invite.id,
              accessStartsAt: now,
              accessEndsAt: school.accessEndsAt,
              revokedAt: null,
            }).where(eq(schoolMembers.id, existingMember.id)).returning())[0]
            : (await tx.insert(schoolMembers).values({
              schoolId: school.id, userId: ctx.user.id, inviteId: invite.id,
              accessStartsAt: now, accessEndsAt: school.accessEndsAt,
            }).returning())[0];
          await tx.update(schoolInvites).set({ status: "redeemed", redeemedAt: now }).where(eq(schoolInvites.id, invite.id));
          await tx.insert(schoolAuditEvents).values({ schoolId: school.id, actorUserId: ctx.user.id, action: "invite_redeemed", targetType: "member", targetId: member.id });
          return member;
        });
      }),

    revokeMember: protectedProcedure
      .input(z.object({ memberId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const school = (await database.select().from(schoolPrograms).where(eq(schoolPrograms.ownerUserId, ctx.user.id)).limit(1))[0];
        if (!school) throw new TRPCError({ code: "FORBIDDEN", message: "Scuola non trovata." });
        const member = (await database.update(schoolMembers).set({ revokedAt: new Date() }).where(and(eq(schoolMembers.id, input.memberId), eq(schoolMembers.schoolId, school.id))).returning())[0];
        if (!member) throw new TRPCError({ code: "NOT_FOUND", message: "Studente non trovato." });
        await database.insert(schoolAuditEvents).values({ schoolId: school.id, actorUserId: ctx.user.id, action: "member_revoked", targetType: "member", targetId: member.id });
        return member;
      }),
  }),
  cookieConsent: router({
    save: publicProcedure
      .input(z.object({
        necessary: z.boolean(),
        functional: z.boolean(),
        analytics: z.boolean(),
        marketing: z.boolean(),
        consentGivenAt: z.string().datetime(),
        expiresAt: z.string().datetime(),
        sessionId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id || null;
        const sessionId = input.sessionId;

        await db.createOrUpdateCookieConsent({
          userId: userId,
          sessionId: sessionId || null,
          necessary: input.necessary ? 1 : 0,
          functional: input.functional ? 1 : 0,
          analytics: input.analytics ? 1 : 0,
          marketing: input.marketing ? 1 : 0,
          consentGivenAt: new Date(input.consentGivenAt),
          expiresAt: new Date(input.expiresAt),
          ipAddress: ctx.req.ip || null,
        });

        return { success: true };
      }),

    get: publicProcedure
      .input(z.object({
        sessionId: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const userId = ctx.user?.id || null;
        const sessionId = input.sessionId;

        const consent = await db.getCookieConsent(userId, sessionId || null);
        if (!consent) return null;

        return {
          necessary: consent.necessary === 1,
          functional: consent.functional === 1,
          analytics: consent.analytics === 1,
          marketing: consent.marketing === 1,
          consentGivenAt: consent.consentGivenAt,
          expiresAt: consent.expiresAt,
        };
      }),
  }),

  payments: router({
    createCustomer: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { createCustomer } = await import('./_core/stripe');
        const customer = await createCustomer({
          email: input.email,
          name: input.name,
        });

        return { customer };
      }),

    createCheckoutSession: protectedProcedure
      .input(z.object({
        priceId: z.string(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createCheckoutSession, createCustomer } = await import('./_core/stripe');

        // Get or create customer in Stripe
        let stripeCustomerId = ctx.user.stripeCustomerId;
        if (!stripeCustomerId) {
          const customer = await createCustomer({
            email: ctx.user.email || `user${ctx.user.id}@example.com`,
            name: ctx.user.name || `User ${ctx.user.id}`,
          });
          stripeCustomerId = customer.id;

          // Update user with stripe customer ID in database
          await db.upsertUser({
            openId: ctx.user.openId,
            stripeCustomerId: stripeCustomerId,
          });
        }

        const session = await createCheckoutSession({
          customerId: stripeCustomerId,
          priceId: input.priceId,
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
        });

        return { session };
      }),

    getActiveSubscriptions: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user.stripeCustomerId) {
          return { subscriptions: [] };
        }

        const { getActiveSubscriptions } = await import('./_core/stripe');
        const subscriptions = await getActiveSubscriptions(ctx.user.stripeCustomerId);

        return { subscriptions };
      }),
  }),

  // User-related endpoints (monetization, profile, etc.)
  user: router({
    monetizationProgress: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          console.log('[monetizationProgress] Query invoked for user:', ctx.user.id);
          const userId = ctx.user.id;

          // Calculate 30-day window
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

          // Get this month's start (for the cycle)
          const cycleStart = new Date(now);
          cycleStart.setDate(1);
          cycleStart.setHours(0, 0, 0, 0);

          // Get next cycle start
          const nextCycleStart = new Date(cycleStart);
          nextCycleStart.setMonth(nextCycleStart.getMonth() + 1);

          // Calculate days remaining in current cycle
          const daysInMonth = (nextCycleStart.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24);
          const daysPassed = (now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24);
          const daysRemaining = Math.ceil(daysInMonth - daysPassed);

          // Query database for banner additions in current cycle
          // Compute activity-based points and unlocks
          let points = 0;
          try {
            const { getBannerAdditions } = await import('./db');
            const additions = await getBannerAdditions(userId, cycleStart, now);
            // Map of activity weights (each activity counts as 1 by default)
            const ACTIVITY_LIST = [
              'Elemento',
              'GreenBoxHybrid',
              'AdBanner',
              'PerfCheck',
              'Syntax Pill Courses',
              'Cloud-Vault Save',
              'Get Infinite History',
              'Encrypted/Security',
              'Deploy/Linter (AI)',
              'Template Bundles',
              'Optimize Button',
              'Micro-Job Sample'
            ];
            const activityWeight: Record<string, number> = {};
            ACTIVITY_LIST.forEach(a => (activityWeight[a.toLowerCase()] = 1));

            points = Array.isArray(additions)
              ? additions.reduce((sum: number, it: any) => {
                const t = (it.activityType || it.bannerId || '').toLowerCase();
                return sum + (activityWeight[t] || 1);
              }, 0)
              : 0;
          } catch (dbErr) {
            console.warn('[monetizationProgress] DB lookup failed, falling back to 0', dbErr);
            points = 0;
          }

          const thresholdPerUnlock = 11; // number of activity points required to unlock a discount
          const maxUnlocksPerCycle = 2; // user can unlock up to 2 times per 30 days
          const unlocksAchieved = Math.min(Math.floor(points / thresholdPerUnlock), maxUnlocksPerCycle);
          const pointsTowardsNext = points - unlocksAchieved * thresholdPerUnlock;
          const percentage = Math.round(Math.min((pointsTowardsNext / thresholdPerUnlock) * 100, 100));
          const isCompleted = unlocksAchieved >= 1;

          const response = {
            points,
            unlocksAchieved,
            percentage: Math.round(percentage),
            isCompleted,
            daysRemaining: Math.max(0, daysRemaining),
            cycleStart: cycleStart.toISOString(),
            nextCycleStart: nextCycleStart.toISOString(),
          };

          console.log('[monetizationProgress] Returning response:', response);
          return response;
        } catch (error) {
          console.error('[monetizationProgress] Error:', error);
          throw error;
        }
      }),
    trackBannerAddition: protectedProcedure
      .input(z.object({
        bannerId: z.string(),
        projectId: z.string(),
        activityType: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { createBannerAddition } = await import('./db');
          await createBannerAddition({
            userId: ctx.user.id,
            bannerId: input.bannerId,
            projectId: input.projectId,
            activityType: input.activityType,
            createdAt: new Date(),
          });

          console.log('[Banner Addition Tracked]', {
            userId: ctx.user.id,
            bannerId: input.bannerId,
            projectId: input.projectId,
          });

          return { success: true };
        } catch (e) {
          console.error('[Banner Addition Error]', e);
          return { success: false };
        }
      }),
    monetizationDetails: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const userId = ctx.user.id;
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const cycleStart = new Date(now);
          cycleStart.setDate(1);
          cycleStart.setHours(0, 0, 0, 0);

          const { getBannerAdditions } = await import('./db');
          const additions = await getBannerAdditions(userId, cycleStart, now);

          // Normalize entries
          const normalized = Array.isArray(additions)
            ? additions.map((it: any) => ({
              bannerId: it.bannerId,
              projectId: it.projectId ?? null,
              activityType: it.activityType ?? null,
              createdAt: it.createdAt ? (new Date(it.createdAt)).toISOString() : new Date().toISOString(),
            }))
            : [];

          return { additions: normalized };
        } catch (e) {
          console.error('[monetizationDetails] Error', e);
          return { additions: [] };
        }
      }),

    devCreateTestBannerAddition: protectedProcedure
      .input(z.object({
        activityType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Only allow in DEV and for specific email
        if (process.env.NODE_ENV !== 'development' || ctx.user.email !== 'tatik.space@gmail.com') {
          throw new Error('Not authorized');
        }
        try {
          const { createBannerAddition } = await import('./db');
          await createBannerAddition({
            userId: ctx.user.id,
            bannerId: `dev-test-${Date.now()}`,
            projectId: 'dev-test',
            activityType: input.activityType,
            createdAt: new Date(),
          });
          return { success: true };
        } catch (e) {
          console.error('[devCreateTestBannerAddition] Error', e);
          return { success: false };
        }
      }),

    getThemePreference: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const theme = await db.getThemePreference(ctx.user.id);
          return { theme };
        } catch (error) {
          console.error('[getThemePreference] Error:', error);
          return { theme: 'system' };
        }
      }),

    setThemePreference: protectedProcedure
      .input(z.object({
        theme: z.enum(['light', 'dark', 'system']),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          await db.updateThemePreference(ctx.user.id, input.theme);
          return { success: true, theme: input.theme };
        } catch (error) {
          console.error('[setThemePreference] Error:', error);
          return { success: false, theme: 'system' };
        }
      }),
  }),

  marketplace: router({
    sellerTerms: publicProcedure.query(() => ({
      version: MARKETPLACE_SELLER_TERMS_VERSION,
      commissionPercent: 15,
      terms: [
        "Il venditore ? l'unico responsabile del template, dei file e dei contenuti offerti, della loro qualit?, correttezza, sicurezza, licenza e conformit? alle leggi applicabili.",
        "Il venditore dichiara di possedere o disporre di tutti i diritti necessari e manleva Tatik nei limiti consentiti dalla legge da contestazioni derivanti dal prodotto o dai diritti di terzi.",
        "Il venditore fornisce descrizione veritiera, istruzioni e supporto sul prodotto e gestisce gli obblighi verso i propri acquirenti previsti dalla legge.",
        "? vietato caricare malware, credenziali, dati personali, contenuti illeciti o materiale che violi diritti di terzi.",
        "Ogni file viene sottoposto a controlli automatici statici. I controlli non certificano la sicurezza o la conformit? legale; i contenuti sospetti possono essere trattenuti per revisione e i listing pubblicati possono essere sospesi o rimossi.",
        "Tatik trattiene una commissione del 15% su ogni vendita.",
        "Il saldo netto resta in sospeso fino alla scadenza del periodo anti-frode e alla verifica dei rimborsi.",
        "Rimborsi e contestazioni possono stornare il saldo del venditore.",
        "I payout richiedono verifica KYC e un provider di pagamento configurato.",
        "L'accettazione dei termini non sostituisce la revisione legale e non esclude responsabilit? inderogabili previste dalla legge.",
      ],
    })),

    acceptSellerTerms: protectedProcedure
      .input(z.object({
        displayName: z.string().trim().min(2).max(120),
        bio: z.string().trim().max(2000).optional(),
        websiteUrl: z.string().url().max(500).optional(),
        accepted: z.literal(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const now = new Date();
        const values = {
          userId: ctx.user.id,
          displayName: input.displayName,
          bio: input.bio || null,
          websiteUrl: input.websiteUrl || null,
          termsAcceptedAt: now,
          termsVersion: MARKETPLACE_SELLER_TERMS_VERSION,
          updatedAt: now,
        };
        const existing = await database.select().from(marketplaceSellers)
          .where(eq(marketplaceSellers.userId, ctx.user.id)).limit(1);
        if (existing[0]) {
          return (await database.update(marketplaceSellers).set({
            ...values,
            status: existing[0].status,
          })
            .where(eq(marketplaceSellers.id, existing[0].id)).returning())[0];
        }
        return (await database.insert(marketplaceSellers).values({
          ...values,
          status: "pending",
          createdAt: now,
        }).returning())[0];
      }),

    getSellerProfile: protectedProcedure.query(async ({ ctx }) => {
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      return (await database.select().from(marketplaceSellers)
        .where(eq(marketplaceSellers.userId, ctx.user.id)).limit(1))[0] || null;
    }),

    createSellerOnboardingLink: protectedProcedure.mutation(async ({ ctx }) => {
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      const seller = (await database.select().from(marketplaceSellers)
        .where(eq(marketplaceSellers.userId, ctx.user.id)).limit(1))[0];
      if (!seller || !seller.termsAcceptedAt) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Accetta prima i termini venditore." });
      }
      const { createConnectAccountLink, createExpressConnectAccount } = await import("./_core/stripe");
      let accountId = seller.payoutAccountId;
      if (!accountId) {
        const account = await createExpressConnectAccount({ email: ctx.user.email || undefined });
        accountId = account.id;
        await database.update(marketplaceSellers).set({
          payoutProvider: "stripe_connect",
          payoutAccountId: accountId,
          status: "onboarding",
          updatedAt: new Date(),
        }).where(eq(marketplaceSellers.id, seller.id));
      }
      const baseUrl = process.env.APP_URL || "http://localhost:3000";
      const link = await createConnectAccountLink({
        accountId,
        refreshUrl: `${baseUrl}/marketplace/developer?connect=refresh`,
        returnUrl: `${baseUrl}/marketplace/developer?connect=success`,
      });
      return { url: link.url };
    }),

    refreshSellerPayoutStatus: protectedProcedure.mutation(async ({ ctx }) => {
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      const seller = (await database.select().from(marketplaceSellers)
        .where(eq(marketplaceSellers.userId, ctx.user.id)).limit(1))[0];
      if (!seller?.payoutAccountId) return { status: seller?.status || "pending", ready: false };
      const { getConnectAccount } = await import("./_core/stripe");
      const account = await getConnectAccount(seller.payoutAccountId);
      const ready = Boolean(account.details_submitted && account.charges_enabled && account.payouts_enabled);
      const status = ready ? "active" : "restricted";
      await database.update(marketplaceSellers).set({ status, updatedAt: new Date() })
        .where(eq(marketplaceSellers.id, seller.id));
      return { status, ready };
    }),

    listSellerListings: protectedProcedure.query(async ({ ctx }) => {
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      const seller = (await database.select().from(marketplaceSellers)
        .where(eq(marketplaceSellers.userId, ctx.user.id)).limit(1))[0];
      if (!seller) return [];
      return database.select().from(marketplaceListings)
        .where(eq(marketplaceListings.sellerId, seller.id))
        .orderBy(desc(marketplaceListings.updatedAt));
    }),

    createListing: protectedProcedure
      .input(z.object({
        title: z.string().trim().min(3).max(160),
        description: z.string().trim().min(20).max(10000),
        category: z.string().trim().min(2).max(80),
        priceCents: z.number().int().min(100).max(100000),
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const seller = (await database.select().from(marketplaceSellers)
          .where(eq(marketplaceSellers.userId, ctx.user.id)).limit(1))[0];
        if (!seller || !seller.termsAcceptedAt) throw new TRPCError({ code: "FORBIDDEN", message: "Accetta i termini venditore prima di pubblicare." });
        return (await database.insert(marketplaceListings).values({
          ...input,
          sellerId: seller.id,
          currency: "eur",
          status: "draft",
        }).returning())[0];
      }),

    uploadListingFile: protectedProcedure
      .input(z.object({
        listingId: z.number().int().positive(),
        fileName: z.string().regex(/^[^\\/]+$/).max(180),
        contentType: z.string().min(1).max(120),
        contentBase64: z.string().min(1).max(6 * 1024 * 1024).optional(),
        content: z.string().min(1).max(MAX_MARKETPLACE_UPLOAD_BYTES).optional(),
      }).refine((input) => Boolean(input.content) !== Boolean(input.contentBase64), {
        message: "Fornisci il contenuto del codice oppure il file, non entrambi.",
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const seller = (await database.select().from(marketplaceSellers)
          .where(eq(marketplaceSellers.userId, ctx.user.id)).limit(1))[0];
        const listing = seller ? (await database.select().from(marketplaceListings).where(
          and(eq(marketplaceListings.id, input.listingId), eq(marketplaceListings.sellerId, seller.id)),
        ).limit(1))[0] : null;
        if (!listing || !seller) throw new TRPCError({ code: "NOT_FOUND", message: "Listing non trovato" });
        if (listing.status !== "draft" && listing.status !== "rejected") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "I file si possono caricare solo in bozza." });
        }
        if (!/\.(html?|css|[cm]?js|jsx|tsx?|json|md|txt|xml|svg|py|sql)$/i.test(input.fileName)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Carica un file di codice testuale supportato." });
        }
        const buffer = input.content
          ? Buffer.from(input.content, "utf8")
          : Buffer.from(input.contentBase64!, "base64");
        if (!buffer.length || buffer.length > MAX_MARKETPLACE_UPLOAD_BYTES) {
          throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Il contenuto supera il limite di 2 MB." });
        }
        if (buffer.includes(0)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "I file binari non sono supportati: carica un file di codice testuale." });
        }
        const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
        const { storagePut } = await import("./storage");
        const stored = await storagePut(
          `marketplace/private/${seller.id}/${listing.id}/${crypto.randomUUID()}-${input.fileName}`,
          buffer,
          input.contentType,
        );
        await database.delete(marketplaceListingFiles)
          .where(eq(marketplaceListingFiles.listingId, listing.id));
        return (await database.insert(marketplaceListingFiles).values({
          listingId: listing.id,
          filePath: stored.key,
          contentType: input.contentType,
          sizeBytes: buffer.length,
          checksum,
        }).returning())[0];
      }),

    submitForReview: protectedProcedure
      .input(z.object({ listingId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const seller = (await database.select().from(marketplaceSellers).where(eq(marketplaceSellers.userId, ctx.user.id)).limit(1))[0];
        const listing = seller ? (await database.select().from(marketplaceListings).where(
          and(eq(marketplaceListings.id, input.listingId), eq(marketplaceListings.sellerId, seller.id)),
        ).limit(1))[0] : null;
        if (!listing) throw new TRPCError({ code: "NOT_FOUND", message: "Listing non trovato" });
        if (listing.status !== "draft" && listing.status !== "rejected") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Solo una bozza o un listing rifiutato pu? essere inviato in revisione." });
        }
        if (!seller?.termsAcceptedAt || seller.termsVersion !== MARKETPLACE_SELLER_TERMS_VERSION) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Accetta la versione corrente dei termini venditore." });
        }
        if (seller.status !== "active" || !seller.payoutAccountId) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Completa prima la verifica Stripe Connect/KYC per poter mettere in vendita il template." });
        }
        const file = (await database.select().from(marketplaceListingFiles)
          .where(eq(marketplaceListingFiles.listingId, listing.id)).limit(1))[0];
        if (!file) throw new TRPCError({ code: "BAD_REQUEST", message: "Carica almeno un file prima della revisione." });
        const { storageReadText } = await import("./storage");
        const storedName = file.filePath.split("/").pop() || "template.txt";
        const fileName = storedName.replace(/^[0-9a-f-]{36}-/i, "");
        let scan;
        try {
          scan = scanMarketplaceTemplate(fileName, await storageReadText(file.filePath));
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Impossibile controllare il contenuto caricato.",
          });
        }
        const now = new Date();
        const report = JSON.stringify(scan.findings);
        const status = scan.status === "passed" ? "published" : scan.status === "review" ? "in_review" : "rejected";
        const rejectionReason = scan.status === "blocked"
          ? scan.findings.map((finding) => finding.message).join(" ")
          : scan.status === "review"
            ? "Il controllo automatico ha rilevato elementi da verificare."
            : null;
        return (await database.update(marketplaceListings).set({
          status,
          scanStatus: scan.status,
          scanReport: report,
          scannedAt: now,
          rejectionReason,
          publishedAt: status === "published" ? now : null,
          updatedAt: now,
        })
          .where(eq(marketplaceListings.id, listing.id)).returning())[0];
      }),

    listPublished: publicProcedure.query(async () => {
      const database = await db.getDb();
      if (!database) return [];
      return database.select({
        listing: marketplaceListings,
        sellerName: marketplaceSellers.displayName,
        averageRating: sql<number>`coalesce(avg(${marketplaceReviews.rating}), 0)`,
        reviewCount: sql<number>`count(${marketplaceReviews.id})`,
      }).from(marketplaceListings)
        .innerJoin(marketplaceSellers, eq(marketplaceListings.sellerId, marketplaceSellers.id))
        .leftJoin(marketplaceReviews, eq(marketplaceReviews.listingId, marketplaceListings.id))
        .where(eq(marketplaceListings.status, "published"))
        .groupBy(marketplaceListings.id, marketplaceSellers.displayName)
        .orderBy(desc(marketplaceListings.publishedAt));
    }),

    listMyOrders: protectedProcedure.query(async ({ ctx }) => {
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      return database.select({
        order: marketplaceOrders,
        listing: marketplaceListings,
        review: marketplaceReviews,
      }).from(marketplaceOrders)
        .innerJoin(marketplaceListings, eq(marketplaceOrders.listingId, marketplaceListings.id))
        .leftJoin(marketplaceReviews, eq(marketplaceReviews.orderId, marketplaceOrders.id))
        .where(eq(marketplaceOrders.buyerId, ctx.user.id))
        .orderBy(desc(marketplaceOrders.createdAt));
    }),

    reviewQueue: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Solo gli amministratori possono vedere la coda di revisione." });
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      return database.select().from(marketplaceListings)
        .where(eq(marketplaceListings.status, "in_review"))
        .orderBy(desc(marketplaceListings.createdAt));
    }),

    moderationListings: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Solo gli amministratori possono moderare i listing." });
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      return database.select({
        listing: marketplaceListings,
        sellerName: marketplaceSellers.displayName,
      }).from(marketplaceListings)
        .innerJoin(marketplaceSellers, eq(marketplaceListings.sellerId, marketplaceSellers.id))
        .where(or(
          eq(marketplaceListings.status, "published"),
          eq(marketplaceListings.status, "suspended"),
        ))
        .orderBy(desc(marketplaceListings.updatedAt));
    }),

    getReviewContent: protectedProcedure
      .input(z.object({ listingId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Solo gli amministratori possono esaminare il codice segnalato." });
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const listing = (await database.select().from(marketplaceListings)
          .where(and(eq(marketplaceListings.id, input.listingId), eq(marketplaceListings.status, "in_review"))).limit(1))[0];
        if (!listing) throw new TRPCError({ code: "NOT_FOUND", message: "Il listing non ? pi? in revisione." });
        const file = (await database.select().from(marketplaceListingFiles)
          .where(eq(marketplaceListingFiles.listingId, listing.id))
          .orderBy(desc(marketplaceListingFiles.createdAt)).limit(1))[0];
        if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "File del listing non disponibile." });
        const { storageReadText } = await import("./storage");
        const storedName = file.filePath.split("/").pop() || "template.txt";
        return {
          listingId: listing.id,
          title: listing.title,
          fileName: storedName.replace(/^[0-9a-f-]{36}-/i, ""),
          content: await storageReadText(file.filePath),
        };
      }),

    moderateListing: protectedProcedure
      .input(z.object({
        listingId: z.number().int().positive(),
        action: z.enum(["suspend", "restore"]),
        reason: z.string().trim().min(5).max(2000).optional(),
      }).refine((input) => input.action !== "suspend" || Boolean(input.reason), {
        message: "Indica il motivo della sospensione.",
        path: ["reason"],
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Solo gli amministratori possono moderare i listing." });
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const listing = (await database.select().from(marketplaceListings)
          .where(eq(marketplaceListings.id, input.listingId)).limit(1))[0];
        if (!listing || (input.action === "suspend" && listing.status !== "published") ||
          (input.action === "restore" && listing.status !== "suspended")) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Il listing non ? nello stato richiesto per questa azione." });
        }
        if (input.action === "restore" && listing.scanStatus !== "passed") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Scansiona e approva nuovamente il contenuto prima di ripristinare il listing." });
        }
        const now = new Date();
        const updated = (await database.update(marketplaceListings).set(input.action === "suspend" ? {
          status: "suspended",
          moderationReason: input.reason!,
          moderatedAt: now,
          moderatedBy: ctx.user.id,
          updatedAt: now,
        } : {
          status: "published",
          moderationReason: null,
          moderatedAt: now,
          moderatedBy: ctx.user.id,
          publishedAt: now,
          updatedAt: now,
        }).where(eq(marketplaceListings.id, listing.id)).returning())[0];
        return updated;
      }),

    rescanLegacyListing: protectedProcedure
      .input(z.object({ listingId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Solo gli amministratori possono scansionare i listing legacy." });
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const listing = (await database.select().from(marketplaceListings)
          .where(eq(marketplaceListings.id, input.listingId)).limit(1))[0];
        if (!listing || (listing.status !== "published" && listing.status !== "suspended") ||
          (listing.scanStatus !== "legacy_unscanned" && listing.scanStatus !== "not_scanned")) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Il listing non richiede una scansione legacy." });
        }
        const file = (await database.select().from(marketplaceListingFiles)
          .where(eq(marketplaceListingFiles.listingId, listing.id))
          .orderBy(desc(marketplaceListingFiles.createdAt)).limit(1))[0];
        if (!file) throw new TRPCError({ code: "NOT_FOUND", message: "File del listing non disponibile." });
        const { storageReadText } = await import("./storage");
        const storedName = file.filePath.split("/").pop() || "template.txt";
        const fileName = storedName.replace(/^[0-9a-f-]{36}-/i, "");
        let scan;
        try {
          scan = scanMarketplaceTemplate(fileName, await storageReadText(file.filePath));
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Impossibile controllare il contenuto caricato.",
          });
        }
        const now = new Date();
        const status = listing.status === "suspended" && scan.status === "passed"
          ? "suspended"
          : scan.status === "passed" ? "published" : scan.status === "review" ? "in_review" : "rejected";
        return (await database.update(marketplaceListings).set({
          status,
          scanStatus: scan.status,
          scanReport: JSON.stringify(scan.findings),
          scannedAt: now,
          rejectionReason: scan.status === "blocked"
            ? scan.findings.map((finding) => finding.message).join(" ")
            : scan.status === "review"
              ? "Il controllo automatico ha rilevato elementi da verificare."
              : null,
          publishedAt: status === "published" ? now : listing.publishedAt,
          updatedAt: now,
        }).where(eq(marketplaceListings.id, listing.id)).returning())[0];
      }),

    reviewListing: protectedProcedure
      .input(z.object({ listingId: z.number().int().positive(), approved: z.boolean(), reason: z.string().max(2000).optional() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Solo gli amministratori possono revisionare i listing." });
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const target = (await database.select({
          listing: marketplaceListings,
          seller: marketplaceSellers,
        }).from(marketplaceListings)
          .innerJoin(marketplaceSellers, eq(marketplaceListings.sellerId, marketplaceSellers.id))
          .where(eq(marketplaceListings.id, input.listingId)).limit(1))[0];
        if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "Listing non trovato." });
        if (input.approved && (
          target.listing.status !== "in_review" ||
          !target.seller.termsAcceptedAt ||
          target.seller.termsVersion !== MARKETPLACE_SELLER_TERMS_VERSION ||
          target.seller.status !== "active"
        )) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Il listing deve essere in revisione e il venditore deve avere termini aggiornati e Stripe Connect/KYC attivo." });
        }
        return (await database.update(marketplaceListings).set({
          status: input.approved ? "published" : "rejected",
          rejectionReason: input.approved ? null : (input.reason || "Listing non approvato"),
          publishedAt: input.approved ? new Date() : null,
          updatedAt: new Date(),
        }).where(eq(marketplaceListings.id, input.listingId)).returning())[0] || null;
      }),

    createPurchase: protectedProcedure
      .input(z.object({ listingId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const listing = (await database.select().from(marketplaceListings).where(
          and(eq(marketplaceListings.id, input.listingId), eq(marketplaceListings.status, "published")),
        ).limit(1))[0];
        if (!listing) throw new TRPCError({ code: "NOT_FOUND", message: "Listing non trovato" });
        const seller = (await database.select().from(marketplaceSellers).where(eq(marketplaceSellers.id, listing.sellerId)).limit(1))[0];
        if (!seller || seller.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Acquisto non disponibile." });
        if (seller.status !== "active" || !seller.payoutAccountId) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Il venditore non ha completato la verifica dei pagamenti." });
        }
        const alreadyPurchased = (await database.select().from(marketplaceOrders).where(and(
          eq(marketplaceOrders.listingId, listing.id),
          eq(marketplaceOrders.buyerId, ctx.user.id),
          eq(marketplaceOrders.status, "paid"),
        )).limit(1))[0];
        if (alreadyPurchased) {
          throw new TRPCError({ code: "CONFLICT", message: "Hai gi? acquistato questo template." });
        }
        const commissionCents = Math.round(listing.priceCents * MARKETPLACE_COMMISSION_RATE);
        const baseUrl = process.env.APP_URL || "http://localhost:3000";
        const { createCheckoutSession, createCustomer } = await import("./_core/stripe");
        let customerId = ctx.user.stripeCustomerId;
        if (!customerId) {
          customerId = (await createCustomer({ email: ctx.user.email || `user${ctx.user.id}@example.com`, name: ctx.user.name || `User ${ctx.user.id}` })).id;
          await db.upsertUser({ openId: ctx.user.openId, stripeCustomerId: customerId });
        }
        const order = (await database.insert(marketplaceOrders).values({
          listingId: listing.id,
          buyerId: ctx.user.id,
          sellerId: seller.id,
          grossAmountCents: listing.priceCents,
          commissionCents,
          sellerAmountCents: listing.priceCents - commissionCents,
          status: "pending",
        }).returning())[0];
        const session = await createCheckoutSession({
          customerId,
          mode: "payment",
          lineItems: [{ name: listing.title, description: "Marketplace developer listing", amount: listing.priceCents, currency: "eur" }],
          successUrl: `${baseUrl}/marketplace?purchase=success&orderId=${order.id}`,
          cancelUrl: `${baseUrl}/marketplace?purchase=cancelled`,
          metadata: { userId: String(ctx.user.id), kind: "marketplace", listingId: String(listing.id), orderId: String(order.id) },
        });
        const payment = await db.createPaymentRecord({
          userId: ctx.user.id, provider: "stripe", kind: "marketplace", status: "pending",
          providerPaymentId: session.id, amount: listing.priceCents, currency: "eur",
          metadata: JSON.stringify({ listingId: listing.id, orderId: order.id }),
        });
        if (!payment) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Impossibile registrare il pagamento. Contatta l'assistenza prima di riprovare." });
        await database.update(marketplaceOrders).set({ paymentRecordId: payment.id }).where(eq(marketplaceOrders.id, order.id));
        return { checkoutUrl: session.url };
      }),

    getSellerBalance: protectedProcedure.query(async ({ ctx }) => {
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      const seller = (await database.select().from(marketplaceSellers).where(eq(marketplaceSellers.userId, ctx.user.id)).limit(1))[0];
      if (!seller) return { seller: null, balanceCents: 0, entries: [] };
      const entries = await database.select().from(marketplaceBalanceEntries).where(eq(marketplaceBalanceEntries.sellerId, seller.id)).orderBy(desc(marketplaceBalanceEntries.createdAt));
      return { seller, balanceCents: entries.reduce((sum, entry) => sum + entry.amountCents, 0), entries };
    }),

    listPayoutCandidates: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Solo gli amministratori possono gestire i payout." });
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      const now = new Date();
      return database.select({
        entry: marketplaceBalanceEntries,
        seller: marketplaceSellers,
      }).from(marketplaceBalanceEntries)
        .innerJoin(marketplaceSellers, eq(marketplaceBalanceEntries.sellerId, marketplaceSellers.id))
        .where(and(
          eq(marketplaceBalanceEntries.type, "sale"),
          or(
            eq(marketplaceBalanceEntries.transferStatus, "pending"),
            and(
              eq(marketplaceBalanceEntries.transferStatus, "transfer_pending"),
              isNull(marketplaceBalanceEntries.transferId),
            ),
          ),
          // @ts-ignore Drizzle's timestamp expression typings are incomplete here.
          marketplaceBalanceEntries.availableAt.lte(now),
        )).orderBy(desc(marketplaceBalanceEntries.availableAt));
    }),

    executeSellerPayout: protectedProcedure
      .input(z.object({ balanceEntryId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Solo gli amministratori possono eseguire payout." });
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const result = await database.select({
          entry: marketplaceBalanceEntries,
          seller: marketplaceSellers,
          order: marketplaceOrders,
        }).from(marketplaceBalanceEntries)
          .innerJoin(marketplaceSellers, eq(marketplaceBalanceEntries.sellerId, marketplaceSellers.id))
          .leftJoin(marketplaceOrders, eq(marketplaceBalanceEntries.orderId, marketplaceOrders.id))
          .where(eq(marketplaceBalanceEntries.id, input.balanceEntryId)).limit(1);
        const row = result[0];
        if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Saldo non trovato" });
        if (row.entry.type !== "sale" || row.entry.transferStatus !== "pending" || row.entry.transferId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Questo saldo non ? trasferibile." });
        }
        if (!row.entry.availableAt || row.entry.availableAt > new Date()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Il periodo anti-frode non ? terminato." });
        }
        if (row.order?.status !== "paid") throw new TRPCError({ code: "BAD_REQUEST", message: "Ordine non pagato o stornato." });
        if (!row.seller.payoutAccountId || row.seller.status !== "active") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Il venditore non ha completato KYC e payout." });
        }
        const { createConnectTransfer, getConnectAccount } = await import("./_core/stripe");
        const account = await getConnectAccount(row.seller.payoutAccountId);
        if (!account.payouts_enabled || !account.charges_enabled) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Stripe Connect non ? abilitato per questo venditore." });
        }
        const claimed = await database.update(marketplaceBalanceEntries).set({
          transferStatus: "transfer_pending",
        }).where(and(
          eq(marketplaceBalanceEntries.id, row.entry.id),
          or(
            eq(marketplaceBalanceEntries.transferStatus, "pending"),
            and(
              eq(marketplaceBalanceEntries.transferStatus, "transfer_pending"),
              isNull(marketplaceBalanceEntries.transferId),
            ),
          ),
          isNull(marketplaceBalanceEntries.transferId),
        )).returning();
        if (!claimed.length) {
          throw new TRPCError({ code: "CONFLICT", message: "Questo payout ? gi? in elaborazione o ? stato trasferito." });
        }
        let transfer: Awaited<ReturnType<typeof createConnectTransfer>>;
        try {
          transfer = await createConnectTransfer({
            amountCents: row.entry.amountCents,
            currency: row.entry.currency,
            destination: row.seller.payoutAccountId,
            metadata: { balanceEntryId: String(row.entry.id), sellerId: String(row.seller.id), orderId: String(row.entry.orderId || "") },
          }, `marketplace-payout-${row.entry.id}`);
        } catch (error) {
          await database.update(marketplaceBalanceEntries).set({ transferStatus: "pending" })
            .where(and(
              eq(marketplaceBalanceEntries.id, row.entry.id),
              eq(marketplaceBalanceEntries.transferStatus, "transfer_pending"),
              isNull(marketplaceBalanceEntries.transferId),
            ));
          throw error;
        }
        const updated = await database.update(marketplaceBalanceEntries).set({
          transferId: transfer.id,
          transferStatus: "transfer_pending",
        }).where(and(
          eq(marketplaceBalanceEntries.id, row.entry.id),
          eq(marketplaceBalanceEntries.transferStatus, "transfer_pending"),
          isNull(marketplaceBalanceEntries.transferId),
        )).returning();
        if (!updated.length) {
          const current = (await database.select().from(marketplaceBalanceEntries)
            .where(eq(marketplaceBalanceEntries.id, row.entry.id)).limit(1))[0];
          if (current?.transferId !== transfer.id) {
            throw new TRPCError({ code: "CONFLICT", message: "Il transfer Stripe ? stato creato, ma il ledger non ? stato aggiornato automaticamente. Contatta l'assistenza prima di ritentare." });
          }
        }
        return { success: true, transferId: transfer.id };
      }),

    getPurchasedFiles: protectedProcedure
      .input(z.object({ orderId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const order = (await database.select().from(marketplaceOrders)
          .where(and(eq(marketplaceOrders.id, input.orderId), eq(marketplaceOrders.buyerId, ctx.user.id))).limit(1))[0];
        if (!order || order.status !== "paid") throw new TRPCError({ code: "FORBIDDEN", message: "Acquisto non disponibile." });
        const listing = (await database.select().from(marketplaceListings)
          .where(eq(marketplaceListings.id, order.listingId)).limit(1))[0];
        if (!listing || listing.status !== "published") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template non disponibile: la vendita o l'accesso sono stati sospesi." });
        }
        const files = await database.select().from(marketplaceListingFiles)
          .where(eq(marketplaceListingFiles.listingId, order.listingId));
        const { storageGet } = await import("./storage");
        return Promise.all(files.map(async (file) => ({
          ...file,
          downloadUrl: (await storageGet(file.filePath)).url,
        })));
      }),

    getPurchasedContent: protectedProcedure
      .input(z.object({ orderId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const order = (await database.select().from(marketplaceOrders)
          .where(and(
            eq(marketplaceOrders.id, input.orderId),
            eq(marketplaceOrders.buyerId, ctx.user.id),
            eq(marketplaceOrders.status, "paid"),
          )).limit(1))[0];
        if (!order) throw new TRPCError({ code: "FORBIDDEN", message: "Il pagamento non ? stato verificato o l'ordine non ? pi? disponibile." });
        const listing = (await database.select().from(marketplaceListings)
          .where(eq(marketplaceListings.id, order.listingId)).limit(1))[0];
        const file = (await database.select().from(marketplaceListingFiles)
          .where(eq(marketplaceListingFiles.listingId, order.listingId))
          .orderBy(desc(marketplaceListingFiles.createdAt)).limit(1))[0];
        if (!listing || listing.status !== "published" || !file) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Template non disponibile: la vendita o l'accesso sono stati sospesi." });
        }
        const { storageReadText } = await import("./storage");
        return {
          orderId: order.id,
          title: listing.title,
          fileName: file.filePath.split("/").pop() || "template.txt",
          content: await storageReadText(file.filePath),
        };
      }),

    submitReview: protectedProcedure
      .input(z.object({
        orderId: z.number().int().positive(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().trim().max(2000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const order = (await database.select().from(marketplaceOrders).where(and(
          eq(marketplaceOrders.id, input.orderId),
          eq(marketplaceOrders.buyerId, ctx.user.id),
          eq(marketplaceOrders.status, "paid"),
        )).limit(1))[0];
        if (!order) throw new TRPCError({ code: "FORBIDDEN", message: "Pu? recensire solo chi ha completato l'acquisto." });
        const now = new Date();
        return (await database.insert(marketplaceReviews).values({
          listingId: order.listingId,
          orderId: order.id,
          buyerId: ctx.user.id,
          rating: input.rating,
          comment: input.comment || null,
          createdAt: now,
          updatedAt: now,
        }).onConflictDoUpdate({
          target: marketplaceReviews.orderId,
          set: { rating: input.rating, comment: input.comment || null, updatedAt: now },
        }).returning())[0];
      }),

    openDispute: protectedProcedure
      .input(z.object({ orderId: z.number().int().positive(), reason: z.string().min(3).max(120), details: z.string().min(10).max(3000) }))
      .mutation(async ({ ctx, input }) => {
        const database = await db.getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
        const order = (await database.select().from(marketplaceOrders).where(eq(marketplaceOrders.id, input.orderId)).limit(1))[0];
        if (!order || order.buyerId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND", message: "Ordine non trovato" });
        return (await database.insert(marketplaceDisputes).values({ ...input, openedByUserId: ctx.user.id }).returning())[0];
      }),
  }),

  // Template purchases
  templatePurchases: router({
    checkAccess: protectedProcedure
      .input(z.object({ templateId: z.string() }))
      .query(async ({ input, ctx }) => {
        try {
          // Get numeric userId
          let userId: number | undefined = undefined;
          if (typeof ctx.user.id === 'number') {
            userId = ctx.user.id;
          } else if (ctx.user.openId) {
            const u = await db.getUserByOpenId(ctx.user.openId);
            if (u) userId = u.id as number;
          }

          if (!userId) return { hasAccess: false, expiresAt: null };
          if (isStaffUser(ctx.user) || await hasActiveSchoolAccess(userId)) {
            return { hasAccess: true, expiresAt: null };
          }

          // Check if user has active purchase for this template
          const database = await db.getDb();
          if (!database) return { hasAccess: false, expiresAt: null };

          const purchaseResult = await database.select().from(templatePurchases).where(
            and(eq(templatePurchases.userId, userId), eq(templatePurchases.templateId, input.templateId), gt(templatePurchases.expiresAt, new Date()))
          ).limit(1);
          const purchase = purchaseResult.length > 0 ? purchaseResult[0] : null;

          return {
            hasAccess: !!purchase,
            expiresAt: purchase?.expiresAt || null,
          };
        } catch (err) {
          console.error('[templatePurchases.checkAccess] Error:', err);
          return { hasAccess: false, expiresAt: null };
        }
      }),

    createCheckoutSession: protectedProcedure
      .input(z.object({
        templateId: z.string(),
        templateName: z.string(),
        price: z.number().positive(),
        couponCode: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Get numeric userId and user email
          let userId: number | undefined = undefined;
          let userEmail = ctx.user.email;

          if (typeof ctx.user.id === 'number') {
            userId = ctx.user.id;
          } else if (ctx.user.openId) {
            const u = await db.getUserByOpenId(ctx.user.openId);
            if (u) {
              userId = u.id as number;
              userEmail = u.email;
            }
          }

          if (!userId) {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
          }

          // Check for special discount code for tati01sp@gmail.com
          let discountPriceEuro = input.price;
          let discountPercentage = 0;
          let couponUsedCode = input.couponCode || null;

          // Special user gets 100% discount with email-based coupon
          if (userEmail === 'tati01sp@gmail.com') {
            // Generate coupon hash if needed
            const couponHash = `TATIK_SPECIAL_${Date.now()}`;

            // Check if coupon code is provided and valid
            if (input.couponCode) {
              // Validate coupon (simple check: must be TATIK_SPECIAL_* pattern)
              if (input.couponCode.startsWith('TATIK_SPECIAL_')) {
                console.log(`[Stripe] Applying 100% discount for ${userEmail} with coupon ${input.couponCode}`);
                discountPercentage = 100;
                discountPriceEuro = 0;
                couponUsedCode = input.couponCode;
              } else {
                console.warn(`[Stripe] Invalid coupon code for ${userEmail}: ${input.couponCode}`);
              }
            } else {
              // Auto-generate coupon for special user
              console.log(`[Stripe] Auto-generating 100% discount for special user ${userEmail}`);
              discountPercentage = 100;
              discountPriceEuro = 0;
              couponUsedCode = couponHash;
            }
          }

          // Use Stripe to create checkout session
          const stripeModule = await import('./_core/stripe');
          const stripeClient: any = (stripeModule as any).stripe;
          if (!stripeClient) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Payment system not available' });
          }

          const successUrl = `${process.env.VITE_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/profile?tab=files&purchase=success`;
          const cancelUrl = `${process.env.VITE_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/templates`;

          // Use the mock Stripe client directly; its API is dynamic in dev, so cast to `any`.
          const session: any = await (stripeClient as any).createCheckoutSession({
            // The mock client accepts a dynamic payload in development.
            customerEmail: ctx.user.email || undefined,
            lineItems: [{
              name: `${input.templateName} - 30 days access`,
              description: `Premium template access valid for 30 days`,
              amount: Math.round(discountPriceEuro * 100), // Convert to cents (may be 0 if discount applied)
              currency: 'eur',
              quantity: 1,
            }],
            metadata: {
              userId: String(userId),
              templateId: input.templateId,
              templateName: input.templateName,
              originalPrice: String(input.price),
              discountPercentage: String(discountPercentage),
              couponCode: couponUsedCode || 'none',
            },
            successUrl,
            cancelUrl,
          });

          return { checkoutUrl: session.url };
        } catch (err) {
          console.error('[templatePurchases.createCheckoutSession] Error:', err);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create checkout session' });
        }
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          // Get numeric userId
          let userId: number | undefined = undefined;
          if (typeof ctx.user.id === 'number') {
            userId = ctx.user.id;
          } else if (ctx.user.openId) {
            const u = await db.getUserByOpenId(ctx.user.openId);
            if (u) userId = u.id as number;
          }

          if (!userId) return [];

          // Get all active purchases
          const database = await db.getDb();
          if (!database) return [];

          const purchases = await database.select().from(templatePurchases).where(
            and(eq(templatePurchases.userId, userId), gt(templatePurchases.expiresAt, new Date()))
          ).orderBy(desc(templatePurchases.purchasedAt));

          return purchases;
        } catch (err) {
          console.error('[templatePurchases.list] Error:', err);
          return [];
        }
      }),
  }),

  // Analytics and Monetization
  analytics: router({
    trackAdImpression: publicProcedure
      .input(z.object({
        adId: z.string(),
        category: z.enum(['affiliate', 'adnetwork', 'internal']),
        timestamp: z.string()
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Log ad impression for revenue tracking
          console.log('[Ad Impression]', {
            adId: input.adId,
            category: input.category,
            userAgent: ctx.req.headers['user-agent'],
            referer: ctx.req.headers.referer,
            timestamp: input.timestamp
          });

          // TODO: Send to analytics service (Mixpanel, PostHog, or custom database)
          // Example: await analyticsService.trackEvent('ad_impression', input);

          return { success: true };
        } catch (e) {
          console.error('[Ad Impression Error]', e);
          return { success: false };
        }
      }),

    trackAdClick: publicProcedure
      .input(z.object({
        adId: z.string(),
        category: z.enum(['affiliate', 'adnetwork', 'internal']),
        timestamp: z.string()
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Log ad click for revenue tracking and affiliate attribution
          console.log('[Ad Click]', {
            adId: input.adId,
            category: input.category,
            userAgent: ctx.req.headers['user-agent'],
            referer: ctx.req.headers.referer,
            ip: ctx.req.headers['x-forwarded-for'] || ctx.req.socket.remoteAddress,
            timestamp: input.timestamp
          });

          // TODO: Send to analytics service for affiliate tracking and revenue attribution
          // Example: await analyticsService.trackEvent('ad_click', input);

          return { success: true };
        } catch (e) {
          console.error('[Ad Click Error]', e);
          return { success: false };
        }
      })
  }),
});

export type AppRouter = typeof appRouter;
