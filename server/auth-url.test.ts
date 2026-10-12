import { describe, expect, it } from "vitest";
import { authBaseUrl } from "./auth-url";

describe("authBaseUrl", () => {
  it("uses the current Vercel deployment for preview login links", () => {
    expect(authBaseUrl({
      APP_URL: "https://www.tatik.space",
      VERCEL_ENV: "preview",
      VERCEL_URL: "preview-example.vercel.app",
    })).toBe("https://preview-example.vercel.app");
  });

  it("keeps the configured app URL for production login links", () => {
    expect(authBaseUrl({
      APP_URL: "https://www.tatik.space",
      VERCEL_ENV: "production",
      VERCEL_URL: "production-example.vercel.app",
    })).toBe("https://www.tatik.space");
  });

  it("uses the Vercel URL when no app URL is configured", () => {
    expect(authBaseUrl({
      APP_URL: undefined,
      VERCEL_ENV: "production",
      VERCEL_URL: "production-example.vercel.app",
    })).toBe("https://production-example.vercel.app");
  });
});
