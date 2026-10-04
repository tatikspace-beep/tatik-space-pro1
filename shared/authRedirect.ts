export function safeReturnPath(value: unknown, fallback = "/editor"): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }

  try {
    const destination = new URL(value, "https://tatik.invalid");
    if (destination.origin !== "https://tatik.invalid") return fallback;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}
