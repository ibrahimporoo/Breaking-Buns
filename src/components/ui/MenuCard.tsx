import AddToCartButton from "@/components/cart/AddToCartButton";
import SafeImage from "@/components/ui/SafeImage";
import type { MenuItemView } from "@/db/queries/menu";
import { formatMoney } from "@/lib/format";

export default function MenuCard({ item }: { item: MenuItemView }) {
  return (
    <article className="group flex flex-col items-center">
      <div className="relative z-10 aspect-square w-3/4 overflow-hidden rounded-full bg-plate shadow-plate ring-1 ring-white/6 transition-transform duration-700 ease-out group-hover:-translate-y-1 group-hover:rotate-6 group-hover:scale-105">
        {item.imageUrl && (
          <SafeImage
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 24vw, (min-width: 640px) 40vw, 70vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="-mt-[36%] w-full rounded-3xl border border-white/4 bg-surface px-5 pb-5 pt-[52%] transition-colors duration-300 group-hover:border-accent/30 sm:px-6 sm:pb-6">
        <h3 className="text-center font-serif text-xl text-ink sm:text-2xl">{item.name}</h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-center text-sm text-ink-muted">
          {item.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="font-serif text-2xl text-ink">{formatMoney(item.priceCents)}</p>
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
  );
}
