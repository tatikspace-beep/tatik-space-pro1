import { enhanceVercelResponse } from "./_vercel-response";

export default async (req: any, res: any) => {
  try {
    const enhancedRes = enhanceVercelResponse(res);

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
            const patchedRes = enhanceVercelResponse(opts.res);
            return await createContext({
              ...opts,
              res: patchedRes,
            } as any);
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

