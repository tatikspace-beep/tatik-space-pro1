ALTER TABLE "subscriptions"
  ADD COLUMN IF NOT EXISTS "paypalSubscriptionId" varchar(255);

CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_paypal_subscription_idx"
  ON "subscriptions" ("paypalSubscriptionId")
  WHERE "paypalSubscriptionId" IS NOT NULL;
