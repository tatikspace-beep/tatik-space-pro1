import type { ServerResponse } from "http";

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

export function enhanceVercelResponse(res: ServerResponse) {
  const anyRes = res as any;

  if (typeof anyRes.cookie !== "function") {
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
  }

  if (typeof anyRes.clearCookie !== "function") {
    anyRes.clearCookie = (name: string, options: Record<string, any> = {}) => {
      anyRes.cookie(name, "", {
        ...options,
        maxAge: 0,
        expires: new Date(0),
      });
    };
  }

  if (typeof anyRes.status !== "function") {
    anyRes.status = (statusCode: number) => {
      if (!anyRes.headersSent) {
        anyRes.statusCode = statusCode;
      }
      return anyRes;
    };
  }

  if (typeof anyRes.json !== "function") {
    anyRes.json = (payload: unknown) => {
      if (!anyRes.headersSent) {
        if (!anyRes.getHeader("Content-Type")) {
          anyRes.setHeader("Content-Type", "application/json; charset=utf-8");
        }
        anyRes.end(JSON.stringify(payload));
      } else {
        anyRes.end(typeof payload === "string" ? payload : JSON.stringify(payload));
      }
      return anyRes;
    };
  }

  if (typeof anyRes.send !== "function") {
    anyRes.send = (payload: unknown) => {
      if (!anyRes.headersSent) {
        if (typeof payload === "object" && payload !== null && !Buffer.isBuffer(payload)) {
          anyRes.setHeader("Content-Type", "application/json; charset=utf-8");
          anyRes.end(JSON.stringify(payload));
        } else {
          anyRes.end(String(payload));
        }
      }
      return anyRes;
    };
  }

  if (typeof anyRes.redirect !== "function") {
    anyRes.redirect = (location: string, status = 302) => {
      if (!anyRes.headersSent) {
        anyRes.statusCode = status;
        anyRes.setHeader("Location", location);
        anyRes.end(`Redirecting to ${location}`);
      }
      return anyRes;
    };
  }

  return anyRes as ServerResponse & {
    cookie(name: string, value: string, options?: Record<string, any>): void;
    clearCookie(name: string, options?: Record<string, any>): void;
    status(statusCode: number): any;
    json(payload: unknown): any;
    send(payload: unknown): any;
    redirect(location: string, status?: number): any;
  };
}
