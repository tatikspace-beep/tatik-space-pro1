import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";

// Import backend code with relative paths matching local server
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { testVersion } from "./_test-version";

function serializeCookie(name: string, value: string, options: Record<string, any> = {}) {
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

function ensureCookieSupport(res: VercelResponse) {
  const anyRes = res as any;
  if (typeof anyRes.cookie === "function" && typeof anyRes.clearCookie === "function") {
    return anyRes;
  }

  anyRes.cookie = (name: string, value: string, options: Record<string, any> = {}) => {
    const headerValue = serializeCookie(name, value, options);
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

const handler = createHTTPHandler({
  router: appRouter,
  createContext: async (opts) => {
    return createContext({
      req: opts.req as any,
      res: ensureCookieSupport(opts.res as any),
    });
  },
});

export default async (req: VercelRequest, res: VercelResponse) => {
  console.log("[API] Request received:", req.url, req.method);

  if (req.url === "/api/health" || req.url === "/health") {
    return res.status(200).json({ ok: true, version: testVersion });
  }

  try {
    await handler(req, res);
  } catch (error: any) {
    console.error("[API] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  }
};

