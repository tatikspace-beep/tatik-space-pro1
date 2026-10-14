import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCheckoutSession: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: class {
    checkout = {
      sessions: {
        create: mocks.createCheckoutSession,
      },
    };
  },
}));

describe("createCheckoutSession", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_checkout_helper");
    mocks.createCheckoutSession.mockReset().mockResolvedValue({
      id: "cs_test_checkout_helper",
      url: "https://checkout.stripe.test/session",
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not send subscription-only options for one-time payments", async () => {
    const { createCheckoutSession } = await import("./stripe");

    await createCheckoutSession({
      mode: "payment",
      lineItems: [{ name: "Premium template", amount: 1000, currency: "eur" }],
      successUrl: "https://preview.example/success",
      cancelUrl: "https://preview.example/cancel",
    });

    const params = mocks.createCheckoutSession.mock.calls[0]?.[0];
    expect(params).toMatchObject({ mode: "payment" });
    expect(params).not.toHaveProperty("payment_method_collection");
  });
});
