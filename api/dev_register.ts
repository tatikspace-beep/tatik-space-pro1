import * as db from "../server/db";
import { enhanceVercelResponse } from "./_vercel-response";

export default async function handler(req: any, res: any) {
  const enhancedRes = enhanceVercelResponse(res);

  try {
    const requestUrl = new URL(req.url ?? "/", "https://example.com");
    const name = String(requestUrl.searchParams.get("name") ?? "Tatik");
    const email = String(requestUrl.searchParams.get("email") ?? "tatik.space@gmail.com");
    const openId = `local:${email}`;

    let dbSynced = false;
    try {
      await db.upsertUser({
        openId,
        name,
        email,
        loginMethod: "local",
        lastSignedIn: new Date(),
      });
      dbSynced = true;
    } catch (dbErr: any) {
      if (dbErr?.cause?.code === "ENOTFOUND" || dbErr?.message?.includes("ENOTFOUND")) {
        console.warn("[DevRegister] Database unreachable, user cached locally only.", dbErr?.message || dbErr);
      } else {
        throw dbErr;
      }
    }

    enhancedRes.status(200).json({
      success: true,
      message: `User ${name} (${email}) registered for dev`,
      user: { openId, name, email },
      dbStatus: dbSynced ? "synced" : "offline",
    });
  } catch (error: any) {
    console.error("[DevRegister] Failed to register user", error);
    enhancedRes.status(500).json({ error: "Registration failed", details: String(error) });
  }
}
