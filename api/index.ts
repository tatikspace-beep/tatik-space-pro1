/**
 * Vercel serverless handler
 * Builds and serves the Express API without starting an HTTP server
 */

import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers.ts";
import { createContext } from "../server/_core/context.ts";

let expressApp = null;

function buildApp() {
  if (expressApp) return expressApp;
  
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // tRPC routes
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  expressApp = app;
  return app;
}

export default async (req, res) => {
  try {
    const app = buildApp();
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(504).json({ error: "timeout" });
        }
        resolve();
      }, 30000);

      app(req, res);
      
      res.on("finish", () => {
        clearTimeout(timeout);
        resolve();
      });

      res.on("error", () => {
        clearTimeout(timeout);
      });
    });
  } catch (err) {
    console.error("[API] Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err?.message });
    }
  }
};
