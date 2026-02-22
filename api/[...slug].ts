/**
 * Vercel API Handler - /api/[...slug].ts
 * Handles ALL /api/* requests
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

let appRouter: any = null;
let createContext: any = null;
let importError: any = null;
let importInitialized = false;

// Try to import from the compiled dist bundle
async function initializeImports() {
  if (importInitialized) return;
  importInitialized = true;

  try {
    // Import from the esbuild bundled output
    const backend = await import("../dist/index.js");
    appRouter = backend.appRouter;
    createContext = backend.createContext;
    console.log("[API] Imports initialized successfully");
  } catch (err) {
    importError = err;
    console.error("[API] Import error:", err);
  }
}

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
  // Initialize imports on first call
  if (!importInitialized) {
    await initializeImports();
  }

  // TEST ENDPOINT: respond immediately to see if handler is being called
  if (req.url === "/api/health" || req.url === "/health") {
    return res.status(200).json({ 
      ok: !importError,
      path: req.url,
      method: req.method,
      importError: importError ? importError.message : null,
    });
  }

  if (importError) {
    console.error("[API] Cannot process request, import failed:", importError);
    return res.status(500).json({ 
      error: "Import error",
      message: importError.message,
    });
  }

  try {
    // DEBUG: Log the exact request details
    console.log("[API Handler] Request received:", {
      method: req.method,
      url: req.url,
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

