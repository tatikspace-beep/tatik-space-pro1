type AuthUrlEnvironment = {
  APP_URL?: string;
  VERCEL_ENV?: string;
  VERCEL_URL?: string;
};

export function authBaseUrl(env: AuthUrlEnvironment = {
  APP_URL: process.env.APP_URL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
}) {
  if (env.VERCEL_ENV === "preview" && env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }

  return env.APP_URL || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "http://localhost:3000");
}
