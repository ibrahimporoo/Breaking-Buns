type Entry<T> = {
  value: T;
  expiresAt: number;
};

export type TtlCache<T> = {
  get(load: () => Promise<T>, now?: number): Promise<T>;
  clear(): void;
};

/**
 * Tiny per-process cache for rarely changing data (settings, opening hours,
 * dining areas). It also de-duplicates concurrent loads, so a burst of
 * visitors triggers one database query instead of hundreds.
 */
export function createTtlCache<T>(ttlMs: number): TtlCache<T> {
  let entry: Entry<T> | null = null;
  let inflight: Promise<T> | null = null;

  return {
    async get(load, now = Date.now()) {
      if (entry && entry.expiresAt > now) return entry.value;
      if (inflight) return inflight;

      inflight = load()
        .then((value) => {
          entry = { value, expiresAt: Date.now() + ttlMs };
          return value;
        })
        .finally(() => {
          inflight = null;
        });

      return inflight;
    },
    clear() {
      entry = null;
    },
  };
}
