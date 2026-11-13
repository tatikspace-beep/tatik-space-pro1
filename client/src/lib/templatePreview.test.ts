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
});
