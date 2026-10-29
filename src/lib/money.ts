const MAX_CENTS = 10_000_000;

/**
 * Converts what an owner types ("12", "12.5", "$12.50") into integer cents.
 * Returns null for anything that is not a sensible, non-negative price.
 */
export function parseMoneyToCents(input: string): number | null {
  const cleaned = input.trim().replace(/^\$/, "").replace(/,/g, "");

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;

  const [whole, fraction = ""] = cleaned.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

  return cents <= MAX_CENTS ? cents : null;
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function percentToBps(input: string): number | null {
  const cleaned = input.trim().replace(/%$/, "");

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;

  const bps = Math.round(Number(cleaned) * 100);

  return bps <= 5000 ? bps : null;
}

export function bpsToPercentInput(bps: number): string {
  return (bps / 100).toFixed(2);
}
