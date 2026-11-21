import { afterEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import {
  createSignedEmailAccessToken,
  createSignedEmailRegistrationToken,
  verifySignedEmailAccessToken,
  verifySignedEmailRegistrationToken,
} from "./email-access-token";

describe("email access tokens", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("verifies the email in a signed access token", async () => {
    vi.stubEnv("JWT_SECRET", "test-secret-with-sufficient-length");
    const token = await createSignedEmailAccessToken("user@example.com");

    await expect(verifySignedEmailAccessToken(token)).resolves.toEqual({
      email: "user@example.com",
    });
  });

  it("rejects expired, tampered, and non-access tokens", async () => {
    vi.stubEnv("JWT_SECRET", "test-secret-with-sufficient-length");
    vi.useFakeTimers();
    const token = await createSignedEmailAccessToken("user@example.com");
    vi.advanceTimersByTime(10 * 60 * 1000 + 1);
    await expect(verifySignedEmailAccessToken(token)).rejects.toThrow();
    await expect(verifySignedEmailAccessToken(`${token}tampered`)).rejects.toThrow();

    const nonAccessToken = await new SignJWT({
      email: "user@example.com",
      purpose: "registration",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(new TextEncoder().encode("test-secret-with-sufficient-length"));
    await expect(verifySignedEmailAccessToken(nonAccessToken)).rejects.toThrow(
      "Invalid access token",
    );
  });

  it("verifies registration tokens without accepting access tokens as registration links", async () => {
    vi.stubEnv("JWT_SECRET", "test-secret-with-sufficient-length");
    const registrationToken = await createSignedEmailRegistrationToken("user@example.com");
    const accessToken = await createSignedEmailAccessToken("user@example.com");

    await expect(verifySignedEmailRegistrationToken(registrationToken)).resolves.toEqual({
      email: "user@example.com",
    });
    await expect(verifySignedEmailRegistrationToken(accessToken)).rejects.toThrow(
      "Invalid registration token",
    );
    await expect(verifySignedEmailAccessToken(registrationToken)).rejects.toThrow(
      "Invalid access token",
    );
  });

  it("expires registration tokens after ten minutes", async () => {
    vi.stubEnv("JWT_SECRET", "test-secret-with-sufficient-length");
    vi.useFakeTimers();
    const token = await createSignedEmailRegistrationToken("user@example.com");
    vi.advanceTimersByTime(10 * 60 * 1000 + 1);

    await expect(verifySignedEmailRegistrationToken(token)).rejects.toThrow();
  });
});
