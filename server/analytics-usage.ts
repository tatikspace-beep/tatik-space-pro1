import { and, eq, lt, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { analyticsMonthlyUsage } from "../drizzle/schema";
import { getDb } from "./db";

export const FREE_MONTHLY_ANALYSES = 3;
export const FREE_ANALYSIS_ROW_LIMIT = 1_000;
export const MAX_ANALYSIS_ROWS = 10_000;
export const DEFAULT_REPORT_PRICE_CENTS = 199;

export function getAnalyticsMonthKey(now = new Date()) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function getAnalyticsReportPriceCents(value = process.env.ANALYTICS_REPORT_PRICE_CENTS) {
  if (value === undefined || value === "") return DEFAULT_REPORT_PRICE_CENTS;
  const cents = Number(value);
  if (!Number.isInteger(cents) || cents < 50 || cents > 100_000) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Il prezzo del report deve essere configurato in centesimi tra 50 e 100000.",
    });
  }
  return cents;
}

export function assertAnalyticsCheckoutStripeKey(
  stripeSecretKey = process.env.STRIPE_SECRET_KEY,
  vercelEnv = process.env.VERCEL_ENV,
) {
  if (!stripeSecretKey) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "I pagamenti Stripe per i report non sono configurati." });
  }
  if (vercelEnv === "preview" && !stripeSecretKey.startsWith("sk_test_")) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "I pagamenti dei report in Preview richiedono una chiave Stripe di test; gli addebiti live sono disabilitati.",
    });
  }
}

export function assertFreeAnalysisRowLimit(rowCount: number, premium: boolean) {
  if (!premium && rowCount > FREE_ANALYSIS_ROW_LIMIT) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Il piano gratuito consente fino a ${FREE_ANALYSIS_ROW_LIMIT.toLocaleString("it-IT")} righe per analisi tabellare. Passa a Pro per analizzare più righe.`,
    });
  }
}

async function getUsageRow(userId: number, monthKey = getAnalyticsMonthKey()) {
  const database = await getDb();
  if (!database) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Il database non è disponibile per verificare la quota mensile.",
    });
  }
  const [usage] = await database.select().from(analyticsMonthlyUsage).where(and(
    eq(analyticsMonthlyUsage.userId, userId),
    eq(analyticsMonthlyUsage.monthKey, monthKey),
  )).limit(1);
  return usage;
}

export async function getMonthlyAnalyticsUsage(userId: number, monthKey = getAnalyticsMonthKey()) {
  return (await getUsageRow(userId, monthKey))?.analysisCount ?? 0;
}

export async function reserveMonthlyAnalyticsUse(userId: number, monthKey = getAnalyticsMonthKey()) {
  const database = await getDb();
  if (!database) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Il database non è disponibile per verificare la quota mensile.",
    });
  }

  const [usage] = await database.insert(analyticsMonthlyUsage).values({
    userId,
    monthKey,
    analysisCount: 1,
  }).onConflictDoUpdate({
    target: [analyticsMonthlyUsage.userId, analyticsMonthlyUsage.monthKey],
    set: {
      analysisCount: sql`${analyticsMonthlyUsage.analysisCount} + 1`,
      updatedAt: new Date(),
    },
    setWhere: lt(analyticsMonthlyUsage.analysisCount, FREE_MONTHLY_ANALYSES),
  }).returning({ analysisCount: analyticsMonthlyUsage.analysisCount });

  if (!usage) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Hai raggiunto le ${FREE_MONTHLY_ANALYSES} analisi gratuite di questo mese. Passa a Pro per continuare.`,
    });
  }
  return usage.analysisCount;
}

export async function releaseMonthlyAnalyticsUse(userId: number, monthKey = getAnalyticsMonthKey()) {
  const database = await getDb();
  if (!database) return;
  await database.update(analyticsMonthlyUsage).set({
    analysisCount: sql`greatest(${analyticsMonthlyUsage.analysisCount} - 1, 0)`,
    updatedAt: new Date(),
  }).where(and(
    eq(analyticsMonthlyUsage.userId, userId),
    eq(analyticsMonthlyUsage.monthKey, monthKey),
  ));
}
