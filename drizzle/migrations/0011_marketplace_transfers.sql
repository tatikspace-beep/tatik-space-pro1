ALTER TABLE "marketplace_balance_entries"
  ADD COLUMN IF NOT EXISTS "transferId" varchar(255),
  ADD COLUMN IF NOT EXISTS "transferStatus" varchar(32) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "transferredAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "transferEventId" varchar(255);

CREATE UNIQUE INDEX IF NOT EXISTS "marketplace_balance_transfer_idx"
  ON "marketplace_balance_entries" ("transferId")
  WHERE "transferId" IS NOT NULL;
