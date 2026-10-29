import { env } from "@/lib/env";

export function absoluteUrl(path: string): string {
  return new URL(path, env.BETTER_AUTH_URL).toString();
}
