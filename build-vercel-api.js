#!/usr/bin/env node
/**
 * Build script for Vercel API bundle
 * Compiles server/vercel-api.ts with proper alias resolution
 */

import esbuild from 'esbuild';
import fs from 'fs';

(async () => {
  try {
    console.log('[BUILD] Starting esbuild for Vercel API...');
    
    // Ensure dist directory exists
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
    }
    
    const result = await esbuild.build({
      entryPoints: ['server/vercel-api.ts'],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile: 'dist/server-vercel-api.js',
      alias: {
        '@shared': './shared',
      },
      // Mark tRPC deps as external since they're in node_modules
      external: ['@trpc/server', '@trpc/server/adapters/express', 'express'],
      logLevel: 'info',
    });
    
    console.log('[BUILD] ✓ Vercel API bundle created successfully');
    
    // Verify file was created
    const bundleSize = fs.statSync('dist/server-vercel-api.js').size;
    console.log(`[BUILD] Bundle size: ${(bundleSize / 1024).toFixed(2)} KB`);
  } catch (err) {
    console.error('[BUILD] ✗ Build failed:', err.message);
    console.error('[BUILD] Stack:', err.stack);
    process.exit(1);
  }
})();
