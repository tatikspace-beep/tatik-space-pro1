/**
 * Vercel API Handler - /api/[...slug].ts
 * Handles ALL /api/* requests as serverless functions
 * This is the canonical Vercel pattern
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// Simple health check
if (process.env.NODE_ENV === "development") {
  console.log("[API Handler] Loaded for", process.env.NODE_ENV);
}

let appInstance: any = null;

async function getApp() {
  if (appInstance) return appInstance;

  try {
    // Try to load Express and tRPC
    const express = await import("express").then(m => m.default);
    const { createExpressMiddleware } = await import("@trpc/server/adapters/express");
    
    // Try to load precompiled backend
    const backend = await import("../dist/index.js");

    const app = express();
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));

    // Setup tRPC if available
    if (backend.appRouter && backend.createContext) {
      app.use(
        "/api/trpc",
        createExpressMiddleware({
          router: backend.appRouter,
          createContext: backend.createContext,
        })
      );
      console.log("[API Handler] tRPC middleware loaded");
    } else {
      console.warn("[API Handler] appRouter or createContext not found");
    }

    appInstance = app;
    return app;
  } catch (err) {
    console.error("[API Handler] Failed to initialize app:", err);
    throw err;
  }
}

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const app = await getApp();

    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(504).json({ error: "timeout" });
        }
        resolve();
      }, 30000);

      // Serve with Express
      app(req as any, res as any);

      res.on("finish", () => {
        clearTimeout(timeout);
        resolve();
      });

      res.on("error", (err) => {
        clearTimeout(timeout);
        console.error("[API Handler] Response error:", err);
        resolve();
      });
    });
  } catch (error: any) {
    console.error("[API Handler] Request error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "development" ? error?.message : undefined,
      });
    }
  }
};
