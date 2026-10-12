import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPayPalSubscription } from "./paypal";

const fetchMock = vi.fn();

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("PayPal API diagnostics", () => {
  beforeEach(() => {
    vi.stubEnv("PAYPAL_CLIENT_ID", "sandbox-client");
    vi.stubEnv("PAYPAL_CLIENT_SECRET", "sandbox-secret");
    vi.stubEnv("PAYPAL_ENV", "sandbox");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("logs sanitized API details while returning a generic error", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "sandbox-token" }))
      .mockResolvedValueOnce(jsonResponse({
        name: "INVALID_REQUEST",
        debug_id: "paypal-debug-123",
        details: [{
          issue: "INVALID_RESOURCE_ID",
          field: "plan_id",
          description: "Plan for buyer@example.com not found; access_token=private-value",
        }],
      }, 400));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(createPayPalSubscription({
      planId: "P-TEST",
      customId: "test-user",
      returnUrl: "https://example.com/pricing?paypal=success",
      cancelUrl: "https://example.com/pricing?paypal=cancelled",
    })).rejects.toThrow("PayPal API error (400)");

    expect(errorSpy).toHaveBeenCalledWith("[PayPal] API request failed", {
      status: 400,
      name: "INVALID_REQUEST",
      debugId: "paypal-debug-123",
      details: [{
        issue: "INVALID_RESOURCE_ID",
        field: "plan_id",
        description: "Plan for [redacted-email] not found; [redacted-credential]",
      }],
    });
  });
});
