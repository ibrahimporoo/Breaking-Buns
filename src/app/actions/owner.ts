"use server";

import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { countOwners, setRoleById, setRoleByEmail } from "@/db/queries/team";
import { fail, ok, type ActionResult } from "@/lib/actions";
import { getSession, requireOwner } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { ownerClaimLimiter } from "@/lib/limiters";
import { getClientIp } from "@/lib/request";
import { z } from "zod";

function codesMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * First-time setup: a signed-in account becomes the owner by typing the secret
 * phrase from the .env file. Only works while no owner exists.
 */
export async function claimOwnershipAction(code: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return fail("Please sign in first.");

  if (!env.OWNER_SETUP_CODE) {
    return fail("Owner setup is not enabled. Set OWNER_SETUP_CODE in your .env file and restart.");
  }

  if (!ownerClaimLimiter.check(`claim:${await getClientIp()}`).allowed) {
    return fail("Too many attempts. Please wait 15 minutes.");
  }

  if ((await countOwners()) > 0) return fail("This restaurant already has an owner.");
  if (!codesMatch(code.trim(), env.OWNER_SETUP_CODE)) return fail("That setup phrase is not correct.");

  await setRoleById(session.user.id, "owner");
  revalidatePath("/admin");

  return ok(undefined);
}

export async function addStaffAction(email: string): Promise<ActionResult> {
  await requireOwner();

  const parsed = z.email().safeParse(email.trim());
  if (!parsed.success) return fail("Enter a valid email address.");

  const updated = await setRoleByEmail(parsed.data, "staff");
  if (!updated) {
    return fail("No account with that email. Ask them to create an account on the website first.");
  }
  if (updated.role === "owner") return fail("That account is already an owner.");

  revalidatePath("/admin/team");
  return ok(undefined);
}

export async function removeStaffAction(userId: string): Promise<ActionResult> {
  const { user } = await requireOwner();

  if (!z.string().min(1).safeParse(userId).success) return fail("Invalid request.");
  if (userId === user.id) return fail("You cannot remove your own access.");

  await setRoleById(userId, "customer");
  revalidatePath("/admin/team");

  return ok(undefined);
}
