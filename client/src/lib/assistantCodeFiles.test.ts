import { describe, expect, it } from "vitest";
import { extractAssistantCodeBlocks, extractAssistantCodeFiles } from "./assistantCodeFiles";

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
});
