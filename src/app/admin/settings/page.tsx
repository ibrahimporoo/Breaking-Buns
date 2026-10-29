import type { Metadata } from "next";
import SettingsForm from "@/components/admin/SettingsForm";
import { getStoreSettingsFresh } from "@/db/queries/store";
import { requireOwner } from "@/lib/auth/session";
import { isStripeConfigured } from "@/lib/payments/stripe";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireOwner();
  const settings = await getStoreSettingsFresh();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">Settings</h1>
        <p className="mt-2 text-ink-muted">Delivery, payments, fees and opening messages.</p>
      </header>
      <SettingsForm values={settings} stripeReady={isStripeConfigured()} />
    </div>
  );
}
