"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import Icon from "@/components/ui/Icon";
import type { CartProduct } from "@/lib/cart";

type AddToCartButtonProps = {
  product: CartProduct;
  soldOut?: boolean;
};

const FEEDBACK_MS = 1400;

export default function AddToCartButton({ product, soldOut = false }: AddToCartButtonProps) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [added]);

  if (soldOut) {
    return (
      <span className="inline-flex h-10 items-center rounded-full border border-white/10 px-4 text-sm text-ink-muted">
        Sold out
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        add(product);
        setAdded(true);
      }}
      aria-label={`Add ${product.name} to cart`}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-white shadow-accent transition duration-300 hover:-translate-y-0.5 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <Icon name={added ? "check" : "plus"} className="size-4" />
      <span aria-live="polite">{added ? "Added" : "Add"}</span>
    </button>
  );
}
