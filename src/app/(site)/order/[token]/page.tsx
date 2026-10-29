import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderTracker from "@/components/order/OrderTracker";
import Container from "@/components/ui/Container";
import { getOrderByToken, getOrderRowByToken } from "@/db/queries/orders";
import { getStoreSettings } from "@/db/queries/store";
import { reconcileAndNotify } from "@/lib/orders/payment";
import { trackingTokenSchema } from "@/lib/orders/schemas";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paid?: string; payment?: string }>;
};

export default async function OrderPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const query = await searchParams;

  if (!trackingTokenSchema.safeParse(token).success) notFound();

  const row = await getOrderRowByToken(token);
  if (!row) notFound();

  if (row.status === "pending_payment") {
    await reconcileAndNotify({ id: row.id, status: row.status }, row.stripeSessionId);
  }

  const [order, settings] = await Promise.all([getOrderByToken(token), getStoreSettings()]);
  if (!order) notFound();

  return (
    <main className="pb-24 pt-32 sm:pt-40">
      <Container>
        <div className="mx-auto max-w-2xl">
          <OrderTracker
            token={token}
            initialOrder={order}
            justPaid={query.paid === "1"}
            paymentCancelled={query.payment === "cancelled"}
            prepMinutes={settings.prepMinutes}
            deliveryMinutes={settings.deliveryMinutes}
          />
        </div>
      </Container>
    </main>
  );
}
