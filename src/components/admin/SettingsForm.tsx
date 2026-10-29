"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { saveSettingsAction } from "@/app/actions/settings";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Toggle from "@/components/ui/Toggle";
import { bpsToPercentInput, centsToInput } from "@/lib/money";

export type SettingsFormValues = {
  timeZone: string;
  closedMessage: string;
  prepMinutes: number;
  deliveryMinutes: number;
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
  minDeliveryOrderCents: number;
  taxRateBps: number;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  cashEnabled: boolean;
  onlinePaymentEnabled: boolean;
};

const panelClass = "space-y-4 rounded-2xl border border-line bg-surface p-5 sm:p-6";

export default function SettingsForm({
  values,
  stripeReady,
}: {
  values: SettingsFormValues;
  stripeReady: boolean;
}) {
  const router = useRouter();
  const [delivery, setDelivery] = useState(values.deliveryEnabled);
  const [pickup, setPickup] = useState(values.pickupEnabled);
  const [cash, setCash] = useState(values.cashEnabled);
  const [online, setOnline] = useState(values.onlinePaymentEnabled);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "");

    setMessage(null);
    startTransition(async () => {
      const result = await saveSettingsAction({
        timeZone: field("timeZone"),
        closedMessage: field("closedMessage"),
        prepMinutes: field("prepMinutes"),
        deliveryMinutes: field("deliveryMinutes"),
        deliveryFee: field("deliveryFee"),
        freeDeliveryThreshold: field("freeDeliveryThreshold"),
        minDeliveryOrder: field("minDeliveryOrder"),
        taxPercent: field("taxPercent"),
        deliveryEnabled: delivery,
        pickupEnabled: pickup,
        cashEnabled: cash,
        onlinePaymentEnabled: online,
      });

      if (result.ok) {
        setMessage({ tone: "ok", text: "Settings saved." });
        router.refresh();
      } else {
        setMessage({ tone: "error", text: result.error });
      }
    });
  };

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl space-y-6">
      <section className={panelClass}>
        <h2 className="font-serif text-xl text-ink">How customers can order</h2>
        <Toggle id="delivery" label="Delivery" checked={delivery} onChange={setDelivery} />
        <Toggle id="pickup" label="Pickup" checked={pickup} onChange={setPickup} />
      </section>

      <section className={panelClass}>
        <h2 className="font-serif text-xl text-ink">Payments</h2>
        <Toggle
          id="cash"
          label="Pay on delivery / at pickup"
          description="Customers pay the delivery driver or at the counter."
          checked={cash}
          onChange={setCash}
        />
        <Toggle
          id="online"
          label="Pay online"
          description="Credit/debit card, Apple Pay, Google Pay and PayPal on Stripe's secure page."
          checked={online}
          onChange={setOnline}
        />
        {!stripeReady && (
          <p role="status" className="rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
            Online payment is not connected yet, so customers only see the cash option. Add your
            Stripe key to <code>.env.local</code> (see docs/PAYMENTS.md), then restart the website.
          </p>
        )}
      </section>

      <section className={panelClass}>
        <h2 className="font-serif text-xl text-ink">Prices and fees</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="deliveryFee" label="Delivery fee (USD)" inputMode="decimal" defaultValue={centsToInput(values.deliveryFeeCents)} />
          <TextField id="minDeliveryOrder" label="Minimum delivery order (USD)" inputMode="decimal" defaultValue={centsToInput(values.minDeliveryOrderCents)} />
          <TextField id="freeDeliveryThreshold" label="Free delivery from (USD, 0 = off)" inputMode="decimal" defaultValue={centsToInput(values.freeDeliveryThresholdCents)} />
          <TextField id="taxPercent" label="Sales tax (%)" inputMode="decimal" defaultValue={bpsToPercentInput(values.taxRateBps)} />
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="font-serif text-xl text-ink">Timing and messages</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="prepMinutes" label="Preparation time (minutes)" inputMode="numeric" defaultValue={String(values.prepMinutes)} />
          <TextField id="deliveryMinutes" label="Delivery time (minutes)" inputMode="numeric" defaultValue={String(values.deliveryMinutes)} />
        </div>
        <TextField id="timeZone" label="Time zone" defaultValue={values.timeZone} />
        <TextField id="closedMessage" label="Message shown when ordering is off" defaultValue={values.closedMessage} />
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save settings"}
        </Button>
        {message && (
          <p
            role={message.tone === "error" ? "alert" : "status"}
            className={message.tone === "error" ? "text-sm text-danger" : "text-sm text-success"}
          >
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}
