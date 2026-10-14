import { describe, expect, it } from "vitest";
import { getStripeReturnBaseUrl } from "./stripe";

describe("getStripeReturnBaseUrl", () => {
  it("uses the deployment hostname for Preview instead of the Production APP_URL", () => {
    expect(getStripeReturnBaseUrl({
      APP_URL: "https://www.tatik.space",
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      VERCEL_URL: "tatik-preview-123.vercel.app",
    })).toBe("https://tatik-preview-123.vercel.app");
  });

  it("uses APP_URL for Production and strips any configured path", () => {
    expect(getStripeReturnBaseUrl({
      APP_URL: "https://www.tatik.space/app/",
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      VERCEL_URL: "production-build.vercel.app",
    })).toBe("https://www.tatik.space");
  });

  it("requires a deployment URL for Preview and a canonical URL for Production", () => {
    expect(() => getStripeReturnBaseUrl({
      APP_URL: "https://www.tatik.space",
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
    })).toThrow("VERCEL_URL is required");
    expect(() => getStripeReturnBaseUrl({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
    })).toThrow("APP_URL is required");
  });
});
