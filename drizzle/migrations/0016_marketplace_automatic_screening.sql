ALTER TABLE "public"."marketplace_listings"
  ADD COLUMN IF NOT EXISTS "scanStatus" varchar(32) NOT NULL DEFAULT 'not_scanned',
  ADD COLUMN IF NOT EXISTS "scanReport" text,
  ADD COLUMN IF NOT EXISTS "scannedAt" timestamp,
  ADD COLUMN IF NOT EXISTS "moderationReason" text,
  ADD COLUMN IF NOT EXISTS "moderatedAt" timestamp,
  ADD COLUMN IF NOT EXISTS "moderatedBy" integer REFERENCES "public"."users"("id") ON DELETE SET NULL;

UPDATE "public"."marketplace_listings"
SET "scanStatus" = 'legacy_unscanned'
WHERE "status" = 'published' AND "scanStatus" = 'not_scanned';
