ALTER TABLE "public"."subscription_discounts"
  ADD COLUMN IF NOT EXISTS "paypalPlanId" varchar(255),
  ADD COLUMN IF NOT EXISTS "paypalApprovalUrl" text;
