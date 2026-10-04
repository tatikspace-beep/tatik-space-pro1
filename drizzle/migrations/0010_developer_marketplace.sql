CREATE TABLE IF NOT EXISTS "marketplace_sellers" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "displayName" varchar(120) NOT NULL,
  "bio" text,
  "websiteUrl" varchar(500),
  "payoutProvider" varchar(32),
  "payoutAccountId" varchar(255),
  "termsAcceptedAt" timestamptz,
  "status" varchar(32) NOT NULL DEFAULT 'pending',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "marketplace_listings" (
  "id" serial PRIMARY KEY,
  "sellerId" integer NOT NULL REFERENCES "marketplace_sellers"("id") ON DELETE CASCADE,
  "slug" varchar(160) NOT NULL UNIQUE,
  "title" varchar(160) NOT NULL,
  "description" text NOT NULL,
  "category" varchar(80) NOT NULL,
  "priceCents" integer NOT NULL CHECK ("priceCents" > 0),
  "currency" varchar(3) NOT NULL DEFAULT 'eur',
  "status" varchar(32) NOT NULL DEFAULT 'draft',
  "rejectionReason" text,
  "publishedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "marketplace_listing_files" (
  "id" serial PRIMARY KEY,
  "listingId" integer NOT NULL REFERENCES "marketplace_listings"("id") ON DELETE CASCADE,
  "filePath" varchar(500) NOT NULL,
  "contentType" varchar(120) NOT NULL,
  "sizeBytes" integer NOT NULL CHECK ("sizeBytes" > 0),
  "checksum" varchar(128) NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "marketplace_orders" (
  "id" serial PRIMARY KEY,
  "listingId" integer NOT NULL REFERENCES "marketplace_listings"("id"),
  "buyerId" integer NOT NULL REFERENCES "users"("id"),
  "sellerId" integer NOT NULL REFERENCES "marketplace_sellers"("id"),
  "paymentRecordId" integer REFERENCES "payment_records"("id") ON DELETE SET NULL,
  "grossAmountCents" integer NOT NULL,
  "commissionCents" integer NOT NULL,
  "sellerAmountCents" integer NOT NULL,
  "status" varchar(32) NOT NULL DEFAULT 'pending',
  "refundedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "marketplace_balance_entries" (
  "id" serial PRIMARY KEY,
  "sellerId" integer NOT NULL REFERENCES "marketplace_sellers"("id") ON DELETE CASCADE,
  "orderId" integer REFERENCES "marketplace_orders"("id") ON DELETE SET NULL,
  "type" varchar(32) NOT NULL,
  "amountCents" integer NOT NULL,
  "currency" varchar(3) NOT NULL DEFAULT 'eur',
  "availableAt" timestamptz,
  "note" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "marketplace_disputes" (
  "id" serial PRIMARY KEY,
  "orderId" integer NOT NULL REFERENCES "marketplace_orders"("id") ON DELETE CASCADE,
  "openedByUserId" integer NOT NULL REFERENCES "users"("id"),
  "reason" varchar(120) NOT NULL,
  "details" text NOT NULL,
  "status" varchar(32) NOT NULL DEFAULT 'open',
  "resolution" text,
  "resolvedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "marketplace_listings_status_idx" ON "marketplace_listings" ("status");
CREATE INDEX IF NOT EXISTS "marketplace_orders_buyer_idx" ON "marketplace_orders" ("buyerId");
CREATE INDEX IF NOT EXISTS "marketplace_orders_seller_idx" ON "marketplace_orders" ("sellerId");
CREATE INDEX IF NOT EXISTS "marketplace_balance_seller_idx" ON "marketplace_balance_entries" ("sellerId");
