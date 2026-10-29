import { after, NextResponse } from "next/server";
import { failPendingPayment, getOrderById } from "@/db/queries/orders";
import { env } from "@/lib/env";
import { notifyOrderReceived } from "@/lib/orders/notify";
import { confirmPaidSession } from "@/lib/orders/payment";
import type { CheckoutSession } from "@/lib/payments/stripe";
import { verifyStripeSignature } from "@/lib/payments/stripe-signature";

type StripeEvent = {
  type: string;
  data: { object: CheckoutSession };
};

export async function POST(request: Request) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const payload = await request.text();
  const valid = verifyStripeSignature({
    payload,
    header: request.headers.get("stripe-signature"),
    secret: env.STRIPE_WEBHOOK_SECRET,
  });

  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const event = JSON.parse(payload) as StripeEvent;
  const session = event.data.object;

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const confirmation = await confirmPaidSession(session);

      if (confirmation?.trackingToken) {
        const { order, trackingToken } = confirmation;
        after(() => notifyOrderReceived(order, trackingToken));
      }
      break;
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const orderId = session.client_reference_id ?? session.metadata?.orderId;
      const existing = orderId ? await getOrderById(orderId) : null;

      if (existing && existing.status === "pending_payment") {
        await failPendingPayment(existing.id);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
