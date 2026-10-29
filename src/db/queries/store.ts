import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { createTtlCache } from "@/lib/ttl-cache";

export type StoreSettings = Omit<typeof storeSettings.$inferSelect, "id" | "updatedAt">;

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  timeZone: "America/New_York",
  isAcceptingOrders: true,
  deliveryEnabled: true,
  pickupEnabled: true,
  cashEnabled: true,
  onlinePaymentEnabled: true,
  deliveryFeeCents: 399,
  freeDeliveryThresholdCents: 0,
  minDeliveryOrderCents: 1500,
  taxRateBps: 0,
  prepMinutes: 20,
  deliveryMinutes: 30,
  closedMessage: "We are not taking online orders right now. Please check back soon.",
};

const cache = createTtlCache<StoreSettings>(15_000);

/** Always reads the database. Use when money or availability is decided. */
export async function getStoreSettingsFresh(): Promise<StoreSettings> {
  const [row] = await db
    .select()
    .from(storeSettings)
    .where(eq(storeSettings.id, 1))
    .limit(1);

  if (!row) return DEFAULT_STORE_SETTINGS;

  const { id, updatedAt, ...settings } = row;
  void id;
  void updatedAt;

  return settings;
}

/** Cached for 15 seconds; fine for displaying fees and messages. */
export function getStoreSettings(): Promise<StoreSettings> {
  return cache.get(getStoreSettingsFresh);
}

export function invalidateStoreSettings() {
  cache.clear();
}

export async function saveStoreSettings(values: Partial<StoreSettings>) {
  await db
    .insert(storeSettings)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: storeSettings.id, set: values });

  invalidateStoreSettings();
}
