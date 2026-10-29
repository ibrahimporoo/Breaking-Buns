import { NextResponse } from "next/server";
import { getLiveOrders } from "@/db/queries/orders";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const session = await getSession();

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  if (!isStaff(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: NO_STORE });
  }

  const orders = await getLiveOrders();

  return NextResponse.json({ orders, serverTime: new Date().toISOString() }, { headers: NO_STORE });
}
