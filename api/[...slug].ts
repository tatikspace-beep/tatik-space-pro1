import type { IncomingMessage, ServerResponse } from "http";

import { enhanceVercelResponse } from "./_vercel-response";

function sendJson(res: ServerResponse, status: number, data: any) {
    if ((res as any).json) {
        try {
            (res as any).status?.(status);
            return (res as any).json(data);
        } catch { }
    }
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
}

function applyCorsHeaders(res: ServerResponse, req: IncomingMessage) {
    const origin = typeof req.headers.origin === "string" ? req.headers.origin : "*";

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization,X-Requested-With,X-TRPC-BATCH,X-TRPC-TRAILER"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
}

export default async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const enhancedRes = enhanceVercelResponse(res as ServerResponse) as any;

        applyCorsHeaders(enhancedRes as ServerResponse, req);

        // Handle OPTIONS
        if (req.method === "OPTIONS") {
            enhancedRes.statusCode = 204;
            return enhancedRes.end();
        }

        // Log request
        console.log('[API] Incoming request:', { url: req.url, method: req.method, origin: req.headers.origin });

        // Check if tRPC request
        if (!req.url?.includes('/api/trpc') && !req.url?.includes('/trpc')) {
            return sendJson(enhancedRes, 404, { error: 'Not found' });
        }

        // Import and run tRPC handler
        try {
            const { createHTTPHandler } = await import("@trpc/server/adapters/standalone");
            const { appRouter } = await import("../server/routers");
            const { createContext } = await import("../server/_core/context");

            const handler = createHTTPHandler({
                router: appRouter,
                basePath: "/api/trpc/",
                createContext: async (opts: any) => {
                    try {
                        const patchedRes = enhanceVercelResponse(opts.res as ServerResponse);
                        return await createContext({ req: opts.req, res: patchedRes, info: opts.info });
                    } catch (ctxErr) {
                        console.error('[API] Context error:', ctxErr);
                        return { req: opts.req, res: opts.res, user: null };
                    }
                },
                onError: (opts: any) => {
                    console.error('[API] tRPC error:', opts.error);
                },
            });

            const handlerPromise = handler(req as any, enhancedRes as any);

            // Timeout after 25 seconds
            const timeoutPromise = new Promise((resolve) => {
                setTimeout(() => {
                    if (!(enhancedRes as any).headersSent) {
                        sendJson(enhancedRes, 504, { error: 'Timeout' });
                    }
                    resolve(null);
                }, 25000);
            });

            await Promise.race([handlerPromise, timeoutPromise]);

            if (!(enhancedRes as any).headersSent) {
                sendJson(enhancedRes, 500, { error: 'No response from handler' });
            }
        } catch (trpcErr: any) {
            console.error('[API] tRPC handler error:', trpcErr);
            if (!(enhancedRes as any).headersSent) {
                sendJson(enhancedRes, 500, { error: trpcErr?.message || 'tRPC handler error' });
            }
        }
    } catch (error: any) {
        console.error('[API] Outer error:', error);
        if (!(res as any).headersSent) {
            sendJson(res as any, 500, { error: error?.message || 'Internal server error' });
        }
    }
};
