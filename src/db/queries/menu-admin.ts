import { and, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { menuCategory, menuItem } from "@/db/schema";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

async function uniqueSlug(table: "item" | "category", base: string): Promise<string> {
  const root = slugify(base) || "item";

  for (let suffix = 0; suffix < 50; suffix += 1) {
    const candidate = suffix === 0 ? root : `${root}-${suffix + 1}`;
    const rows =
      table === "item"
        ? await db.select({ id: menuItem.id }).from(menuItem).where(eq(menuItem.slug, candidate)).limit(1)
        : await db
            .select({ id: menuCategory.id })
            .from(menuCategory)
            .where(eq(menuCategory.slug, candidate))
            .limit(1);

    if (rows.length === 0) return candidate;
  }

  return `${root}-${Date.now()}`;
}

export type MenuItemInput = {
  categoryId: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
};

export async function createMenuItem(input: MenuItemInput) {
  const [last] = await db
    .select({ value: max(menuItem.sortOrder) })
    .from(menuItem)
    .where(eq(menuItem.categoryId, input.categoryId));

  await db.insert(menuItem).values({
    ...input,
    slug: await uniqueSlug("item", input.name),
    sortOrder: (last?.value ?? 0) + 1,
  });
}

export async function updateMenuItem(id: string, input: MenuItemInput) {
  await db.update(menuItem).set(input).where(eq(menuItem.id, id));
}

export async function setMenuItemAvailability(id: string, isAvailable: boolean) {
  await db.update(menuItem).set({ isAvailable }).where(eq(menuItem.id, id));
}

export async function deleteMenuItem(id: string) {
  await db.delete(menuItem).where(eq(menuItem.id, id));
}

export async function createCategory(name: string) {
  const [last] = await db.select({ value: max(menuCategory.sortOrder) }).from(menuCategory);

  await db.insert(menuCategory).values({
    name,
    slug: await uniqueSlug("category", name),
    sortOrder: (last?.value ?? 0) + 1,
  });
}

export async function updateCategory(id: string, values: { name?: string; isActive?: boolean }) {
  await db.update(menuCategory).set(values).where(eq(menuCategory.id, id));
}

export async function deleteCategoryIfEmpty(id: string): Promise<boolean> {
  const items = await db
    .select({ id: menuItem.id })
    .from(menuItem)
    .where(and(eq(menuItem.categoryId, id)))
    .limit(1);

  if (items.length > 0) return false;

  await db.delete(menuCategory).where(eq(menuCategory.id, id));
  return true;
}
