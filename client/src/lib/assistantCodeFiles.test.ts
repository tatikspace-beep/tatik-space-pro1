import { describe, expect, it } from "vitest";
import {
  extractAssistantCodeBlocks,
  extractAssistantCodeFiles,
  extractAssistantProjectMoves,
  findAgentFilesWithExcessiveScopeLoss,
  findUnverifiedGoogleMapEmbeds,
  hasAssistantProjectOperationsBlock,
} from "./assistantCodeFiles";

describe("assistant code response parsing", () => {
  it("extracts named files from headings and fenced code blocks", () => {
    const response = [
      "### src/index.html",
      "```html",
      "<main>Hello</main>",
      "```",
      "",
      "**src/styles/main.css**",
      "```css",
      "main { color: navy; }",
      "```",
    ].join("\n");

    expect(extractAssistantCodeFiles(response)).toEqual([
      { path: "src/index.html", content: "<main>Hello</main>" },
      { path: "src/styles/main.css", content: "main { color: navy; }" },
    ]);
  });

  it("supports file paths embedded in the code fence info string", () => {
    expect(extractAssistantCodeFiles('```html filename="pages/home.html"\n<h1>Home</h1>\n```'))
      .toEqual([{ path: "pages/home.html", content: "<h1>Home</h1>" }]);
  });

  it("removes numbered Markdown list prefixes from file headings", () => {
    const response = [
      "1️⃣ `index.html`",
      "```html",
      "<a href=\"css/style.css\">Style</a>",
      "```",
      "2️⃣ `css/style.css`",
      "```css",
      "body { color: navy; }",
      "```",
      "3. `js/main.js`",
      "```js",
      "console.log('Belice');",
      "```",
    ].join("\n");

    expect(extractAssistantCodeFiles(response)).toEqual([
      { path: "index.html", content: '<a href="css/style.css">Style</a>' },
      { path: "css/style.css", content: "body { color: navy; }" },
      { path: "js/main.js", content: "console.log('Belice');" },
    ]);
  });

  it("ignores unsafe paths, duplicate paths, and unnamed blocks", () => {
    const response = [
      "### ../outside.ts",
      "```ts",
      "unsafe",
      "```",
      "### .env",
      "```text",
      "secret",
      "```",
      "### src/app.ts",
      "```ts",
      "safe",
      "```",
      "### src/app.ts",
      "```ts",
      "duplicate",
      "```",
      "```js",
      "unnamed",
      "```",
    ].join("\n");

    expect(extractAssistantCodeFiles(response)).toEqual([{ path: "src/app.ts", content: "safe" }]);
  });

  it("extracts all non-empty code blocks for the single-file editor action", () => {
    expect(extractAssistantCodeBlocks("Example:\n```js\nconst a = 1;\n```\n```css\nbody{}\n```"))
      .toEqual([
        { language: "js", content: "const a = 1;" },
        { language: "css", content: "body{}" },
      ]);
  });

  it("extracts explicit file moves from the project operations block", () => {
    const response = [
      "### belice/assets/css/style.css",
      "```css",
      "body { color: #222; }",
      "```",
      "```tatik-project-operations",
      JSON.stringify({ moves: [{ fromPath: "assets/css/style.css", toPath: "belice/assets/css/style.css" }] }),
      "```",
    ].join("\n");

    expect(hasAssistantProjectOperationsBlock(response)).toBe(true);
    expect(extractAssistantCodeFiles(response)).toEqual([
      { path: "belice/assets/css/style.css", content: "body { color: #222; }" },
    ]);
    expect(extractAssistantCodeBlocks(response)).toEqual([
      { language: "css", content: "body { color: #222; }" },
    ]);
    expect(extractAssistantProjectMoves(response)).toEqual([
      { fromPath: "assets/css/style.css", toPath: "belice/assets/css/style.css" },
    ]);
  });

  it("rejects unsafe, duplicate, and malformed project moves", () => {
    expect(() => extractAssistantProjectMoves([
      "```tatik-project-operations",
      JSON.stringify({ moves: [{ fromPath: "../secret.html", toPath: "belice/secret.html" }] }),
      "```",
    ].join("\n"))).toThrow("percorso file non valido");
    expect(() => extractAssistantProjectMoves([
      "```tatik-project-operations",
      JSON.stringify({ moves: [
        { fromPath: "index.html", toPath: "belice/index.html" },
        { fromPath: "about.html", toPath: "belice/INDEX.html" },
      ] }),
      "```",
    ].join("\n"))).toThrow("destinazione duplicati");
    expect(() => extractAssistantProjectMoves("```tatik-project-operations\n{bad json}\n```"))
      .toThrow("JSON valido");
  });

  it("blocks unverified Google Maps coordinates or place IDs", () => {
    expect(findUnverifiedGoogleMapEmbeds([{
      path: "index.html",
      content: '<iframe src="https://www.google.com/maps/embed?pb=!2d12.123456!3d44.123456!1s0x1234567890abcdef:0x1234567890abcdef"></iframe>',
    }], "Ristorante Due Palme, Santa Ninfa")).toEqual(["index.html"]);
  });

  it("allows address-search embeds and coordinates explicitly supplied by the user", () => {
    expect(findUnverifiedGoogleMapEmbeds([{
      path: "index.html",
      content: '<iframe src="https://maps.google.com/maps?q=Ristorante%20Due%20Palme&output=embed"></iframe>',
    }], "Ristorante Due Palme, Santa Ninfa")).toEqual([]);
    expect(findUnverifiedGoogleMapEmbeds([{
      path: "index.html",
      content: '<iframe src="https://www.google.com/maps/embed?pb=!2d12.123456!3d44.123456"></iframe>',
    }], "Coordinate verificate: 12.123456, 44.123456")).toEqual([]);
  });

  it("blocks a localized edit that would discard most of the existing page", () => {
    const original = [
      "<header><h1>Restaurant</h1></header>",
      ...Array.from({ length: 7 }, (_, index) =>
        `<section id="section-${index}"><h2>Existing section ${index}</h2><p>${"Existing content ".repeat(20)}</p></section>`,
      ),
      "<footer>Existing footer</footer>",
    ].join("\n");
    const replacement = '<section><h2>Valutazioni dei clienti</h2><div class="ratings"></div></section>';

    expect(findAgentFilesWithExcessiveScopeLoss(
      [{ path: "index.html", content: replacement }],
      [{ path: "index.html", content: original }],
      "Allinea le valutazioni dei clienti",
    )).toEqual(["index.html"]);
  });

  it("allows complete local edits and explicit full-page rewrites", () => {
    const original = [
      "<header><h1>Restaurant</h1></header>",
      ...Array.from({ length: 7 }, (_, index) =>
        `<section id="section-${index}"><h2>Existing section ${index}</h2><p>${"Existing content ".repeat(20)}</p></section>`,
      ),
      "<footer>Existing footer</footer>",
    ].join("\n");
    const updated = original.replace("<h2>Existing section 3</h2>", '<h2 class="centered">Existing section 3</h2>');

    expect(findAgentFilesWithExcessiveScopeLoss(
      [{ path: "index.html", content: updated }],
      [{ path: "index.html", content: original }],
      "Allinea le valutazioni dei clienti",
    )).toEqual([]);
    expect(findAgentFilesWithExcessiveScopeLoss(
      [{ path: "index.html", content: "<section>New design</section>" }],
      [{ path: "index.html", content: original }],
      "Riprogetta tutta la pagina da zero",
    )).toEqual([]);
  });
});
