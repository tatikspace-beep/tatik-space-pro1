import { build as buildWithEsbuild } from "esbuild";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function previewReactRuntimePlugin(): Plugin {
  const assetPath = "/preview-react-runtime.js";
  let runtimeBuild: Promise<string> | undefined;
  const buildRuntime = () => {
    runtimeBuild ??= buildWithEsbuild({
      stdin: {
        contents: `
          import * as React from "react";
          import * as ReactDOM from "react-dom/client";
          import * as jsxRuntime from "react/jsx-runtime";
          globalThis.TatikPreviewReact = { React, ReactDOM, jsxRuntime };
        `,
        loader: "js",
        resolveDir: __dirname,
        sourcefile: "preview-react-runtime.js",
      },
      bundle: true,
      format: "iife",
      platform: "browser",
      target: ["es2020"],
      minify: true,
      write: false,
    }).then(({ outputFiles }) => {
      const output = outputFiles.find(file => file.path.endsWith(".js") || file.path === "<stdout>");
      if (!output) throw new Error("The React preview runtime bundle is missing.");
      return output.text;
    });
    return runtimeBuild;
  };

  return {
    name: "tatik-preview-react-runtime",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?")[0] !== assetPath) return next();
        void buildRuntime().then(code => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "text/javascript; charset=utf-8");
          response.end(code);
        }).catch(next);
      });
    },
    async generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: assetPath.slice(1),
        source: await buildRuntime(),
      });
    },
  };
}

function previewFrameworkRuntimePlugin(): Plugin {
  const assetPath = "/preview-framework-runtime.js";
  let runtimeBuild: Promise<string> | undefined;
  const buildRuntime = () => {
    runtimeBuild ??= buildWithEsbuild({
      stdin: {
        contents: `
          import * as Vue from "vue";
          import * as Svelte from "svelte";
          import * as SvelteClient from "svelte/internal/client";
          import * as SvelteLegacy from "svelte/legacy";
          import * as SvelteStore from "svelte/store";
          import "svelte/internal/disclose-version";
          import "svelte/internal/flags/legacy";
          globalThis.TatikPreviewFramework = {
            vue: Vue,
            svelte: SvelteClient,
            svelteApi: { ...Svelte, ...SvelteLegacy, ...SvelteStore }
          };
        `,
        loader: "js",
        resolveDir: __dirname,
        sourcefile: "preview-framework-runtime.js",
      },
      bundle: true,
      format: "iife",
      platform: "browser",
      target: ["es2020"],
      minify: true,
      write: false,
    }).then(({ outputFiles }) => {
      const output = outputFiles.find(file => file.path.endsWith(".js") || file.path === "<stdout>");
      if (!output) throw new Error("The framework preview runtime bundle is missing.");
      return output.text;
    });
    return runtimeBuild;
  };

  return {
    name: "tatik-preview-framework-runtime",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?")[0] !== assetPath) return next();
        void buildRuntime().then(code => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "text/javascript; charset=utf-8");
          response.end(code);
        }).catch(next);
      });
    },
    async generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: assetPath.slice(1),
        source: await buildRuntime(),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), previewReactRuntimePlugin(), previewFrameworkRuntimePlugin()],
  root: "./client", // Serve da client
  // publicDir is relative to `root` (which is ./client). Use the default
  // "public" inside the client folder so Vite will copy static assets
  // (favicon, logo.png, etc.) into the final `dist/public` folder.
  publicDir: "public",
  envDir: "../", // <--- FIX: Load .env da root progetto (non client)
  build: {
    outDir: "../dist",
    emptyOutDir: false,
  },
  server: {
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 5173,
    open: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:3001",
        changeOrigin: true,
      },
      "/__dev": {
        target: process.env.VITE_API_URL || "http://localhost:3001",
        changeOrigin: true,
      },
      "/auth": {
        target: process.env.VITE_API_URL || "http://localhost:3001",
        changeOrigin: true,
      },
      "/trpc": {
        target: process.env.VITE_API_URL || "http://localhost:3001",
        changeOrigin: true,
      },
    },
    hmr: { overlay: false }, // Disable overlay for errors (opzionale)
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
