import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth/auth";
import { isStaff } from "@/lib/auth/roles";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function requireStaff() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (!isStaff(session.user.role)) redirect("/owner");

  return session;
}

export async function requireOwner() {
  const session = await requireStaff();

  if (session.user.role !== "owner") redirect("/admin");

  return session;
}

export async function redirectIfSignedIn(next?: string) {
  const session = await getSession();
  if (!session) return;

  redirect(next ?? (isStaff(session.user.role) ? "/admin" : "/"));
}
