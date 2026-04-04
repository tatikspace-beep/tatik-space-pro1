import type { VercelRequest, VercelResponse } from "@vercel/node";

function applyCookieHelpers(res: VercelResponse) {
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

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const enhancedRes = applyCookieHelpers(res);

    // Set response type first
    enhancedRes.setHeader('Content-Type', 'application/json');
    
    // CORS headers
    enhancedRes.setHeader('Access-Control-Allow-Origin', '*');
    enhancedRes.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    enhancedRes.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    
    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
      return enhancedRes.status(200).end();
    }

    // Log request
    console.log('[API] Incoming request:', req.url, req.method);

    // Check if tRPC request
    if (!req.url?.includes('/api/trpc')) {
      return enhancedRes.status(404).json({ error: 'Not found' });
    }

    // Import and run tRPC handler
    try {
      const { createHTTPHandler } = await import("@trpc/server/adapters/standalone");
      const { appRouter } = await import("../server/routers");
      const { createContext } = await import("../server/_core/context");

      const handler = createHTTPHandler({
        router: appRouter,
        createContext: async (opts: any) => {
          try {
            const patchedRes = applyCookieHelpers(opts.res);
            return await createContext({
              req: opts.req,
              res: patchedRes,
            });
          } catch (ctxErr) {
            console.error('[API] Context error:', ctxErr);
            return { req: opts.req, res: opts.res, user: null };
          }
        },
        onError: (opts: any) => {
          console.error('[API] tRPC error:', opts.error);
        },
      });

      const handlerPromise = handler(req, enhancedRes);
      
      // Timeout after 25 seconds
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          if (!enhancedRes.headersSent) {
            enhancedRes.status(504).json({ error: 'Timeout' });
          }
          resolve(null);
        }, 25000);
      });

      await Promise.race([handlerPromise, timeoutPromise]);
      
      if (!enhancedRes.headersSent) {
        enhancedRes.status(500).json({ error: 'No response from handler' });
      }
    } catch (trpcErr: any) {
      console.error('[API] tRPC handler error:', trpcErr);
      if (!enhancedRes.headersSent) {
        enhancedRes.status(500).json({ error: trpcErr?.message || 'tRPC handler error' });
      }
    }
  } catch (error: any) {
    console.error('[API] Outer error:', error);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ error: error?.message || 'Internal server error' });
    }
  }
};

