import { siteConfig } from "@/config/site";
import type { OrderView } from "@/db/queries/orders";
import { renderEmail, renderText, type EmailRow } from "@/lib/email/layout";
import { sendMail, type Mail } from "@/lib/email/mailer";
import { env } from "@/lib/env";
import { formatMoney } from "@/lib/format";
import { absoluteUrl } from "@/lib/url";

function itemRows(order: OrderView): EmailRow[] {
  return order.items.map((item) => ({
    label: `${item.quantity} × ${item.name}`,
    value: formatMoney(item.lineTotalCents),
  }));
}

function totalRows(order: OrderView): EmailRow[] {
  const rows: EmailRow[] = [{ label: "Subtotal", value: formatMoney(order.subtotalCents) }];

  if (order.deliveryFeeCents > 0) {
    rows.push({ label: "Delivery fee", value: formatMoney(order.deliveryFeeCents) });
  }
  if (order.taxCents > 0) rows.push({ label: "Tax", value: formatMoney(order.taxCents) });

  rows.push({ label: "Total", value: formatMoney(order.totalCents) });

  return rows;
}

function paymentLabel(order: OrderView): string {
  if (order.paymentStatus === "paid") return "Paid online";

  return order.fulfillment === "delivery" ? "Cash on delivery" : "Pay at pickup";
}

function destination(order: OrderView): string {
  if (order.fulfillment === "pickup") return "Pickup at the restaurant";

  return [order.addressLine, order.city, order.postalCode].filter(Boolean).join(", ");
}

export function customerOrderMail(order: OrderView, trackingToken: string): Mail {
  const content = {
    heading: `Thanks, ${order.customerName.split(" ")[0]}! Order ${order.code} is in`,
    intro:
      order.fulfillment === "delivery"
        ? "We are firing up the grill. You can follow your delivery with the link below."
        : "We are firing up the grill. We will have it ready for pickup soon.",
    rows: [
      ...itemRows(order),
      ...totalRows(order),
      { label: "Payment", value: paymentLabel(order) },
      { label: order.fulfillment === "delivery" ? "Delivering to" : "Collect from", value: destination(order) },
    ],
    action: { label: "Track your order", href: absoluteUrl(`/order/${trackingToken}`) },
  };

  return {
    to: order.customerEmail,
    subject: `Your ${siteConfig.name} order ${order.code}`,
    html: renderEmail({
      ...content,
      footer: `${siteConfig.contact.address} · ${siteConfig.contact.phone}`,
    }),
    text: renderText(content),
  };
}

export function ownerOrderMail(order: OrderView, ownerEmail: string): Mail {
  const rows: EmailRow[] = [
    { label: "Customer", value: `${order.customerName} · ${order.customerPhone}` },
    { label: "Type", value: order.fulfillment === "delivery" ? "Delivery" : "Pickup" },
    { label: "Address", value: destination(order) },
    ...itemRows(order),
    ...totalRows(order),
    { label: "Payment", value: paymentLabel(order) },
  ];

  if (order.orderNotes) rows.push({ label: "Notes", value: order.orderNotes });
  if (order.deliveryNotes) rows.push({ label: "Delivery notes", value: order.deliveryNotes });

  const content = {
    heading: `New order ${order.code} · ${formatMoney(order.totalCents)}`,
    intro: "A customer just placed an order. Open the dashboard to start preparing it.",
    rows,
    action: { label: "Open live orders", href: absoluteUrl("/admin/orders") },
  };

  return {
    to: ownerEmail,
    subject: `New order ${order.code} · ${formatMoney(order.totalCents)}`,
    html: renderEmail(content),
    text: renderText(content),
  };
}

export function orderCancelledMail(order: OrderView): Mail {
  const refundNote =
    order.paymentStatus === "paid"
      ? "Because you paid online, we will refund the full amount to your original payment method."
      : "You will not be charged.";
  const content = {
    heading: `Order ${order.code} was cancelled`,
    intro: `Sorry about that, ${order.customerName.split(" ")[0]}. ${refundNote}`,
    rows: [...itemRows(order), { label: "Total", value: formatMoney(order.totalCents) }],
  };

  return {
    to: order.customerEmail,
    subject: `Your order ${order.code} was cancelled`,
    html: renderEmail({ ...content, footer: siteConfig.contact.phone }),
    text: renderText(content),
  };
}

/** Sends the customer confirmation and the owner alert. Never throws. */
export async function notifyOrderReceived(order: OrderView, trackingToken: string) {
  await Promise.allSettled([
    sendMail(customerOrderMail(order, trackingToken)),
    env.OWNER_EMAIL ? sendMail(ownerOrderMail(order, env.OWNER_EMAIL)) : Promise.resolve(true),
  ]);
}
