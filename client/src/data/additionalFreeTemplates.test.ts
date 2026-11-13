import { describe, expect, it } from "vitest";
import { FREE_TEMPLATES } from "./templates";
import { ADDITIONAL_FREE_TEMPLATES } from "./additionalFreeTemplates";

describe("additional free templates", () => {
  it("adds exactly five distinct, editable free templates", () => {
    const ids = ADDITIONAL_FREE_TEMPLATES.map((template) => template.id);
    const existingIds = new Set(FREE_TEMPLATES.map((template) => template.id));

    expect(ADDITIONAL_FREE_TEMPLATES).toHaveLength(5);
    expect(new Set(ids).size).toBe(5);
    expect(ids.every((id) => !existingIds.has(id))).toBe(true);
    expect(FREE_TEMPLATES.length + ADDITIONAL_FREE_TEMPLATES.length).toBe(11);
    for (const template of ADDITIONAL_FREE_TEMPLATES) {
      expect(template.isPremium).toBe(false);
      expect(template.price).toBe(0);
      expect(template.code).toContain("<!doctype html>");
      expect(template.code).toContain("@media(max-width:760px)");
    }
  });

  it("gives each free starter a page structure tailored to its purpose", () => {
    const templatesById: Record<string, { section: string; art: string }> = {
      "free-cafe-one-page": { section: "On the menu today.", art: "cafe" },
      "free-creator-portfolio": { section: "Selected projects.", art: "portfolio" },
      "free-community-event": { section: "The day at a glance.", art: "event" },
      "free-wellness-studio": { section: "Find a class that feels right.", art: "wellness" },
      "free-product-waitlist": { section: "What is coming together.", art: "waitlist" },
    };

    for (const template of ADDITIONAL_FREE_TEMPLATES) {
      expect(template.code).toContain(templatesById[template.id].section);
      expect(template.code).toContain(`data-art="${templatesById[template.id].art}"`);
    }
  });
});
