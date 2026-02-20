import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
    console.log(`[Context] Authentication successful for user: ${user?.email || user?.openId}`);
  } catch (error: any) {
    // If authentication fails due to database unavailability, still allow request
    // (graceful fallback for when DB is unreachable but session may be valid)
    if (error?.cause?.code === "ENOTFOUND" || error?.message?.includes("ENOTFOUND")) {
      console.warn(`[Context] Database unreachable but session may still be valid: ${error.message}`);
    } else if (error?.message?.includes("openId is required")) {
      // If upsert fails due to missing openId (logic error in SDK), continue without sync
      console.warn(`[Context] Failed to sync user (missing openId): ${error.message}`);
    } else {
      // For other authentication errors, log and continue (auth is optional)
      console.log(`[Context] Authentication failed: ${error?.message || String(error)}`);
    }
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
