export type RateLimiterOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

type Entry = {
  count: number;
  resetAt: number;
};

const MAX_TRACKED_KEYS = 5000;

export function createRateLimiter({ limit, windowMs }: RateLimiterOptions) {
  const entries = new Map<string, Entry>();

  function prune(now: number) {
    for (const [key, entry] of entries) {
      if (entry.resetAt <= now) entries.delete(key);
    }
  }

  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      if (entries.size > MAX_TRACKED_KEYS) {
        prune(now);
        while (entries.size > MAX_TRACKED_KEYS) {
          const oldest = entries.keys().next().value;
          if (oldest === undefined) break;
          entries.delete(oldest);
        }
      }

      const current = entries.get(key);

      if (!current || current.resetAt <= now) {
        entries.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSeconds: 0 };
      }

      if (current.count >= limit) {
        return {
          allowed: false,
          retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
        };
      }

      current.count += 1;
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}
