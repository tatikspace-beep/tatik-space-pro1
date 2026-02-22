/**
 * Vercel API Handler - /api/[...slug].ts
 * Handles ALL /api/* requests
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

console.log("[API] Module loading started");

let app: any = null;
let initialized = false;
let initError: any = null;

async function initialize() {
  if (initialized || initError) return;
  
  try {
    console.log("[API] Starting initialization...");
    
    // Import from dist/server/ (compiled by tsc with paths resolved by tsc-alias)
    console.log("[API] Importing from compiled server...");
    const { appRouter: router, createContext: ctx } = await import("../dist/server/vercel-api.js");
    appRouter = router;
    createContext = ctx;
    console.log("[API] Exports imported successfully");
    
    console.log("[API] Creating Express app...");
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
    
    initialized = true;
    console.log("[API] Initialization complete!");
  } catch (err: any) {
    initError = err;
    console.error("[API] INIT ERROR:", err.message);
    console.error("[API] Stack:", err.stack?.split('\n').slice(0, 3).join('\n'));
  }
}

export default async (req: VercelRequest, res: VercelResponse) => {
  // Initialize on first request
  if (!initialized && !initError) {
    await initialize();
  }

  // Health check endpoint
  if (req.url === "/api/health" || req.url === "/health") {
    if (initError) {
      return res.status(503).json({ 
        ok: false,
        error: initError.message,
      });
    }
    return res.status(200).json({ 
      ok: true,
      path: req.url,
      initialized: true,
    });
  }

  // Check if initialization failed
  if (initError) {
    console.error("[API] Request rejected due to init error:", initError.message);
    return res.status(503).json({ 
      error: "Server initialization failed",
      message: initError.message,
    });
  }

  // Wait for initialization if needed
  if (!initialized) {
    await new Promise(r => setTimeout(r, 500));
    if (!initialized) {
      return res.status(503).json({ error: "Server still initializing" });
    }
  }

  try {
    console.log("[API] Request:", req.method, req.url);
    
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(504).json({ error: "timeout" });
        }
        resolve();
      }, 30000);

      app(req as any, res as any);

      res.on("finish", () => {
        clearTimeout(timeout);
        resolve();
      });

      res.on("error", () => {
        clearTimeout(timeout);
      });
    });
  } catch (error: any) {
    console.error("[API] Request error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message });
    }
  }
};

