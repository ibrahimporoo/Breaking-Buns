export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import AddToCartButton from "@/components/cart/AddToCartButton";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import { getPublicMenu } from "@/db/queries/menu";
import { getStoreSettings } from "@/db/queries/store";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: "Menu",
  description: "Smash burgers, crispy chicken buns, sides, shakes and desserts. Order online for delivery or pickup.",
};

/** Static, rebuilt in the background at most once a minute (and instantly when the owner edits the menu). */
export const revalidate = 60;

export default async function MenuPage() {
  const [categories, settings] = await Promise.all([getPublicMenu(), getStoreSettings()]);

  return (
    <main className="pb-24 pt-32 sm:pt-40">
      <Container>
        <header>
          <h1 className="font-serif text-[2.5rem] leading-tight text-ink sm:text-5xl lg:text-6xl">
            Our Menu
          </h1>
          <p className="mt-4 max-w-xl text-ink-muted">
            Add as many dishes as you like. Choose delivery or pickup at checkout and pay online
            or with cash.
          </p>
        </header>

        {!settings.isAcceptingOrders && (
          <p
            role="status"
            className="mt-6 rounded-2xl border border-warning/30 bg-warning/10 px-5 py-4 text-warning"
          >
            {settings.closedMessage}
          </p>
        )}

        <nav
          aria-label="Menu categories"
          className="sticky top-20 z-30 -mx-5 mt-8 overflow-x-auto bg-canvas/80 px-5 py-3 backdrop-blur-md scrollbar-none sm:-mx-8 sm:px-8 lg:top-24"
        >
          <ul className="flex gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <a
                  href={`#${category.slug}`}
                  className="inline-block whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm text-ink transition hover:border-accent hover:text-accent"
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 space-y-16">
          {categories.map((category) => (
            <section key={category.id} id={category.slug} aria-labelledby={`${category.slug}-title`} className="scroll-mt-40">
              <h2 id={`${category.slug}-title`} className="font-serif text-3xl text-ink">
                {category.name}
              </h2>

              <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item, index) => (
                  <li key={item.id}>
                    <Reveal delay={(index % 3) * 80} className="h-full">
                      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition duration-300 hover:border-accent/30">
                        <div className="relative aspect-video bg-plate">
                          {item.imageUrl && (
                            <SafeImage
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="font-serif text-xl text-ink">{item.name}</h3>
                          <p className="mt-2 flex-1 text-sm text-ink-muted">{item.description}</p>
                          <div className="mt-5 flex items-center justify-between gap-3">
                            <p className="font-serif text-2xl text-ink">
                              {formatMoney(item.priceCents)}
                            </p>
                            <AddToCartButton
                              soldOut={!item.isAvailable}
                              product={{
                                id: item.id,
                                name: item.name,
                                priceCents: item.priceCents,
                                image: item.imageUrl,
                              }}
                            />
                          </div>
                        </div>
                      </article>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
