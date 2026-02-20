import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: "./client", // Serve da client
  // publicDir is relative to `root` (which is ./client). Use the default
  // "public" inside the client folder so Vite will copy static assets
  // (favicon, logo.png, etc.) into the final `dist/public` folder.
  publicDir: "public",
  envDir: "../", // <--- FIX: Load .env da root progetto (non client)
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/__dev": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/trpc": {
        target: "http://localhost:3001",
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
