/**
 * Vercel serverless function - Express wrapper
 * Forwards tRPC requests to the bundled backend
 */

const express = require("express");

let app = null;

function getApp() {
  if (app) return app;

  app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Try to import and use tRPC from bundled backend
  try {
    const { createExpressMiddleware } = require("@trpc/server/adapters/express");
    const backend = require("../dist/index.js");
    
    // The bundled backend exports appRouter and createContext
    app.use(
      "/api/trpc",
      createExpressMiddleware({
        router: backend.appRouter,
        createContext: backend.createContext,
      })
    );
    
    console.log("[API] tRPC middleware initialized");
  } catch (e) {
    console.error("[API] Failed to setup tRPC:", e.message);
    app.use("/api/trpc", (req, res) => {
      res.status(500).json({ error: "Backend not initialized", message: e.message });
    });
  }

  return app;
}

module.exports = async (req, res) => {
  try {
    const expressApp = getApp();
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(504).json({ error: "Request timeout" });
        }
        resolve();
      }, 30000);

      expressApp(req, res);
      
      res.on("finish", () => {
        clearTimeout(timeout);
        resolve();
      });
      
      res.on("error", (err) => {
        clearTimeout(timeout);
        console.error("[API] Response error:", err);
        resolve();
      });
    });
  } catch (error) {
    console.error("[API] Handler error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message || "Internal error" });
    }
  }
};
