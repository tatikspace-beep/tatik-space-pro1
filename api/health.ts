import { COOKIE_NAME } from "../shared/const";
import { enhanceVercelResponse } from "./_vercel-response";

export default async function handler(_req: any, res: any) {
  const enhancedRes = enhanceVercelResponse(res);
  enhancedRes.status(200).json({ ok: true, cookie: COOKIE_NAME });
}
