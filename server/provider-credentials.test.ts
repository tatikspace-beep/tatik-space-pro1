import { afterEach, describe, expect, it, vi } from "vitest";
import {
  decryptProviderCredential,
  encryptProviderCredential,
  verifyProviderCredential,
} from "./provider-credentials";

const testKey = Buffer.alloc(32, 7);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("provider credential security", () => {
  it("encrypts credentials and rejects tampering", () => {
    const encrypted = encryptProviderCredential("provider-token-secret", testKey, "user:neon");
    expect(encrypted).not.toContain("provider-token-secret");
    expect(decryptProviderCredential(encrypted, testKey, "user:neon")).toBe("provider-token-secret");
    expect(() => decryptProviderCredential(encrypted, testKey, "different-user:neon")).toThrow();

    const parts = encrypted.split(".");
    parts[3] = `${parts[3].slice(0, -2)}AA`;
    expect(() => decryptProviderCredential(parts.join("."), testKey)).toThrow();
  });

  it("verifies credentials against the provider and rejects denied access", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response("unauthorized", { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(verifyProviderCredential("cloudflare", "valid-token-value")).resolves.toBeUndefined();
    await expect(verifyProviderCredential("neon", "invalid-token-value"))
      .rejects.toThrow("The provider rejected this credential or its permissions.");
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.cloudflare.com/client/v4/user/tokens/verify");
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: "Bearer valid-token-value",
    });
  });
});
