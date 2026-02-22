/**
 * Vercel API Handler - /api/[...slug].ts
 * Must register module aliases before importing backend code
 */

// Register module aliases at the very top
import moduleAlias from 'module-alias';
import path from 'path';

const root = path.resolve(__dirname, '..');
moduleAlias.addAliases({
  '@shared': path.join(root, 'shared'),
  '@': path.join(root, 'client', 'src'),
});

console.log('[API] Module aliases registered');

import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// Now we can import backend code
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

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
    return res.status(200).json({ ok: true, version: testVersion });
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

