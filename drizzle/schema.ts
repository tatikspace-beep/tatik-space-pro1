import { pgTable, serial, text, timestamp, varchar, integer, pgEnum, uniqueIndex, index } from "drizzle-orm/pg-core";

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

export const schoolPrograms = pgTable("school_programs", {
  id: serial("id").primaryKey(),
  ownerUserId: integer("ownerUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  institutionName: varchar("institutionName", { length: 255 }).notNull(),
  institutionEmail: varchar("institutionEmail", { length: 320 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  termsVersion: varchar("termsVersion", { length: 32 }).notNull(),
  termsAcceptedAt: timestamp("termsAcceptedAt").notNull(),
  accessStartsAt: timestamp("accessStartsAt"),
  accessEndsAt: timestamp("accessEndsAt"),
  maxStudents: integer("maxStudents").notNull().default(30),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  ownerUnique: uniqueIndex("school_program_owner_idx").on(table.ownerUserId),
}));

export const schoolInvites = pgTable("school_invites", {
  id: serial("id").primaryKey(),
  schoolId: integer("schoolId").notNull().references(() => schoolPrograms.id, { onDelete: "cascade" }),
  studentEmail: varchar("studentEmail", { length: 320 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  tokenHash: varchar("tokenHash", { length: 128 }),
  expiresAt: timestamp("expiresAt").notNull(),
  approvedAt: timestamp("approvedAt"),
  redeemedAt: timestamp("redeemedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  schoolEmailIdx: index("school_invite_email_idx").on(table.schoolId, table.studentEmail),
}));

export const schoolMembers = pgTable("school_members", {
  id: serial("id").primaryKey(),
  schoolId: integer("schoolId").notNull().references(() => schoolPrograms.id, { onDelete: "cascade" }),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  inviteId: integer("inviteId").notNull().references(() => schoolInvites.id, { onDelete: "cascade" }),
  accessStartsAt: timestamp("accessStartsAt").notNull(),
  accessEndsAt: timestamp("accessEndsAt").notNull(),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  schoolUserIdx: uniqueIndex("school_member_user_idx").on(table.schoolId, table.userId),
}));

export const schoolAuditEvents = pgTable("school_audit_events", {
  id: serial("id").primaryKey(),
  schoolId: integer("schoolId").notNull().references(() => schoolPrograms.id, { onDelete: "cascade" }),
  actorUserId: integer("actorUserId").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 64 }).notNull(),
  targetType: varchar("targetType", { length: 32 }).notNull(),
  targetId: integer("targetId"),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SchoolProgram = typeof schoolPrograms.$inferSelect;
export type SchoolInvite = typeof schoolInvites.$inferSelect;

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
  paymentRecordId: integer("paymentRecordId"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type TemplatePurchase = typeof templatePurchases.$inferSelect;
export type InsertTemplatePurchase = typeof templatePurchases.$inferInsert;

/**
 * Payment ledger. A record is created before redirecting to a provider and is
 * marked paid only by a verified provider callback/capture response.
 */
export const paymentRecords = pgTable("payment_records", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 32 }).notNull(), // stripe|paypal
  kind: varchar("kind", { length: 32 }).notNull(), // subscription|template
  status: varchar("status", { length: 32 }).notNull().default("pending"), // pending|paid|failed|refunded|cancelled
  providerPaymentId: varchar("providerPaymentId", { length: 255 }),
  providerOrderId: varchar("providerOrderId", { length: 255 }),
  providerEventId: varchar("providerEventId", { length: 255 }),
  templateId: varchar("templateId", { length: 255 }),
  amount: integer("amount"), // minor units
  currency: varchar("currency", { length: 3 }).default("eur"),
  metadata: text("metadata"), // JSON
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  providerEventIdx: uniqueIndex("payment_records_provider_event_idx").on(table.provider, table.providerEventId),
  providerPaymentIdx: index("payment_records_provider_payment_idx").on(table.provider, table.providerPaymentId),
  providerOrderIdx: uniqueIndex("payment_records_provider_order_idx").on(table.provider, table.providerOrderId),
  userStatusIdx: index("payment_records_user_status_idx").on(table.userId, table.status),
}));

export type PaymentRecord = typeof paymentRecords.$inferSelect;
export type InsertPaymentRecord = typeof paymentRecords.$inferInsert;

/**
 * Developer marketplace. Listing source files are kept in private storage and
 * are only released after a verified order.
 */
