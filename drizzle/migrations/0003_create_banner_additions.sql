-- Migration: create banner_additions table for monetization tracking
-- Suitable for Supabase / Postgres

CREATE TABLE IF NOT EXISTS public.banner_additions (
  "id" bigserial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "bannerId" varchar(255) NOT NULL,
  "projectId" varchar(255),
  "activityType" varchar(255),
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS banner_additions_user_idx ON public.banner_additions ("userId");
CREATE INDEX IF NOT EXISTS banner_additions_created_idx ON public.banner_additions ("createdAt");
