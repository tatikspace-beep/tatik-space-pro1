import { desc, eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { InsertUser, users, backups, InsertBackup, projects, files, InsertProject, InsertFile, twoFactorSettings, InsertTwoFactorSettings, contactMessages, InsertContactMessage, cookieConsents, InsertCookieConsent, bannerAdditions, InsertBannerAddition, subscriptions, InsertSubscription, subscriptionDiscounts, InsertSubscriptionDiscount, monetizationEarnings, InsertMonetizationEarning } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
// In-memory fallback store for banner additions when no DB is configured
const _inMemoryBannerStore: Map<number, Array<{ bannerId: string; projectId?: string; createdAt: Date }>> = new Map();

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<import("../drizzle/schema").User | null> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    // In case of no database, return a minimal user object for dev purposes
    return {
      id: 1,
      openId: user.openId,
      name: user.name || null,
      email: user.email || null,
      loginMethod: user.loginMethod || null,
      role: user.role || 'user',
      trialEndsAt: user.trialEndsAt || null,
      subscriptionType: user.subscriptionType || 'free',
      stripeCustomerId: user.stripeCustomerId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: user.lastSignedIn || new Date(),
    };
  }

  try {
    const db = await getDb();
    if (!db) {
      // No DB - return mock user
      return {
        id: 1,
        openId: user.openId,
        name: user.name || null,
        email: user.email || null,
        password: null,
        loginMethod: user.loginMethod || null,
        role: user.role || 'user',
        trialEndsAt: user.trialEndsAt || null,
        subscriptionType: user.subscriptionType || 'free',
        stripeCustomerId: user.stripeCustomerId || null,
        themePreference: 'system' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: user.lastSignedIn || new Date(),
      };
    }

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);

    if (existing.length > 0) {
      // User exists - update it
      const updateData: Record<string, unknown> = {};
      if (user.name !== undefined) updateData.name = user.name ?? null;
      if (user.email !== undefined) updateData.email = user.email ?? null;
      if (user.loginMethod !== undefined) updateData.loginMethod = user.loginMethod ?? null;
      if (user.stripeCustomerId !== undefined) updateData.stripeCustomerId = user.stripeCustomerId ?? null;
      if (user.role !== undefined) updateData.role = user.role;
      if (user.trialEndsAt !== undefined) updateData.trialEndsAt = user.trialEndsAt;
      if (user.subscriptionType !== undefined) updateData.subscriptionType = user.subscriptionType;
      if (user.lastSignedIn !== undefined) updateData.lastSignedIn = user.lastSignedIn;

      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = new Date();
        await db.update(users).set(updateData).where(eq(users.openId, user.openId));
      }
      return existing[0];
    } else {
      // User doesn't exist - create it (without password field)
      const insertData: any = {
        openId: user.openId,
      };
      if (user.name !== undefined) insertData.name = user.name ?? null;
      if (user.email !== undefined) insertData.email = user.email ?? null;
      if (user.loginMethod !== undefined) insertData.loginMethod = user.loginMethod ?? null;
      if (user.stripeCustomerId !== undefined) insertData.stripeCustomerId = user.stripeCustomerId ?? null;
      if (user.role !== undefined) {
        insertData.role = user.role;
      } else if (user.openId === ENV.ownerOpenId) {
        insertData.role = 'admin';
      }
      if (user.trialEndsAt !== undefined) insertData.trialEndsAt = user.trialEndsAt;
      if (user.subscriptionType !== undefined) insertData.subscriptionType = user.subscriptionType;
      if (user.lastSignedIn !== undefined) insertData.lastSignedIn = user.lastSignedIn;

      await db.insert(users).values(insertData as InsertUser);

      // Fetch and return the created user
      const result = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
      return result.length > 0 ? result[0] : null;
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ PROJECT HELPERS ============

export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values(project).returning();
  return result[0].id;
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
}

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ FILE HELPERS ============

export async function createFile(file: InsertFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(files).values(file).returning();
  return result[0].id;
}

export async function getProjectFiles(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(files).where(eq(files.projectId, projectId));
}

export async function updateFileContent(fileId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(files).set({ content, updatedAt: new Date() }).where(eq(files.id, fileId));
}

export async function deleteFile(fileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(files).where(eq(files.id, fileId));
}

// ============ BACKUP HELPERS ============

export async function createBackup(backup: InsertBackup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const backupType = backup.backupType || 'local';

  // Check if user already has max backups of this type
  const userBackups = await db
    .select()
    .from(backups)
    .where(and(
      eq(backups.userId, backup.userId),
      eq(backups.backupType, backupType)
    ))
    .orderBy(desc(backups.createdAt));

  const maxBackups = backupType === 'online' ? 2 : 10;

  if (userBackups.length >= maxBackups) {
    // Delete oldest backup of this type
    const oldestBackup = userBackups[userBackups.length - 1];
    if (oldestBackup) {
      await db.delete(backups).where(eq(backups.id, oldestBackup.id));
    }
  }

  const result = await db.insert(backups).values(backup).returning();
  return result[0].id;
}

export async function getUserBackups(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(backups).where(eq(backups.userId, userId)).orderBy(desc(backups.createdAt));
}

export async function getUserBackupsByType(userId: number, backupType: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(backups)
    .where(and(eq(backups.userId, userId), eq(backups.backupType, backupType)))
    .orderBy(desc(backups.createdAt));
}

// ============ BANNER ADDITIONS HELPERS ============

