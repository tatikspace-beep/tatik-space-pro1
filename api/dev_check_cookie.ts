import { COOKIE_NAME } from "../shared/const";
import { enhanceVercelResponse } from "./_vercel-response";

export default async function handler(req: any, res: any) {
  const enhancedRes = enhanceVercelResponse(res);
  const cookies = String(req.headers.cookie ?? "");
  const hasCookie = cookies.includes(COOKIE_NAME);

  enhancedRes.status(200).json({
    hasCookie,
    cookies: cookies || "none",
    cookieName: COOKIE_NAME,
  });
}
