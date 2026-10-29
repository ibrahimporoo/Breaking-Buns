import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TOLERANCE_SECONDS = 300;

type VerifyOptions = {
  payload: string;
  header: string | null;
  secret: string;
  toleranceSeconds?: number;
  nowSeconds?: number;
};

/**
 * Verifies a Stripe webhook (`Stripe-Signature: t=...,v1=...`).
 * Stripe signs `${timestamp}.${rawBody}` with HMAC-SHA256 using the endpoint secret.
 */
export function verifyStripeSignature({
  payload,
  header,
  secret,
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
  nowSeconds = Math.floor(Date.now() / 1000),
}: VerifyOptions): boolean {
  if (!header) return false;

  let timestamp = "";
  const signatures: string[] = [];

  for (const part of header.split(",")) {
    const [key, value] = part.split("=");
    if (key === "t") timestamp = value ?? "";
    if (key === "v1" && value) signatures.push(value);
  }

  const signedAt = Number(timestamp);
  if (!Number.isInteger(signedAt) || signatures.length === 0) return false;
  if (Math.abs(nowSeconds - signedAt) > toleranceSeconds) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest();

  return signatures.some((signature) => {
    const candidate = Buffer.from(signature, "hex");

    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}
