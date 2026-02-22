#!/usr/bin/env node
/**
 * Build script for Vercel API bundle
 * Compiles server/vercel-api.ts with proper alias resolution
 */

import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  try {
    console.log('[BUILD] Starting esbuild for Vercel API...');
    
    await esbuild.build({
      entryPoints: [path.join(__dirname, 'server/vercel-api.ts')],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile: path.join(__dirname, 'dist/server-vercel-api.js'),
      alias: {
        '@shared': path.join(__dirname, 'shared'),
      },
      external: [],
      logLevel: 'info',
    });
    
    console.log('[BUILD] ✓ Vercel API bundle created successfully');
  } catch (err) {
    console.error('[BUILD] ✗ Build failed:', err.message);
    process.exit(1);
  }
})();
