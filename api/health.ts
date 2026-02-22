import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.url === "/api/health") {
    return res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
  }
  
  res.status(404).json({ error: "Not found" });
}
