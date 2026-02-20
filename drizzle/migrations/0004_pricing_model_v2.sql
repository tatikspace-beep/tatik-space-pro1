-- Migration: New Pricing Model v2 (60-day free trial + subscription with rewards)
-- Tables: subscriptions, subscription_discounts, monetization_earnings

-- 1. Alter users table to add new pricing fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "trialStartedAt" timestamptz DEFAULT now();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "trialEndsAt_v2" timestamptz;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "subscriptionStartedAt" timestamptz;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "subscriptionTier" varchar(50) DEFAULT 'free';
-- 0=free/trial, 1-2=pro discounts applied (max 2 per 30 days)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "discountsAppliedInWindow" integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "lastDiscountResetAt" timestamptz;

-- 2. Subscriptions table (tracks user subscription history)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  "id" bigserial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "tier" varchar(50) NOT NULL DEFAULT 'pro', -- 'pro'
  "status" varchar(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  "currentPrice" decimal(10,2) NOT NULL, -- €5.99 or €7.99 (after first month)
  "isFirstMonth" integer DEFAULT 1 NOT NULL, -- 1 = €5.99/mese, 0 = €7.99/mese
  "startedAt" timestamptz NOT NULL DEFAULT now(),
  "endsAt" timestamptz, -- When subscription expires (if cancelled)
  "renewsAt" timestamptz, -- Next billing date
  "stripeSubscriptionId" varchar(255), -- Stripe subscription ID if integrated
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_idx ON public.subscriptions ("userId");
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions ("status");

-- 3. Subscription discounts table (tracks earned €2 discounts from monetization)
CREATE TABLE IF NOT EXISTS public.subscription_discounts (
  "id" bigserial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "discountAmount" decimal(10,2) NOT NULL DEFAULT 2.00, -- €2 discount
  "reason" varchar(255) NOT NULL, -- 'monetization_100_percent'
  "earnedAt" timestamptz NOT NULL DEFAULT now(),
  "appliedAt" timestamptz, -- When it was actually applied to subscription
  "applicableUntil" timestamptz, -- Expires if not used within 30 days
  "status" varchar(50) NOT NULL DEFAULT 'pending', -- 'pending', 'applied', 'expired'
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscription_discounts_user_idx ON public.subscription_discounts ("userId");
CREATE INDEX IF NOT EXISTS subscription_discounts_status_idx ON public.subscription_discounts ("status");

-- 4. Monetization earnings table (tracks €0-6 earnings from site monetization)
CREATE TABLE IF NOT EXISTS public.monetization_earnings (
  "id" bigserial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "earningAmount" decimal(10,2) NOT NULL,
  "percentageOfGoal" integer NOT NULL, -- 0-100 (€6 = 100%)
  "goalAmount" decimal(10,2) NOT NULL DEFAULT 6.00,
  "cycleStartDate" date NOT NULL,
  "cycleEndDate" date NOT NULL,
  "completed" integer DEFAULT 0 NOT NULL, -- 1 = reached 100%
  "completedAt" timestamptz, -- When 100% was first reached in this cycle
  "discountEarnedFromCompletion" integer DEFAULT 0 NOT NULL, -- 1 = discount was generated
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS monetization_earnings_user_idx ON public.monetization_earnings ("userId");
CREATE INDEX IF NOT EXISTS monetization_earnings_cycle_idx ON public.monetization_earnings ("cycleStartDate", "cycleEndDate");

-- 5. Update subscriptions table with additional tracking columns
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS "appliedDiscountId" bigint REFERENCES public.subscription_discounts(id) ON DELETE SET NULL;

-- Seed: ensure users on old 'free' or 'pro' have correct trial/subscription dates
-- This is a no-op if already migrated, but prepares old records for the new model
-- UPDATE public.users 
-- SET "trialStartedAt" = COALESCE("trialStartedAt", "createdAt"),
--     "trialEndsAt_v2" = COALESCE("trialEndsAt_v2", "createdAt" + interval '60 days'),
--     "subscriptionTier" = CASE 
--       WHEN "subscriptionType" = 'pro' THEN 'pro' 
--       WHEN "subscriptionType" = 'free' THEN 'free' 
--       ELSE 'free' 
--     END
-- WHERE "trialStartedAt" IS NULL;
