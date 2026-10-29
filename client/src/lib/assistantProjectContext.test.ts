import { describe, expect, it } from "vitest";
import { buildAssistantProjectContext, normalizeAssistantProjectPath } from "./assistantProjectContext";

describe("buildAssistantProjectContext", () => {
  it("provides root-relative project structure and puts the active file first", () => {
    const context = buildAssistantProjectContext("Course site", [
      { path: "/about.html", content: "<a href=\"index.html\">Home</a>" },
      { path: "/index.html", content: "<nav><a href=\"about.html\">About</a></nav>" },
    ], "/index.html");

    expect(context).toContain("Current Tatik.space project: Course site.");
    expect(context).toContain("Do not create a wrapper folder named after the project.");
    expect(context.indexOf("File: index.html")).toBeLessThan(context.indexOf("File: about.html"));
    expect(context).toContain("href=\"about.html\"");
  });

  it("normalizes legacy root-leading paths without accepting traversal", () => {
    expect(normalizeAssistantProjectPath("/src/index.html")).toBe("src/index.html");
    expect(normalizeAssistantProjectPath("../outside.html")).toBeNull();
    expect(normalizeAssistantProjectPath("C:\\outside.html")).toBeNull();
  });

  it("does not include secret, dependency, or binary asset contents", () => {
    const context = buildAssistantProjectContext("App", [
      { path: ".env", content: "SECRET_VALUE" },
      { path: "node_modules/pkg/index.js", content: "vendor code" },
      { path: "private/key.pem", content: "private key" },
      { path: "assets/logo.png", content: "data:image/png;base64,AAAA" },
      { path: "index.html", content: "<h1>Safe</h1>" },
    ]);

    expect(context).not.toContain("SECRET_VALUE");
    expect(context).not.toContain("vendor code");
    expect(context).not.toContain("private key");
    expect(context).not.toContain("AAAA");
    expect(context).toContain("File: index.html");
  });

  it("bounds project context size and reports truncated files", () => {
    const context = buildAssistantProjectContext("App", [
      { path: "index.html", content: "x".repeat(20_000) },
    ]);

    expect(context.length).toBeLessThanOrEqual(14_000);
    expect(context).toContain("[File content truncated]");
  });

  it("bounds the file tree when a project has many long paths", () => {
    const context = buildAssistantProjectContext("App", Array.from({ length: 120 }, (_, index) => ({
      path: `${"nested/".repeat(60)}file-${index}.html`,
      content: "<p>page</p>",
    })));

    expect(context.length).toBeLessThanOrEqual(14_000);
    expect(context).toContain("more files");
  });
});
