/**
 * Tatik Space API Server - Standalone Express App for Render
 * Runs on Render (port 3000) while frontend stays on Vercel
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware - allow requests from tatik.space and localhost
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://www.tatik.space',
      'https://tatik.space',
      'http://localhost:5173',  // Vite dev server
      'http://localhost:3000',  // When running locally
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// tRPC API routes
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tatik Space API running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 API: http://localhost:${PORT}/api/trpc`);
});
