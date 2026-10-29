const AUTH_PATHS = ["/login", "/register"];

export function safeRedirectPath(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return undefined;
  }
  if (AUTH_PATHS.some((path) => value.startsWith(path))) return undefined;

  return value;
}
