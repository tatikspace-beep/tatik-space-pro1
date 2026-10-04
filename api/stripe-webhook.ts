import type { IncomingMessage, ServerResponse } from "http";

// @ts-ignore Generated CommonJS bundle is produced by build:vercel.
import { handleStripeWebhook } from "./_server-bundle.cjs";

async function readRawBody(req: IncomingMessage & { body?: unknown }) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("Method Not Allowed");
    return;
  }
  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Missing Stripe signature" }));
    return;
  }
  try {
    const result = await handleStripeWebhook(await readRawBody(req), signature);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
  } catch (error) {
    console.error("[Stripe webhook] Failed:", error);
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Invalid webhook" }));
  }
}
