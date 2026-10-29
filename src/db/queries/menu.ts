import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { menuCategory, menuItem } from "@/db/schema";
import { FALLBACK_MENU } from "@/data/menu";

export type MenuItemView = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
};

export type MenuCategoryView = {
  id: string;
  slug: string;
  name: string;
  items: MenuItemView[];
};

const itemColumns = {
  id: menuItem.id,
  categoryId: menuItem.categoryId,
  name: menuItem.name,
  description: menuItem.description,
  priceCents: menuItem.priceCents,
  imageUrl: menuItem.imageUrl,
  isAvailable: menuItem.isAvailable,
  isFeatured: menuItem.isFeatured,
};

/** Public menu: active categories with their items. Sold-out items stay visible. */
export async function getPublicMenu(): Promise<MenuCategoryView[]> {
  try {
    const [categories, items] = await Promise.all([
      db
        .select()
        .from(menuCategory)
        .where(eq(menuCategory.isActive, true))
        .orderBy(asc(menuCategory.sortOrder), asc(menuCategory.name)),
      db
        .select(itemColumns)
        .from(menuItem)
        .orderBy(asc(menuItem.sortOrder), asc(menuItem.name)),
    ]);

    return categories
      .map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        items: items.filter((item) => item.categoryId === category.id),
      }))
      .filter((category) => category.items.length > 0);
  } catch (error) {
    console.error("[menu] Using fallback menu because the database is unavailable", error);
    return FALLBACK_MENU;
  }
}

export async function getFeaturedItems(limit = 6): Promise<MenuItemView[]> {
  try {
    const featured = await db
      .select(itemColumns)
      .from(menuItem)
      .where(and(eq(menuItem.isFeatured, true), eq(menuItem.isAvailable, true)))
      .orderBy(asc(menuItem.sortOrder))
      .limit(limit);

    if (featured.length > 0) return featured;
  } catch (error) {
    console.error("[menu] Using fallback featured items", error);
  }

  return FALLBACK_MENU.flatMap((category) => category.items).slice(0, limit);
}

/** Authoritative lookup used when an order is placed. Only available items. */
export async function getOrderableItems(ids: readonly string[]) {
  if (ids.length === 0) return [];

  return db
    .select({
      id: menuItem.id,
      name: menuItem.name,
      priceCents: menuItem.priceCents,
    })
    .from(menuItem)
    .where(and(inArray(menuItem.id, [...ids]), eq(menuItem.isAvailable, true)));
}

export async function getAdminMenu() {
  const [categories, items] = await Promise.all([
    db
      .select()
      .from(menuCategory)
      .orderBy(asc(menuCategory.sortOrder), asc(menuCategory.name)),
    db
      .select()
      .from(menuItem)
      .orderBy(asc(menuItem.sortOrder), asc(menuItem.name)),
  ]);

  return { categories, items };
}
