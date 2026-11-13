import { describe, expect, it } from "vitest";
import { commercialSeoCopy } from "./commercialSeoCopy";
import { templateMarketplaceContentCopy } from "./templateMarketplaceContentCopy";
import { templateMarketplaceUiCopy } from "./templateMarketplaceUiCopy";

describe("template marketplace customer-facing labels", () => {
  it("uses payment wording instead of premium labels in every supported language", () => {
    for (const copy of Object.values(templateMarketplaceUiCopy)) {
      expect(copy.premiumTemplates).not.toMatch(/premium/i);
      expect(copy.premium).not.toMatch(/premium/i);
      expect(copy.premiumContent).not.toMatch(/premium/i);
    }

    for (const copy of Object.values(commercialSeoCopy)) {
      expect(copy.marketplaceDescription).not.toMatch(/premium/i);
      expect(copy.marketplaceIntro).not.toMatch(/premium/i);
    }

    for (const descriptions of Object.values(templateMarketplaceContentCopy)) {
      for (const description of Object.values(descriptions)) {
        expect(description).not.toMatch(/premium/i);
      }
    }
  });
});
