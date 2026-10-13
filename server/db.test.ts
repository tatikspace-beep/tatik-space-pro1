import { describe, expect, it } from "vitest";
import { resolveDatabaseConnectionString } from "./db";

describe("resolveDatabaseConnectionString", () => {
  it("uses the branch-scoped DATABASE_URL for the isolated PayPal Preview", () => {
    expect(resolveDatabaseConnectionString({
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "preview/paypal-diagnostics-20261012",
      DATABASE_URL: "postgres://isolated-preview.invalid/postgres",
      POSTGRES_URL: "postgres://integration.invalid/postgres",
    })).toBe("postgres://isolated-preview.invalid/postgres");
  });

  it("preserves the existing PostgreSQL variable precedence on other Preview branches", () => {
    expect(resolveDatabaseConnectionString({
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "another-preview-branch",
      DATABASE_URL: "postgres://database.invalid/postgres",
      POSTGRES_URL: "postgres://integration.invalid/postgres",
    })).toBe("postgres://integration.invalid/postgres");
  });

  it("preserves the existing PostgreSQL variable precedence in Production", () => {
    expect(resolveDatabaseConnectionString({
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: "preview/paypal-diagnostics-20261012",
      DATABASE_URL: "postgres://database.invalid/postgres",
      POSTGRES_URL: "postgres://integration.invalid/postgres",
    })).toBe("postgres://integration.invalid/postgres");
  });
});
