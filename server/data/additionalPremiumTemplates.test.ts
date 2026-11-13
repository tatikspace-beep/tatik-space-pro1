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

    expect([...prices].sort((a, b) => a - b)).toEqual([29, 49, 79, 129]);
    expect(Math.min(...Object.values(PREMIUM_TEMPLATE_CATALOG).map(({ priceEuro }) => priceEuro))).toBe(29);
    for (const template of ADDITIONAL_PREMIUM_TEMPLATES) {
      expect(template.isPremium).toBe(true);
      expect(PREMIUM_TEMPLATE_CATALOG[template.id]).toEqual({
        name: template.name,
        priceEuro: template.price,
      });
    }
  });

  it("raises the original premium templates to the new catalog price ladder", () => {
    const originalPremiumPrices = Object.fromEntries(
      PREMIUM_TEMPLATES.map(({ id, price }) => [id, price]),
    );

    expect(originalPremiumPrices).toMatchObject({
      "saas-landing-pro": 29,
      "ecommerce-luxury": 49,
      "portfolio-developer": 79,
      "business-corporate": 79,
      "blog-magazine": 129,
      "react-portfolio-pro": 129,
    });
    expect(PREMIUM_TEMPLATE_CATALOG).toMatchObject({
      "saas-landing-pro": { priceEuro: 29 },
      "ecommerce-luxury": { priceEuro: 49 },
      "portfolio-developer": { priceEuro: 79 },
      "business-corporate": { priceEuro: 79 },
      "blog-magazine": { priceEuro: 129 },
      "react-portfolio-pro": { priceEuro: 129 },
    });
    expect(PREMIUM_TEMPLATE_CATALOG["saas-landing-pro"].name).toBe("SaaS Landing Page");
  });

  it("provides complete, self-contained responsive HTML demos with interaction disclosures", () => {
    for (const template of ADDITIONAL_PREMIUM_TEMPLATES) {
      expect(template.description).not.toMatch(/premium/i);
      expect(template.code).toContain("<!doctype html>");
      expect(template.code).toContain('name="viewport"');
      expect(template.code).toContain("prefers-reduced-motion");
      expect(template.code).toContain("Sample selection only");
      expect(template.code).toContain("Connect your own service");
      expect(template.code).not.toContain("Choose what fits today.");
      expect(template.code).not.toContain("€19");
    }
  });

  it("uses page sections suited to each template family", () => {
    const sectionByTemplateId = {
      "premium-ai-research-intelligence": ["dashboard", "Built around the workflow"],
      "premium-digital-creator-shop": ["storefront", "The collection"],
      "premium-legal-advisory-firm": ["service", "How we can help"],
      "premium-product-designer-portfolio": ["editorial", "Selected work"],
      "premium-b2b-saas-launch": ["launch", "What is taking shape"],
    };

    for (const [id, [archetype, section]] of Object.entries(sectionByTemplateId)) {
      const template = ADDITIONAL_PREMIUM_TEMPLATES.find((item) => item.id === id);
      if (!template) throw new Error(`Missing representative template ${id}`);
      expect(template.code).toContain(`data-archetype="${archetype}"`);
      expect(template.code).toContain(section);
    }

    const layoutVariants = new Set(ADDITIONAL_PREMIUM_TEMPLATES.map(
      ({ code }) => code.match(/<body data-layout="(\d)"/)?.[1],
    ));
    expect(layoutVariants).toEqual(new Set(["0", "1", "2", "3", "4"]));
  });
});
