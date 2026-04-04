import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  console.log("[API] Request received:", req.url, req.method, req.headers);

  // Health check
  if (req.url === "/api/health" || req.url === "/health") {
    return res.status(200).json({ ok: true, version: "test" });
  }

  // Test endpoint for login/register
  if (req.url?.startsWith('/api/trpc/auth.login') || req.url?.startsWith('/api/trpc/auth.register')) {
    console.log('[API] Auth request detected, returning mock success');
    return res.status(200).json({
      result: {
        data: {
          success: true,
          user: {
            id: "test-user",
            email: "test@example.com",
            name: "Test User"
          }
        }
      }
    });
  }

  // Default response
  return res.status(200).json({
    result: {
      data: { message: "API working" }
    }
  });
};

