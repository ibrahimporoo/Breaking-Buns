import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "@/db/schema/auth";
import { createdAt, timestamptz, updatedAt } from "@/db/schema/columns";
import type { Fulfillment } from "@/lib/orders/pricing";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/orders/status";

export const menuCategory = pgTable("menu_category", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const menuItem = pgTable(
  "menu_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => menuCategory.id, { onDelete: "restrict" }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    priceCents: integer("price_cents").notNull(),
    imageUrl: text("image_url"),
    isAvailable: boolean("is_available").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("menu_item_category_idx").on(table.categoryId),
    index("menu_item_featured_idx").on(table.isFeatured),
    check("menu_item_price_non_negative", sql`${table.priceCents} >= 0`),
  ],
);

export const storeSettings = pgTable(
  "store_settings",
  {
    id: integer("id").primaryKey().default(1),
    timeZone: text("time_zone").notNull().default("America/New_York"),
    isAcceptingOrders: boolean("is_accepting_orders").notNull().default(true),
    deliveryEnabled: boolean("delivery_enabled").notNull().default(true),
    pickupEnabled: boolean("pickup_enabled").notNull().default(true),
    cashEnabled: boolean("cash_enabled").notNull().default(true),
    onlinePaymentEnabled: boolean("online_payment_enabled").notNull().default(true),
    deliveryFeeCents: integer("delivery_fee_cents").notNull().default(399),
    freeDeliveryThresholdCents: integer("free_delivery_threshold_cents")
      .notNull()
      .default(0),
    minDeliveryOrderCents: integer("min_delivery_order_cents").notNull().default(1500),
    taxRateBps: integer("tax_rate_bps").notNull().default(0),
    prepMinutes: integer("prep_minutes").notNull().default(20),
    deliveryMinutes: integer("delivery_minutes").notNull().default(30),
    closedMessage: text("closed_message")
      .notNull()
      .default("We are not taking online orders right now. Please check back soon."),
    updatedAt: updatedAt(),
  },
  (table) => [check("store_settings_singleton", sql`${table.id} = 1`)],
);

export const order = pgTable(
  "customer_order",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    trackingTokenHash: text("tracking_token_hash").notNull().unique(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    status: text("status").$type<OrderStatus>().notNull(),
    paymentMethod: text("payment_method").$type<PaymentMethod>().notNull(),
    paymentStatus: text("payment_status").$type<PaymentStatus>().notNull().default("unpaid"),
    fulfillment: text("fulfillment").$type<Fulfillment>().notNull(),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    addressLine: text("address_line"),
    city: text("city"),
    postalCode: text("postal_code"),
    deliveryNotes: text("delivery_notes"),
    orderNotes: text("order_notes"),
    subtotalCents: integer("subtotal_cents").notNull(),
    deliveryFeeCents: integer("delivery_fee_cents").notNull(),
    taxCents: integer("tax_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    stripeSessionId: text("stripe_session_id"),
    paidAt: timestamptz("paid_at"),
    completedAt: timestamptz("completed_at"),
    cancelledAt: timestamptz("cancelled_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("order_status_created_idx").on(table.status, table.createdAt),
    index("order_created_idx").on(table.createdAt),
    index("order_user_idx").on(table.userId),
    uniqueIndex("order_stripe_session_idx").on(table.stripeSessionId),
  ],
);

export const orderItem = pgTable(
  "order_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    menuItemId: uuid("menu_item_id").references(() => menuItem.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
  },
  (table) => [index("order_item_order_idx").on(table.orderId)],
);
