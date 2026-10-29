import { eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { menuCategory, menuItem, storeSettings } from "@/db/schema";
import { SEED_MENU } from "@/data/menu";

async function main() {
  await db.insert(storeSettings).values({ id: 1 }).onConflictDoNothing();

  let categoryOrder = 0;

  for (const category of SEED_MENU) {
    categoryOrder += 1;

    await db
      .insert(menuCategory)
      .values({ slug: category.slug, name: category.name, sortOrder: categoryOrder })
      .onConflictDoNothing();

    const [saved] = await db
      .select({ id: menuCategory.id })
      .from(menuCategory)
      .where(eq(menuCategory.slug, category.slug))
      .limit(1);

    let itemOrder = 0;

    for (const item of category.items) {
      itemOrder += 1;

      await db
        .insert(menuItem)
        .values({
          categoryId: saved.id,
          slug: item.slug,
          name: item.name,
          description: item.description,
          priceCents: item.priceCents,
          imageUrl: item.imageUrl,
          isFeatured: item.isFeatured ?? false,
          sortOrder: itemOrder,
        })
        .onConflictDoNothing();
    }
  }

  console.log("Seed complete: store settings and starter menu are ready.");
  console.log("Existing items are never overwritten, so your dashboard edits are safe.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
