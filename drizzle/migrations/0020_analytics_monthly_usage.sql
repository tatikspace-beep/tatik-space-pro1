CREATE TABLE IF NOT EXISTS "analytics_monthly_usage" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "monthKey" varchar(7) NOT NULL,
  "analysisCount" integer NOT NULL DEFAULT 0,
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "analytics_monthly_usage_user_month_unique"
  ON "analytics_monthly_usage" ("userId", "monthKey");
