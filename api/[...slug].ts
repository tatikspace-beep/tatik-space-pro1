import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";

// Import backend code with relative paths
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
  console.log('[API] Request received:', req.url, req.method);

  // Health check
  if (req.url === "/api/health" || req.url === "/health") {
    return res.status(200).json({ ok: true, version: testVersion });
  }

  try {
    await handler(req, res);
  } catch (error: any) {
    console.error("[API] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  }
};
};

