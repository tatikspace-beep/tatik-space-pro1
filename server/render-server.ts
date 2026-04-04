/**
 * Tatik Space API Server - Standalone Express App for Render
 * Runs on Render (port 3000) while frontend stays on Vercel
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

console.log('[Init] Starting imports...');

let appRouter: any;
let createContext: any;

try {
  const routersModule = await import("./routers.js");
  appRouter = routersModule.appRouter;
  console.log('[Init] appRouter imported successfully:', !!appRouter);
} catch (importError) {
  console.error('[Init] Failed to import appRouter:', importError);
  process.exit(1);
}

try {
  const contextModule = await import("./_core/context.js");
  createContext = contextModule.createContext;
  console.log('[Init] createContext imported successfully:', !!createContext);
} catch (importError) {
  console.error('[Init] Failed to import createContext:', importError);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Log environment status
console.log(`[Init] Node Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`[Init] Database configured: ${!!process.env.DATABASE_URL}`);
console.log(`[Init] Port: ${PORT}`);

// CORS middleware - allow all origins for now
app.use(cors());

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: !!process.env.DATABASE_URL ? 'configured' : 'not-configured'
  });
});

// tRPC API routes
console.log('[Init] Registering tRPC middleware at /api/trpc...');
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);
console.log('[Init] tRPC middleware registered');

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error Middleware]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// Start server with error handling
try {
  app.listen(PORT, () => {
    console.log(`🚀 Tatik Space API running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`📍 API: http://localhost:${PORT}/api/trpc`);
  });
} catch (error) {
  console.error('[Fatal Error]', error);
  process.exit(1);
}
