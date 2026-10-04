CREATE TABLE IF NOT EXISTS "school_programs" (
  "id" serial PRIMARY KEY,
  "ownerUserId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "institutionName" varchar(255) NOT NULL,
  "institutionEmail" varchar(320) NOT NULL,
  "status" varchar(32) NOT NULL DEFAULT 'pending',
  "termsVersion" varchar(32) NOT NULL,
  "termsAcceptedAt" timestamptz NOT NULL,
  "accessStartsAt" timestamptz,
  "accessEndsAt" timestamptz,
  "maxStudents" integer NOT NULL DEFAULT 30,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "school_program_owner_idx" ON "school_programs" ("ownerUserId");

CREATE TABLE IF NOT EXISTS "school_invites" (
  "id" serial PRIMARY KEY,
  "schoolId" integer NOT NULL REFERENCES "school_programs"("id") ON DELETE CASCADE,
  "studentEmail" varchar(320) NOT NULL,
  "status" varchar(32) NOT NULL DEFAULT 'pending',
  "tokenHash" varchar(128),
  "expiresAt" timestamptz NOT NULL,
  "approvedAt" timestamptz,
  "redeemedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "school_invite_email_idx" ON "school_invites" ("schoolId", "studentEmail");

CREATE TABLE IF NOT EXISTS "school_members" (
  "id" serial PRIMARY KEY,
  "schoolId" integer NOT NULL REFERENCES "school_programs"("id") ON DELETE CASCADE,
  "userId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "inviteId" integer NOT NULL REFERENCES "school_invites"("id") ON DELETE CASCADE,
  "accessStartsAt" timestamptz NOT NULL,
  "accessEndsAt" timestamptz NOT NULL,
  "revokedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "school_member_user_idx" ON "school_members" ("schoolId", "userId");

CREATE TABLE IF NOT EXISTS "school_audit_events" (
  "id" serial PRIMARY KEY,
  "schoolId" integer NOT NULL REFERENCES "school_programs"("id") ON DELETE CASCADE,
  "actorUserId" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "action" varchar(64) NOT NULL,
  "targetType" varchar(32) NOT NULL,
  "targetId" integer,
  "details" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
