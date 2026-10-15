type AuthUrlEnvironment = {
  APP_URL?: string;
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  VERCEL_BRANCH_URL?: string;
  VERCEL_URL?: string;
};

export function getAuthBaseUrl(env: AuthUrlEnvironment = {
  APP_URL: process.env.APP_URL,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
  VERCEL_URL: process.env.VERCEL_URL,
}) {
  if (env.VERCEL_ENV === "preview") {
    const previewUrl = env.VERCEL_BRANCH_URL || env.VERCEL_URL;
    if (!previewUrl) {
      throw new Error("VERCEL_BRANCH_URL or VERCEL_URL is required to create authentication links in Preview");
    }
    return `https://${previewUrl}`;
  }

  return env.APP_URL || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "http://localhost:3000");
}
