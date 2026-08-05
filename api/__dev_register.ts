import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as db from "../server/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const name = String(req.query.name ?? "Tatik");
    const email = String(req.query.email ?? "tatik.space@gmail.com");
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

    res.status(200).json({
      success: true,
      message: `User ${name} (${email}) registered for dev`,
      user: { openId, name, email },
      dbStatus: dbSynced ? "synced" : "offline",
    });
  } catch (error: any) {
    console.error("[DevRegister] Failed to register user", error);
    res.status(500).json({ error: "Registration failed", details: String(error) });
  }
}
