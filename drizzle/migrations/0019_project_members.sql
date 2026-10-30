CREATE TABLE IF NOT EXISTS "project_members" (
  "id" serial PRIMARY KEY,
  "projectId" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "userId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "project_members_project_user_unique"
  ON "project_members" ("projectId", "userId");
CREATE INDEX IF NOT EXISTS "project_members_user_idx"
  ON "project_members" ("userId");
