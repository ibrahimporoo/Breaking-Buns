export type Fulfillment = "delivery" | "pickup";

export type PricingSettings = {
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
  minDeliveryOrderCents: number;
  taxRateBps: number;
};

export type OrderTotals = {
  subtotalCents: number;
  deliveryFeeCents: number;
  taxCents: number;
  totalCents: number;
};

export function lineTotal(unitPriceCents: number, quantity: number): number {
  return unitPriceCents * quantity;
}

/**
 * Tax is charged on food only (not on the delivery fee) and rounded to the
 * nearest cent. A free-delivery threshold of 0 means the feature is off.
 */
export function calculateTotals(
  subtotalCents: number,
  fulfillment: Fulfillment,
  settings: PricingSettings,
): OrderTotals {
  const qualifiesForFreeDelivery =
    settings.freeDeliveryThresholdCents > 0 &&
    subtotalCents >= settings.freeDeliveryThresholdCents;

  const deliveryFeeCents =
    fulfillment === "delivery" && !qualifiesForFreeDelivery
      ? settings.deliveryFeeCents
      : 0;

  const taxCents = Math.round((subtotalCents * settings.taxRateBps) / 10_000);

  return {
    subtotalCents,
    deliveryFeeCents,
    taxCents,
    totalCents: subtotalCents + deliveryFeeCents + taxCents,
  };
}

/** How many cents are missing to reach the delivery minimum (0 when fine). */
export function minimumShortfall(
  subtotalCents: number,
  fulfillment: Fulfillment,
  settings: Pick<PricingSettings, "minDeliveryOrderCents">,
): number {
  if (fulfillment !== "delivery") return 0;

  return Math.max(0, settings.minDeliveryOrderCents - subtotalCents);
}
