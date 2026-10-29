"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";
import QuantityStepper from "@/components/cart/QuantityStepper";
import Icon from "@/components/ui/Icon";
import SafeImage from "@/components/ui/SafeImage";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

export default function CartDrawer() {
  const { lines, count, subtotalCents, isOpen, close, changeQuantity } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  return (
    <div
      inert={!isOpen}
      className={cn("fixed inset-0 z-60", isOpen ? "pointer-events-auto" : "pointer-events-none")}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close cart"
        onClick={close}
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-surface shadow-hero transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-serif text-2xl text-ink">Your cart</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="flex size-10 items-center justify-center rounded-full text-ink transition hover:bg-white/10"
          >
            <Icon name="close" className="size-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <Icon name="shoppingBag" className="size-12 text-ink/30" />
            <p className="text-ink-muted">Your cart is empty. Pick something tasty!</p>
            <Link
              href="/menu"
              onClick={close}
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-accent transition hover:bg-accent-hover"
            >
              Browse the menu
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((line) => (
                <li key={line.id} className="flex items-center gap-4 py-4">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-canvas">
                    {line.image && (
                      <SafeImage
                        src={line.image}
                        alt={line.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-base text-ink">{line.name}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">{formatMoney(line.priceCents)}</p>
                    <div className="mt-2">
                      <QuantityStepper
                        name={line.name}
                        quantity={line.quantity}
                        onChange={(quantity) => changeQuantity(line.id, quantity)}
                      />
                    </div>
                  </div>
                  <p className="font-serif text-base text-ink">
                    {formatMoney(line.priceCents * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <footer className="space-y-4 border-t border-line p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-ink-muted">Subtotal ({count} items)</span>
                <span className="font-serif text-2xl text-ink">{formatMoney(subtotalCents)}</span>
              </div>
              <p className="text-xs text-ink-muted">Delivery fee and tax are shown at checkout.</p>
              <Link
                href="/checkout"
                onClick={close}
                className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-semibold uppercase tracking-wider text-white shadow-accent transition hover:bg-accent-hover"
              >
                Checkout
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
