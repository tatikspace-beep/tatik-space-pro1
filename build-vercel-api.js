#!/usr/bin/env node
/**
 * Build script for Vercel API bundle
 * Compiles server/vercel-api.ts with proper alias resolution
 */

import esbuild from 'esbuild';

(async () => {
  try {
    console.log('[BUILD] Starting esbuild for Vercel API...');
    
    const result = await esbuild.build({
      entryPoints: ['server/vercel-api.ts'],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile: 'dist/server-vercel-api.js',
      alias: {
        '@shared': './shared',
      },
      logLevel: 'info',
    });
    
    console.log('[BUILD] ✓ Vercel API bundle created successfully');
    console.log('[BUILD] Result:', result);
  } catch (err) {
    console.error('[BUILD] ✗ Build failed:', err.message);
    console.error('[BUILD] Stack:', err.stack);
    process.exit(1);
  }
})();
