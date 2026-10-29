import { env } from "@/lib/env";

const API_BASE = "https://api.stripe.com/v1";
const SESSION_LIFETIME_SECONDS = 30 * 60 + 60;

export type CheckoutLine = {
  name: string;
  unitAmountCents: number;
  quantity: number;
};

export type CheckoutSession = {
  id: string;
  url: string | null;
  status: "open" | "complete" | "expired";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  amount_total: number | null;
  client_reference_id: string | null;
  metadata: Record<string, string> | null;
};

export function isStripeConfigured(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY);
}

async function stripeRequest<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: URLSearchParams; idempotencyKey?: string },
): Promise<T> {
  if (!env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured");

  const response = await fetch(`${API_BASE}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      ...(init.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(init.idempotencyKey ? { "Idempotency-Key": init.idempotencyKey } : {}),
    },
    body: init.body,
    cache: "no-store",
  });

  const payload: unknown = await response.json();

  if (!response.ok) {
    const message =
      (payload as { error?: { message?: string } }).error?.message ?? "Stripe request failed";
    throw new Error(message);
  }

  return payload as T;
}

type CreateSessionInput = {
  orderId: string;
  orderCode: string;
  trackingToken: string;
  customerEmail: string;
  lines: CheckoutLine[];
  successUrl: string;
  cancelUrl: string;
  attempt: number;
};

/**
 * Creates a hosted Stripe Checkout page. We do not list payment methods on
 * purpose: Stripe shows every method enabled in the dashboard (cards, Apple
 * Pay, Google Pay, PayPal where available, ...), so the owner can switch
 * methods on without any code change.
 */
export async function createCheckoutSession(input: CreateSessionInput): Promise<CheckoutSession> {
  const body = new URLSearchParams({
    mode: "payment",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    client_reference_id: input.orderId,
    customer_email: input.customerEmail,
    expires_at: String(Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS),
    "metadata[orderId]": input.orderId,
    "metadata[orderCode]": input.orderCode,
    "metadata[trackingToken]": input.trackingToken,
    "payment_intent_data[description]": `Breaking Buns order ${input.orderCode}`,
    "payment_intent_data[metadata][orderId]": input.orderId,
  });

  input.lines.forEach((line, index) => {
    body.set(`line_items[${index}][quantity]`, String(line.quantity));
    body.set(`line_items[${index}][price_data][currency]`, "usd");
    body.set(`line_items[${index}][price_data][unit_amount]`, String(line.unitAmountCents));
    body.set(`line_items[${index}][price_data][product_data][name]`, line.name);
  });

  return stripeRequest<CheckoutSession>("/checkout/sessions", {
    method: "POST",
    body,
    idempotencyKey: `order-${input.orderId}-${input.attempt}`,
  });
}

export function retrieveCheckoutSession(sessionId: string): Promise<CheckoutSession> {
  return stripeRequest<CheckoutSession>(`/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    method: "GET",
  });
}
