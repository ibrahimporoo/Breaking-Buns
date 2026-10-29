import { count } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import type { Role } from "@/lib/auth/roles";

export type AdminOverview = {
  customers: number;
  team: number;
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const rows = await db
    .select({ role: user.role, total: count() })
    .from(user)
    .groupBy(user.role);

  const totalFor = (...roles: Role[]) =>
    rows
      .filter((row) => roles.includes(row.role))
      .reduce((sum, row) => sum + row.total, 0);

  return {
    customers: totalFor("customer"),
    team: totalFor("staff", "owner"),
  };
}
