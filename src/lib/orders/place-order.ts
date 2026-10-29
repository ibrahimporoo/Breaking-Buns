import { getOrderableItems } from "@/db/queries/menu";
import { createOrder, type OrderView } from "@/db/queries/orders";
import { getStoreSettingsFresh } from "@/db/queries/store";
import { MAX_QUANTITY } from "@/lib/cart";
import { calculateTotals, minimumShortfall } from "@/lib/orders/pricing";
import type { PlaceOrderData } from "@/lib/orders/schemas";
import { formatMoney } from "@/lib/format";
import { isStripeConfigured } from "@/lib/payments/stripe";

export type PlaceOrderFailure = {
  ok: false;
  error: string;
  code: "closed" | "option_disabled" | "unavailable_items" | "minimum" | "price_changed";
  totalCents?: number;
};

export type PlaceOrderOutcome =
  | { ok: true; order: OrderView; trackingToken: string }
  | PlaceOrderFailure;

function mergeQuantities(items: PlaceOrderData["items"]) {
  const merged = new Map<string, number>();

  for (const item of items) {
    merged.set(item.itemId, Math.min(MAX_QUANTITY, (merged.get(item.itemId) ?? 0) + item.quantity));
  }

  return merged;
}

/**
 * The server never trusts prices from the browser. It re-reads every item from
 * the database, recalculates the totals, and only accepts the order when the
 * customer saw the same total.
 */
export async function placeOrder(
  data: PlaceOrderData,
  userId?: string,
): Promise<PlaceOrderOutcome> {
  const settings = await getStoreSettingsFresh();

  if (!settings.isAcceptingOrders) {
    return { ok: false, code: "closed", error: settings.closedMessage };
  }

  const fulfillmentEnabled =
    data.fulfillment === "delivery" ? settings.deliveryEnabled : settings.pickupEnabled;

  if (!fulfillmentEnabled) {
    return {
      ok: false,
      code: "option_disabled",
      error: `${data.fulfillment === "delivery" ? "Delivery" : "Pickup"} is not available right now.`,
    };
  }

  const paymentEnabled =
    data.paymentMethod === "cash"
      ? settings.cashEnabled
      : settings.onlinePaymentEnabled && isStripeConfigured();

  if (!paymentEnabled) {
    return {
      ok: false,
      code: "option_disabled",
      error: "That payment method is not available right now. Please choose another.",
    };
  }

  const quantities = mergeQuantities(data.items);
  const products = await getOrderableItems([...quantities.keys()]);

  if (products.length !== quantities.size) {
    return {
      ok: false,
      code: "unavailable_items",
      error: "Some items in your cart are no longer available. Please review your cart.",
    };
  }

  const lines = products.map((product) => ({
    menuItemId: product.id,
    name: product.name,
    unitPriceCents: product.priceCents,
    quantity: quantities.get(product.id) ?? 0,
  }));
  const subtotalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);

  const shortfall = minimumShortfall(subtotalCents, data.fulfillment, settings);
  if (shortfall > 0) {
    return {
      ok: false,
      code: "minimum",
      error: `Delivery orders start at ${formatMoney(settings.minDeliveryOrderCents)}. Add ${formatMoney(shortfall)} more or choose pickup.`,
    };
  }

  const totals = calculateTotals(subtotalCents, data.fulfillment, settings);

  if (totals.totalCents !== data.expectedTotalCents) {
    return {
      ok: false,
      code: "price_changed",
      totalCents: totals.totalCents,
      error: `Prices changed. Your new total is ${formatMoney(totals.totalCents)}. Please review and place your order again.`,
    };
  }

  const isDelivery = data.fulfillment === "delivery";
  const created = await createOrder({
    userId,
    paymentMethod: data.paymentMethod,
    fulfillment: data.fulfillment,
    customerName: data.name,
    customerEmail: data.email,
    customerPhone: data.phone,
    addressLine: isDelivery ? data.addressLine : undefined,
    city: isDelivery ? data.city : undefined,
    postalCode: isDelivery ? data.postalCode : undefined,
    deliveryNotes: isDelivery ? data.deliveryNotes : undefined,
    orderNotes: data.orderNotes,
    totals,
    lines,
  });

  return { ok: true, order: created.order, trackingToken: created.trackingToken };
}
