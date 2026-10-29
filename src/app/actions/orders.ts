"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import {
  type OrderView,
  attachStripeSession,
  failPendingPayment,
  getOrderRowByToken,
  getOrderByToken,
  transitionOrder,
} from "@/db/queries/orders";
import { fail, ok, type ActionResult } from "@/lib/actions";
import { getSession, requireStaff } from "@/lib/auth/session";
import { sendMail } from "@/lib/email/mailer";
import { placeOrderLimiter } from "@/lib/limiters";
import { notifyOrderReceived, orderCancelledMail } from "@/lib/orders/notify";
import { placeOrder } from "@/lib/orders/place-order";
import { placeOrderSchema, trackingTokenSchema, type PlaceOrderInput } from "@/lib/orders/schemas";
import { isOrderStatus } from "@/lib/orders/status";
import { createCheckoutSession } from "@/lib/payments/stripe";
import { getClientIp } from "@/lib/request";
import { absoluteUrl } from "@/lib/url";
import { z } from "zod";

export type PlacedOrder = { redirectUrl: string };

const RETRY_MESSAGE = "Too many attempts. Please wait a few minutes and try again.";
const PAYMENT_DOWN_MESSAGE =
  "Online payment is unavailable right now. Please pay with cash or try again in a moment.";

async function startCheckout(
  order: OrderView,
  trackingToken: string,
  attempt: number,
) {
  const lines = order.items.map((item) => ({
    name: item.name,
    unitAmountCents: item.unitPriceCents,
    quantity: item.quantity,
  }));

  if (order.deliveryFeeCents > 0) {
    lines.push({ name: "Delivery fee", unitAmountCents: order.deliveryFeeCents, quantity: 1 });
  }
  if (order.taxCents > 0) {
    lines.push({ name: "Tax", unitAmountCents: order.taxCents, quantity: 1 });
  }

  const session = await createCheckoutSession({
    orderId: order.id,
    orderCode: order.code,
    trackingToken,
    customerEmail: order.customerEmail,
    lines,
    successUrl: absoluteUrl(`/order/${trackingToken}?paid=1`),
    cancelUrl: absoluteUrl(`/order/${trackingToken}?payment=cancelled`),
    attempt,
  });

  if (!session.url) throw new Error("Stripe did not return a payment page");

  await attachStripeSession(order.id, session.id);

  return session.url;
}

export async function placeOrderAction(
  input: PlaceOrderInput,
): Promise<ActionResult<PlacedOrder>> {
  const parsed = placeOrderSchema.safeParse(input);

  if (!parsed.success) {
    return fail("Please check the highlighted fields.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    });
  }

  if (parsed.data.website) return fail("Something went wrong. Please try again.");

  if (!placeOrderLimiter.check(`order:${await getClientIp()}`).allowed) {
    return fail(RETRY_MESSAGE);
  }

  const session = await getSession();
  const outcome = await placeOrder(parsed.data, session?.user.id);

  if (!outcome.ok) {
    return fail(outcome.error, { code: outcome.code, totalCents: outcome.totalCents });
  }

  const { order, trackingToken } = outcome;
  revalidatePath("/admin/orders");

  if (order.paymentMethod === "cash") {
    after(() => notifyOrderReceived(order, trackingToken));
    return ok({ redirectUrl: `/order/${trackingToken}` });
  }

  try {
    return ok({ redirectUrl: await startCheckout(order, trackingToken, 1) });
  } catch (error) {
    console.error("[order] Could not start online payment", error);
    await failPendingPayment(order.id);
    return fail(PAYMENT_DOWN_MESSAGE);
  }
}

/** Lets a customer who left the payment page try again without re-entering the order. */
export async function retryPaymentAction(token: string): Promise<ActionResult<PlacedOrder>> {
  if (!trackingTokenSchema.safeParse(token).success) return fail("Order not found.");
  if (!placeOrderLimiter.check(`retry:${await getClientIp()}`).allowed) {
    return fail(RETRY_MESSAGE);
  }

  const order = await getOrderByToken(token);
  if (!order) return fail("Order not found.");
  if (order.status !== "pending_payment") return fail("This order no longer needs payment.");

  try {
    return ok({ redirectUrl: await startCheckout(order, token, Date.now()) });
  } catch (error) {
    console.error("[order] Could not restart online payment", error);
    return fail(PAYMENT_DOWN_MESSAGE);
  }
}

export async function cancelUnpaidOrderAction(token: string): Promise<ActionResult> {
  if (!trackingTokenSchema.safeParse(token).success) return fail("Order not found.");

  const row = await getOrderRowByToken(token);
  if (!row) return fail("Order not found.");
  if (row.status !== "pending_payment") return fail("This order can no longer be cancelled here.");

  await failPendingPayment(row.id);
  revalidatePath(`/order/${token}`);

  return ok(undefined);
}

export async function updateOrderStatusAction(
  orderId: string,
  status: string,
): Promise<ActionResult<{ refundNeeded: boolean }>> {
  await requireStaff();

  if (!z.uuid().safeParse(orderId).success || !isOrderStatus(status)) {
    return fail("Invalid request.");
  }

  const result = await transitionOrder(orderId, status);

  if (!result.ok) {
    return fail(
      result.reason === "not_found"
        ? "Order not found."
        : "That change is not allowed. Someone may have updated this order already.",
    );
  }

  if (status === "cancelled") {
    after(() => sendMail(orderCancelledMail(result.order)));
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  return ok({ refundNeeded: result.refundNeeded });
}
