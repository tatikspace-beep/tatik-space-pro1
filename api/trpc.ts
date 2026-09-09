import type { IncomingMessage, ServerResponse } from "http";
import { resolveResponse } from "@trpc/server/unstable-core-do-not-import";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { enhanceVercelResponse } from "./_vercel-response";

function applyCorsHeaders(res: ServerResponse, req: IncomingMessage) {
    const origin = typeof req.headers.origin === "string" ? req.headers.origin : "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With,X-TRPC-BATCH,X-TRPC-TRAILER");
    res.setHeader("Access-Control-Allow-Credentials", "true");
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
    const response = enhanceVercelResponse(res);
    applyCorsHeaders(response, req);

    if (req.method === "OPTIONS") {
        response.statusCode = 204;
        response.end();
        return;
    }

    try {
        const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
        const body = req.body === undefined ? undefined : JSON.stringify(req.body);
        const headers = new Headers();
        for (const [name, value] of Object.entries(req.headers)) {
            if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(", ") : value);
        }

        const webRequest = new Request(url, { method: req.method, headers, body });
        const path = decodeURIComponent(url.pathname.replace(/^\/api\/trpc\/?/, ""));
        const trpcResponse = await resolveResponse({
            router: appRouter,
            req: webRequest,
            path,
            createContext: async (opts: any) => createContext({ req: req as any, res: response, info: opts.info }),
        } as any);

        response.statusCode = trpcResponse.status;
        trpcResponse.headers.forEach((value, key) => response.setHeader(key, value));
        response.end(Buffer.from(await trpcResponse.arrayBuffer()));
    } catch (error: any) {
        console.error("[API tRPC] Handler error:", error);
        if (!(response as any).headersSent) {
            response.statusCode = 500;
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.end(JSON.stringify({ error: error?.message || "Internal server error" }));
        }
    }
}
