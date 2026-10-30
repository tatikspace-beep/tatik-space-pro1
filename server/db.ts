import { desc, eq, and, gte, lte, ne, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { InsertUser, users, backups, InsertBackup, projects, projectMembers, files, InsertProject, InsertFile, twoFactorSettings, InsertTwoFactorSettings, contactMessages, InsertContactMessage, cookieConsents, InsertCookieConsent, bannerAdditions, InsertBannerAddition, subscriptions, InsertSubscription, subscriptionDiscounts, InsertSubscriptionDiscount, monetizationEarnings, InsertMonetizationEarning, paymentRecords, InsertPaymentRecord, templatePurchases, providerConnections, providerResources } from "../drizzle/schema";
import { ENV } from './_core/env';
import { normalizeEmail } from "./auth-utils";
import { canAccessProject as canAccessProjectByPolicy, canManageProjectMembers as canManageProjectMembersByPolicy, canUseProjectAgent } from "./project-access";

let _db: ReturnType<typeof drizzle> | null = null;
const _inMemoryUsers = new Map<string, any>();
let _memoryUserCounter = 1;
// In-memory fallback store for banner additions when no DB is configured
const _inMemoryBannerStore: Map<number, Array<{ bannerId: string; projectId?: string; createdAt: Date }>> = new Map();

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  const connectionString = process.env.POSTGRES_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.POSTGRES_URL_NON_POOLING
    || process.env.DATABASE_URL;
  if (!_db && connectionString) {
    try {
      // Supabase pooler URLs may include sslmode=verify-ca, while the
      // serverless runtime does not have the provider CA bundle installed.
      // Keep TLS enabled but let pg use its explicit TLS configuration.
      let pgConnectionString = connectionString;
      try {
        const parsedUrl = new URL(connectionString);
        parsedUrl.searchParams.delete("sslmode");
        pgConnectionString = parsedUrl.toString();
      } catch {
        console.warn("[Database] Could not normalize PostgreSQL connection URL");
      }
      const pool = new pg.Pool({
        connectionString: pgConnectionString,
        ssl: { rejectUnauthorized: false },
        options: "-c search_path=public",
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

  if (user.email) {
    user.email = normalizeEmail(user.email) as any;
  }

  const db = await getDb();
  if (!db) {
    const emailKey = user.email ? `email:${normalizeEmail(user.email)}` : null;
    const openIdKey = user.openId;
    const existing = emailKey ? _inMemoryUsers.get(emailKey) : undefined;
    const record = existing ?? _inMemoryUsers.get(openIdKey) ?? {
      id: _memoryUserCounter++,
      openId: user.openId,
      name: user.name || null,
      email: user.email || null,
      password: user.password || null,
      loginMethod: user.loginMethod || null,
      role: user.role || 'user',
      trialEndsAt: user.trialEndsAt || null,
      subscriptionType: user.subscriptionType || 'free',
      stripeCustomerId: user.stripeCustomerId || null,
      themePreference: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: user.lastSignedIn || new Date(),
    };

    if (user.name !== undefined) record.name = user.name ?? null;
    if (user.email !== undefined) record.email = user.email ?? null;
    if (user.password !== undefined) record.password = user.password ?? null;
    if (user.loginMethod !== undefined) record.loginMethod = user.loginMethod ?? null;
    if (user.role !== undefined) record.role = user.role ?? 'user';
    if (user.trialEndsAt !== undefined) record.trialEndsAt = user.trialEndsAt ?? null;
    if (user.subscriptionType !== undefined) record.subscriptionType = user.subscriptionType ?? 'free';
    if (user.stripeCustomerId !== undefined) record.stripeCustomerId = user.stripeCustomerId ?? null;
    if (user.lastSignedIn !== undefined) record.lastSignedIn = user.lastSignedIn ?? new Date();
    record.updatedAt = new Date();
    _inMemoryUsers.set(openIdKey, record);
    if (record.email) {
      _inMemoryUsers.set(`email:${normalizeEmail(record.email)}`, record);
    }
    return record;
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
      if (user.password !== undefined) updateData.password = user.password ?? null;
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
      if (user.password !== undefined) insertData.password = user.password ?? null;
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
    return _inMemoryUsers.get(openId);
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return _inMemoryUsers.get(`email:${normalizedEmail}`);
  }

  try {
    const result = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    const reason = error instanceof Error ? error.cause ?? error.name : "Unknown database error";
    console.error("[Database] User email lookup failed:", reason);
    throw error;
  }
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

export async function getProjectsForUser(userId: number, isAdmin = false, isEarlyAccessDeveloper = false) {
  const database = await getDb();
  if (!database) return [];
  if (isAdmin) {
    const allProjects = await database.select().from(projects).orderBy(desc(projects.updatedAt));
    return allProjects.map(project => ({ ...project, canManageMembers: true, canUseAgent: true }));
  }

  const owned = await database.select().from(projects).where(eq(projects.userId, userId));
  const shared = await database
    .select({ project: projects })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(eq(projectMembers.userId, userId));
  const ownedIds = new Set(owned.map(project => project.id));
  const memberProjectIds = new Set(shared.map(({ project }) => project.id));
  const accessibleProjects = new Map([...owned, ...shared.map(({ project }) => project)].map(project => [project.id, project]));
  return [...accessibleProjects.values()]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .map(project => ({
      ...project,
      canManageMembers: ownedIds.has(project.id),
      canUseAgent: canUseProjectAgent("user", memberProjectIds.has(project.id), isEarlyAccessDeveloper),
    }));
}

export async function hasProjectAccess(projectId: number, userId: number, isAdmin = false) {
  const database = await getDb();
  if (!database) return false;
  const [project] = await database.select({ id: projects.id, userId: projects.userId })
    .from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return false;
  const [membership] = await database.select({ id: projectMembers.id })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .limit(1);
  return canAccessProjectByPolicy(userId, isAdmin ? "admin" : "user", project.userId, Boolean(membership));
}

export async function hasProjectAgentAccess(
  projectId: number,
  userId: number,
  isAdmin = false,
  isEarlyAccessDeveloper = false,
) {
  const database = await getDb();
  if (!database) return false;
  const [project] = await database.select({ id: projects.id, userId: projects.userId })
    .from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return false;
  if (isAdmin) return true;
  const [membership] = await database.select({ id: projectMembers.id })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .limit(1);
  return canUseProjectAgent("user", Boolean(membership), isEarlyAccessDeveloper);
}

export async function canManageProjectMembers(projectId: number, userId: number, isAdmin = false) {
  const database = await getDb();
  if (!database) return false;
  const [project] = await database.select({ id: projects.id, userId: projects.userId })
    .from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return false;
  return canManageProjectMembersByPolicy(userId, isAdmin ? "admin" : "user", project.userId);
}

export async function listProjectMembers(projectId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  return database.select({
    id: projectMembers.id,
    userId: users.id,
    name: users.name,
    email: users.email,
    createdAt: projectMembers.createdAt,
  }).from(projectMembers)
    .innerJoin(users, eq(projectMembers.userId, users.id))
    .where(eq(projectMembers.projectId, projectId));
}

export async function addProjectMemberByEmail(projectId: number, email: string) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const normalizedEmail = normalizeEmail(email);
  const [member] = await database.select({ id: users.id, email: users.email })
    .from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (!member) return { notFound: true as const };
  const [project] = await database.select({ userId: projects.userId })
    .from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return { missingProject: true as const };
  if (project.userId === member.id) return { owner: true as const };
  const [saved] = await database.insert(projectMembers)
    .values({ projectId, userId: member.id })
    .onConflictDoNothing()
    .returning({ id: projectMembers.id });
  return { alreadyMember: !saved, memberId: saved?.id, email: member.email };
}

export async function removeProjectMember(projectId: number, memberId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const deleted = await database.delete(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.id, memberId)))
    .returning({ id: projectMembers.id });
  return deleted.length > 0;
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

export async function createAssistantFiles(
  projectId: number,
  userId: number,
  newFiles: Omit<InsertFile, "projectId">[],
  moves: Array<{ fromPath: string; toPath: string }> = [],
  isAdmin = false,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.transaction(async (tx) => {
    const [project] = await tx
      .select({ id: projects.id, userId: projects.userId })
      .from(projects)
      .where(eq(projects.id, projectId))
      .for("update")
      .limit(1);
    if (!project) return { missingProject: true as const, files: [] };
    if (!isAdmin && project.userId !== userId) {
      const [membership] = await tx.select({ id: projectMembers.id })
        .from(projectMembers)
        .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
        .limit(1);
      if (!membership) return { missingProject: true as const, files: [] };
    }

    const existingFiles = await tx.select().from(files).where(eq(files.projectId, projectId));
    const canonicalPath = (path: string) => path.replace(/\\/g, "/").replace(/^\/+/, "").toLowerCase();
    const existingByPath = new Map(existingFiles.map(file => [canonicalPath(file.path), file]));
    const newFilesByPath = new Map(newFiles.map(file => [canonicalPath(file.path), file]));
    const moveSources = new Set<string>();
    const moveTargets = new Set<string>();
    const resolvedMoves: Array<{
      source: (typeof existingFiles)[number];
      targetFile: (typeof newFiles)[number];
      toPath: string;
      targetKey: string;
    }> = [];

    for (const move of moves) {
      const sourceKey = canonicalPath(move.fromPath);
      const targetKey = canonicalPath(move.toPath);
      const source = existingByPath.get(sourceKey);
      const targetFile = newFilesByPath.get(targetKey);
      if (!source) return { missingProject: false as const, missingFiles: [move.fromPath], files: [] };
      if (!targetFile) return { missingProject: false as const, missingMoveOutput: move.toPath, files: [] };
      if (moveSources.has(sourceKey) || moveTargets.has(targetKey) || newFilesByPath.has(sourceKey)) {
        return { missingProject: false as const, invalidMoves: true as const, files: [] };
      }
      if (sourceKey === targetKey || existingByPath.has(targetKey)) {
        return { missingProject: false as const, pathConflict: move.toPath, files: [] };
      }
      moveSources.add(sourceKey);
      moveTargets.add(targetKey);
      resolvedMoves.push({ source, targetFile, toPath: move.toPath, targetKey });
    }
    if (resolvedMoves.some(move => moveSources.has(move.targetKey))) {
      return { missingProject: false as const, invalidMoves: true as const, files: [] };
    }

    const savedFiles = [];
    let createdCount = 0;
    let updatedCount = 0;
    let movedCount = 0;

    for (const move of resolvedMoves) {
      const saved = (await tx.update(files).set({
        name: move.targetFile.name,
        path: move.toPath,
        content: move.targetFile.content,
        language: move.targetFile.language,
        updatedAt: new Date(),
      }).where(and(eq(files.id, move.source.id), eq(files.projectId, projectId))).returning())[0];
      savedFiles.push(saved);
      existingByPath.set(move.targetKey, saved);
      movedCount += 1;
    }

    for (const file of newFiles) {
      const fileKey = canonicalPath(file.path);
      if (moveTargets.has(fileKey)) continue;
      const existing = existingByPath.get(fileKey);
      const saved = existing
        ? (await tx.update(files).set({
          name: file.name,
          content: file.content,
          language: file.language,
          updatedAt: new Date(),
        }).where(and(eq(files.id, existing.id), eq(files.projectId, projectId))).returning())[0]
        : (await tx.insert(files).values({ ...file, projectId }).returning())[0];

      savedFiles.push(saved);
      if (existing) updatedCount += 1;
      else createdCount += 1;
    }

    return { missingProject: false as const, files: savedFiles, createdCount, updatedCount, movedCount };
  });
}

export async function getProjectFiles(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(files).where(eq(files.projectId, projectId));
}

export async function getFileById(fileId: number) {
  const database = await getDb();
  if (!database) return undefined;
  const [file] = await database.select().from(files).where(eq(files.id, fileId)).limit(1);
  return file;
}

export async function updateFileContent(fileId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(files).set({ content, updatedAt: new Date() }).where(eq(files.id, fileId));
}

export async function updateFilePath(fileId: number, userId: number, name: string, path: string, isAdmin = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.transaction(async (tx) => {
    const [file] = await tx
      .select({ id: files.id, projectId: files.projectId, ownerUserId: projects.userId })
      .from(files)
      .innerJoin(projects, eq(files.projectId, projects.id))
      .where(eq(files.id, fileId))
      .limit(1);
    if (!file) return { notFound: true as const };
    if (!isAdmin && file.ownerUserId !== userId) {
      const [membership] = await tx.select({ id: projectMembers.id })
        .from(projectMembers)
        .where(and(eq(projectMembers.projectId, file.projectId), eq(projectMembers.userId, userId)))
        .limit(1);
      if (!membership) return { notFound: true as const };
    }

    const [conflict] = await tx
      .select({ id: files.id })
      .from(files)
      .where(and(
        eq(files.projectId, file.projectId),
        eq(files.path, path),
        ne(files.id, fileId),
      ))
      .limit(1);
    if (conflict) return { conflict: true as const };

    await tx.update(files).set({ name, path, updatedAt: new Date() }).where(eq(files.id, fileId));
    return { updated: true as const };
  });
}

export async function renameProjectFolder(projectId: number, userId: number, folderPath: string, newName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.transaction(async (tx) => {
    const projectFiles = await tx
      .select({ id: files.id, name: files.name, path: files.path })
      .from(files)
      .innerJoin(projects, eq(files.projectId, projects.id))
      .where(eq(files.projectId, projectId));
    const sourcePrefix = `${folderPath}/`;
    const movingFiles = projectFiles.filter(file => file.path.startsWith(sourcePrefix));
    if (movingFiles.length === 0) return { notFound: true as const };

    const separator = folderPath.lastIndexOf("/");
    const destinationPrefix = separator === -1
      ? newName
      : `${folderPath.slice(0, separator)}/${newName}`;
    if (
      destinationPrefix === folderPath
      || destinationPrefix.startsWith(sourcePrefix)
      || folderPath.startsWith(`${destinationPrefix}/`)
    ) {
      return { conflict: true as const };
    }

    const unaffectedPaths = projectFiles
      .filter(file => !file.path.startsWith(sourcePrefix))
      .map(file => file.path);
    if (
      unaffectedPaths.some(path =>
        path === destinationPrefix
        || path.startsWith(`${destinationPrefix}/`)
        || destinationPrefix.startsWith(`${path}/`)
      )
    ) {
      return { conflict: true as const };
    }

    const pathUpdates = movingFiles.map(file => {
      const path = `${destinationPrefix}${file.path.slice(folderPath.length)}`;
      const name = path.slice(path.lastIndexOf("/") + 1);
      return { id: file.id, path, name };
    });
    if (pathUpdates.some(update => unaffectedPaths.some(path =>
      path === update.path
      || path.startsWith(`${update.path}/`)
      || update.path.startsWith(`${path}/`)
    ))) {
      return { conflict: true as const };
    }

    for (const update of pathUpdates) {
      await tx.update(files)
        .set({ name: update.name, path: update.path, updatedAt: new Date() })
        .where(eq(files.id, update.id));
    }

    return { updated: pathUpdates.length } as const;
  });
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

  return await db.select().from(bannerAdditions).where(and(
    eq(bannerAdditions.userId, userId),
    gte(bannerAdditions.createdAt, start),
    lte(bannerAdditions.createdAt, end)
  ));
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

  if (minDate) {
    const minDateStr = minDate.toISOString().split('T')[0];
    // Use a raw SQL comparison for the date string to avoid Drizzle typing issues
    const result = await db.select().from(monetizationEarnings)
      .where(and(eq(monetizationEarnings.userId, userId), sql`${monetizationEarnings.cycleStartDate} >= ${minDateStr}`))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  }

  const result = await db.select().from(monetizationEarnings)
    .where(eq(monetizationEarnings.userId, userId))
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

// ============ PAYMENT HELPERS ============

export async function createPaymentRecord(data: InsertPaymentRecord) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(paymentRecords).values(data).returning();
  return result[0] || null;
}

export async function getPaymentRecordByProviderEvent(provider: string, providerEventId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(paymentRecords).where(and(
    eq(paymentRecords.provider, provider),
    eq(paymentRecords.providerEventId, providerEventId),
  )).limit(1);
  return result[0] || null;
}

export async function getPaymentRecordByProviderOrder(provider: string, providerOrderId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(paymentRecords).where(and(
    eq(paymentRecords.provider, provider),
    eq(paymentRecords.providerOrderId, providerOrderId),
  )).limit(1);
  return result[0] || null;
}

export async function getPaymentRecordByProviderPayment(provider: string, providerPaymentId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(paymentRecords).where(and(
    eq(paymentRecords.provider, provider),
    eq(paymentRecords.providerPaymentId, providerPaymentId),
  )).limit(1);
  return result[0] || null;
}

export async function updatePaymentRecord(paymentId: number, data: Partial<InsertPaymentRecord>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(paymentRecords)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(paymentRecords.id, paymentId))
    .returning();
  return result[0] || null;
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return result[0] || null;
}

export async function getSubscriptionByPayPalId(paypalSubscriptionId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.paypalSubscriptionId, paypalSubscriptionId))
    .limit(1);
  return result[0] || null;
}

