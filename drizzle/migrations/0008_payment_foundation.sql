-- Phase A payment foundation.
-- Provider callbacks/captures are the only code paths that turn pending records
-- into paid records and grant access.
CREATE TABLE IF NOT EXISTS "payment_records" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider" varchar(32) NOT NULL,
  "kind" varchar(32) NOT NULL,
  "status" varchar(32) NOT NULL DEFAULT 'pending',
  "providerPaymentId" varchar(255),
  "providerOrderId" varchar(255),
  "providerEventId" varchar(255),
  "templateId" varchar(255),
  "amount" integer,
  "currency" varchar(3) DEFAULT 'eur',
  "metadata" text,
  "verifiedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "payment_records_provider_event_idx"
  ON "payment_records" ("provider", "providerEventId")
  WHERE "providerEventId" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "payment_records_provider_order_idx"
  ON "payment_records" ("provider", "providerOrderId")
  WHERE "providerOrderId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "payment_records_provider_payment_idx"
  ON "payment_records" ("provider", "providerPaymentId");
CREATE INDEX IF NOT EXISTS "payment_records_user_status_idx"
  ON "payment_records" ("userId", "status");

ALTER TABLE "template_purchases"
  ADD COLUMN IF NOT EXISTS "paymentRecordId" integer REFERENCES "payment_records"("id") ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "template_purchases_payment_record_idx"
  ON "template_purchases" ("paymentRecordId")
  WHERE "paymentRecordId" IS NOT NULL;
