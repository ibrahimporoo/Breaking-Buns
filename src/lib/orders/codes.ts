import { createHash, randomBytes, randomInt } from "node:crypto";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const TOKEN_BYTES = 24;

export function generateOrderCode(): string {
  let suffix = "";

  for (let index = 0; index < CODE_LENGTH; index += 1) {
    suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }

  return `BB-${suffix}`;
}

export function hashTrackingToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** The raw token only ever lives in the customer's link; we store its hash. */
export function generateTrackingToken(): { token: string; hash: string } {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");

  return { token, hash: hashTrackingToken(token) };
}
