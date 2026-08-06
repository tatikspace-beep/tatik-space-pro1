import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SignJWT } from "jose";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";

function getSigningKey() {
  const secret = process.env.JWT_SECRET ?? "tatik-space-pro-secret";
  return new TextEncoder().encode(secret);
}

async function signSessionToken(openId: string, name: string, appId: string) {
  const issuedAt = Date.now();
  const expiration = Math.floor((issuedAt + ONE_YEAR_MS) / 1000);
  return new SignJWT({ openId, appId, name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiration)
    .sign(getSigningKey());
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const openId = String(req.query.openId ?? "local:dev-admin");
    const name = String(req.query.name ?? "Dev Admin");
    const appId = process.env.VITE_APP_ID ?? "";
    const sessionToken = await signSessionToken(openId, name, appId);
    const isSecure = String(req.headers["x-forwarded-proto"] ?? req.protocol ?? "").toLowerCase().includes("https");
    const cookieValue = buildCookieString(COOKIE_NAME, sessionToken, {
      path: "/",
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",
      maxAge: ONE_YEAR_MS,
    });
    res.writeHead(302, {
      "Set-Cookie": cookieValue,
      "Location": "/dashboard",
      "Content-Type": "text/plain; charset=utf-8",
    });
    res.end("Redirecting to /dashboard");
  } catch (error: any) {
    console.error("[DevLogin] Failed to create dev session", error);
    res.status(500).send("Dev login failed");
  }
}
