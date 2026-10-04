ALTER TABLE "marketplace_sellers"
  ADD COLUMN IF NOT EXISTS "termsVersion" varchar(32);

CREATE TABLE IF NOT EXISTS "marketplace_reviews" (
  "id" serial PRIMARY KEY,
  "listingId" integer NOT NULL REFERENCES "marketplace_listings"("id") ON DELETE CASCADE,
  "orderId" integer NOT NULL UNIQUE REFERENCES "marketplace_orders"("id") ON DELETE CASCADE,
  "buyerId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "rating" integer NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
  "comment" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "marketplace_reviews_listing_idx"
  ON "marketplace_reviews" ("listingId");

CREATE UNIQUE INDEX IF NOT EXISTS "marketplace_balance_order_type_idx"
  ON "marketplace_balance_entries" ("orderId", "type");
