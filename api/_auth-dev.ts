import type { VercelRequest, VercelResponse } from "@vercel/node";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import * as db from "../server/db";
import { sdk } from "../server/_core/sdk";
import { getSessionCookieOptions } from "../server/_core/cookies";

export function applyCookieHelpers(res: VercelResponse) {
  const anyRes = res as any;

  if (typeof anyRes.cookie === "function" && typeof anyRes.clearCookie === "function") {
    return anyRes;
  }

  function buildCookieString(name: string, value: string, options: Record<string, any> = {}) {
    const segments = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
    if (options.maxAge !== undefined && options.maxAge !== null) {
      segments.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
    }
    if (options.domain) {
      segments.push(`Domain=${options.domain}`);
    }
    if (options.path) {
      segments.push(`Path=${options.path}`);
    }
    if (options.expires) {
      const expires = options.expires instanceof Date ? options.expires : new Date(options.expires);
      segments.push(`Expires=${expires.toUTCString()}`);
    }
    if (options.httpOnly) {
      segments.push("HttpOnly");
    }
    if (options.secure) {
      segments.push("Secure");
    }
    if (options.sameSite) {
      segments.push(`SameSite=${options.sameSite}`);
    }
    return segments.join("; ");
  }

  anyRes.cookie = (name: string, value: string, options: Record<string, any> = {}) => {
    const headerValue = buildCookieString(name, value, options);
    const prev = anyRes.getHeader("Set-Cookie");
    if (!prev) {
      anyRes.setHeader("Set-Cookie", headerValue);
    } else if (Array.isArray(prev)) {
      anyRes.setHeader("Set-Cookie", [...prev, headerValue]);
    } else {
      anyRes.setHeader("Set-Cookie", [String(prev), headerValue]);
    }
  };

  anyRes.clearCookie = (name: string, options: Record<string, any> = {}) => {
    anyRes.cookie(name, "", {
      ...options,
      maxAge: 0,
      expires: new Date(0),
    });
  };

  return anyRes;
}

export async function issueSession(req: VercelRequest, res: VercelResponse, input: {
  openId: string;
  name: string;
  email?: string;
  loginMethod?: string;
  role?: "admin" | "user";
  redirectTo?: string;
}) {
  const enhanced = applyCookieHelpers(res);
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
