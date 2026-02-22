/**
 * Vercel API Handler - /api/[...slug].ts
 * Handles ALL /api/* requests
 * 
 * CRITICAL: Register module aliases BEFORE any imports
 * This ensures @shared/* paths work in Vercel's Node.js environment
 */

// MUST be done before any imports!
import moduleAlias from "module-alias";
import path from "path";
const __dirname = path.resolve();
moduleAlias.addAliases({
  "@shared": path.resolve(__dirname, "shared"),
  "@": path.resolve(__dirname, "client/src"),
});

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
  // Health check
  if (req.url === "/api/health" || req.url === "/health") {
    return res.status(200).json({ ok: true });
  }

  try {
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

