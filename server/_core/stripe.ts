// Stripe API wrapper for Tatik.space Pro
// This file provides integration with Stripe for payment processing

interface Customer {
  id: string;
  email: string;
  name: string;
}

interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: Date;
}

// Mock Stripe implementation for development
class MockStripe {
  private customers: Map<string, Customer> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();

  constructor() {
    // Initialize with sample data for development
    this.setupSampleData();
  }

  private setupSampleData() {
    // Sample customer
    this.customers.set('cus_mock_customer_1', {
      id: 'cus_mock_customer_1',
      email: 'user@example.com',
      name: 'Test User'
    });

    // Sample subscription
    this.subscriptions.set('sub_mock_subscription_1', {
      id: 'sub_mock_subscription_1',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
  }

  async createCustomer({ email, name }: { email: string; name: string }): Promise<Customer> {
    const id = `cus_mock_${Date.now()}`;
    const customer: Customer = { id, email, name };
    this.customers.set(id, customer);
    return customer;
  }

  async createCheckoutSession({
    customerId,
    priceId,
    successUrl,
    cancelUrl,
  }: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    // Return mock checkout session
    return {
      id: `cs_mock_${Date.now()}`,
      url: successUrl, // In a real implementation, this would be the Stripe checkout URL
      status: 'open',
    };
  }

  async getActiveSubscriptions(customerId: string): Promise<Subscription[]> {
    const subs: Subscription[] = [];
    for (const [_, sub] of this.subscriptions) {
      if (sub.status === 'active') {
        subs.push(sub);
      }
    }
    return subs;
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) {
      throw new Error('Subscription not found');
    }
    sub.status = 'canceled';
    return sub;
  }

  async createProduct({
    name,
    description,
  }: {
    name: string;
    description: string;
  }) {
    return {
      id: `prod_mock_${Date.now()}`,
      name,
      description,
    };
  }

  async createPrice({
    productId,
    unitAmount,
    currency = 'eur',
    recurringInterval = 'month',
  }: {
    productId: string;
    unitAmount: number;
    currency?: string;
    recurringInterval?: 'day' | 'week' | 'month' | 'year';
  }) {
    return {
      id: `price_mock_${Date.now()}`,
      product: productId,
      unit_amount: unitAmount,
      currency,
      recurring: {
        interval: recurringInterval,
      },
    };
  }
}

// Initialize Stripe based on environment
let stripe: MockStripe | null = null;

if (process.env.NODE_ENV === 'development' || !process.env.STRIPE_SECRET_KEY) {
  console.warn('[Stripe] Running in development mode with mock implementation');
  stripe = new MockStripe();
} else if (process.env.STRIPE_SECRET_KEY) {
  // In production, we would initialize the real Stripe client
  // import Stripe from 'stripe';
  // stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' });
  console.log('[Stripe] Production mode - real Stripe client would be initialized here');
  stripe = new MockStripe(); // Using mock for now until Stripe is properly installed
} else {
  console.warn('[Stripe] Missing STRIPE_SECRET_KEY. Payment functionality will be disabled.');
}

export { stripe };

/**
 * Create a checkout session for a customer
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  try {
    const session = await stripe.createCheckoutSession({
      customerId,
      priceId,
      successUrl,
      cancelUrl,
    });

    return session;
  } catch (error) {
    console.error('[Stripe] Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create a customer in Stripe
 */
export async function createCustomer({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  try {
    const customer = await stripe.createCustomer({
      email,
      name,
    });

    return customer;
  } catch (error) {
    console.error('[Stripe] Error creating customer:', error);
    throw error;
  }
}

/**
 * Get a customer's active subscriptions
 */
export async function getActiveSubscriptions(customerId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  try {
    const subscriptions = await stripe.getActiveSubscriptions(customerId);
    return subscriptions;
  } catch (error) {
    console.error('[Stripe] Error fetching subscriptions:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  try {
    const subscription = await stripe.cancelSubscription(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('[Stripe] Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Create a product in Stripe (for testing purposes)
 */
export async function createProduct({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  try {
    const product = await stripe.createProduct({
      name,
      description,
    });

    return product;
  } catch (error) {
    console.error('[Stripe] Error creating product:', error);
    throw error;
  }
}

/**
 * Create a price for a product (for testing purposes)
 */
export async function createPrice({
  productId,
  unitAmount,
  currency = 'eur',
  recurringInterval = 'month',
}: {
  productId: string;
  unitAmount: number; // Amount in cents
  currency?: string;
  recurringInterval?: 'day' | 'week' | 'month' | 'year';
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  try {
    const price = await stripe.createPrice({
      productId,
      unitAmount,
      currency,
      recurringInterval,
    });

    return price;
  } catch (error) {
    console.error('[Stripe] Error creating price:', error);
    throw error;
  }
}