/**
 * Catch-all tRPC handler for Vercel
 * Routes all /api/trpc/* requests here
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

let app: express.Application | null = null;

function getApp(): express.Application {
  if (app) return app;
  
  app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  app.use(
    "/",
    createExpressMiddleware({
      router: appRouter,
      createContext: createContext,
    })
  );

  return app;
}

export default async (req: VercelRequest, res: VercelResponse) => {
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
    });
  } catch (error: any) {
    console.error("[tRPC] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message || "error" });
    }
  }
};
