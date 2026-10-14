import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { marketplaceListings, marketplaceOrders } from "../../drizzle/schema";

const mocks = vi.hoisted(() => ({
  createSubscription: vi.fn(),
  getPaymentRecordByProviderEvent: vi.fn(),
  getPaymentRecordByProviderPayment: vi.fn(),
  getSubscriptionByStripeId: vi.fn(),
  updatePaymentRecord: vi.fn(),
  updateSubscription: vi.fn(),
  getDb: vi.fn(),
  constructWebhookEvent: vi.fn(),
  moveSubscriptionToPrice: vi.fn(),
  refundPayment: vi.fn(),
}));

vi.mock("../db", async importOriginal => {
  const actual = await importOriginal<typeof import("../db")>();
  return {
    ...actual,
    createSubscription: mocks.createSubscription,
    getPaymentRecordByProviderEvent: mocks.getPaymentRecordByProviderEvent,
    getPaymentRecordByProviderPayment: mocks.getPaymentRecordByProviderPayment,
    getSubscriptionByStripeId: mocks.getSubscriptionByStripeId,
    updatePaymentRecord: mocks.updatePaymentRecord,
    updateSubscription: mocks.updateSubscription,
    getDb: mocks.getDb,
  };
});

vi.mock("./stripe", () => ({
  constructWebhookEvent: mocks.constructWebhookEvent,
  moveSubscriptionToPrice: mocks.moveSubscriptionToPrice,
  refundPayment: mocks.refundPayment,
}));

import { handleStripeEvent } from "./paymentWebhooks";

describe("Stripe subscription webhooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSubscriptionByStripeId.mockResolvedValue(null);
    mocks.getPaymentRecordByProviderEvent.mockResolvedValue(null);
    mocks.getPaymentRecordByProviderPayment.mockResolvedValue({ id: 55 });
    mocks.updatePaymentRecord.mockResolvedValue({ id: 55 });
  });

  it("does not grant Pro from a subscription event before paid Checkout is recorded", async () => {
    const subscription = {
      id: "sub_unconfirmed",
      status: "active",
      metadata: { userId: "42" },
      items: { data: [{ price: { id: "price_first_month_test", unit_amount: 599 } }] },
    } as unknown as Stripe.Subscription;

    await handleStripeEvent({
      id: "evt_subscription_created",
      type: "customer.subscription.created",
      data: { object: subscription },
    } as Stripe.Event);

    expect(mocks.getSubscriptionByStripeId).toHaveBeenCalledWith("sub_unconfirmed");
    expect(mocks.createSubscription).not.toHaveBeenCalled();
    expect(mocks.updateSubscription).not.toHaveBeenCalled();
    expect(mocks.moveSubscriptionToPrice).not.toHaveBeenCalled();
  });

  it("processes subscription updates after a verified Checkout created the DB record", async () => {
    mocks.getSubscriptionByStripeId.mockResolvedValue({
      id: 10,
      userId: 42,
      stripeSubscriptionId: "sub_paid",
    });
    mocks.getDb.mockResolvedValue({
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn().mockResolvedValue(undefined),
        })),
      })),
    });
    const subscription = {
      id: "sub_paid",
      status: "active",
      metadata: { userId: "42" },
      ended_at: null,
      current_period_end: 1_800_000_000,
      items: { data: [] },
    } as unknown as Stripe.Subscription;

    await handleStripeEvent({
      id: "evt_subscription_updated",
      type: "customer.subscription.updated",
      data: { object: subscription },
    } as Stripe.Event);

    expect(mocks.updateSubscription).toHaveBeenCalledWith(10, expect.objectContaining({
      status: "active",
      renewsAt: new Date(1_800_000_000 * 1000),
    }));
  });

  it("marks a paid developer Marketplace order and credits the seller balance", async () => {
    const order = {
      id: 70,
      buyerId: 42,
      listingId: 7,
      sellerId: 9,
      grossAmountCents: 1250,
      sellerAmountCents: 1063,
      status: "pending",
    };
    const listing = { id: 7, status: "published" };
    const database = {
      select: vi.fn(() => {
        let selectedTable: unknown;
        return {
          from: vi.fn((table: unknown) => {
            selectedTable = table;
            return {
              where: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue(
                  selectedTable === marketplaceOrders ? [order]
                    : selectedTable === marketplaceListings ? [listing]
                      : [],
                ),
              })),
            };
          }),
        };
      }),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn().mockResolvedValue(undefined),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
        })),
      })),
    };
    mocks.getDb.mockResolvedValue(database);

    await handleStripeEvent({
      id: "evt_marketplace_paid",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_marketplace_paid",
          payment_status: "paid",
          amount_total: 1250,
          currency: "eur",
          payment_intent: "pi_marketplace_paid",
          metadata: {
            userId: "42",
            kind: "marketplace",
            listingId: "7",
            orderId: "70",
          },
        } as Stripe.Checkout.Session,
      },
    } as Stripe.Event);

    expect(mocks.updatePaymentRecord).toHaveBeenCalledWith(55, expect.objectContaining({
      status: "paid",
      providerEventId: "evt_marketplace_paid",
      providerPaymentId: "pi_marketplace_paid",
    }));
    expect(database.update).toHaveBeenCalled();
    expect(database.insert).toHaveBeenCalled();
  });
});
