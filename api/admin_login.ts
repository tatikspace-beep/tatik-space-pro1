import type { VercelRequest, VercelResponse } from "@vercel/node";
import { issueSession } from "./_auth-dev";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await issueSession(req, res, {
      openId: "local:tatik.space@gmail.com",
      name: "Tatik Admin",
      email: "tatik.space@gmail.com",
      loginMethod: "admin",
      role: "admin",
      redirectTo: "/dashboard",
    });
    return;
  } catch (error: any) {
    console.error("[AdminLogin] Failed to create admin session", error);
    res.status(500).send("Admin login failed");
  }
}
