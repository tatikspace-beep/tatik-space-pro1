import type { VercelRequest, VercelResponse } from "@vercel/node";

// Import from local _const instead of external shared/
import { COOKIE_NAME } from "./_const";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.url === "/api/health") {
    return res.status(200).json({ ok: true, cookie: COOKIE_NAME });
  }
  
  res.status(404).json({ error: "Not found" });
}
