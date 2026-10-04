import { SignJWT, jwtVerify } from "jose";

const ACCESS_TOKEN_TTL_SECONDS = 10 * 60;

function accessTokenKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "tatik-space-pro-secret");
}

export async function createSignedEmailAccessToken(email: string) {
  return new SignJWT({ email, purpose: "access" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(accessTokenKey());
}

export async function verifySignedEmailAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessTokenKey());
  if (payload.purpose !== "access" || typeof payload.email !== "string") {
    throw new Error("Invalid access token");
  }
  return { email: payload.email };
}
