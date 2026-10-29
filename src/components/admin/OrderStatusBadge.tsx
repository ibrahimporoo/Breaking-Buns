import Badge, { type BadgeTone } from "@/components/ui/Badge";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders/status";

const TONES: Record<OrderStatus, BadgeTone> = {
  pending_payment: "warning",
  new: "accent",
  preparing: "warning",
  ready: "success",
  out_for_delivery: "accent",
  completed: "success",
  cancelled: "danger",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={TONES[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}
