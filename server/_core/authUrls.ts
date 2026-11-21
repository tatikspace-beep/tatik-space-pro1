type AuthUrlEnvironment = {
  APP_URL?: string;
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  VERCEL_BRANCH_URL?: string;
  VERCEL_URL?: string;
};

const PREVIEW_HOST_PREFIX = "tatik-space-pro1-";
const PREVIEW_HOST_SUFFIX = "-tatikspace-beeps-projects.vercel.app";

function getHttpsOrigin(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

function isProjectPreviewOrigin(origin: string) {
  const url = new URL(origin);
  return !url.port &&
    url.hostname.startsWith(PREVIEW_HOST_PREFIX) &&
    url.hostname.endsWith(PREVIEW_HOST_SUFFIX);
}

export function getAuthBaseUrl(
  env: AuthUrlEnvironment = {
    APP_URL: process.env.APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
    VERCEL_URL: process.env.VERCEL_URL,
  },
  requestOrigin?: string,
) {
  if (env.VERCEL_ENV === "preview") {
    const previewOrigins = [
      getHttpsOrigin(env.VERCEL_BRANCH_URL),
      getHttpsOrigin(env.VERCEL_URL),
    ].filter((origin): origin is string => origin !== null);
    const requestedOrigin = getHttpsOrigin(requestOrigin);
    if (
      requestedOrigin &&
      (previewOrigins.includes(requestedOrigin) || isProjectPreviewOrigin(requestedOrigin))
    ) {
      return requestedOrigin;
    }

    const previewUrl = env.VERCEL_BRANCH_URL || env.VERCEL_URL;
    if (!previewUrl) {
      throw new Error("VERCEL_BRANCH_URL or VERCEL_URL is required to create authentication links in Preview");
    }
    return `https://${previewUrl}`;
  }

  return env.APP_URL || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "http://localhost:3000");
}
