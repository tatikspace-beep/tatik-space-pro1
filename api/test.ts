/**
 * Simple test endpoint to verify Vercel serverless is working
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  res.status(200).json({ 
    ok: true,
    message: "Serverless function is working!",
    method: req.method,
    path: req.url,
  });
};
