import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  console.log('[API] Request received:', req.url, req.method);

  // Health check
  if (req.url === "/api/health" || req.url === "/health") {
    return res.status(200).json({ ok: true, version: "test" });
  }

  // Simple test endpoint
  if (req.url?.startsWith('/api/trpc/')) {
    console.log('[API] tRPC request detected');
    return res.status(200).json({ result: { data: { success: true } } });
  }

  return res.status(404).json({ error: "Not found" });
};
};

