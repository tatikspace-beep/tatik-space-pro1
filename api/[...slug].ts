/**
 * Vercel API Handler - /api/[...slug].ts
 * Handles ALL /api/* requests
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

console.log("[API] Imports loaded successfully");

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
  // TEST ENDPOINT
  if (req.url === "/api/health" || req.url === "/health") {
    return res.status(200).json({ 
      ok: true,
      path: req.url,
    });
  }

  try {
    console.log("[API Handler] Request:", req.method, req.url);
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

