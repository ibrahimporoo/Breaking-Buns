"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { cancelUnpaidOrderAction, retryPaymentAction } from "@/app/actions/orders";
import { useCart } from "@/components/cart/CartProvider";
import Icon from "@/components/ui/Icon";
import type { OrderView } from "@/db/queries/orders";
import { formatMoney } from "@/lib/format";
import {
  ORDER_STATUS_LABELS,
  isTerminal,
  progressSteps,
  type OrderStatus,
} from "@/lib/orders/status";

type OrderTrackerProps = {
  token: string;
  initialOrder: OrderView;
  justPaid: boolean;
  paymentCancelled: boolean;
  prepMinutes: number;
  deliveryMinutes: number;
};

const POLL_MS = 6000;

const STEP_HINTS: Record<OrderStatus, string> = {
  pending_payment: "",
  new: "We received your order.",
  preparing: "The kitchen is cooking it fresh.",
  ready: "Your order is ready.",
  out_for_delivery: "Your driver is on the way.",
  completed: "Enjoy your meal!",
  cancelled: "",
};

function paymentSummary(order: OrderView): string {
  if (order.paymentStatus === "paid") return "Paid online";
  if (order.status === "cancelled") return "Not charged";

  return order.fulfillment === "delivery"
    ? `Pay ${formatMoney(order.totalCents)} in cash on delivery`
    : `Pay ${formatMoney(order.totalCents)} at pickup`;
}

