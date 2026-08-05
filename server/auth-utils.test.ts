import { describe, expect, it } from "vitest";
import { hashPassword, isAdminEmail, isAdminOpenId, normalizeEmail, verifyPassword } from "./auth-utils";

describe("auth utils", () => {
  it("normalizes admin email and treats local admin openId as admin", () => {
    expect(normalizeEmail(" TATIK.SPACE@GMAIL.COM ")).toBe("tatik.space@gmail.com");
    expect(isAdminEmail("tatik.space@gmail.com")).toBe(true);
    expect(isAdminOpenId("local:tatik.space@gmail.com")).toBe(true);
  });

  it("hashes and verifies passwords consistently", () => {
    const password = "StrongPass123!";
    const hashed = hashPassword(password);

    expect(verifyPassword(password, hashed)).toBe(true);
    expect(verifyPassword("WrongPass123!", hashed)).toBe(false);
  });
});
