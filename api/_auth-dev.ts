import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import * as db from "../server/db";
import { sdk } from "../server/_core/sdk";
import { getSessionCookieOptions } from "../server/_core/cookies";
import { enhanceVercelResponse } from "./_vercel-response";

export async function issueSession(
  req: any,
  res: any,
  input: {
    openId: string;
    name: string;
    email?: string;
    loginMethod?: string;
    role?: "admin" | "user";
    redirectTo?: string;
  }
) {
  const enhanced = enhanceVercelResponse(res);
  const { openId, name, email, loginMethod = "local", role = "user", redirectTo = "/dashboard" } = input;

  try {
    await db.upsertUser({
      openId,
      name,
      email: email ?? null,
      loginMethod,
      role,
      lastSignedIn: new Date(),
    });
  } catch (dbErr: any) {
    if (dbErr?.cause?.code === "ENOTFOUND" || dbErr?.message?.includes("ENOTFOUND")) {
      console.warn("[AuthDev] Database unavailable, continuing without DB sync:", dbErr?.message || dbErr);
    } else {
      console.warn("[AuthDev] Upsert warning:", dbErr?.message || dbErr);
    }
  }

  const token = await sdk.createSessionToken(openId, { name });
  const cookieOptions = getSessionCookieOptions(req as any);
  enhanced.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
  enhanced.redirect(redirectTo);
  return enhanced;
}