export async function createBannerAddition(add: InsertBannerAddition) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] DB not available, storing banner addition in-memory");
    const arr = _inMemoryBannerStore.get(add.userId) || [];
    arr.push({ bannerId: String(add.bannerId), projectId: add.projectId ? String(add.projectId) : undefined, createdAt: add.createdAt || new Date() });
    _inMemoryBannerStore.set(add.userId, arr);
    return;
  }

  await db.insert(bannerAdditions).values(add);
}

export async function getBannerAdditions(userId: number, start: Date, end: Date) {
  const db = await getDb();
  if (!db) {
    const arr = _inMemoryBannerStore.get(userId) || [];
    return arr.filter(r => r.createdAt >= start && r.createdAt <= end);
  }

  return await db.select().from(bannerAdditions).where(and(eq(bannerAdditions.userId, userId), and(bannerAdditions.createdAt.gte(start), bannerAdditions.createdAt.lte(end))));
}

export async function getBackupById(backupId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(backups).where(eq(backups.id, backupId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteBackup(backupId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(backups).where(and(eq(backups.id, backupId), eq(backups.userId, userId)));
}

// ============ AUTH HELPERS ============

export async function updatePassword(userId: number, hashedPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
}

// ============ 2FA HELPERS ============

export async function createOrUpdateTwoFactorSettings(settings: InsertTwoFactorSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(twoFactorSettings).where(eq(twoFactorSettings.userId, settings.userId)).limit(1);

  if (existing.length > 0) {
    await db.update(twoFactorSettings).set(settings).where(eq(twoFactorSettings.userId, settings.userId));
  } else {
    await db.insert(twoFactorSettings).values(settings);
  }
}

export async function getTwoFactorSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(twoFactorSettings).where(eq(twoFactorSettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function disableTwoFactor(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(twoFactorSettings).where(eq(twoFactorSettings.userId, userId));
}

// ============ CONTACT MESSAGE HELPERS ============

export async function createContactMessage(message: InsertContactMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contactMessages).values(message).returning();
  return result[0].id;
}

export async function getContactMessages() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function updateContactMessageStatus(messageId: number, status: "new" | "read" | "replied") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, messageId));
}

// ============ COOKIE CONSENT HELPERS ============

export async function createOrUpdateCookieConsent(consent: InsertCookieConsent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if a record already exists for this user/session
  let whereCondition;
  if (consent.userId) {
    whereCondition = eq(cookieConsents.userId, consent.userId);
  } else if (consent.sessionId) {
    whereCondition = eq(cookieConsents.sessionId, consent.sessionId);
  } else {
    throw new Error("Either userId or sessionId must be provided");
  }

  const existing = await db.select().from(cookieConsents)
    .where(whereCondition)
    .limit(1);

  if (existing.length > 0) {
    // Update existing record
    await db.update(cookieConsents).set(consent)
      .where(eq(cookieConsents.id, existing[0].id));
  } else {
    // Insert new record
    await db.insert(cookieConsents).values(consent);
  }
}

export async function getCookieConsent(userId: number | null, sessionId: string | null) {
  const db = await getDb();
  if (!db) return undefined;

  let whereCondition;
  if (userId) {
    whereCondition = eq(cookieConsents.userId, userId);
  } else if (sessionId) {
    whereCondition = eq(cookieConsents.sessionId, sessionId);
  } else {
    return undefined; // Need either userId or sessionId
  }

  const result = await db.select().from(cookieConsents)
    .where(whereCondition)
    .orderBy(desc(cookieConsents.consentGivenAt))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ SUBSCRIPTION PRICING HELPERS ============

export async function getSubscriptionByUserIdAndStatus(userId: number, status: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, status)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(subscriptions).values(data).returning();
  return result.length > 0 ? result[0] : null;
}

export async function updateSubscription(subscriptionId: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.update(subscriptions)
    .set(data)
    .where(eq(subscriptions.id, subscriptionId))
    .returning();

  return result.length > 0 ? result[0] : null;
}

export async function getMonetizationEarnings(userId: number, minDate?: Date) {
  const db = await getDb();
  if (!db) return null;

  let conditions = eq(monetizationEarnings.userId, userId);
  if (minDate) {
    conditions = and(
      eq(monetizationEarnings.userId, userId),
      // @ts-ignore - assuming date comparison works
      monetizationEarnings.cycleStartDate >= minDate.toISOString().split("T")[0]
    );
  }

  const result = await db.select().from(monetizationEarnings)
    .where(conditions)
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createMonetizationEarnings(data: InsertMonetizationEarning) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(monetizationEarnings).values(data).returning();
  return result.length > 0 ? result[0] : null;
}

export async function getSubscriptionDiscounts(userId: number, windowStart: Date, windowEnd: Date) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(subscriptionDiscounts)
    .where(and(
      eq(subscriptionDiscounts.userId, userId),
      eq(subscriptionDiscounts.status, "applied")
    ))
    .limit(10); // max recent

  return result;
}

export async function createSubscriptionDiscount(data: InsertSubscriptionDiscount) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(subscriptionDiscounts).values(data).returning();
  return result.length > 0 ? result[0] : null;
}

export async function getThemePreference(userId: number) {
  const db = await getDb();
  if (!db) return 'system';

  const result = await db.select({ themePreference: users.themePreference }).from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0].themePreference : 'system';
}

export async function updateThemePreference(userId: number, theme: 'light' | 'dark' | 'system') {
  const db = await getDb();
  if (!db) return null;

  const result = await db.update(users)
    .set({ themePreference: theme })
    .where(eq(users.id, userId))
    .returning();

  return result.length > 0 ? result[0] : null;
}
