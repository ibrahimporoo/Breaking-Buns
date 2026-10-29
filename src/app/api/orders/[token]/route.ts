import { NextResponse } from "next/server";
import { getOrderRowByToken, getOrderByToken } from "@/db/queries/orders";
import { orderLookupLimiter } from "@/lib/limiters";
import { trackingTokenSchema } from "@/lib/orders/schemas";
import { reconcileAndNotify } from "@/lib/orders/payment";
import { getClientIp } from "@/lib/request";

const NO_STORE = { "Cache-Control": "no-store" };

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params;

  if (!orderLookupLimiter.check(`track:${await getClientIp()}`).allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: NO_STORE });
  }

  if (!trackingTokenSchema.safeParse(token).success) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  }

  const row = await getOrderRowByToken(token);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });

  if (row.status === "pending_payment") {
    await reconcileAndNotify({ id: row.id, status: row.status }, row.stripeSessionId);
  }

  const order = await getOrderByToken(token);

  return NextResponse.json({ order }, { headers: NO_STORE });
}
