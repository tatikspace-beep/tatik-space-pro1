type AuthUrlEnvironment = {
  APP_URL?: string;
  VERCEL_BRANCH_URL?: string;
  VERCEL_ENV?: string;
  VERCEL_GIT_COMMIT_REF?: string;
  VERCEL_URL?: string;
};

const PAYPAL_DIAGNOSTICS_PREVIEW_BRANCH = "preview/paypal-diagnostics-20261012";

export function authBaseUrl(env: AuthUrlEnvironment = {
  APP_URL: process.env.APP_URL,
  VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
  VERCEL_URL: process.env.VERCEL_URL,
}) {
  if (
    env.VERCEL_ENV === "preview" &&
    env.VERCEL_GIT_COMMIT_REF === PAYPAL_DIAGNOSTICS_PREVIEW_BRANCH &&
    env.VERCEL_BRANCH_URL
  ) {
    return `https://${env.VERCEL_BRANCH_URL}`;
  }

  if (env.VERCEL_ENV === "preview" && env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`;
  }

  return env.APP_URL || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "http://localhost:3000");
}
