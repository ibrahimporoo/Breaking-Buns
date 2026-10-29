"use server";

import { revalidatePath } from "next/cache";
import { saveStoreSettings } from "@/db/queries/store";
import { fail, ok, type ActionResult } from "@/lib/actions";
import { requireOwner, requireStaff } from "@/lib/auth/session";
import { parseMoneyToCents, percentToBps } from "@/lib/money";
import { z } from "zod";

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** One-tap open/closed switch. Staff may use it because it is a daily task. */
export async function setAcceptingOrdersAction(accepting: boolean): Promise<ActionResult> {
  await requireStaff();
  await saveStoreSettings({ isAcceptingOrders: accepting });

  revalidatePath("/", "layout");
  return ok(undefined);
}

const settingsSchema = z.object({
  timeZone: z.string().refine(isValidTimeZone, "Unknown time zone"),
  closedMessage: z.string().trim().min(3).max(200),
  prepMinutes: z.coerce.number().int().min(1).max(240),
  deliveryMinutes: z.coerce.number().int().min(1).max(240),
});

export type SettingsInput = {
  timeZone: string;
  closedMessage: string;
  prepMinutes: string;
  deliveryMinutes: string;
  deliveryFee: string;
  freeDeliveryThreshold: string;
  minDeliveryOrder: string;
  taxPercent: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  cashEnabled: boolean;
  onlinePaymentEnabled: boolean;
};

export async function saveSettingsAction(input: SettingsInput): Promise<ActionResult> {
  await requireOwner();

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return fail(z.prettifyError(parsed.error));

  const deliveryFeeCents = parseMoneyToCents(input.deliveryFee);
  const freeDeliveryThresholdCents = parseMoneyToCents(input.freeDeliveryThreshold || "0");
  const minDeliveryOrderCents = parseMoneyToCents(input.minDeliveryOrder || "0");
  const taxRateBps = percentToBps(input.taxPercent || "0");

  if (deliveryFeeCents === null) return fail("Delivery fee must be a price like 3.99.");
  if (freeDeliveryThresholdCents === null) return fail("Free delivery amount must be a price like 40.");
  if (minDeliveryOrderCents === null) return fail("Minimum order must be a price like 15.");
  if (taxRateBps === null) return fail("Tax must be a percentage between 0 and 50.");

  if (!input.cashEnabled && !input.onlinePaymentEnabled) {
    return fail("Keep at least one payment method turned on.");
  }
  if (!input.deliveryEnabled && !input.pickupEnabled) {
    return fail("Keep delivery or pickup turned on.");
  }

  await saveStoreSettings({
    ...parsed.data,
    deliveryFeeCents,
    freeDeliveryThresholdCents,
    minDeliveryOrderCents,
    taxRateBps,
    deliveryEnabled: input.deliveryEnabled,
    pickupEnabled: input.pickupEnabled,
    cashEnabled: input.cashEnabled,
    onlinePaymentEnabled: input.onlinePaymentEnabled,
  });

  revalidatePath("/", "layout");
  return ok(undefined);
}
