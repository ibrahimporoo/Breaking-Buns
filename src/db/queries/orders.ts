import { and, asc, desc, eq, gte, inArray, lt, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { order, orderItem } from "@/db/schema";
import { generateOrderCode, generateTrackingToken, hashTrackingToken } from "@/lib/orders/codes";
import type { Fulfillment, OrderTotals } from "@/lib/orders/pricing";
import {
  LIVE_STATUSES,
  canTransition,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/orders/status";
import { addDays, zonedTimeToUtc } from "@/lib/time";

export type OrderLine = {
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type OrderView = {
  id: string;
  code: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillment: Fulfillment;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine: string | null;
  city: string | null;
  postalCode: string | null;
  deliveryNotes: string | null;
  orderNotes: string | null;
  subtotalCents: number;
  deliveryFeeCents: number;
  taxCents: number;
  totalCents: number;
  createdAt: string;
  paidAt: string | null;
  items: OrderLine[];
};

type OrderRow = typeof order.$inferSelect;

function toView(row: OrderRow, items: OrderLine[]): OrderView {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    paymentMethod: row.paymentMethod,
    paymentStatus: row.paymentStatus,
    fulfillment: row.fulfillment,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    addressLine: row.addressLine,
    city: row.city,
    postalCode: row.postalCode,
    deliveryNotes: row.deliveryNotes,
    orderNotes: row.orderNotes,
    subtotalCents: row.subtotalCents,
    deliveryFeeCents: row.deliveryFeeCents,
    taxCents: row.taxCents,
    totalCents: row.totalCents,
    createdAt: row.createdAt.toISOString(),
    paidAt: row.paidAt?.toISOString() ?? null,
    items,
  };
}

async function attachItems(rows: OrderRow[]): Promise<OrderView[]> {
  if (rows.length === 0) return [];

  const items = await db
    .select()
    .from(orderItem)
    .where(inArray(orderItem.orderId, rows.map((row) => row.id)));

  return rows.map((row) =>
    toView(
      row,
      items
        .filter((item) => item.orderId === row.id)
        .map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          lineTotalCents: item.lineTotalCents,
        })),
    ),
  );
}

function isUniqueViolation(error: unknown): boolean {
  const candidate = error as { code?: string; cause?: { code?: string } } | null;

  return candidate?.code === "23505" || candidate?.cause?.code === "23505";
}

export type NewOrderInput = {
  userId?: string;
  paymentMethod: PaymentMethod;
  fulfillment: Fulfillment;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine?: string;
  city?: string;
  postalCode?: string;
  deliveryNotes?: string;
  orderNotes?: string;
  totals: OrderTotals;
  lines: { menuItemId: string; name: string; unitPriceCents: number; quantity: number }[];
};

/**
 * Cash orders go straight to the kitchen ("new"). Online orders wait for the
 * payment to be confirmed ("pending_payment") so the kitchen never cooks unpaid food.
 */
export async function createOrder(input: NewOrderInput) {
  const status: OrderStatus = input.paymentMethod === "cash" ? "new" : "pending_payment";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { token, hash } = generateTrackingToken();

    try {
      const created = await db.transaction(async (tx) => {
        const [row] = await tx
          .insert(order)
          .values({
            code: generateOrderCode(),
            trackingTokenHash: hash,
            userId: input.userId,
            status,
            paymentMethod: input.paymentMethod,
            fulfillment: input.fulfillment,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            addressLine: input.addressLine,
            city: input.city,
            postalCode: input.postalCode,
            deliveryNotes: input.deliveryNotes,
            orderNotes: input.orderNotes,
            subtotalCents: input.totals.subtotalCents,
            deliveryFeeCents: input.totals.deliveryFeeCents,
            taxCents: input.totals.taxCents,
            totalCents: input.totals.totalCents,
          })
          .returning();

        await tx.insert(orderItem).values(
          input.lines.map((line) => ({
            orderId: row.id,
            menuItemId: line.menuItemId,
            name: line.name,
            unitPriceCents: line.unitPriceCents,
            quantity: line.quantity,
            lineTotalCents: line.unitPriceCents * line.quantity,
          })),
        );

        return row;
      });

      const [view] = await attachItems([created]);

      return { order: view, trackingToken: token };
    } catch (error) {
      if (!isUniqueViolation(error) || attempt === 2) throw error;
    }
  }

  throw new Error("Could not allocate an order code");
}

export async function getOrderByToken(token: string): Promise<OrderView | null> {
  const [row] = await db
    .select()
    .from(order)
    .where(eq(order.trackingTokenHash, hashTrackingToken(token)))
    .limit(1);

  if (!row) return null;

  const [view] = await attachItems([row]);
  return view;
}

