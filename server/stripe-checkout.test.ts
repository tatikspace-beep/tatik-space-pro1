import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { marketplaceListings, marketplaceOrders, marketplaceSellers } from "../drizzle/schema";

const mocks = vi.hoisted(() => ({
  createCheckoutSession: vi.fn(),
  createCustomer: vi.fn(),
  getStripeReturnBaseUrl: vi.fn(),
  getDb: vi.fn(),
  createPaymentRecord: vi.fn(),
  getSubscriptionByUserIdAndStatus: vi.fn(),
  updateSubscription: vi.fn(),
  upsertUser: vi.fn(),
  createSubscription: vi.fn(),
}));

vi.mock("./_core/stripe", () => ({
  createCheckoutSession: mocks.createCheckoutSession,
  createCustomer: mocks.createCustomer,
  getStripeReturnBaseUrl: mocks.getStripeReturnBaseUrl,
  cancelSubscription: vi.fn(),
}));

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createPaymentRecord: mocks.createPaymentRecord,
    getDb: mocks.getDb,
    createSubscription: mocks.createSubscription,
    getSubscriptionByUserIdAndStatus: mocks.getSubscriptionByUserIdAndStatus,
    updateSubscription: mocks.updateSubscription,
    upsertUser: mocks.upsertUser,
  };
});

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(stripeCustomerId: string | null = "cus_test_customer"): TrpcContext {
  const now = new Date();
  const user: AuthenticatedUser = {
    id: 42,
    openId: "stripe-checkout-test",
    name: "Checkout Test",
    email: "checkout@example.com",
    password: null,
    loginMethod: "email",
    role: "user",
    trialEndsAt: null,
    subscriptionType: "free",
    stripeCustomerId,
    themePreference: "system",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };

  return {
    user,
    req: { protocol: "https", headers: {}, socket: {} },
    res: {} as TrpcContext["res"],
  };
}