export async function grantTemplateAccess(input: {
  userId: number;
  templateId: string;
  price: string;
  paymentRecordId: number;
  providerPaymentId?: string | null;
}) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(templatePurchases)
    .where(eq(templatePurchases.paymentRecordId, input.paymentRecordId))
    .limit(1);
  if (existing[0]) return existing[0];

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const result = await db.insert(templatePurchases).values({
    userId: input.userId,
    templateId: input.templateId,
    purchasedAt: now,
    expiresAt,
    price: input.price,
    stripePaymentIntentId: input.providerPaymentId || null,
    paymentRecordId: input.paymentRecordId,
  }).returning();
  return result[0] || null;
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

export async function listProviderConnections(userId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database is unavailable.");
  return database.select({
    provider: providerConnections.provider,
    connectedAt: providerConnections.createdAt,
  }).from(providerConnections).where(eq(providerConnections.userId, userId));
}

export async function saveProviderConnection(userId: number, provider: string, encryptedCredential: string) {
  const database = await getDb();
  if (!database) throw new Error("Database is unavailable.");
  const [connection] = await database.insert(providerConnections).values({
    userId,
    provider,
    encryptedCredential,
  }).onConflictDoUpdate({
    target: [providerConnections.userId, providerConnections.provider],
    set: { encryptedCredential, updatedAt: new Date() },
  }).returning({
    provider: providerConnections.provider,
    connectedAt: providerConnections.updatedAt,
  });
  return connection;
}

