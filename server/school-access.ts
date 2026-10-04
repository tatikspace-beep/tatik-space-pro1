import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { schoolMembers, schoolPrograms } from "../drizzle/schema";
import { getDb } from "./db";

export async function hasActiveSchoolAccess(userId: number): Promise<boolean> {
  const database = await getDb();
  if (!database) return false;
  const now = new Date();
  const membership = (await database.select({ id: schoolMembers.id })
    .from(schoolMembers)
    .innerJoin(schoolPrograms, eq(schoolMembers.schoolId, schoolPrograms.id))
    .where(and(
      eq(schoolMembers.userId, userId),
      eq(schoolPrograms.status, "approved"),
      isNull(schoolMembers.revokedAt),
      lte(schoolMembers.accessStartsAt, now),
      gte(schoolMembers.accessEndsAt, now),
    ))
    .limit(1))[0];
  return Boolean(membership);
}
