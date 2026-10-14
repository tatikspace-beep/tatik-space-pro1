import { describe, expect, it } from "vitest";
import { getStripeReturnBaseUrl } from "./stripe";

describe("getStripeReturnBaseUrl", () => {
  it("uses the stable branch hostname for Preview instead of the deployment or Production hostname", () => {
    expect(getStripeReturnBaseUrl({
      APP_URL: "https://www.tatik.space",
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      VERCEL_BRANCH_URL: "tatik-space-pro1-git-preview-p-446b37.vercel.app",
      VERCEL_URL: "tatik-preview-123.vercel.app",
    })).toBe("https://tatik-space-pro1-git-preview-p-446b37.vercel.app");
  });

  it("falls back to the deployment hostname when no branch URL is available", () => {
    expect(getStripeReturnBaseUrl({
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

  it("requires a Preview URL and a canonical URL for Production", () => {
    expect(() => getStripeReturnBaseUrl({
      APP_URL: "https://www.tatik.space",
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
    })).toThrow("VERCEL_BRANCH_URL or VERCEL_URL is required");
    expect(() => getStripeReturnBaseUrl({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
    })).toThrow("APP_URL is required");
  });
});
