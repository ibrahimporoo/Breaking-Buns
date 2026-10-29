import { after } from "next/server";
import {
  failPendingPayment,
  getOrderById,
  markOrderPaid,
  type OrderView,
} from "@/db/queries/orders";
import { notifyOrderReceived } from "@/lib/orders/notify";
import {
  isStripeConfigured,
  retrieveCheckoutSession,
  type CheckoutSession,
} from "@/lib/payments/stripe";

export type PaymentConfirmation = { order: OrderView; trackingToken: string | null };

/**
 * Marks an order as paid when Stripe confirms it. Safe to call many times
 * (webhook retries, customer returning to the page): only the first call
 * changes anything, so the kitchen is notified exactly once.
 */
export async function confirmPaidSession(
  session: CheckoutSession,
): Promise<PaymentConfirmation | null> {
  if (session.payment_status !== "paid") return null;

  const orderId = session.client_reference_id ?? session.metadata?.orderId;
  if (!orderId) return null;

  const existing = await getOrderById(orderId);
  if (!existing) return null;

  if (session.amount_total !== existing.totalCents) {
    console.error(
      `[payment] Amount mismatch for ${existing.code}: paid ${session.amount_total}, expected ${existing.totalCents}`,
    );
    return null;
  }

  const updated = await markOrderPaid(orderId, session.id);
  if (!updated) return null;

  return { order: updated, trackingToken: session.metadata?.trackingToken ?? null };
}

/**
 * Asks Stripe directly whether an unpaid online order was paid. This is what
 * makes the site work on a laptop with no webhook set up, and it repairs any
 * missed webhook in production.
 */
export async function reconcilePendingOrder(
  order: Pick<OrderView, "id" | "status">,
  stripeSessionId: string | null,
): Promise<PaymentConfirmation | null> {
  if (order.status !== "pending_payment" || !stripeSessionId || !isStripeConfigured()) {
    return null;
  }

  try {
    const session = await retrieveCheckoutSession(stripeSessionId);

    if (session.payment_status === "paid") return confirmPaidSession(session);
    if (session.status === "expired") await failPendingPayment(order.id);
  } catch (error) {
    console.error("[payment] Could not reconcile order", error);
  }

  return null;
}

/** Reconciles and, if the order just became paid, sends the confirmation emails once. */
export async function reconcileAndNotify(
  order: Pick<OrderView, "id" | "status">,
  stripeSessionId: string | null,
): Promise<boolean> {
  const confirmation = await reconcilePendingOrder(order, stripeSessionId);
  if (!confirmation) return false;

  if (confirmation.trackingToken) {
    const { order: paid, trackingToken } = confirmation;
    after(() => notifyOrderReceived(paid, trackingToken));
  }

  return true;
}
