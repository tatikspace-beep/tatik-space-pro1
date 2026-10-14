import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cancelPayPalSubscription, createPayPalSubscription, getPayPalSubscription } from "./paypal";

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

  it("retrieves a subscription from the configured PayPal environment", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "sandbox-token" }))
      .mockResolvedValueOnce(jsonResponse({
        id: "I-TEST123",
        plan_id: "P-TEST",
        status: "ACTIVE",
      }));

    await expect(getPayPalSubscription("I-TEST123")).resolves.toMatchObject({
      id: "I-TEST123",
      plan_id: "P-TEST",
      status: "ACTIVE",
    });

    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://api-m.sandbox.paypal.com/v1/billing/subscriptions/I-TEST123",
    );
  });

  it("cancels a subscription through the configured PayPal environment", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "sandbox-token" }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(cancelPayPalSubscription("I-TEST123", "User requested cancellation"))
      .resolves.toEqual({});

    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://api-m.sandbox.paypal.com/v1/billing/subscriptions/I-TEST123/cancel",
    );
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ reason: "User requested cancellation" }),
    });
  });
});
