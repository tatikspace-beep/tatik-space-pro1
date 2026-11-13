import { describe, expect, it } from "vitest";
import { templatePreviewDataUrl } from "./templatePreview";

describe("template preview artwork", () => {
  it("returns an escaped SVG data URL for template metadata", () => {
    const preview = templatePreviewDataUrl({
      id: "premium-test-template",
      name: "A & B <Studio>",
      category: "portfolio",
    });

    expect(preview).toMatch(/^data:image\/svg\+xml;charset=UTF-8,/);
    const svg = decodeURIComponent(preview.split(",")[1]);
    expect(svg).toContain("A &amp; B &lt;Studio&gt;");
    expect(svg).toContain("<svg ");
  });

  it("uses distinct visual layouts for each marketplace category", () => {
    const categories = ["saas", "ecommerce", "portfolio", "business", "blog"];
    const previews = categories.map((category, index) => {
      const preview = templatePreviewDataUrl({
        id: `preview-${index}`,
        name: `Example ${category}`,
        category,
      });
      return decodeURIComponent(preview.split(",")[1]);
    });

    expect(new Set(previews).size).toBe(categories.length);
    categories.forEach((category, index) => {
      expect(previews[index]).toContain(`data-preview-family="${category}"`);
    });
  });
});
