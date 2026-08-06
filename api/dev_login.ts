import type { VercelRequest, VercelResponse } from "@vercel/node";
import { issueSession } from "./_auth-dev";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const openId = String(req.query.openId ?? "local:dev-admin");
    const name = String(req.query.name ?? "Dev Admin");
    await issueSession(req, res, {
      openId,
      name,
      email: String(req.query.email ?? `${openId}@dev.local`),
      loginMethod: "dev",
      role: "admin",
      redirectTo: "/dashboard",
    });
    return;
  } catch (error: any) {
    console.error("[DevLogin] Failed to create dev session", error);
    res.status(500).send("Dev login failed");
  }
}
