"use client";

import Badge from "@/components/ui/Badge";
import type { OrderView } from "@/db/queries/orders";
import { formatMoney, timeAgo } from "@/lib/format";
import { ACTION_LABELS, nextStatuses, type OrderStatus } from "@/lib/orders/status";

type OrderCardProps = {
  order: OrderView;
  now: number;
  isNew: boolean;
  busy: boolean;
  onChangeStatus: (order: OrderView, status: OrderStatus) => void;
};

function paymentBadge(order: OrderView) {
  if (order.paymentStatus === "paid") return <Badge tone="success">Paid online</Badge>;

  return <Badge tone="warning">{`Collect ${formatMoney(order.totalCents)} cash`}</Badge>;
}

export default function OrderCard({ order, now, isNew, busy, onChangeStatus }: OrderCardProps) {
  const actions = nextStatuses(order.status, order.fulfillment);
  const address = [order.addressLine, order.city, order.postalCode].filter(Boolean).join(", ");

  return (
    <article
      className={`rounded-2xl border bg-surface p-4 ${
        isNew ? "animate-glow border-accent" : "border-line"
      }`}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-serif text-lg text-ink">{order.code}</p>
        <p className="text-xs text-ink-muted">{timeAgo(order.createdAt, now)}</p>
      </header>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge tone={order.fulfillment === "delivery" ? "accent" : "neutral"}>
          {order.fulfillment === "delivery" ? "Delivery" : "Pickup"}
        </Badge>
        {paymentBadge(order)}
      </div>

      <p className="mt-3 text-sm text-ink">
        {order.customerName} ·{" "}
        <a href={`tel:${order.customerPhone.replace(/[^\d+]/g, "")}`} className="text-accent hover:underline">
          {order.customerPhone}
        </a>
      </p>
      {order.fulfillment === "delivery" && address && (
        <p className="mt-1 text-sm text-ink-muted">{address}</p>
      )}
      {order.deliveryNotes && (
        <p className="mt-1 text-sm text-ink-muted">Delivery note: {order.deliveryNotes}</p>
      )}

      <ul className="mt-3 divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <li key={item.name} className="flex justify-between gap-3 py-1.5 text-sm text-ink">
            <span>
              <span className="font-semibold text-accent">{item.quantity}×</span> {item.name}
            </span>
          </li>
        ))}
      </ul>

      {order.orderNotes && (
        <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
          Kitchen note: {order.orderNotes}
        </p>
      )}

      <p className="mt-3 text-right font-serif text-lg text-ink">{formatMoney(order.totalCents)}</p>

      {actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((status) => {
            const destructive = status === "cancelled";

            return (
              <button
                key={status}
                type="button"
                disabled={busy}
                onClick={() => onChangeStatus(order, status)}
                className={`h-10 rounded-full px-4 text-sm font-semibold transition disabled:opacity-50 ${
                  destructive
                    ? "border border-white/15 text-ink-muted hover:border-danger hover:text-danger"
                    : "bg-accent text-white shadow-accent hover:bg-accent-hover"
                }`}
              >
                {ACTION_LABELS[status]}
              </button>
            );
          })}
        </div>
      )}
    </article>
  );
}
