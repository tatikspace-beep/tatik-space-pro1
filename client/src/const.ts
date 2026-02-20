export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// For development, use local login page; for production, use OAuth portal
export const getLoginUrl = () => {
  // Always use local login page for now
  return '/login';
};
