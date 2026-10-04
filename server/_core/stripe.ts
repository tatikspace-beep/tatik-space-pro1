import Stripe from "stripe";

/**
 * Stripe is intentionally not mocked. Payment code must fail closed when the
 * server has not been configured, rather than granting access locally.
 */
export const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
  return stripe;
}

export async function createCustomer(input: { email: string; name: string }) {
  return requireStripe().customers.create({
    email: input.email,
    name: input.name,
  });
}

export async function createExpressConnectAccount(input: { email?: string; country?: string }) {
  return requireStripe().accounts.create({
    type: "express",
    ...(input.email ? { email: input.email } : {}),
    country: input.country || "IT",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
}

export async function createConnectAccountLink(input: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}) {
  return requireStripe().accountLinks.create({
    account: input.accountId,
    type: "account_onboarding",
    refresh_url: input.refreshUrl,
    return_url: input.returnUrl,
  });
}

export async function getConnectAccount(accountId: string) {
  return requireStripe().accounts.retrieve(accountId);
}

export async function createConnectTransfer(input: {
  amountCents: number;
  currency: string;
  destination: string;
  metadata: Record<string, string>;
}, idempotencyKey: string) {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error("Transfer amount must be a positive integer");
  }
  return requireStripe().transfers.create(
    {
      amount: input.amountCents,
      currency: input.currency,
      destination: input.destination,
      metadata: input.metadata,
    },
    { idempotencyKey },
  );
}

export type CheckoutLineItem = {
  price?: string;
  name?: string;
  description?: string;
  amount?: number;
  currency?: string;
  quantity?: number;
};

export async function createCheckoutSession(input: {
  customerId?: string;
  customerEmail?: string;
  priceId?: string;
  lineItems?: CheckoutLineItem[];
  mode?: "payment" | "subscription";
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const client = requireStripe();
  const mode = input.mode || (input.priceId ? "subscription" : "payment");
  const lineItems = input.priceId
    ? [{ price: input.priceId, quantity: 1 }]
    : (input.lineItems || []).map(item => ({
      quantity: item.quantity || 1,
      ...(item.price
        ? { price: item.price }
        : {
          price_data: {
            currency: item.currency || "eur",
            unit_amount: Math.max(0, Math.round(item.amount || 0)),
            product_data: {
              name: item.name || "Tatik.space payment",
              ...(item.description ? { description: item.description } : {}),
            },
          },
        }),
    }));

  if (!lineItems.length) {
    throw new Error("At least one Stripe checkout line item is required");
  }

  return client.checkout.sessions.create({
    mode,
    line_items: lineItems as Stripe.Checkout.SessionCreateParams.LineItem[],
    ...(input.customerId ? { customer: input.customerId } : {}),
    ...(!input.customerId && input.customerEmail ? { customer_email: input.customerEmail } : {}),
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    ...(input.metadata ? {
      metadata: input.metadata,
      ...(mode === "subscription" ? { subscription_data: { metadata: input.metadata } } : {}),
    } : {}),
    ...(mode === "payment" ? { payment_method_collection: "if_required" } : {}),
  });
}

export async function getActiveSubscriptions(customerId: string) {
  const result = await requireStripe().subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 100,
  });
  return result.data;
}

export async function cancelSubscription(subscriptionId: string, immediately = false) {
  const client = requireStripe();
  if (immediately) return client.subscriptions.cancel(subscriptionId);
  return client.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
}

export async function moveSubscriptionToPrice(subscriptionId: string, priceId: string) {
  const client = requireStripe();
  const subscription = await client.subscriptions.retrieve(subscriptionId);
  const item = subscription.items.data[0];
  if (!item || item.price.id === priceId) return subscription;

  return client.subscriptionItems.update(item.id, {
    price: priceId,
    proration_behavior: "none",
  });
}

export async function addCustomerCredit(customerId: string, amountInCents: number, description: string) {
  if (amountInCents <= 0) throw new Error("Customer credit must be greater than zero");
  return requireStripe().customers.createBalanceTransaction(customerId, {
    amount: -amountInCents,
    currency: "eur",
    description,
  });
}

export async function addSubscriptionInvoiceCredit(
  customerId: string,
  subscriptionId: string,
  amountInCents: number,
  description: string,
) {
  if (amountInCents <= 0) throw new Error("Subscription credit must be greater than zero");
  return requireStripe().invoiceItems.create({
    customer: customerId,
    subscription: subscriptionId,
    amount: -amountInCents,
    currency: "eur",
    description,
  });
}

export async function refundPayment(paymentIntentId: string, amount?: number, idempotencyKey?: string) {
  return requireStripe().refunds.create({
    payment_intent: paymentIntentId,
    ...(amount ? { amount } : {}),
  }, idempotencyKey ? { idempotencyKey } : undefined);
}

export async function createProduct(input: { name: string; description: string }) {
  return requireStripe().products.create(input);
}

export async function createPrice(input: {
  productId: string;
  unitAmount: number;
  currency?: string;
  recurringInterval?: "day" | "week" | "month" | "year";
}) {
  return requireStripe().prices.create({
    product: input.productId,
    unit_amount: input.unitAmount,
    currency: input.currency || "eur",
    recurring: { interval: input.recurringInterval || "month" },
  });
}

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("Stripe webhook is not configured");
  return requireStripe().webhooks.constructEvent(payload, signature, secret);
}
