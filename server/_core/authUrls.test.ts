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
