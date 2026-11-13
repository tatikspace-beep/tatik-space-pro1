import { describe, expect, it } from "vitest";
import { templateMarketplaceUiCopy } from "./templateMarketplaceUiCopy";

describe("template marketplace customer-facing labels", () => {
  it("uses payment wording instead of premium labels in every supported language", () => {
    for (const copy of Object.values(templateMarketplaceUiCopy)) {
      expect(copy.premiumTemplates).not.toMatch(/premium/i);
      expect(copy.premium).not.toMatch(/premium/i);
      expect(copy.premiumContent).not.toMatch(/premium/i);
    }
  });
});
