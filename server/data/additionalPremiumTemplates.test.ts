import { describe, expect, it } from "vitest";
import { PREMIUM_TEMPLATES } from "../../client/src/data/templates";
import { PREMIUM_TEMPLATE_CATALOG } from "../_core/premiumTemplateCatalog";
import { ADDITIONAL_PREMIUM_TEMPLATES } from "./additionalPremiumTemplates";

describe("additional premium templates", () => {
  it("adds 45 distinct premium templates without colliding with the existing catalog", () => {
    const newIds = ADDITIONAL_PREMIUM_TEMPLATES.map((template) => template.id);
    const existingIds = new Set(PREMIUM_TEMPLATES.map((template) => template.id));

    expect(ADDITIONAL_PREMIUM_TEMPLATES).toHaveLength(45);
    expect(new Set(newIds).size).toBe(45);
    expect(newIds.every((id) => !existingIds.has(id))).toBe(true);
    expect(Object.keys(PREMIUM_TEMPLATE_CATALOG)).toHaveLength(51);
  });

  it("keeps every premium template server-priced and available in the checkout catalog", () => {
    const prices = new Set(ADDITIONAL_PREMIUM_TEMPLATES.map((template) => template.price));

    expect([...prices].sort((a, b) => a - b)).toEqual([9, 19, 29, 39]);
    for (const template of ADDITIONAL_PREMIUM_TEMPLATES) {
      expect(template.isPremium).toBe(true);
      expect(PREMIUM_TEMPLATE_CATALOG[template.id]).toEqual({
        name: template.name,
        priceEuro: template.price,
      });
    }
  });

  it("provides complete, self-contained responsive HTML demos with interaction disclosures", () => {
    for (const template of ADDITIONAL_PREMIUM_TEMPLATES) {
      expect(template.code).toContain("<!doctype html>");
      expect(template.code).toContain('name="viewport"');
      expect(template.code).toContain("prefers-reduced-motion");
      expect(template.code).toContain("Sample content");
      expect(template.code).toContain("Connect your own service");
    }
  });
});
