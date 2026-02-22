/**
 * Vercel API Handler - /api/[...slug].ts
 * Handles ALL /api/* requests
 * Imports directly from TypeScript sources (Vercel compiles these natively)
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

let app: any = null;

function getApp() {
  if (app) return app;

  app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Mount at /api/trpc because req.url includes full path /api/trpc/auth.login
  // Express middleware strips /api/trpc prefix and passes /auth/login to tRPC
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // DEBUG: Log the exact request details
    console.log("[API Handler] Request received:", {
      method: req.method,
      url: req.url,
      path: (req as any).path,
      originalUrl: (req as any).originalUrl,
      baseUrl: (req as any).baseUrl,
      pathname: (req as any).pathname,
    });

    const expressApp = getApp();

    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(504).json({ error: "timeout" });
        }
        resolve();
      }, 30000);

      expressApp(req as any, res as any);

      res.on("finish", () => {
        clearTimeout(timeout);
        resolve();
      });

      res.on("error", () => {
        clearTimeout(timeout);
      });
    });
  } catch (error: any) {
    console.error("[API] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message });
    }
  }
};

