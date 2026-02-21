#!/usr/bin/env node
/**
 * Post-build script: Copy /api folder to /dist for Vercel deployment
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiSrc = path.join(__dirname, "..", "api");
const apiDest = path.join(__dirname, "..", "dist", "api");

function mkdirDeep(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyDir(src, dest) {
  mkdirDeep(dest);
  const files = fs.readdirSync(src);
  
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stats = fs.statSync(srcPath);
    
    if (stats.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log(`[PostBuild] Copying ${apiSrc} → ${apiDest}`);
  // Remove old dist/api if exists
  if (fs.existsSync(apiDest)) {
    fs.rmSync(apiDest, { recursive: true, force: true });
  }
  copyDir(apiSrc, apiDest);
  console.log("[PostBuild] ✅ API folder copied successfully");
} catch (error) {
  console.error("[PostBuild] ❌ Failed to copy API folder:", error.message);
  process.exit(1);
}
