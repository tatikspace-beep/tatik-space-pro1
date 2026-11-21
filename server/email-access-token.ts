import { SignJWT, jwtVerify } from "jose";

const ACCESS_TOKEN_TTL_SECONDS = 10 * 60;

function accessTokenKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "tatik-space-pro-secret");
}

async function createSignedEmailToken(email: string, purpose: "access" | "registration") {
  return new SignJWT({ email, purpose })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(accessTokenKey());
}

async function verifySignedEmailToken(token: string, purpose: "access" | "registration") {
  const { payload } = await jwtVerify(token, accessTokenKey());
  if (payload.purpose !== purpose || typeof payload.email !== "string") {
    throw new Error(`Invalid ${purpose} token`);
  }
  return { email: payload.email };
}

export function createSignedEmailAccessToken(email: string) {
  return createSignedEmailToken(email, "access");
}

export function verifySignedEmailAccessToken(token: string) {
  return verifySignedEmailToken(token, "access");
}

export function createSignedEmailRegistrationToken(email: string) {
  return createSignedEmailToken(email, "registration");
}

export function verifySignedEmailRegistrationToken(token: string) {
  return verifySignedEmailToken(token, "registration");
}
