-- Create theme_preference enum type
CREATE TYPE "public"."theme_preference" AS ENUM('light', 'dark', 'system');

-- Add themePreference column to users table
ALTER TABLE "users" ADD COLUMN "themePreference" "public"."theme_preference" NOT NULL DEFAULT 'system';
