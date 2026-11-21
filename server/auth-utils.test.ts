import { describe, expect, it } from "vitest";
import { hashPassword, isAdminEmail, isAdminOpenId, isAgentEarlyAccessEmail, normalizeEmail, verifyPassword } from "./auth-utils";

describe("auth utils", () => {
  it("normalizes admin email and treats local admin openId as admin", () => {
    expect(normalizeEmail(" TATIK.SPACE@GMAIL.COM ")).toBe("tatik.space@gmail.com");
    expect(isAdminEmail("tatik.space@gmail.com")).toBe(true);
    expect(isAdminOpenId("local:tatik.space@gmail.com")).toBe(true);
  });

  it("recognizes the explicitly configured early-access developer accounts", () => {
    const earlyAccessEmails = [
      "tatik.space@outlook.it",
      "tatik.space@outlook.com",
      "tatik.space1@outlook.it",
      "tatik.space1@outlook.com",
      "tatik.space2@outlook.it",
      "tatik.space2@outlook.com",
      "tatik.space3@outlook.it",
      "tatik.space3@outlook.com",
      "tatik.space@hotmail.com",
      "tatik.space1@hotmail.com",
      "tatik.space2@hotmail.com",
      "tatik.space3@hotmail.com",
    ];
    expect(earlyAccessEmails.every(isAgentEarlyAccessEmail)).toBe(true);
    expect(isAgentEarlyAccessEmail(" TATIK.SPACE@OUTLOOK.IT ")).toBe(true);
    expect(isAgentEarlyAccessEmail("unlisted@example.com")).toBe(false);
  });

  it("hashes and verifies passwords consistently", () => {
    const password = "StrongPass123!";
    const hashed = hashPassword(password);

    expect(verifyPassword(password, hashed)).toBe(true);
    expect(verifyPassword("WrongPass123!", hashed)).toBe(false);
  });
});