export default function OrderTracker({
  token,
  initialOrder,
  justPaid,
  paymentCancelled,
  prepMinutes,
  deliveryMinutes,
}: OrderTrackerProps) {
  const { clear } = useCart();
  const [order, setOrder] = useState(initialOrder);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const finished = isTerminal(order.status);

  useEffect(() => {
    if (justPaid && order.status !== "pending_payment") clear();
  }, [justPaid, order.status, clear]);

  useEffect(() => {
    if (finished) return;

    const refresh = async () => {
      if (document.visibilityState !== "visible") return;

      try {
        const response = await fetch(`/api/orders/${token}`, { cache: "no-store" });
        if (!response.ok) return;

        const body = (await response.json()) as { order: OrderView | null };
        if (body.order) setOrder(body.order);
      } catch {
        // Network blip: the next tick tries again.
      }
    };

    const timer = window.setInterval(refresh, POLL_MS);
    return () => window.clearInterval(timer);
  }, [finished, token]);

  const retryPayment = () => {
    setMessage("");
    startTransition(async () => {
      const result = await retryPaymentAction(token);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      window.location.assign(result.data.redirectUrl);
    });
  };

  const cancelUnpaid = () => {
    if (!window.confirm("Cancel this order?")) return;

    setMessage("");
    startTransition(async () => {
      const result = await cancelUnpaidOrderAction(token);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setOrder((current) => ({ ...current, status: "cancelled", paymentStatus: "failed" }));
    });
  };

  const steps = progressSteps(order.fulfillment);
  const currentIndex = steps.indexOf(order.status);
  const eta =
    order.fulfillment === "delivery" ? prepMinutes + deliveryMinutes : prepMinutes;
  const destination = [order.addressLine, order.city, order.postalCode].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-widest text-accent">Order {order.code}</p>
        <h1 className="mt-2 font-serif text-4xl text-ink sm:text-5xl">
          {order.status === "cancelled"
            ? "Order cancelled"
            : order.status === "pending_payment"
              ? "Almost there"
              : order.status === "completed"
                ? "Enjoy your meal!"
                : "We are on it"}
        </h1>
        {!finished && order.status !== "pending_payment" && (
          <p className="mt-2 text-ink-muted">
            Estimated {order.fulfillment === "delivery" ? "delivery" : "pickup"} in about {eta}{" "}
            minutes. This page updates by itself.
          </p>
        )}
      </header>

      {order.status === "pending_payment" && (
        <section className="rounded-3xl border border-warning/30 bg-warning/10 p-5 text-warning">
          <p className="font-medium">
            {justPaid
              ? "Confirming your payment… this usually takes a few seconds."
              : paymentCancelled
                ? "Your payment was not completed. Your order is saved. You can pay now or cancel."
                : "Your order is waiting for payment."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={retryPayment}
              disabled={isPending}
              className="h-11 rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-accent transition hover:bg-accent-hover disabled:opacity-60"
            >
              Pay {formatMoney(order.totalCents)} now
            </button>
            <button
              type="button"
              onClick={cancelUnpaid}
              disabled={isPending}
              className="h-11 rounded-full border border-white/20 px-6 text-sm font-semibold text-ink transition hover:border-danger hover:text-danger disabled:opacity-60"
            >
              Cancel order
            </button>
          </div>
        </section>
      )}

      {order.status !== "pending_payment" && order.status !== "cancelled" && (
        <ol className="rounded-3xl border border-line bg-surface p-5 sm:p-6" aria-label="Order progress">
          {steps.map((step, index) => {
            const done = index <= currentIndex;
            const active = index === currentIndex && step !== "completed";

            return (
              <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-4 top-9 h-[calc(100%-2.25rem)] w-px ${
                      index < currentIndex ? "bg-accent" : "bg-white/10"
                    }`}
                  />
                )}
                <span
                  className={`relative flex size-8 shrink-0 items-center justify-center rounded-full border text-sm ${
                    done ? "border-accent bg-accent text-white" : "border-white/15 text-ink-muted"
                  } ${active ? "animate-glow" : ""}`}
                >
                  {done ? <Icon name="check" className="size-4" /> : index + 1}
                </span>
                <div>
                  <p className={done ? "font-medium text-ink" : "text-ink-muted"}>
                    {ORDER_STATUS_LABELS[step]}
                  </p>
                  {done && <p className="text-sm text-ink-muted">{STEP_HINTS[step]}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <section className="rounded-3xl border border-line bg-surface p-5 sm:p-6" aria-labelledby="receipt-title">
        <h2 id="receipt-title" className="font-serif text-2xl text-ink">
          Your order
        </h2>
        <ul className="mt-4 divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.name} className="flex justify-between gap-4 py-2.5 text-sm">
              <span className="text-ink">
                {item.quantity} × {item.name}
              </span>
              <span className="text-ink">{formatMoney(item.lineTotalCents)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Subtotal</dt>
            <dd className="text-ink">{formatMoney(order.subtotalCents)}</dd>
          </div>
          {order.fulfillment === "delivery" && (
            <div className="flex justify-between">
              <dt className="text-ink-muted">Delivery fee</dt>
              <dd className="text-ink">
                {order.deliveryFeeCents === 0 ? "Free" : formatMoney(order.deliveryFeeCents)}
              </dd>
            </div>
          )}
          {order.taxCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-ink-muted">Tax</dt>
              <dd className="text-ink">{formatMoney(order.taxCents)}</dd>
            </div>
          )}
          <div className="flex justify-between pt-1 font-serif text-xl">
            <dt className="text-ink">Total</dt>
            <dd className="text-ink">{formatMoney(order.totalCents)}</dd>
          </div>
        </dl>

        <dl className="mt-5 grid gap-4 border-t border-line pt-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-muted">Payment</dt>
            <dd className="mt-0.5 text-ink">{paymentSummary(order)}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">
              {order.fulfillment === "delivery" ? "Delivering to" : "Pickup"}
            </dt>
            <dd className="mt-0.5 text-ink">
              {order.fulfillment === "delivery" ? destination : "Collect at the restaurant"}
            </dd>
          </div>
        </dl>
      </section>

      <p role="alert" className="min-h-5 text-sm text-danger">
        {message}
      </p>

      <Link href="/menu" className="inline-block text-sm text-accent transition hover:text-accent-hover">
        Order something else
      </Link>
    </div>
  );
}
