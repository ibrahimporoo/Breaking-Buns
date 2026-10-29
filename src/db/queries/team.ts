import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import type { Role } from "@/lib/auth/roles";

export async function listTeam() {
  return db
    .select({ id: user.id, name: user.name, email: user.email, role: user.role })
    .from(user)
    .where(inArray(user.role, ["staff", "owner"]))
    .orderBy(asc(user.role), asc(user.name));
}

export async function countOwners(): Promise<number> {
  const owners = await db.select({ id: user.id }).from(user).where(eq(user.role, "owner"));

  return owners.length;
}

export async function setRoleByEmail(email: string, role: Role) {
  const [updated] = await db
    .update(user)
    .set({ role })
    .where(eq(user.email, email.toLowerCase()))
    .returning({ id: user.id, role: user.role });

  return updated ?? null;
}

export async function setRoleById(id: string, role: Role) {
  const [updated] = await db
    .update(user)
    .set({ role })
    .where(eq(user.id, id))
    .returning({ id: user.id });

  return updated ?? null;
}
