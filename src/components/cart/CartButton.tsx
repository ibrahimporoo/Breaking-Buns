"use client";

import { useCart } from "@/components/cart/CartProvider";
import Icon from "@/components/ui/Icon";

export default function CartButton() {
  const { count, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={count > 0 ? `Open cart, ${count} items` : "Open cart"}
      className="relative flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/4 text-ink transition-colors hover:bg-white/10"
    >
      <Icon name="shoppingBag" className="size-5" />
      {count > 0 && (
        <span
          key={count}
          className="absolute -right-1 -top-1 flex min-w-5 animate-fade-up items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold leading-5 text-white"
        >
          {count}
        </span>
      )}
    </button>
  );
}
