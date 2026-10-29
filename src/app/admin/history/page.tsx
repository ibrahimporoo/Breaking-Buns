import type { Metadata } from "next";
import Link from "next/link";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { listOrdersForDate } from "@/db/queries/orders";
import { getStoreSettingsFresh } from "@/db/queries/store";
import { requireStaff } from "@/lib/auth/session";
import { formatDateLabel, formatMoney, pluralize } from "@/lib/format";
import { addDays, formatInZone, getZonedParts, isIsoDate, zonedTimeToUtc } from "@/lib/time";

export const metadata: Metadata = { title: "Order history" };

type PageProps = { searchParams: Promise<{ date?: string }> };

const navLinkClass =
  "rounded-full border border-white/15 px-4 py-2 text-sm text-ink transition hover:border-accent";

export default async function OrderHistoryPage({ searchParams }: PageProps) {
  await requireStaff();
  const query = await searchParams;
  const settings = await getStoreSettingsFresh();
  const today = getZonedParts(new Date(), settings.timeZone).date;
  const date = query.date && isIsoDate(query.date) ? query.date : today;

  const orders = await listOrdersForDate(date, settings.timeZone);
  const sold = orders.filter((order) => order.status !== "cancelled");
  const revenueCents = sold.reduce((sum, order) => sum + order.totalCents, 0);
  const heading = formatDateLabel(zonedTimeToUtc(date, "12:00", settings.timeZone), settings.timeZone);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Order history</h1>
          <p className="mt-2 text-ink-muted">
            {heading} · {pluralize(sold.length, "order")} · {formatMoney(revenueCents)} in sales
          </p>
        </div>
        <nav aria-label="Date" className="flex items-center gap-2">
          <Link href={`/admin/history?date=${addDays(date, -1)}`} className={navLinkClass}>
            Previous
          </Link>
          <Link href={`/admin/history?date=${today}`} className={navLinkClass}>
            Today
          </Link>
          <Link href={`/admin/history?date=${addDays(date, 1)}`} className={navLinkClass}>
            Next
          </Link>
        </nav>
      </header>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-ink-muted">
          No orders on this day.
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex flex-wrap items-center gap-2 text-ink">
                  <span className="font-serif text-lg">{order.code}</span>
                  <OrderStatusBadge status={order.status} />
                  <span className="text-sm text-ink-muted">
                    {formatInZone(new Date(order.createdAt), settings.timeZone, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </p>
                <p className="font-serif text-xl text-ink">{formatMoney(order.totalCents)}</p>
              </div>
              <p className="mt-2 text-sm text-ink">
                {order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {order.customerName} · {order.customerPhone} ·{" "}
                {order.fulfillment === "delivery" ? "Delivery" : "Pickup"} ·{" "}
                {order.paymentStatus === "paid" ? "Paid" : "Unpaid"} (
                {order.paymentMethod === "online" ? "online" : "cash"})
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
