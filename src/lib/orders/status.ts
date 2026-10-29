import type { Fulfillment } from "@/lib/orders/pricing";

export const ORDER_STATUSES = [
  "pending_payment",
  "new",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["online", "cash"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["unpaid", "paid", "failed"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Waiting for payment",
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "On the way",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Statuses the kitchen board shows as live work. */
export const LIVE_STATUSES: readonly OrderStatus[] = [
  "new",
  "preparing",
  "ready",
  "out_for_delivery",
];

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.some((status) => status === value);
}

export function isTerminal(status: OrderStatus): boolean {
  return status === "completed" || status === "cancelled";
}

/**
 * Moves staff may make from a status. `pending_payment` becomes `new` only
 * through a confirmed payment, never by hand.
 */
export function nextStatuses(
  status: OrderStatus,
  fulfillment: Fulfillment,
): readonly OrderStatus[] {
  switch (status) {
    case "new":
      return ["preparing", "cancelled"];
    case "preparing":
      return ["ready", "cancelled"];
    case "ready":
      return fulfillment === "delivery"
        ? ["out_for_delivery", "cancelled"]
        : ["completed", "cancelled"];
    case "out_for_delivery":
      return ["completed", "cancelled"];
    case "pending_payment":
      return ["cancelled"];
    default:
      return [];
  }
}

export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  fulfillment: Fulfillment,
): boolean {
  return nextStatuses(from, fulfillment).includes(to);
}

/** Steps shown to the customer on the tracking page. */
export function progressSteps(fulfillment: Fulfillment): readonly OrderStatus[] {
  return fulfillment === "delivery"
    ? ["new", "preparing", "ready", "out_for_delivery", "completed"]
    : ["new", "preparing", "ready", "completed"];
}

export const ACTION_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Waiting for payment",
  new: "Reopen",
  preparing: "Start preparing",
  ready: "Mark ready",
  out_for_delivery: "Out for delivery",
  completed: "Complete",
  cancelled: "Cancel order",
};
