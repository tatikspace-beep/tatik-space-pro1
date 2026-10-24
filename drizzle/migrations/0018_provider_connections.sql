CREATE TABLE IF NOT EXISTS "provider_connections" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider" varchar(32) NOT NULL,
  "encryptedCredential" text NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "provider_connections_user_provider_idx"
  ON "provider_connections" ("userId", "provider");

CREATE TABLE IF NOT EXISTS "provider_resources" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "projectId" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "provider" varchar(32) NOT NULL,
  "resourceId" varchar(255) NOT NULL,
  "resourceUrl" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "provider_resources_user_project_provider_idx"
  ON "provider_resources" ("userId", "projectId", "provider");
