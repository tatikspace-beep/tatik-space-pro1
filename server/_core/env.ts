export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "tatik-space-pro-secret",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  hfApiKey: process.env.HF_API_KEY ?? "",
  // Forge / third-party storage API (optional)
  forgeApiUrl: process.env.FORGE_API_URL ?? process.env.VITE_FRONTEND_FORGE_API_URL ?? "",
  forgeApiKey: process.env.FORGE_API_KEY ?? process.env.VITE_FRONTEND_FORGE_API_KEY ?? "",
};
