import type { IncomingMessage, ServerResponse } from "http";

import { enhanceVercelResponse, ensureRequestBody, resolveResponse } from "./_server-bundle.cjs";

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
            const { appRouter, createContext } = await import("./_server-bundle.cjs");
            await ensureRequestBody(req);
            const parsedBody = (req as any).body;
            const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
            const requestHeaders = new Headers();
            for (const [name, value] of Object.entries(req.headers)) {
                if (value !== undefined) requestHeaders.set(name, Array.isArray(value) ? value.join(', ') : value);
            }
            const requestBody = parsedBody === undefined
                ? undefined
                : typeof parsedBody === "string"
                    ? parsedBody
                    : JSON.stringify(parsedBody);
            const webRequest = new Request(requestUrl, {
                method: req.method,
                headers: requestHeaders,
                body: requestBody,
            });
            const trpcPath = decodeURIComponent(requestUrl.pathname.replace(/^\/api\/trpc\/?/, ''));
            const response = await resolveResponse({
                router: appRouter,
                req: webRequest,
                path: trpcPath,
                createContext: async (opts: any) => createContext({ req: req as any, res: enhancedRes, info: opts.info }),
                onError: (opts: any) => console.error('[API] tRPC error:', opts.error),
            } as any);

            enhancedRes.statusCode = response.status;
            response.headers.forEach((value, key) => enhancedRes.setHeader(key, value));
            enhancedRes.end(Buffer.from(await response.arrayBuffer()));
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
