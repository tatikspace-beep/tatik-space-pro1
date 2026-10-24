import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export const PROVIDER_IDS = ["cloudflare", "vercel", "netlify", "supabase", "neon"] as const;
export type ProviderId = typeof PROVIDER_IDS[number];

const PROVIDER_API_PROBES: Record<ProviderId, { url: string; method?: "GET" }> = {
  cloudflare: { url: "https://api.cloudflare.com/client/v4/user/tokens/verify" },
  vercel: { url: "https://api.vercel.com/v2/user" },
  netlify: { url: "https://api.netlify.com/api/v1/user" },
  supabase: { url: "https://api.supabase.com/v1/projects" },
  neon: { url: "https://console.neon.tech/api/v2/projects" },
};

function encryptionKey() {
  const encoded = process.env.PROVIDER_CREDENTIALS_ENCRYPTION_KEY;
  if (!encoded) {
    throw new Error("Provider credential storage is not configured.");
  }
  const key = /^[a-f0-9]{64}$/i.test(encoded)
    ? Buffer.from(encoded, "hex")
    : Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new Error("PROVIDER_CREDENTIALS_ENCRYPTION_KEY must encode exactly 32 bytes.");
  }
  return key;
}

export function assertProviderCredentialStorageConfigured() {
  encryptionKey();
}

export function encryptProviderCredential(value: string, key = encryptionKey(), context = "") {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(context, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v2.${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function decryptProviderCredential(value: string, key = encryptionKey(), context = "") {
  const [version, encodedIv, encodedTag, encodedCiphertext, extra] = value.split(".");
  if (version !== "v2" || !encodedIv || !encodedTag || !encodedCiphertext || extra) {
    throw new Error("Stored provider credential has an unsupported format.");
  }
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(encodedIv, "base64url"));
  decipher.setAAD(Buffer.from(context, "utf8"));
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export async function verifyProviderCredential(provider: ProviderId, token: string) {
  const probe = PROVIDER_API_PROBES[provider];
  const response = await fetch(probe.url, {
    method: probe.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "User-Agent": "Tatik.space",
    },
    signal: AbortSignal.timeout(10_000),
    redirect: "error",
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("The provider rejected this credential or its permissions.");
  }
  if (!response.ok) {
    throw new Error(`Provider verification failed (HTTP ${response.status}).`);
  }
  if (provider === "cloudflare") {
    const result = await response.json() as { success?: boolean };
    if (result.success !== true) {
      throw new Error("Cloudflare did not confirm this token.");
    }
  }
}
