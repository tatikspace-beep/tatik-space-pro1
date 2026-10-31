import { describe, expect, it } from "vitest";
import { AI_DAILY_LIMIT, checkAiDailyLimit, releaseAiDailyUsage } from "./aiUsage";

describe("AI daily usage", () => {
  it("keeps the existing daily request limit for regular users", () => {
    const userId = `regular-${crypto.randomUUID()}`;
    for (let request = 0; request < AI_DAILY_LIMIT; request += 1) {
      checkAiDailyLimit(userId);
    }

    expect(() => checkAiDailyLimit(userId)).toThrow(/Limite giornaliero AI raggiunto/);
  });

  it("allows administrators to exceed the limit without consuming their quota", () => {
    const userId = `admin-${crypto.randomUUID()}`;
    for (let request = 0; request < AI_DAILY_LIMIT; request += 1) {
      checkAiDailyLimit(userId);
    }

    expect(checkAiDailyLimit(userId, true)).toEqual({
      used: AI_DAILY_LIMIT,
      limit: AI_DAILY_LIMIT,
      unlimited: true,
    });
    releaseAiDailyUsage(userId, true);
    expect(() => checkAiDailyLimit(userId)).toThrow(/Limite giornaliero AI raggiunto/);
  });
});
