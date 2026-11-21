import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  returning: vi.fn(),
  onConflictDoUpdate: vi.fn(),
}));

vi.mock("./db", () => ({ getDb: mocks.getDb }));

import {
  assertAnalyticsCheckoutStripeKey,
  FREE_MONTHLY_ANALYSES,
  assertFreeAnalysisRowLimit,
  getAnalyticsMonthKey,
  getAnalyticsReportPriceCents,
  reserveMonthlyAnalyticsUse,
} from "./analytics-usage";

describe("analytics usage policy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDb.mockResolvedValue({
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          onConflictDoUpdate: mocks.onConflictDoUpdate.mockReturnValue({
            returning: mocks.returning,
          }),
        })),
      })),
    });
  });

  it("uses a UTC calendar month for the monthly quota", () => {
    expect(getAnalyticsMonthKey(new Date("2026-12-01T00:15:00+02:00"))).toBe("2026-11");
  });

  it("uses the configured report price and rejects invalid amounts", () => {
    expect(getAnalyticsReportPriceCents("250")).toBe(250);
    expect(() => getAnalyticsReportPriceCents("49")).toThrow("prezzo del report");
    expect(() => getAnalyticsReportPriceCents("not-a-price")).toThrow("prezzo del report");
  });

  it("requires Stripe test mode for Preview report checkouts", () => {
    expect(() => assertAnalyticsCheckoutStripeKey("", "preview")).toThrow("non sono configurati");
    expect(() => assertAnalyticsCheckoutStripeKey("sk_live_not-a-secret", "preview")).toThrow("chiave Stripe di test");
    expect(() => assertAnalyticsCheckoutStripeKey("sk_test_for-preview", "preview")).not.toThrow();
    expect(() => assertAnalyticsCheckoutStripeKey("sk_live_for-production", "production")).not.toThrow();
  });

  it("allows 1,000 free tabular rows but requires Pro above the cap", () => {
    expect(() => assertFreeAnalysisRowLimit(1_000, false)).not.toThrow();
    expect(() => assertFreeAnalysisRowLimit(1_001, false)).toThrow("fino a 1000 righe");
    expect(() => assertFreeAnalysisRowLimit(10_000, true)).not.toThrow();
  });

  it("atomically reserves only three free analyses in a month", async () => {
    mocks.returning.mockResolvedValue([{ analysisCount: FREE_MONTHLY_ANALYSES }]);

    await expect(reserveMonthlyAnalyticsUse(8, "2026-11")).resolves.toBe(FREE_MONTHLY_ANALYSES);
    const conflict = mocks.onConflictDoUpdate.mock.calls[0][0];
    expect(conflict.setWhere).toBeDefined();
  });

  it("rejects a fourth free analysis when the atomic reservation returns no row", async () => {
    mocks.returning.mockResolvedValue([]);

    await expect(reserveMonthlyAnalyticsUse(8, "2026-11")).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: expect.stringContaining("3 analisi gratuite"),
    });
  });
});
