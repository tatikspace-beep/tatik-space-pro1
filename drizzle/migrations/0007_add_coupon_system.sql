-- Add coupon system to template_purchases
-- Allows tracking discount codes used for purchases

ALTER TABLE template_purchases 
ADD COLUMN IF NOT EXISTS "couponCode" varchar(255),
ADD COLUMN IF NOT EXISTS "discountPercentage" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "couponUsedAt" timestamp;

-- Create coupon_codes table for managing coupon codes
CREATE TABLE IF NOT EXISTS "coupon_codes" (
  "id" serial PRIMARY KEY,
  "code" varchar(255) NOT NULL UNIQUE,
  "email" varchar(320) NOT NULL,
  "discountPercentage" integer NOT NULL DEFAULT 100,
  "usedCount" integer NOT NULL DEFAULT 0,
  "maxUses" integer NOT NULL DEFAULT 1,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT NOW(),
  "updatedAt" timestamp NOT NULL DEFAULT NOW(),
  
  CONSTRAINT "coupon_codes_email_fk" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "coupon_codes_code_idx" ON "coupon_codes"("code");
CREATE INDEX IF NOT EXISTS "coupon_codes_email_idx" ON "coupon_codes"("email");
