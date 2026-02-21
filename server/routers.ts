import { COOKIE_NAME } from "@shared/const";

// simple in-memory store for password reset tokens; production should persist
const passwordResetTokens: Map<string, { userId: number; expires: number }> = new Map();
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { pricingRouter } from "./_core/pricingRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  pricing: pricingRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      console.log(`[Auth.me] Query called, user: ${opts.ctx.user?.email || 'not authenticated'}`);
      return opts.ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
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
          console.log(`[Auth Login] Attempting login - email: ${input.email}`);

          // Dev admin login: allow when running locally (development or localhost)
          const isDevAdmin = input.email === 'tatik.space@gmail.com';
          const hostHeader = String(ctx.req.headers.host || '') || '';
          // Allow dev admin when running locally, on loopback addresses or via explicit env override
          const allowDevLogin = process.env.NODE_ENV === 'development'
            || hostHeader.includes('localhost')
            || hostHeader.includes('127.0.0.1')
            || hostHeader.includes('::1')
            || process.env.ALLOW_DEV_ADMIN === 'true';

          if (allowDevLogin && isDevAdmin) {
            console.log(`[Auth Login] Dev admin detected, attempting DB upsert for ${input.email}`);
            let adminUser: any = null;

            try {
              adminUser = await db.upsertUser({
                openId: `local:${input.email}`,
                name: 'Admin',
                email: input.email,
                loginMethod: 'dev-admin',
                role: 'admin',
                lastSignedIn: new Date(),
              });
              console.log(`[Auth Login] Admin user created/updated successfully, ID: ${adminUser?.id}`);
            } catch (dbErr: any) {
              console.warn(`[Auth Login] Database upsert failed, using fallback - ${(dbErr as any).message}`);
              // Use fallback admin user object
              adminUser = { id: 'dev-admin-' + input.email, name: 'Admin', email: input.email, role: 'admin' };
            }

            try {
              console.log(`[Auth Login] Creating session token for ${input.email}`);
              const token = await sdk.createSessionToken(`local:${input.email}`, { name: 'Admin' });
              console.log(`[Auth Login] Token created, length: ${token.length}`);

              try {
                const cookieOptions = getSessionCookieOptions(ctx.req);
                console.log(`[Auth Login] Cookie options: ${JSON.stringify(cookieOptions)}`);
                ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 365 });
                console.log(`[Auth Login] Admin token cookie set successfully for ${input.email}`);
              } catch (cookieErr: any) {
                console.error(`[Auth Login] Cookie setting failed: ${(cookieErr as any).message}`, cookieErr);
                throw cookieErr;
              }
            } catch (tokenErr: any) {
              console.error(`[Auth Login] Token creation failed: ${(tokenErr as any).message}`, tokenErr);
              throw tokenErr;
            }

            const responseObject = { success: true, requires2fa: false, user: { id: adminUser?.id || 'dev-admin', name: 'Admin', email: input.email, role: 'admin' } };
            console.log(`[Auth Login] Dev admin login successful, returning:`, JSON.stringify(responseObject));
            return responseObject;
          }

          // Standard login
          console.log(`[Auth Login] Standard login for ${input.email}`);
          let user: any;
          try {
            user = await db.getUserByEmail(input.email);
          } catch (getUserErr: any) {
            console.error(`[Auth Login] getUserByEmail failed: ${(getUserErr as any).message}`, getUserErr);
            // If DB is down, allow login with temp user
            user = null;
          }

          if (!user) {
            console.log(`[Auth Login] User not found, creating new user for ${input.email}`);
            // Auto-register on first login (for demo/early access)
            try {
              user = await db.upsertUser({
                openId: `local:${input.email}`,
                email: input.email,
                name: input.email.split('@')[0],
                loginMethod: 'local',
                lastSignedIn: new Date(),
              });
              console.log(`[Auth Login] New user created: ${user.id}`);
            } catch (createErr: any) {
              console.error(`[Auth Login] Failed to create user: ${(createErr as any).message}`);
              // Fallback: create temp user object
              user = {
                id: 'temp-' + Math.random().toString(36).substr(2, 9),
                openId: `local:${input.email}`,
                email: input.email,
                name: input.email.split('@')[0],
                role: 'user'
              };
            }
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
            console.log(`[Auth Login] Creating session token for standard user ${user.id}`);
            const openId = user.openId || `local:${input.email}`;
            const token = await sdk.createSessionToken(openId, { name: user.name || undefined });
            console.log(`[Auth Login] Standard user token created, length: ${token.length}`);

            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 1000 * 60 * 60 * 24 * 365 });
            console.log(`[Auth Login] Standard user token cookie set for ${input.email}`);
          } catch (stdTokenErr: any) {
            console.error(`[Auth Login] Standard user token creation failed: ${(stdTokenErr as any).message}`, stdTokenErr);
            throw stdTokenErr;
          }

          const responseObject = { success: true, requires2fa: twoFactorSettings?.enabled === 1, user: { id: user.id, name: user.name, email: user.email } };
          console.log(`[Auth Login] Standard login successful, returning:`, JSON.stringify(responseObject));
          return responseObject;
        } catch (err: any) {
          const errMsg = (err as any).message || String(err);
          console.error(`[Auth Login] MUTATION ERROR (caught at outer level): ${errMsg}`, err);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
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
        passwordResetTokens.set(token, { userId: user.id, expires: Date.now() + 1000 * 60 * 60 });
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
          // Hash the password (in a real app)
          const hashedPassword = input.password; // Placeholder - implement proper hashing

          // Create user in database
          const newUser = await db.upsertUser({
            openId: `local:${input.email}`, // Use email as unique identifier for local accounts
            email: input.email,
            name: input.name,
            loginMethod: 'local',
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          });

          // Get the created user to return user info
          const createdUser = await db.getUserByEmail(input.email);

          return {
            success: true,
            message: 'Utente registrato con successo',
            user: {
              id: createdUser?.id,
              name: createdUser?.name,
              email: createdUser?.email,
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

          // Check if user has active purchase for this template
          const purchase = await db.query.templatePurchases.findFirst({
            where: (tpTable, { and, eq, gt }) =>
              and(
                eq(tpTable.userId, userId),
                eq(tpTable.templateId, input.templateId),
                gt(tpTable.expiresAt, new Date())
              ),
          });

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
          const { stripe } = await import('./_core/stripe');
          if (!stripe) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Payment system not available' });
          }

          const successUrl = `${process.env.VITE_BASE_URL || 'http://localhost:3000'}/profile?tab=files&purchase=success`;
          const cancelUrl = `${process.env.VITE_BASE_URL || 'http://localhost:3000'}/templates`;

          const session = await stripe.createCheckoutSession({
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
          const purchases = await db.query.templatePurchases.findMany({
            where: (tpTable, { and, eq, gt }) =>
              and(
                eq(tpTable.userId, userId),
                gt(tpTable.expiresAt, new Date())
              ),
            orderBy: (tpTable, { desc }) => [desc(tpTable.purchasedAt)],
          });

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
