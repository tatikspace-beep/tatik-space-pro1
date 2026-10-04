import type Stripe from "stripe";
import * as db from "../db";
import { getDb } from "../db";
import {
  marketplaceBalanceEntries,
  marketplaceListings,
  marketplaceOrders,
  marketplaceSellers,
  paymentRecords,
  subscriptions,
  templatePurchases,
  users,
} from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { constructWebhookEvent, moveSubscriptionToPrice, refundPayment } from "./stripe";

function jsonMetadata(value: unknown) {
  return JSON.stringify(value ?? {});
}

function getUserId(metadata: Record<string, string | undefined>) {
  const value = Number(metadata.userId);
  return Number.isInteger(value) && value > 0 ? value : null;
}

async function updateUserTier(userId: number, tier: string) {
  const database = await getDb();
  if (!database) throw new Error("Database is not configured");
  await database.update(users).set({
    subscriptionType: tier,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
}

async function processCheckoutSession(
  session: Stripe.Checkout.Session,
  eventId: string,
) {
  const metadata = (session.metadata || {}) as Record<string, string | undefined>;
  const userId = getUserId(metadata);
  if (!userId) throw new Error("Stripe checkout session is missing userId metadata");

  const existingEvent = await db.getPaymentRecordByProviderEvent("stripe", eventId);
  if (existingEvent) return existingEvent;

  const isPaid = session.payment_status === "paid" || session.amount_total === 0;
  if (!isPaid) return null;

  const isTemplate = metadata.kind === "template" || Boolean(metadata.templateId);
  let marketplaceOrder: typeof marketplaceOrders.$inferSelect | undefined;
  let marketplaceListingUnavailable = false;
  if (metadata.kind === "marketplace" && metadata.orderId) {
    const database = await getDb();
    if (!database) throw new Error("Database is not configured");
    const orderId = Number(metadata.orderId);
    marketplaceOrder = (await database.select().from(marketplaceOrders)
      .where(eq(marketplaceOrders.id, orderId)).limit(1))[0];
    if (
      !marketplaceOrder ||
      marketplaceOrder.buyerId !== userId ||
      String(marketplaceOrder.listingId) !== metadata.listingId ||
      session.amount_total !== marketplaceOrder.grossAmountCents ||
      (session.currency || "eur").toLowerCase() !== "eur"
    ) {
      throw new Error("Stripe marketplace payment does not match its pending order");
    }
    if (marketplaceOrder.status === "refunded") {
      throw new Error("A refunded marketplace order cannot be marked as paid");
    }
    const listing = (await database.select().from(marketplaceListings)
      .where(eq(marketplaceListings.id, marketplaceOrder.listingId)).limit(1))[0];
    if (!listing) throw new Error("Marketplace listing no longer exists");
    marketplaceListingUnavailable = listing.status !== "published";
  }
  const providerPaymentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.id;
  const pendingRecord = await db.getPaymentRecordByProviderPayment("stripe", session.id);
  if (marketplaceListingUnavailable && marketplaceOrder) {
    if (typeof session.payment_intent !== "string") {
      throw new Error("Cannot refund a suspended marketplace order without its Stripe payment intent");
    }
    await refundPayment(
      session.payment_intent,
      undefined,
      `marketplace-suspended-order-${marketplaceOrder.id}`,
    );
    const refundedAt = new Date();
    const record = pendingRecord
      ? await db.updatePaymentRecord(pendingRecord.id, {
        status: "refunded",
        providerPaymentId,
        providerEventId: eventId,
        amount: session.amount_total ?? pendingRecord.amount ?? 0,
        currency: session.currency || pendingRecord.currency || "eur",
        metadata: jsonMetadata(metadata),
        verifiedAt: refundedAt,
      })
      : await db.createPaymentRecord({
        userId,
        provider: "stripe",
        kind: "marketplace",
        status: "refunded",
        providerPaymentId,
        providerEventId: eventId,
        amount: session.amount_total ?? 0,
        currency: session.currency || "eur",
        metadata: jsonMetadata(metadata),
        verifiedAt: refundedAt,
      });
    if (!record) throw new Error("Unable to persist refunded Stripe marketplace payment");
    const database = await getDb();
    if (!database) throw new Error("Database is not configured");
    await database.update(marketplaceOrders).set({
      paymentRecordId: record.id,
      status: "refunded",
      refundedAt,
      updatedAt: refundedAt,
    }).where(eq(marketplaceOrders.id, marketplaceOrder.id));
    return record;
  }
  const record = pendingRecord
    ? await db.updatePaymentRecord(pendingRecord.id, {
      status: "paid",
      providerPaymentId,
      providerEventId: eventId,
      templateId: metadata.templateId || pendingRecord.templateId || null,
      amount: session.amount_total ?? pendingRecord.amount ?? 0,
      currency: session.currency || pendingRecord.currency || "eur",
      metadata: jsonMetadata(metadata),
      verifiedAt: new Date(),
    })
    : await db.createPaymentRecord({
      userId,
      provider: "stripe",
      kind: metadata.kind === "marketplace" ? "marketplace" : isTemplate ? "template" : "subscription",
      status: "paid",
      providerPaymentId,
      providerEventId: eventId,
      templateId: metadata.templateId || null,
      amount: session.amount_total ?? 0,
      currency: session.currency || "eur",
      metadata: jsonMetadata(metadata),
      verifiedAt: new Date(),
    });
  if (!record) throw new Error("Unable to persist Stripe payment");

  if (isTemplate) {
    await db.grantTemplateAccess({
      userId,
      templateId: metadata.templateId!,
      price: metadata.originalPrice || ((session.amount_total || 0) / 100).toFixed(2),
      paymentRecordId: record.id,
      providerPaymentId: record.providerPaymentId,
    });
    return record;
  }

  if (metadata.kind === "marketplace" && metadata.orderId) {
    const database = await getDb();
    if (!database) throw new Error("Database is not configured");
    const order = marketplaceOrder;
    if (order && order.status !== "paid") {
      await database.update(marketplaceOrders).set({ status: "paid", updatedAt: new Date() })
        .where(eq(marketplaceOrders.id, order.id));
    }
    if (order) {
      await database.insert(marketplaceBalanceEntries).values({
        sellerId: order.sellerId,
        orderId: order.id,
        type: "sale",
        amountCents: order.sellerAmountCents,
        currency: "eur",
        availableAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        note: "Marketplace sale net of 15% Tatik commission",
      }).onConflictDoNothing();
    }
    return record;
  }

  const stripeSubscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : null;
  const existingSubscription = stripeSubscriptionId
    ? await db.getSubscriptionByStripeId(stripeSubscriptionId)
    : null;
  if (!existingSubscription) {
    const now = new Date();
    await db.createSubscription({
      userId,
      tier: "pro",
      status: "active",
      currentPrice: ((session.amount_total ?? 599) / 100).toFixed(2),
      isFirstMonth: 1,
      startedAt: now,
      renewsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      stripeSubscriptionId,
    });
  }
  if (stripeSubscriptionId && process.env.STRIPE_PRO_PRICE_ID) {
    await moveSubscriptionToPrice(stripeSubscriptionId, process.env.STRIPE_PRO_PRICE_ID);
  }
  await updateUserTier(userId, "pro");
  return record;
}

async function processSubscriptionEvent(subscription: Stripe.Subscription) {
  const existing = await db.getSubscriptionByStripeId(subscription.id);
  const metadata = (subscription.metadata || {}) as Record<string, string | undefined>;
  const userId = getUserId(metadata);
  const status = subscription.status === "active" || subscription.status === "trialing"
    ? "active"
    : subscription.status === "canceled" ? "cancelled" : subscription.status;

  if (process.env.STRIPE_PRO_PRICE_ID) {
    await moveSubscriptionToPrice(subscription.id, process.env.STRIPE_PRO_PRICE_ID);
  }

  if (existing) {
    await db.updateSubscription(existing.id, {
      status,
      endsAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
      renewsAt: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
    });
    await updateUserTier(existing.userId, status === "active" ? "pro" : "free");
    return;
  }
  if (userId) {
    const amount = subscription.items.data[0]?.price?.unit_amount;
    await db.createSubscription({
      userId,
      tier: "pro",
      status,
      currentPrice: ((amount || 599) / 100).toFixed(2),
      isFirstMonth: 1,
      startedAt: new Date((subscription.start_date || Math.floor(Date.now() / 1000)) * 1000),
      endsAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
      renewsAt: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      stripeSubscriptionId: subscription.id,
    });
    await updateUserTier(userId, status === "active" ? "pro" : "free");
  }
}

export async function handleStripeEvent(event: Stripe.Event) {
  const eventType = event.type as string;
  switch (eventType) {
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const database = await getDb();
      if (database) {
        await database.update(marketplaceSellers).set({
          status: account.details_submitted && account.charges_enabled && account.payouts_enabled
            ? "active" : "restricted",
          updatedAt: new Date(),
        }).where(eq(marketplaceSellers.payoutAccountId, account.id));
      }
      break;
    }
    case "transfer.created":
    case "transfer.paid":
    case "transfer.failed": {
      const transfer = event.data.object as Stripe.Transfer;
      const database = await getDb();
      if (database) {
        const status = eventType === "transfer.paid"
          ? "paid_out"
          : eventType === "transfer.failed" ? "failed" : "transfer_pending";
        const balanceEntryId = Number(transfer.metadata.balanceEntryId);
        await database.update(marketplaceBalanceEntries).set({
          transferId: transfer.id,
          transferStatus: status,
          transferEventId: event.id,
          ...(status === "paid_out" ? { transferredAt: new Date() } : {}),
        }).where(Number.isInteger(balanceEntryId) && balanceEntryId > 0
          ? eq(marketplaceBalanceEntries.id, balanceEntryId)
          : eq(marketplaceBalanceEntries.transferId, transfer.id));
      }
      break;
    }
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await processCheckoutSession(event.data.object as Stripe.Checkout.Session, event.id);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await processSubscriptionEvent(event.data.object as Stripe.Subscription);
      break;
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : null;
      if (paymentIntentId) {
        const record = await db.getPaymentRecordByProviderPayment("stripe", paymentIntentId);
        if (record) {
          await db.updatePaymentRecord(record.id, {
            status: "refunded",
            providerEventId: event.id,
            verifiedAt: new Date(),
          });
          const database = await getDb();
          if (database) {
            await database.update(templatePurchases)
              .set({ expiresAt: new Date() })
              .where(eq(templatePurchases.paymentRecordId, record.id));
            const marketplaceOrder = (await database.select().from(marketplaceOrders)
              .where(eq(marketplaceOrders.paymentRecordId, record.id)).limit(1))[0];
            if (marketplaceOrder && marketplaceOrder.status !== "refunded") {
              await database.update(marketplaceOrders).set({
                status: "refunded",
                refundedAt: new Date(),
                updatedAt: new Date(),
              }).where(eq(marketplaceOrders.id, marketplaceOrder.id));
              await database.insert(marketplaceBalanceEntries).values({
                sellerId: marketplaceOrder.sellerId,
                orderId: marketplaceOrder.id,
                type: "refund",
                amountCents: -marketplaceOrder.sellerAmountCents,
                currency: record.currency || "eur",
                transferStatus: "pending",
                note: "Marketplace sale reversed after provider refund",
              });
            }
          }
        }
      }
      break;
    }
    default:
      break;
  }
}

export async function handleStripeWebhook(payload: string | Buffer, signature: string) {
  const event = constructWebhookEvent(payload, signature);
  const existing = await db.getPaymentRecordByProviderEvent("stripe", event.id);
  if (existing && event.type !== "charge.refunded") return { received: true, duplicate: true };
  await handleStripeEvent(event);
  return { received: true };
}
