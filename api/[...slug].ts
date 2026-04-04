import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Set response type first
    res.setHeader('Content-Type', 'application/json');
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    
    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Log request
    console.log('[API] Incoming request:', req.url, req.method);

    // Check if tRPC request
    if (!req.url?.includes('/api/trpc')) {
      return res.status(404).json({ error: 'Not found' });
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
            return await createContext({
              req: opts.req,
              res: opts.res,
            });
          } catch (ctxErr) {
            console.error('[API] Context error:', ctxErr);
            // Return minimal context on error
            return { req: opts.req, res: opts.res, user: null };
          }
        },
        onError: (opts: any) => {
          console.error('[API] tRPC error:', opts.error);
        },
      });

      // Run handler and ensure response
      const handlerPromise = handler(req, res);
      
      // Timeout after 25 seconds
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          if (!res.headersSent) {
            res.status(504).json({ error: 'Timeout' });
          }
          resolve(null);
        }, 25000);
      });

      await Promise.race([handlerPromise, timeoutPromise]);
      
      // Ensure response was sent
      if (!res.headersSent) {
        res.status(500).json({ error: 'No response from handler' });
      }
    } catch (trpcErr: any) {
      console.error('[API] tRPC handler error:', trpcErr);
      if (!res.headersSent) {
        res.status(500).json({ error: trpcErr?.message || 'tRPC handler error' });
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

