import type { Metadata } from "next";
import LiveOrderBoard from "@/components/admin/LiveOrderBoard";
import { getLiveOrders } from "@/db/queries/orders";
import { requireStaff } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Live orders" };

export default async function LiveOrdersPage() {
  await requireStaff();
  const orders = await getLiveOrders();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">Live orders</h1>
        <p className="mt-2 text-ink-muted">
          New orders show up here instantly. Keep this page open on a tablet or the kitchen
          screen.
        </p>
      </header>
      <LiveOrderBoard initialOrders={orders} />
    </div>
  );
}
