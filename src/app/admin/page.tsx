import Link from "next/link";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import StatCard from "@/components/admin/StatCard";
import StoreToggle from "@/components/admin/StoreToggle";
import { getDayStats, listOrdersForDate } from "@/db/queries/orders";
import { getStoreSettingsFresh } from "@/db/queries/store";
import { requireStaff } from "@/lib/auth/session";
import { formatMoney, pluralize, timeAgo } from "@/lib/format";
import { getZonedParts } from "@/lib/time";

const QUICK_LINKS = [
  { href: "/admin/orders", label: "Open live orders", hint: "See and manage orders as they arrive" },
  { href: "/admin/menu", label: "Edit the menu", hint: "Prices, photos, sold-out dishes" },
  { href: "/admin/history", label: "Order history", hint: "Past days and sales totals" },
] as const;

export default async function AdminDashboardPage() {
  const { user } = await requireStaff();
  const settings = await getStoreSettingsFresh();
  const today = getZonedParts(new Date(), settings.timeZone).date;
  const [stats, todays] = await Promise.all([
    getDayStats(today, settings.timeZone),
    listOrdersForDate(today, settings.timeZone),
  ]);
  const recent = todays.slice(0, 6);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">
          Welcome, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-2 text-ink-muted">Here is how Breaking Buns is doing today.</p>
      </header>

      <StoreToggle initialOpen={settings.isAcceptingOrders} />

      <section aria-label="Today" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders today" value={stats.orders} icon="receipt" />
        <StatCard label="Sales today" value={formatMoney(stats.revenueCents)} icon="creditCard" />
        <StatCard label="Average order" value={formatMoney(stats.averageCents)} icon="shoppingBag" />
        <StatCard label="Being prepared now" value={stats.openOrders} icon="bell" />
      </section>

      <section aria-labelledby="quick-heading">
        <h2 id="quick-heading" className="font-serif text-2xl text-ink">
          Quick actions
        </h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block h-full rounded-2xl border border-line bg-surface p-5 transition hover:border-accent/40"
              >
                <p className="font-serif text-lg text-ink">{link.label}</p>
                <p className="mt-1.5 text-sm text-ink-muted">{link.hint}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="font-serif text-2xl text-ink">
          Latest orders
        </h2>
        {recent.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-white/15 p-8 text-center text-ink-muted">
            No orders yet today.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recent.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-ink">
                    <span className="font-serif text-lg">{order.code}</span>
                    <OrderStatusBadge status={order.status} />
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {order.customerName} · {pluralize(order.items.reduce((sum, item) => sum + item.quantity, 0), "item")} ·{" "}
                    {timeAgo(order.createdAt)}
                  </p>
                </div>
                <p className="font-serif text-xl text-ink">{formatMoney(order.totalCents)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
