export const MAX_QUANTITY = 20;
export const MAX_LINES = 30;

export type CartLine = {
  id: string;
  name: string;
  priceCents: number;
  image: string | null;
  quantity: number;
};

export type CartProduct = Omit<CartLine, "quantity">;

function clampQuantity(quantity: number): number {
  return Math.min(MAX_QUANTITY, Math.max(0, Math.floor(quantity)));
}

export function addToCart(
  lines: readonly CartLine[],
  product: CartProduct,
  quantity = 1,
): CartLine[] {
  const existing = lines.find((line) => line.id === product.id);

  if (existing) {
    return lines.map((line) =>
      line.id === product.id
        ? { ...line, ...product, quantity: clampQuantity(line.quantity + quantity) }
        : line,
    );
  }

  if (lines.length >= MAX_LINES) return [...lines];

  const next = clampQuantity(quantity);
  return next > 0 ? [...lines, { ...product, quantity: next }] : [...lines];
}

export function setQuantity(
  lines: readonly CartLine[],
  id: string,
  quantity: number,
): CartLine[] {
  const next = clampQuantity(quantity);

  if (next === 0) return lines.filter((line) => line.id !== id);

  return lines.map((line) => (line.id === id ? { ...line, quantity: next } : line));
}

export function removeLine(lines: readonly CartLine[], id: string): CartLine[] {
  return lines.filter((line) => line.id !== id);
}

export function cartCount(lines: readonly CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartSubtotal(lines: readonly CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;

  return (
    typeof line.id === "string" &&
    line.id.length > 0 &&
    typeof line.name === "string" &&
    Number.isInteger(line.priceCents) &&
    (line.priceCents as number) >= 0 &&
    (line.image === null || typeof line.image === "string") &&
    Number.isInteger(line.quantity) &&
    (line.quantity as number) >= 1 &&
    (line.quantity as number) <= MAX_QUANTITY
  );
}

/** Reads a stored cart defensively: corrupted or tampered data becomes an empty cart. */
export function parseCart(raw: string | null): CartLine[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isCartLine).slice(0, MAX_LINES);
  } catch {
    return [];
  }
}

export function serializeCart(lines: readonly CartLine[]): string {
  return JSON.stringify(lines);
}
