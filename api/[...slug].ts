import type { VercelRequest, VercelResponse } from "@vercel/node";

function sendJSON(res: VercelResponse, status: number, data: any) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status);
  res.end(JSON.stringify(data));
}

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    console.log("[API] Request:", req.url, req.method);

    // Health check
    if (req.url === "/api/health" || req.url === "/health") {
      return sendJSON(res, 200, { ok: true });
    }

    // Auth endpoints
    if (req.url?.includes('/api/trpc/auth.login')) {
      console.log('[API] Login request');
      return sendJSON(res, 200, {
        result: { data: { success: true, requires2fa: false } }
      });
    }

    if (req.url?.includes('/api/trpc/auth.register')) {
      console.log('[API] Register request');
      return sendJSON(res, 200, {
        result: { data: { success: true } }
      });
    }

    // Default
    return sendJSON(res, 200, { result: { data: { ok: true } } });
  } catch (error: any) {
    console.error("[API] Error:", error);
    sendJSON(res, 500, { error: error?.message || "Server error" });
  }
};

