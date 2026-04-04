/**
 * Vercel API Handler - /api/[...slug].ts
 * Must register module aliases before importing backend code
 */

// Register module aliases at the very top
import moduleAlias from 'module-alias';
import path from 'path';

const root = path.resolve(__dirname, '..');
moduleAlias.addAliases({
  '@shared': path.join(root, 'shared'),
  '@': path.join(root, 'client', 'src'),
});

console.log('[API] Module aliases registered');

/**
 * Vercel API Handler - /api/[...slug].ts
 * Must register module aliases before importing backend code
 */

// Register module aliases at the very top
import moduleAlias from 'module-alias';
import path from 'path';

const root = path.resolve(__dirname, '..');
moduleAlias.addAliases({
  '@shared': path.join(root, 'shared'),
  '@': path.join(root, 'client', 'src'),
});

console.log('[API] Module aliases registered');

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";

// Now we can import backend code
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { testVersion } from "./_test-version";

const handler = createHTTPHandler({
  router: appRouter,
  createContext: async (opts) => {
    return createContext({
      req: opts.req,
      res: opts.res,
    });
  },
});

export default async (req: VercelRequest, res: VercelResponse) => {
  // Health check
  if (req.url === "/api/health" || req.url === "/health") {
    return res.status(200).json({ ok: true, version: testVersion });
  }

  try {
    await handler(req, res);
  } catch (error: any) {
    console.error("[API] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message });
    }
  }
};
};

