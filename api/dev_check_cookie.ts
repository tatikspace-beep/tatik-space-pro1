import type { VercelRequest, VercelResponse } from "@vercel/node";
import { COOKIE_NAME } from "../shared/const";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cookies = req.headers.cookie || "";
  const hasCookie = cookies.includes(COOKIE_NAME);

  res.status(200).json({
    hasCookie,
    cookies: cookies || "none",
    cookieName: COOKIE_NAME,
  });
}
