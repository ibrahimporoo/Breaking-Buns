"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory,
  createMenuItem,
  deleteCategoryIfEmpty,
  deleteMenuItem,
  setMenuItemAvailability,
  updateCategory,
  updateMenuItem,
} from "@/db/queries/menu-admin";
import { fail, ok, type ActionResult } from "@/lib/actions";
import { requireStaff } from "@/lib/auth/session";
import { parseMoneyToCents } from "@/lib/money";
import { z } from "zod";

export type MenuItemFormInput = {
  id?: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
};

const itemSchema = z.object({
  id: z.uuid().optional(),
  categoryId: z.uuid("Choose a category"),
  name: z.string().trim().min(2, "Enter a name").max(80),
  description: z.string().trim().max(300, "Keep the description under 300 characters"),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => value === "" || /^https:\/\//.test(value), "Image link must start with https://"),
});

function refreshMenu() {
  revalidatePath("/menu");
  revalidatePath("/");
  revalidatePath("/admin/menu");
}

export async function saveMenuItemAction(input: MenuItemFormInput): Promise<ActionResult> {
  await requireStaff();

  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return fail(z.prettifyError(parsed.error));

  const priceCents = parseMoneyToCents(input.price);
  if (priceCents === null) return fail("Price must be a number like 11.99.");

  const values = {
    categoryId: parsed.data.categoryId,
    name: parsed.data.name,
    description: parsed.data.description,
    priceCents,
    imageUrl: parsed.data.imageUrl || null,
    isAvailable: input.isAvailable,
    isFeatured: input.isFeatured,
  };

  if (parsed.data.id) await updateMenuItem(parsed.data.id, values);
  else await createMenuItem(values);

  refreshMenu();
  return ok(undefined);
}

export async function toggleItemAvailabilityAction(
  id: string,
  isAvailable: boolean,
): Promise<ActionResult> {
  await requireStaff();
  if (!z.uuid().safeParse(id).success) return fail("Invalid request.");

  await setMenuItemAvailability(id, isAvailable);
  refreshMenu();

  return ok(undefined);
}

export async function deleteMenuItemAction(id: string): Promise<ActionResult> {
  await requireStaff();
  if (!z.uuid().safeParse(id).success) return fail("Invalid request.");

  await deleteMenuItem(id);
  refreshMenu();

  return ok(undefined);
}

export async function createCategoryAction(name: string): Promise<ActionResult> {
  await requireStaff();

  const parsed = z.string().trim().min(2, "Enter a category name").max(40).safeParse(name);
  if (!parsed.success) return fail(z.prettifyError(parsed.error));

  await createCategory(parsed.data);
  refreshMenu();

  return ok(undefined);
}

export async function renameCategoryAction(id: string, name: string): Promise<ActionResult> {
  await requireStaff();

  const parsed = z.object({ id: z.uuid(), name: z.string().trim().min(2).max(40) }).safeParse({ id, name });
  if (!parsed.success) return fail("Enter a category name (2-40 characters).");

  await updateCategory(parsed.data.id, { name: parsed.data.name });
  refreshMenu();

  return ok(undefined);
}

export async function toggleCategoryAction(id: string, isActive: boolean): Promise<ActionResult> {
  await requireStaff();
  if (!z.uuid().safeParse(id).success) return fail("Invalid request.");

  await updateCategory(id, { isActive });
  refreshMenu();

  return ok(undefined);
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireStaff();
  if (!z.uuid().safeParse(id).success) return fail("Invalid request.");

  const deleted = await deleteCategoryIfEmpty(id);
  if (!deleted) return fail("Move or delete the dishes in this category first.");

  refreshMenu();
  return ok(undefined);
}
