import { describe, expect, it } from "vitest";
import { validateAssistantProjectReferences } from "./assistantProjectIntegrity";

describe("validateAssistantProjectReferences", () => {
  it("accepts local links between consolidated pages and assets", () => {
    const issues = validateAssistantProjectReferences([], [
      {
        path: "belice/index.html",
        content: '<a href="contatti.html">Contatti</a><link href="assets/css/style.css"><script src="assets/js/main.js"></script>',
      },
      { path: "belice/contatti.html", content: '<a href="index.html">Home</a>' },
      { path: "belice/assets/css/style.css", content: 'body { background: url("../img/olio.jpg"); }' },
      { path: "belice/assets/js/main.js", content: 'import "./modules/menu.js";' },
      { path: "belice/assets/js/modules/menu.js", content: "export {};" },
      { path: "belice/assets/img/olio.jpg", content: "binary" },
    ], []);

    expect(issues).toEqual([]);
  });

  it("reports missing assets and references left at old paths after a move", () => {
    const issues = validateAssistantProjectReferences(
      [{ path: "assets/js/auth.js", content: "existing" }],
      [{
        path: "belice/index.html",
        content: '<link href="assets/css/style.css"><script src="../assets/js/auth.js"></script>',
      }],
      [{ fromPath: "assets/js/auth.js", toPath: "belice/assets/js/auth.js" }],
    );

    expect(issues).toEqual([
      { sourcePath: "belice/index.html", reference: "assets/css/style.css", reason: "missing" },
      { sourcePath: "belice/index.html", reference: "../assets/js/auth.js", reason: "stale" },
    ]);
  });

  it("ignores external URLs and preserves root-relative local links", () => {
    const issues = validateAssistantProjectReferences([{ path: "shared/help.html" }], [{
      path: "belice/index.html",
      content: '<a href="https://example.com">External</a><script src="https://cdn.example.com/app.js"></script><a href="/shared/help.html">Help</a>',
    }], []);

    expect(issues).toEqual([]);
  });
});