export const marketplaceSellers = pgTable("marketplace_sellers", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  displayName: varchar("displayName", { length: 120 }).notNull(),
  bio: text("bio"),
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  payoutProvider: varchar("payoutProvider", { length: 32 }),
  payoutAccountId: varchar("payoutAccountId", { length: 255 }),
  termsAcceptedAt: timestamp("termsAcceptedAt"),
  termsVersion: varchar("termsVersion", { length: 32 }),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type MarketplaceSeller = typeof marketplaceSellers.$inferSelect;
export type InsertMarketplaceSeller = typeof marketplaceSellers.$inferInsert;

export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("sellerId").notNull().references(() => marketplaceSellers.id, { onDelete: "cascade" }),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  priceCents: integer("priceCents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("eur"),
  status: varchar("status", { length: 32 }).notNull().default("draft"),
  rejectionReason: text("rejectionReason"),
  scanStatus: varchar("scanStatus", { length: 32 }).notNull().default("not_scanned"),
  scanReport: text("scanReport"),
  scannedAt: timestamp("scannedAt"),
  moderationReason: text("moderationReason"),
  moderatedAt: timestamp("moderatedAt"),
  moderatedBy: integer("moderatedBy").references(() => users.id, { onDelete: "set null" }),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceListing = typeof marketplaceListings.$inferInsert;

export const marketplaceListingFiles = pgTable("marketplace_listing_files", {
  id: serial("id").primaryKey(),
  listingId: integer("listingId").notNull().references(() => marketplaceListings.id, { onDelete: "cascade" }),
  filePath: varchar("filePath", { length: 500 }).notNull(),
  contentType: varchar("contentType", { length: 120 }).notNull(),
  sizeBytes: integer("sizeBytes").notNull(),
  checksum: varchar("checksum", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MarketplaceListingFile = typeof marketplaceListingFiles.$inferSelect;
export type InsertMarketplaceListingFile = typeof marketplaceListingFiles.$inferInsert;

export const marketplaceOrders = pgTable("marketplace_orders", {
  id: serial("id").primaryKey(),
  listingId: integer("listingId").notNull().references(() => marketplaceListings.id),
  buyerId: integer("buyerId").notNull().references(() => users.id),
  sellerId: integer("sellerId").notNull().references(() => marketplaceSellers.id),
  paymentRecordId: integer("paymentRecordId").references(() => paymentRecords.id, { onDelete: "set null" }),
  grossAmountCents: integer("grossAmountCents").notNull(),
  commissionCents: integer("commissionCents").notNull(),
  sellerAmountCents: integer("sellerAmountCents").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  refundedAt: timestamp("refundedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type InsertMarketplaceOrder = typeof marketplaceOrders.$inferInsert;

export const marketplaceReviews = pgTable("marketplace_reviews", {
  id: serial("id").primaryKey(),
  listingId: integer("listingId").notNull().references(() => marketplaceListings.id, { onDelete: "cascade" }),
  orderId: integer("orderId").notNull().references(() => marketplaceOrders.id, { onDelete: "cascade" }).unique(),
  buyerId: integer("buyerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  listingIdx: index("marketplace_reviews_listing_idx").on(table.listingId),
}));
export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;
export type InsertMarketplaceReview = typeof marketplaceReviews.$inferInsert;

export const marketplaceBalanceEntries = pgTable("marketplace_balance_entries", {
  id: serial("id").primaryKey(),
  sellerId: integer("sellerId").notNull().references(() => marketplaceSellers.id, { onDelete: "cascade" }),
  orderId: integer("orderId").references(() => marketplaceOrders.id, { onDelete: "set null" }),
  type: varchar("type", { length: 32 }).notNull(),
  amountCents: integer("amountCents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("eur"),
  availableAt: timestamp("availableAt"),
  transferId: varchar("transferId", { length: 255 }),
  transferStatus: varchar("transferStatus", { length: 32 }).notNull().default("pending"),
  transferredAt: timestamp("transferredAt"),
  transferEventId: varchar("transferEventId", { length: 255 }),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  orderTypeUnique: uniqueIndex("marketplace_balance_order_type_idx").on(table.orderId, table.type),
}));
export type MarketplaceBalanceEntry = typeof marketplaceBalanceEntries.$inferSelect;
export type InsertMarketplaceBalanceEntry = typeof marketplaceBalanceEntries.$inferInsert;

export const marketplaceDisputes = pgTable("marketplace_disputes", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull().references(() => marketplaceOrders.id, { onDelete: "cascade" }),
  openedByUserId: integer("openedByUserId").notNull().references(() => users.id),
  reason: varchar("reason", { length: 120 }).notNull(),
  details: text("details").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("open"),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MarketplaceDispute = typeof marketplaceDisputes.$inferSelect;
export type InsertMarketplaceDispute = typeof marketplaceDisputes.$inferInsert;
