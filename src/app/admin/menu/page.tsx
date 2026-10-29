import type { Metadata } from "next";
import MenuManager from "@/components/admin/MenuManager";
import { getAdminMenu } from "@/db/queries/menu";
import { requireStaff } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Menu" };

export default async function AdminMenuPage() {
  await requireStaff();
  const { categories, items } = await getAdminMenu();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">Menu</h1>
        <p className="mt-2 text-ink-muted">
          Add dishes, change prices, upload photo links and mark dishes as sold out. Changes show
          on the website within a minute.
        </p>
      </header>
      <MenuManager
        categories={categories.map(({ id, name, isActive }) => ({ id, name, isActive }))}
        items={items.map((item) => ({
          id: item.id,
          categoryId: item.categoryId,
          name: item.name,
          description: item.description,
          priceCents: item.priceCents,
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
          isFeatured: item.isFeatured,
        }))}
      />
    </div>
  );
}
