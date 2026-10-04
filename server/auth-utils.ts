import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_EMAIL = "tatik.space@gmail.com";

export function normalizeEmail(email?: string | null): string {
  return String(email ?? "").trim().toLowerCase();
}

export function isAdminEmail(email?: string | null): boolean {
  return normalizeEmail(email) === ADMIN_EMAIL;
}

export function isCollaboratorEmail(email?: string | null): boolean {
  const configured = (process.env.COLLABORATOR_EMAILS || "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
  return configured.includes(normalizeEmail(email));
}

export function isStaffEmail(email?: string | null): boolean {
  return isAdminEmail(email) || isCollaboratorEmail(email);
}

export function isStaffUser(user?: { email?: string | null; role?: string | null } | null): boolean {
  return Boolean(user && (user.role === "admin" || isStaffEmail(user.email)));
}
export function isAdminOpenId(openId?: string | null): boolean {
  if (!openId) return false;
  const value = String(openId).trim();
  if (value.toLowerCase().includes("admin")) return true;
  const localEmail = value.startsWith("local:") ? value.slice("local:".length) : value;
  return isAdminEmail(localEmail);
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, storedPassword?: string | null): boolean {
  if (!storedPassword) return false;

  const plain = String(storedPassword).trim();
  if (plain === password) return true;

  const hashed = hashPassword(password);
  const a = Buffer.from(plain, "utf8");
  const b = Buffer.from(hashed, "utf8");

  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
