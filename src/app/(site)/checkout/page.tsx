import type { Metadata } from "next";
import CheckoutForm, { type CheckoutConfig } from "@/components/checkout/CheckoutForm";
import Container from "@/components/ui/Container";
import { getStoreSettings } from "@/db/queries/store";
import { getSession } from "@/lib/auth/session";
import { isStripeConfigured } from "@/lib/payments/stripe";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [settings, session] = await Promise.all([getStoreSettings(), getSession()]);

  const config: CheckoutConfig = {
    isAcceptingOrders: settings.isAcceptingOrders,
    closedMessage: settings.closedMessage,
    deliveryEnabled: settings.deliveryEnabled,
    pickupEnabled: settings.pickupEnabled,
    cashEnabled: settings.cashEnabled,
    onlineEnabled: settings.onlinePaymentEnabled && isStripeConfigured(),
    pricing: {
      deliveryFeeCents: settings.deliveryFeeCents,
      freeDeliveryThresholdCents: settings.freeDeliveryThresholdCents,
      minDeliveryOrderCents: settings.minDeliveryOrderCents,
      taxRateBps: settings.taxRateBps,
    },
    prepMinutes: settings.prepMinutes,
    deliveryMinutes: settings.deliveryMinutes,
    defaultName: session?.user.name ?? "",
    defaultEmail: session?.user.email ?? "",
  };

  return (
    <main className="pb-24 pt-32 sm:pt-40">
      <Container>
        <h1 className="font-serif text-[2.5rem] leading-tight text-ink sm:text-5xl">Checkout</h1>
        <CheckoutForm config={config} />
      </Container>
    </main>
  );
}
