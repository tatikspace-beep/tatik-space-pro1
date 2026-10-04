import type { IncomingMessage } from "http";

export { appRouter } from "../server/routers";
export { createContext } from "../server/_core/context";
export { handleStripeWebhook } from "../server/_core/paymentWebhooks";
export { enhanceVercelResponse } from "./_vercel-response";
export { resolveResponse } from "@trpc/server/unstable-core-do-not-import";

export async function ensureRequestBody(req: IncomingMessage & { body?: unknown }) {
  if (req.body !== undefined || req.method === "GET" || req.method === "HEAD") return;
  if (req.readableEnded) return;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  req.body = Buffer.concat(chunks).toString("utf8");
}
