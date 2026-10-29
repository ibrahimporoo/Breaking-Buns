"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { placeOrderAction } from "@/app/actions/orders";
import { useCart } from "@/components/cart/CartProvider";
import QuantityStepper from "@/components/cart/QuantityStepper";
import ChoiceCard from "@/components/ui/ChoiceCard";
import SafeImage from "@/components/ui/SafeImage";
import TextAreaField from "@/components/ui/TextAreaField";
import TextField from "@/components/ui/TextField";
import type { FieldErrors } from "@/lib/actions";
import { formatMoney } from "@/lib/format";
import {
  calculateTotals,
  minimumShortfall,
  type Fulfillment,
  type PricingSettings,
} from "@/lib/orders/pricing";
import type { PaymentMethod } from "@/lib/orders/status";

export type CheckoutConfig = {
  isAcceptingOrders: boolean;
  closedMessage: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  cashEnabled: boolean;
  onlineEnabled: boolean;
  pricing: PricingSettings;
  prepMinutes: number;
  deliveryMinutes: number;
  defaultName: string;
  defaultEmail: string;
};

const panelClass = "rounded-3xl border border-line bg-surface p-5 sm:p-6";
const panelTitleClass = "font-serif text-2xl text-ink";

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={strong ? "font-serif text-lg text-ink" : "text-sm text-ink-muted"}>{label}</dt>
      <dd className={strong ? "font-serif text-2xl text-ink" : "text-sm text-ink"}>{value}</dd>
    </div>
  );
}

