import { describe, expect, it } from "vitest";
import { advancedLogicChallenges } from "./advancedLogicChallenges";

describe("advanced logic challenge banks", () => {
  it.each(["kids", "youth", "adult"] as const)(
    "provides 10 valid challenges for %s in both languages",
    ageGroup => {
      const challenges = advancedLogicChallenges[ageGroup];

      expect(challenges).toHaveLength(10);
      expect(new Set(challenges.map(challenge => challenge.id)).size).toBe(
        challenges.length
      );

      for (const challenge of challenges) {
        expect(challenge.correct).toBeGreaterThanOrEqual(0);
        expect(challenge.correct).toBeLessThan(4);
        for (const locale of ["it", "en"] as const) {
          expect(challenge[locale].category).not.toBe("");
          expect(challenge[locale].prompt).not.toBe("");
          expect(challenge[locale].options).toHaveLength(4);
          expect(challenge[locale].options.every(Boolean)).toBe(true);
          expect(challenge[locale].explanation).not.toBe("");
        }
      }
    }
  );
});
