import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  // Skip Vite middleware for API routes - let them pass through to tRPC/other handlers
  app.use((req, res, next) => {
    if (String(req.url).startsWith("/api/")) {
      return next();
    }
    return vite.middlewares(req, res, next);
  });

  // Catch-all: serve index.html for any non-API route (SPA fallback)
  app.use("*", async (req, res, next) => {
    // Skip API routes - let them reach the API handlers
    if (String(req.originalUrl).startsWith("/api/")) {
      return next();
    }
    // Skip health check - it's handled separately
    if (String(req.originalUrl) === "/health") {
      return next();
    }
    // Skip Vite modules and HMR requests
    const originalUrl = String(req.originalUrl);
    if (originalUrl.includes("?t=") || originalUrl.includes("?v=")) {
      // These are Vite module requests with query params - let them through to Vite middleware
      return next();
    }
    if (originalUrl.startsWith("/@vite") || originalUrl.startsWith("/@react-refresh")) {
      // Vite internal modules
      return next();
    }
    if (originalUrl.startsWith("/src/") || originalUrl.startsWith("/node_modules/")) {
      // Module imports
      return next();
    }
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, serve from dist/ (Vite output)
  const distPath = path.resolve(import.meta.dirname, "../..", "dist");

  // For Vite builds, the index.html and assets are directly in dist/
  const indexHtmlPath = path.resolve(distPath, "index.html");

  if (!fs.existsSync(indexHtmlPath)) {
    console.error(
      `Could not find build output: ${indexHtmlPath}, make sure to build the client first (pnpm run build)`
    );
  }

  // Serve static assets (CSS, JS bundled by Vite)
  app.use(express.static(distPath));

  // Fall through to index.html for SPA routing
  // But skip API routes - those should be handled by earlier middleware
  app.use("*", (_req, res) => {
    const url = _req.originalUrl;
    // Skip API routes
    if (String(url).startsWith("/api/")) {
      return res.status(404).json({ error: "Not found" });
    }
    // Skip health check
    if (String(url) === "/health") {
      return res.status(404).json({ error: "Not found" });
    }
    // Serve index.html for SPA routing
    res.sendFile(indexHtmlPath);
  });
}
