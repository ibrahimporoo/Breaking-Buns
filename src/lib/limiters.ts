import { createRateLimiter } from "@/lib/rate-limit";

const MINUTE_MS = 60_000;

export const placeOrderLimiter = createRateLimiter({ limit: 10, windowMs: 10 * MINUTE_MS });
export const orderLookupLimiter = createRateLimiter({ limit: 90, windowMs: MINUTE_MS });
export const ownerClaimLimiter = createRateLimiter({ limit: 5, windowMs: 15 * MINUTE_MS });
