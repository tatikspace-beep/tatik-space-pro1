import { describe, expect, it } from "vitest";
import { getFeatureVisibility, isUserInFreeTrial, PRICING } from "./pricing";

describe("pricing feature access", () => {
  it("keeps all Pro features enabled during the 60-day trial", () => {
    const trialStartedAt = new Date();

    expect(isUserInFreeTrial(trialStartedAt)).toBe(true);
    expect(getFeatureVisibility("free", true)).toEqual({
      backupOnline: true,
      aiAssistant: true,
      collaboration: true,
      advancedEditor: true,
    });
  });

  it("limits free features after the 60-day trial ends", () => {
    const trialStartedAt = new Date(Date.now() - (PRICING.FREE_TRIAL_DAYS + 1) * 24 * 60 * 60 * 1000);

    expect(isUserInFreeTrial(trialStartedAt)).toBe(false);
    expect(getFeatureVisibility("free", false)).toEqual({
      backupOnline: false,
      aiAssistant: false,
      collaboration: false,
      advancedEditor: false,
    });
  });

  it("keeps Pro features enabled for an active Pro subscription after the trial", () => {
    expect(getFeatureVisibility("pro", false)).toEqual({
      backupOnline: true,
      aiAssistant: true,
      collaboration: true,
      advancedEditor: true,
    });
  });
});