describe("Stripe checkout routes", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_PRO_FIRST_MONTH_PRICE_ID = "price_first_month_test";
    process.env.STRIPE_PRO_PRICE_ID = "price_renewal_test";
    mocks.getStripeReturnBaseUrl.mockReturnValue("https://preview-checkout.vercel.app");
    mocks.getSubscriptionByUserIdAndStatus.mockResolvedValue(null);
    mocks.updateSubscription.mockResolvedValue({ id: 10 });
    mocks.createCustomer.mockResolvedValue({ id: "cus_created_test" });
    mocks.getDb.mockResolvedValue(null);
    mocks.createPaymentRecord.mockResolvedValue({ id: 55 });
    mocks.createCheckoutSession.mockResolvedValue({
      id: "cs_test_session",
      url: "https://checkout.stripe.test/session",
    });
    mocks.upsertUser.mockResolvedValue({ id: 42 });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("starts Pro through Stripe Checkout and waits for the verified webhook", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.pricing.startProSubscription();

    expect(result).toEqual({
      success: true,
      checkoutUrl: "https://checkout.stripe.test/session",
    });
    expect(mocks.createCheckoutSession).toHaveBeenCalledWith({
      customerId: "cus_test_customer",
      priceId: "price_first_month_test",
      mode: "subscription",
      successUrl: "https://preview-checkout.vercel.app/pricing?subscription=success&session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "https://preview-checkout.vercel.app/pricing?subscription=cancelled",
      metadata: { userId: "42", kind: "subscription" },
    });
    expect(mocks.createSubscription).not.toHaveBeenCalled();
  });

  it("clears only an unverified local-only Pro record before starting Checkout", async () => {
    mocks.getSubscriptionByUserIdAndStatus.mockResolvedValue({
      id: 10,
      stripeSubscriptionId: null,
      paypalSubscriptionId: null,
    });
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.pricing.startProSubscription();

    expect(result.success).toBe(true);
    expect(mocks.updateSubscription).toHaveBeenCalledWith(10, expect.objectContaining({
      status: "cancelled",
      endsAt: expect.any(Date),
    }));
    expect(mocks.upsertUser).toHaveBeenCalledWith({
      openId: "stripe-checkout-test",
      subscriptionType: "free",
    });
  });

  it("does not disturb an existing PayPal subscription or open Stripe Checkout", async () => {
    mocks.getSubscriptionByUserIdAndStatus.mockResolvedValue({
      id: 10,
      stripeSubscriptionId: null,
      paypalSubscriptionId: "I-PAYPAL-ACTIVE",
    });
    const caller = appRouter.createCaller(createAuthContext());

    await expect(caller.pricing.startProSubscription()).resolves.toMatchObject({
      success: false,
    });
    expect(mocks.updateSubscription).not.toHaveBeenCalled();
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });

  it("does not start Pro when either configured Stripe Price ID is missing", async () => {
    delete process.env.STRIPE_PRO_PRICE_ID;
    const caller = appRouter.createCaller(createAuthContext());

    await expect(caller.pricing.startProSubscription()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });

  it("uses server-owned template prices and a Preview callback", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const untrustedInput: { templateId: string } = Object.assign(
      { templateId: "saas-landing-pro" },
      { templateName: "Injected name", price: 0.01 },
    );

    const result = await caller.templatePurchases.createCheckoutSession(untrustedInput);

    expect(result).toEqual({ checkoutUrl: "https://checkout.stripe.test/session" });
    expect(mocks.createCheckoutSession).toHaveBeenCalledWith({
      mode: "payment",
      customerEmail: "checkout@example.com",
      lineItems: [{
        name: "SaaS Landing Page Premium - 30 days access",
        description: "Premium template access valid for 30 days",
        amount: 1000,
        currency: "eur",
        quantity: 1,
      }],
      metadata: {
        userId: "42",
        kind: "template",
        templateId: "saas-landing-pro",
        templateName: "SaaS Landing Page Premium",
        originalPrice: "10",
        discountPercentage: "0",
        couponCode: "none",
      },
      successUrl: "https://preview-checkout.vercel.app/profile?tab=files&purchase=success&session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "https://preview-checkout.vercel.app/templates?purchase=cancelled",
    });
  });

  it("rejects unknown premium templates instead of charging a client-provided amount", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    await expect(caller.templatePurchases.createCheckoutSession({
      templateId: "client-selected-price",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });

  it("creates developer Marketplace Checkout from the published listing price", async () => {
    const listing = {
      id: 7,
      sellerId: 9,
      title: "Preview listing",
      priceCents: 1250,
      status: "published",
    };
    const seller = {
      id: 9,
      userId: 99,
      status: "active",
      payoutAccountId: "acct_test_seller",
    };
    const database = {
      select: vi.fn(() => {
        let selectedTable: unknown;
        return {
          from: vi.fn((table: unknown) => {
            selectedTable = table;
            return {
              where: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue(
                  selectedTable === marketplaceListings ? [listing]
                    : selectedTable === marketplaceSellers ? [seller]
                      : [],
                ),
              })),
            };
          }),
        };
      }),
      insert: vi.fn((table: unknown) => ({
        values: vi.fn((values: Record<string, unknown>) => ({
          returning: vi.fn().mockResolvedValue(
            table === marketplaceOrders ? [{ ...values, id: 70 }] : [],
          ),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn().mockResolvedValue(undefined),
        })),
      })),
    };
    mocks.getDb.mockResolvedValue(database);
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.marketplace.createPurchase({ listingId: listing.id });

    expect(result).toEqual({ checkoutUrl: "https://checkout.stripe.test/session" });
    expect(mocks.createCheckoutSession).toHaveBeenCalledWith({
      customerId: "cus_test_customer",
      mode: "payment",
      lineItems: [{
        name: listing.title,
        description: "Marketplace developer listing",
        amount: listing.priceCents,
        currency: "eur",
      }],
      successUrl: "https://preview-checkout.vercel.app/marketplace?purchase=success&orderId=70&session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "https://preview-checkout.vercel.app/marketplace?purchase=cancelled",
      metadata: { userId: "42", kind: "marketplace", listingId: "7", orderId: "70" },
    });
    expect(mocks.createPaymentRecord).toHaveBeenCalledWith(expect.objectContaining({
      userId: 42,
      kind: "marketplace",
      status: "pending",
      amount: listing.priceCents,
      currency: "eur",
    }));
  });
});