export async function getOrderRowByToken(token: string): Promise<OrderRow | null> {
  const [row] = await db
    .select()
    .from(order)
    .where(eq(order.trackingTokenHash, hashTrackingToken(token)))
    .limit(1);

  return row ?? null;
}

export async function getOrderById(id: string): Promise<OrderView | null> {
  const [row] = await db.select().from(order).where(eq(order.id, id)).limit(1);
  if (!row) return null;

  const [view] = await attachItems([row]);
  return view;
}

export async function attachStripeSession(orderId: string, sessionId: string) {
  await db.update(order).set({ stripeSessionId: sessionId }).where(eq(order.id, orderId));
}

/** Orders the kitchen is working on, oldest first so nothing is forgotten. */
export async function getLiveOrders(): Promise<OrderView[]> {
  const rows = await db
    .select()
    .from(order)
    .where(inArray(order.status, [...LIVE_STATUSES]))
    .orderBy(asc(order.createdAt))
    .limit(150);

  return attachItems(rows);
}

export async function listOrdersForDate(date: string, timeZone: string): Promise<OrderView[]> {
  const dayStart = zonedTimeToUtc(date, "00:00", timeZone);
  const dayEnd = zonedTimeToUtc(addDays(date, 1), "00:00", timeZone);

  const rows = await db
    .select()
    .from(order)
    .where(
      and(
        gte(order.createdAt, dayStart),
        lt(order.createdAt, dayEnd),
        ne(order.status, "pending_payment"),
      ),
    )
    .orderBy(desc(order.createdAt))
    .limit(500);

  return attachItems(rows);
}

export async function getDayStats(date: string, timeZone: string) {
  const dayStart = zonedTimeToUtc(date, "00:00", timeZone);
  const dayEnd = zonedTimeToUtc(addDays(date, 1), "00:00", timeZone);

  const [row] = await db
    .select({
      orders: sql<number>`count(*)::int`,
      revenueCents: sql<number>`coalesce(sum(${order.totalCents}), 0)::int`,
    })
    .from(order)
    .where(
      and(
        gte(order.createdAt, dayStart),
        lt(order.createdAt, dayEnd),
        inArray(order.status, ["new", "preparing", "ready", "out_for_delivery", "completed"]),
      ),
    );

  const [open] = await db
    .select({ open: sql<number>`count(*)::int` })
    .from(order)
    .where(inArray(order.status, [...LIVE_STATUSES]));

  const orders = row?.orders ?? 0;
  const revenueCents = row?.revenueCents ?? 0;

  return {
    orders,
    revenueCents,
    averageCents: orders > 0 ? Math.round(revenueCents / orders) : 0,
    openOrders: open?.open ?? 0,
  };
}

/** Called once a payment is confirmed. Returns the order only for the call that made the change. */
export async function markOrderPaid(orderId: string, stripeSessionId: string) {
  const [row] = await db
    .update(order)
    .set({
      status: "new",
      paymentStatus: "paid",
      paidAt: new Date(),
      stripeSessionId,
    })
    .where(and(eq(order.id, orderId), eq(order.status, "pending_payment")))
    .returning();

  if (!row) return null;

  const [view] = await attachItems([row]);
  return view;
}

export async function failPendingPayment(orderId: string) {
  await db
    .update(order)
    .set({ status: "cancelled", paymentStatus: "failed", cancelledAt: new Date() })
    .where(and(eq(order.id, orderId), eq(order.status, "pending_payment")));
}

export type TransitionResult =
  | { ok: true; order: OrderView; refundNeeded: boolean }
  | { ok: false; reason: "not_found" | "not_allowed" };

export async function transitionOrder(
  orderId: string,
  next: OrderStatus,
): Promise<TransitionResult> {
  const [current] = await db.select().from(order).where(eq(order.id, orderId)).limit(1);

  if (!current) return { ok: false, reason: "not_found" };
  if (!canTransition(current.status, next, current.fulfillment)) {
    return { ok: false, reason: "not_allowed" };
  }

  const now = new Date();
  const collectedCash = next === "completed" && current.paymentMethod === "cash";

  const [updated] = await db
    .update(order)
    .set({
      status: next,
      completedAt: next === "completed" ? now : null,
      cancelledAt: next === "cancelled" ? now : null,
      ...(collectedCash ? { paymentStatus: "paid" as const, paidAt: now } : {}),
    })
    .where(and(eq(order.id, orderId), eq(order.status, current.status)))
    .returning();

  if (!updated) return { ok: false, reason: "not_allowed" };

  const [view] = await attachItems([updated]);

  return {
    ok: true,
    order: view,
    refundNeeded: next === "cancelled" && current.paymentStatus === "paid",
  };
}
