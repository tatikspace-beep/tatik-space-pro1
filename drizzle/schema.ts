import { pgTable, serial, text, timestamp, varchar, integer, pgEnum } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);
const themeEnum = pgEnum("theme_preference", ["light", "dark", "system"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Managed by the database.
   */
  id: serial("id").primaryKey(),
  /** OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }), // hashed password for local login
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  trialEndsAt: timestamp("trialEndsAt"), // Data scadenza trial
  subscriptionType: varchar("subscriptionType", { length: 50 }).default("free"), // free|pro|unlimited
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }), // Stripe customer ID
  themePreference: themeEnum("themePreference").default("system").notNull(), // light|dark|system
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table - stores user projects
 */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Files table - stores project files
 */
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  content: text("content"),
  language: varchar("language", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

/**
 * Backups table - stores project backups (max 10 local + 2 online per user)
 */
export const backups = pgTable("backups", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  projectId: integer("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  /** JSON stringified snapshot of project files */
  snapshot: text("snapshot").notNull(),
  /** Backup type: 'local' (client-side only) or 'online' (cloud storage) */
  backupType: varchar("backupType", { length: 20 }).default("local").notNull(),
  /** URL/path for online backups (e.g., S3 bucket URL) */
  storageUrl: varchar("storageUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Backup = typeof backups.$inferSelect;
export type InsertBackup = typeof backups.$inferInsert;

/**
 * 2FA settings table - stores TOTP secrets for two-factor authentication
 */
export const twoFactorSettings = pgTable("twoFactorSettings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  secret: varchar("secret", { length: 255 }).notNull(),
  backupCodes: text("backupCodes"), // JSON array of backup codes
  enabled: integer("enabled").default(0).notNull(), // 0 = disabled, 1 = enabled
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TwoFactorSettings = typeof twoFactorSettings.$inferSelect;
export type InsertTwoFactorSettings = typeof twoFactorSettings.$inferInsert;

/**
 * Contact messages table - stores contact form submissions
 */
export const statusEnum = pgEnum("status", ["new", "read", "replied"]);

export const contactMessages = pgTable("contactMessages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  status: statusEnum("status").default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

/**
 * Cookie consents table - stores user privacy choices
 */
export const cookieConsents = pgTable("cookieConsents", {
  id: serial("id").primaryKey(),
  userId: integer("userId"), // NULL se non loggato
  sessionId: varchar("sessionId", { length: 255 }), // Per utenti anonimi
  necessary: integer("necessary").default(1).notNull(),
  functional: integer("functional").default(0).notNull(),
  analytics: integer("analytics").default(0).notNull(),
  marketing: integer("marketing").default(0).notNull(),
  consentGivenAt: timestamp("consentGivenAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
});

export type CookieConsent = typeof cookieConsents.$inferSelect;
export type InsertCookieConsent = typeof cookieConsents.$inferInsert;

/**
 * Banner additions table - tracks when a user adds a banner for monetization
 */
export const bannerAdditions = pgTable("banner_additions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  bannerId: varchar("bannerId", { length: 255 }).notNull(),
  projectId: varchar("projectId", { length: 255 }),
  activityType: varchar("activityType", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BannerAddition = typeof bannerAdditions.$inferSelect;

/**
 * Subscriptions table - tracks user subscription tiers and pricing
 */
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  tier: varchar("tier", { length: 50 }).notNull().default("pro"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  currentPrice: text("currentPrice").notNull(), // €5.99 or €7.99 as string
  isFirstMonth: integer("isFirstMonth").notNull().default(1), // 1 = €5.99, 0 = €7.99
  startedAt: timestamp("startedAt").notNull().defaultNow(),
  endsAt: timestamp("endsAt"),
  renewsAt: timestamp("renewsAt"),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  appliedDiscountId: integer("appliedDiscountId"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Subscription discounts table - tracks €2 earned discounts from monetization
 */
export const subscriptionDiscounts = pgTable("subscription_discounts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  discountAmount: text("discountAmount").notNull().default("2.00"),
  reason: varchar("reason", { length: 255 }).notNull(), // 'monetization_100_percent'
  earnedAt: timestamp("earnedAt").notNull().defaultNow(),
  appliedAt: timestamp("appliedAt"),
  applicableUntil: timestamp("applicableUntil"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending|applied|expired
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type SubscriptionDiscount = typeof subscriptionDiscounts.$inferSelect;
export type InsertSubscriptionDiscount = typeof subscriptionDiscounts.$inferInsert;

/**
 * Monetization earnings table - tracks earnings towards 100% & discount unlock
 */
export const monetizationEarnings = pgTable("monetization_earnings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  earningAmount: text("earningAmount").notNull(),
  percentageOfGoal: integer("percentageOfGoal").notNull(),
  goalAmount: text("goalAmount").notNull().default("6.00"),
  cycleStartDate: text("cycleStartDate").notNull(), // YYYY-MM-DD
  cycleEndDate: text("cycleEndDate").notNull(),
  completed: integer("completed").notNull().default(0), // 1 = reached 100%
  completedAt: timestamp("completedAt"),
  discountEarnedFromCompletion: integer("discountEarnedFromCompletion").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type MonetizationEarning = typeof monetizationEarnings.$inferSelect;
export type InsertMonetizationEarning = typeof monetizationEarnings.$inferInsert;
export type InsertBannerAddition = typeof bannerAdditions.$inferInsert;

/**
 * Template purchases table - tracks user purchases of premium templates
 * Each purchase grants 30-day access to a template
 */
export const templatePurchases = pgTable("template_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: varchar("templateId", { length: 255 }).notNull(), // Template ID from templates data
  purchasedAt: timestamp("purchasedAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt").notNull(), // 30 days from purchase
  price: text("price").notNull(), // €amount
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type TemplatePurchase = typeof templatePurchases.$inferSelect;
export type InsertTemplatePurchase = typeof templatePurchases.$inferInsert;
