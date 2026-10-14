import { TRPCError } from "@trpc/server";
import type { User } from "../../drizzle/schema";
import { isStaffUser } from "../auth-utils";
import { getSubscriptionByUserIdAndStatus } from "../db";
import { hasActiveSchoolAccess } from "../school-access";
import { getFeatureVisibility, isUserInFreeTrial } from "./pricing";

export type FeatureAccessKey = keyof ReturnType<typeof getFeatureVisibility>;

export async function getUserFeatureAccess(user: User) {
  const isStaff = isStaffUser(user);
  const hasSchoolAccess = !isStaff && await hasActiveSchoolAccess(user.id);
  if (isStaff || hasSchoolAccess) {
    return getFeatureVisibility("pro", false);
  }

  const subscription = await getSubscriptionByUserIdAndStatus(user.id, "active");
  const subscriptionTier = subscription?.tier || user.subscriptionType || "free";
  return getFeatureVisibility(
    subscriptionTier === "pro" ? "pro" : "free",
    isUserInFreeTrial(user.createdAt),
  );
}

export async function requireFeatureAccess(user: User, feature: FeatureAccessKey) {
  const featureAccess = await getUserFeatureAccess(user);
  if (!featureAccess[feature]) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Questa funzione richiede un abbonamento Pro attivo o una prova gratuita valida.",
    });
  }
  return featureAccess;
}