export default function CheckoutForm({ config }: { config: CheckoutConfig }) {
  const router = useRouter();
  const { lines, subtotalCents, changeQuantity, clear } = useCart();
  const [fulfillment, setFulfillment] = useState<Fulfillment>(
    config.deliveryEnabled ? "delivery" : "pickup",
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    config.onlineEnabled ? "online" : "cash",
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  if (lines.length === 0) {
    return (
      <div className={`${panelClass} mt-8 text-center`}>
        <p className="text-ink-muted">Your cart is empty.</p>
        <Link
          href="/menu"
          className="mt-5 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-accent transition hover:bg-accent-hover"
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  if (!config.isAcceptingOrders) {
    return (
      <p role="status" className="mt-8 rounded-2xl border border-warning/30 bg-warning/10 px-5 py-4 text-warning">
        {config.closedMessage}
      </p>
    );
  }

  const totals = calculateTotals(subtotalCents, fulfillment, config.pricing);
  const displayTotal = serverTotal ?? totals.totalCents;
  const shortfall = minimumShortfall(subtotalCents, fulfillment, config.pricing);
  const isDelivery = fulfillment === "delivery";
  const eta = isDelivery ? config.prepMinutes + config.deliveryMinutes : config.prepMinutes;
  const error = (name: string) => fieldErrors[name]?.[0];

  const changeFulfillment = (value: string) => {
    setFulfillment(value === "pickup" ? "pickup" : "delivery");
    setServerTotal(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");

    setFormError("");
    setFieldErrors({});

    startTransition(async () => {
      const result = await placeOrderAction({
        items: lines.map((line) => ({ itemId: line.id, quantity: line.quantity })),
        name: text("name"),
        email: text("email"),
        phone: text("phone"),
        fulfillment,
        addressLine: text("addressLine"),
        city: text("city"),
        postalCode: text("postalCode"),
        deliveryNotes: text("deliveryNotes"),
        orderNotes: text("orderNotes"),
        paymentMethod,
        expectedTotalCents: displayTotal,
        website: text("website"),
      });

      if (!result.ok) {
        setFormError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        if (result.code === "price_changed" && result.totalCents !== undefined) {
          setServerTotal(result.totalCents);
        }
        return;
      }

      if (paymentMethod === "cash") {
        clear();
        router.push(result.data.redirectUrl);
        return;
      }

      window.location.assign(result.data.redirectUrl);
    });
  };

  const cashTitle = isDelivery ? "Pay cash on delivery" : "Pay at pickup";
  const cashDescription = isDelivery
    ? "Hand the cash to the delivery driver when your order arrives."
    : "Pay in the restaurant when you collect your order.";
  const submitLabel =
    paymentMethod === "online"
      ? `Pay ${formatMoney(displayTotal)} securely`
      : `Place order · ${formatMoney(displayTotal)}`;

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-start">
      <div className="space-y-6">
        <section className={panelClass} aria-labelledby="how-title">
          <h2 id="how-title" className={panelTitleClass}>
            How do you want it?
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ChoiceCard
              name="fulfillment"
              value="delivery"
              checked={fulfillment === "delivery"}
              onChange={changeFulfillment}
              title="Delivery"
              description={`About ${config.prepMinutes + config.deliveryMinutes} minutes to your door`}
              icon="truck"
              disabled={!config.deliveryEnabled}
              disabledReason="Delivery is not available right now."
            />
            <ChoiceCard
              name="fulfillment"
              value="pickup"
              checked={fulfillment === "pickup"}
              onChange={changeFulfillment}
              title="Pickup"
              description={`Ready in about ${config.prepMinutes} minutes`}
              icon="store"
              disabled={!config.pickupEnabled}
              disabledReason="Pickup is not available right now."
            />
          </div>
        </section>

        <section className={panelClass} aria-labelledby="contact-title">
          <h2 id="contact-title" className={panelTitleClass}>
            Your details
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField
              id="name"
              label="Full name"
              autoComplete="name"
              defaultValue={config.defaultName}
              error={error("name")}
            />
            <TextField
              id="phone"
              label="Phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 555 000 0000"
              error={error("phone")}
            />
          </div>
          <div className="mt-4">
            <TextField
              id="email"
              label="Email (for your receipt and tracking link)"
              type="email"
              autoComplete="email"
              defaultValue={config.defaultEmail}
              error={error("email")}
            />
          </div>

          {isDelivery && (
            <div className="mt-6 space-y-4 border-t border-line pt-6">
              <h3 className="font-serif text-xl text-ink">Delivery address</h3>
              <TextField
                id="addressLine"
                label="Street address"
                autoComplete="address-line1"
                error={error("addressLine")}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField id="city" label="City" autoComplete="address-level2" error={error("city")} />
                <TextField
                  id="postalCode"
                  label="Postal code"
                  autoComplete="postal-code"
                  error={error("postalCode")}
                />
              </div>
              <TextAreaField
                id="deliveryNotes"
                label="Delivery notes (optional)"
                placeholder="Gate code, floor, where to leave it"
                maxLength={200}
                error={error("deliveryNotes")}
              />
            </div>
          )}

          <div className="mt-6">
            <TextAreaField
              id="orderNotes"
              label="Notes for the kitchen (optional)"
              placeholder="Allergies, no onions, extra sauce"
              maxLength={300}
              error={error("orderNotes")}
            />
          </div>
        </section>

        <section className={panelClass} aria-labelledby="pay-title">
          <h2 id="pay-title" className={panelTitleClass}>
            How do you want to pay?
          </h2>
          <div className="mt-4 grid gap-3">
            <ChoiceCard
              name="payment"
              value="online"
              checked={paymentMethod === "online"}
              onChange={() => setPaymentMethod("online")}
              title="Pay online now"
              description="Credit or debit card, Apple Pay, Google Pay and PayPal where available, on Stripe's secure page."
              icon="creditCard"
              disabled={!config.onlineEnabled}
              disabledReason="Online payment is not available right now."
            />
            <ChoiceCard
              name="payment"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={() => setPaymentMethod("cash")}
              title={cashTitle}
              description={cashDescription}
              icon="receipt"
              disabled={!config.cashEnabled}
              disabledReason="Cash payment is not available right now."
            />
          </div>
        </section>
      </div>

      <aside className={`${panelClass} lg:sticky lg:top-28`} aria-labelledby="summary-title">
        <h2 id="summary-title" className={panelTitleClass}>
          Order summary
        </h2>

        <ul className="mt-4 divide-y divide-line">
          {lines.map((line) => (
            <li key={line.id} className="flex items-center gap-3 py-3">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-canvas">
                {line.image && (
                  <SafeImage src={line.image} alt={line.name} fill sizes="48px" className="object-cover" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{line.name}</p>
                <div className="mt-1.5">
                  <QuantityStepper
                    name={line.name}
                    quantity={line.quantity}
                    onChange={(quantity) => {
                      changeQuantity(line.id, quantity);
                      setServerTotal(null);
                    }}
                  />
                </div>
              </div>
              <p className="text-sm text-ink">{formatMoney(line.priceCents * line.quantity)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-line pt-4">
          <SummaryRow label="Subtotal" value={formatMoney(totals.subtotalCents)} />
          {isDelivery && (
            <SummaryRow
              label="Delivery fee"
              value={totals.deliveryFeeCents === 0 ? "Free" : formatMoney(totals.deliveryFeeCents)}
            />
          )}
          {totals.taxCents > 0 && <SummaryRow label="Tax" value={formatMoney(totals.taxCents)} />}
          <SummaryRow label="Total" value={formatMoney(displayTotal)} strong />
        </dl>

        <p className="mt-3 text-xs text-ink-muted">
          Estimated {isDelivery ? "delivery" : "pickup"} time: about {eta} minutes.
        </p>

        {shortfall > 0 && (
          <p role="status" className="mt-4 rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
            Delivery orders start at {formatMoney(config.pricing.minDeliveryOrderCents)}. Add{" "}
            {formatMoney(shortfall)} more, or choose pickup.
          </p>
        )}

        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="sr-only" />

        <button
          type="submit"
          disabled={isPending || shortfall > 0}
          className="mt-5 h-12 w-full rounded-full bg-accent text-sm font-semibold uppercase tracking-wider text-white shadow-accent transition duration-300 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Placing your order…" : submitLabel}
        </button>

        <p role="alert" className="mt-3 min-h-5 text-center text-sm text-danger">
          {formError}
        </p>
      </aside>
    </form>
  );
}
