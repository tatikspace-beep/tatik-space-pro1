import { describe, expect, it } from "vitest";
import { getAuthBaseUrl } from "./authUrls";

describe("getAuthBaseUrl", () => {
  it("uses the active Preview branch URL instead of a configured APP_URL", () => {
    expect(getAuthBaseUrl({
      APP_URL: "https://old-preview.example.com",
      VERCEL_ENV: "preview",
      VERCEL_BRANCH_URL: "current-preview.example.com",
      VERCEL_URL: "deployment-id.example.com",
    })).toBe("https://current-preview.example.com");
  });

  it("falls back to the current Preview deployment URL when the branch URL is unavailable", () => {
    expect(getAuthBaseUrl({
      APP_URL: "https://old-preview.example.com",
      VERCEL_ENV: "preview",
      VERCEL_URL: "deployment-id.example.com",
    })).toBe("https://deployment-id.example.com");
  });

  it("keeps Preview authentication links on the deployment that received the request", () => {
    expect(getAuthBaseUrl({
      APP_URL: "https://old-preview.example.com",
      VERCEL_ENV: "preview",
      VERCEL_BRANCH_URL: "current-preview.example.com",
      VERCEL_URL: "deployment-id.example.com",
    }, "https://deployment-id.example.com")).toBe("https://deployment-id.example.com");
  });

  it("uses the current project Preview origin when Vercel environment URLs point elsewhere", () => {
    expect(getAuthBaseUrl({
      VERCEL_ENV: "preview",
      VERCEL_BRANCH_URL: "tatik-space-pro1-old-tatikspace-beeps-projects.vercel.app",
      VERCEL_URL: "tatik-space-pro1-old-tatikspace-beeps-projects.vercel.app",
    }, "https://tatik-space-pro1-current-tatikspace-beeps-projects.vercel.app"))
      .toBe("https://tatik-space-pro1-current-tatikspace-beeps-projects.vercel.app");
  });

  it("ignores an unrecognized Preview request origin", () => {
    expect(getAuthBaseUrl({
      VERCEL_ENV: "preview",
      VERCEL_BRANCH_URL: "current-preview.example.com",
      VERCEL_URL: "deployment-id.example.com",
    }, "https://attacker.example.com")).toBe("https://current-preview.example.com");
  });

  it("ignores a Vercel origin belonging to another project or team", () => {
    expect(getAuthBaseUrl({
      VERCEL_ENV: "preview",
      VERCEL_BRANCH_URL: "tatik-space-pro1-current-tatikspace-beeps-projects.vercel.app",
    }, "https://tatik-space-pro1-current-other-team.vercel.app"))
      .toBe("https://tatik-space-pro1-current-tatikspace-beeps-projects.vercel.app");
  });

  it("fails explicitly rather than sending Preview links to APP_URL", () => {
    expect(() => getAuthBaseUrl({
      APP_URL: "https://www.tatik.space",
      VERCEL_ENV: "preview",
    })).toThrow("VERCEL_BRANCH_URL or VERCEL_URL is required");
  });

  it("continues using APP_URL for Production", () => {
    expect(getAuthBaseUrl({
      APP_URL: "https://www.tatik.space",
      VERCEL_ENV: "production",
      VERCEL_BRANCH_URL: "preview.example.com",
    })).toBe("https://www.tatik.space");
  });
});
