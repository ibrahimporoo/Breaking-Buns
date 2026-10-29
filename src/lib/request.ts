import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");

  return forwarded?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
}
