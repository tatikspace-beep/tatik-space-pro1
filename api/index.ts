/**
 * Vercel Serverless Function Handler
 * This file is automatically recognized by Vercel as a serverless function
 * It receives all API requests and forwards them to the Express app
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { serveStatic } from "../server/_core/vite";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import * as db from "../server/db";
import { analyticsRouter } from "../server/_core/analyticsRouter";

let app: express.Application | null = null;

/**
 * Initialize the Express app once and reuse it
 */
function initializeApp(): express.Application {
  if (app) return app;

  app = express();

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OAuth routes
  registerOAuthRoutes(app);

  // Static files
  serveStatic(app);

  // Analytics routes
  app.use("/api/analytics", analyticsRouter);

  // tRPC routes - AFTER analytics, BEFORE catch-all
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext: createContext,
    })
  );

  return app;
}

/**
 * Vercel serverless function handler
 * Handles all requests to /api/* and static files
 */
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const expressApp = initializeApp();

    // Execute the express handler
    return new Promise<void>((resolve, reject) => {
      // Add a timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(504).json({ error: "Request timeout" });
        }
        resolve();
      }, 30000);

      // Execute the express app
      expressApp(req as any, res as any);

      // Cleanup on response completion
      const cleanup = () => {
        clearTimeout(timeout);
      };

      res.on("finish", cleanup);
      res.on("close", cleanup);
      res.on("error", (error) => {
        console.error("[Vercel Handler] Response error:", error);
        cleanup();
      });
    });
  } catch (error: any) {
    console.error("[Vercel Handler] Initialization error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "development" ? error?.message : undefined,
      });
    }
  }
};