export async function deleteProviderConnection(userId: number, provider: string) {
  const database = await getDb();
  if (!database) throw new Error("Database is unavailable.");
  await database.delete(providerConnections).where(and(
    eq(providerConnections.userId, userId),
    eq(providerConnections.provider, provider),
  ));
}

export async function getProviderCredential(userId: number, provider: string) {
  const database = await getDb();
  if (!database) throw new Error("Database is unavailable.");
  const [connection] = await database.select({
    encryptedCredential: providerConnections.encryptedCredential,
  }).from(providerConnections).where(and(
    eq(providerConnections.userId, userId),
    eq(providerConnections.provider, provider),
  )).limit(1);
  return connection?.encryptedCredential ?? null;
}

export async function getProviderResource(userId: number, projectId: number, provider: string) {
  const database = await getDb();
  if (!database) throw new Error("Database is unavailable.");
  const [resource] = await database.select({
    resourceId: providerResources.resourceId,
    resourceUrl: providerResources.resourceUrl,
  }).from(providerResources).where(and(
    eq(providerResources.userId, userId),
    eq(providerResources.projectId, projectId),
    eq(providerResources.provider, provider),
  )).limit(1);
  return resource ?? null;
}

export async function saveProviderResource(
  userId: number,
  projectId: number,
  provider: string,
  resourceId: string,
  resourceUrl: string | null,
) {
  const database = await getDb();
  if (!database) throw new Error("Database is unavailable.");
  await database.insert(providerResources).values({
    userId,
    projectId,
    provider,
    resourceId,
    resourceUrl,
  }).onConflictDoUpdate({
    target: [providerResources.userId, providerResources.projectId, providerResources.provider],
    set: { resourceId, resourceUrl, updatedAt: new Date() },
  });
}
