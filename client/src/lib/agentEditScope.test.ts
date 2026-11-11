import { describe, expect, it } from "vitest";
import { isLocalizedAgentEditRequest } from "@shared/agentEditScope";

describe("localized agent edit requests", () => {
  it("recognizes focused layout and alignment changes", () => {
    expect(isLocalizedAgentEditRequest("Allinea le valutazioni dei clienti")).toBe(true);
    expect(isLocalizedAgentEditRequest("Center the rating cards")).toBe(true);
    expect(isLocalizedAgentEditRequest("Riduci il font del titolo")).toBe(true);
  });

  it("does not treat an explicit full-page redesign as a local edit", () => {
    expect(isLocalizedAgentEditRequest("Riprogetta tutta la pagina e allinea le valutazioni")).toBe(false);
    expect(isLocalizedAgentEditRequest("Rewrite the entire page from scratch and center the cards")).toBe(false);
  });

  it("does not classify unrelated requests as local layout changes", () => {
    expect(isLocalizedAgentEditRequest("Aggiungi una nuova pagina contatti")).toBe(false);
    expect(isLocalizedAgentEditRequest("Fix the payment webhook")).toBe(false);
  });
});
