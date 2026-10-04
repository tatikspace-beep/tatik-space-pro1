import { describe, expect, it } from "vitest";
import { scanMarketplaceTemplate } from "./marketplace-scan";

describe("marketplace automatic code scan", () => {
  it("passes an ordinary HTML template", () => {
    expect(scanMarketplaceTemplate("index.html", "<!doctype html><h1>Hello</h1>")).toMatchObject({
      status: "passed",
      findings: [],
    });
  });

  it("blocks a committed private key without returning its value", () => {
    const result = scanMarketplaceTemplate("config.txt", "-----BEGIN PRIVATE KEY-----\nsecret-material\n-----END PRIVATE KEY-----");
    expect(result.status).toBe("blocked");
    expect(result.findings[0].message).not.toContain("secret-material");
  });

  it("blocks known cryptominer signatures", () => {
    expect(scanMarketplaceTemplate("miner.js", "loadCoinHiveMiner()").status).toBe("blocked");
  });

  it("holds a password form with network submission for additional review", () => {
    expect(scanMarketplaceTemplate("login.html", '<input type="password"><script>fetch("/login")</script>').status).toBe("review");
  });

  it("holds dynamic execution for additional review", () => {
    expect(scanMarketplaceTemplate("script.js", "const result = eval(input);").status).toBe("review");
  });

  it("scans each source file in an editor project manifest", () => {
    const project = JSON.stringify({
      format: "tatik-project-v1",
      files: [
        { name: "index.html", path: "index.html", content: "<h1>Safe</h1>" },
        { name: "secret.js", path: "src/secret.js", content: "const key = 'sk_live_abcdefghijklmnopqrstuv';" },
      ],
    });
    expect(scanMarketplaceTemplate("project.json", project).status).toBe("blocked");
  });

  it("rejects project manifests with unsafe paths", () => {
    const project = JSON.stringify({
      format: "tatik-project-v1",
      files: [{ name: "index.html", path: "../outside.html", content: "<h1>x</h1>" }],
    });
    expect(() => scanMarketplaceTemplate("project.json", project)).toThrow("percorso");
  });
});
