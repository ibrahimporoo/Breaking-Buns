"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  addToCart,
  cartCount,
  cartSubtotal,
  parseCart,
  removeLine,
  serializeCart,
  setQuantity,
  type CartLine,
  type CartProduct,
} from "@/lib/cart";

const STORAGE_KEY = "breaking-buns-cart-v1";
const EMPTY: CartLine[] = [];

let current: CartLine[] | null = null;
const listeners = new Set<() => void>();

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): CartLine[] {
  if (current === null) current = parseCart(readStorage());
  return current;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function commit(lines: CartLine[]) {
  current = lines;

  try {
    window.localStorage.setItem(STORAGE_KEY, serializeCart(lines));
  } catch {
    // Private mode or blocked storage: the cart still works until the tab closes.
  }

  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    current = parseCart(event.newValue);
    listener();
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

type CartContextValue = {
  lines: readonly CartLine[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  add: (product: CartProduct, quantity?: number) => void;
  changeQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback(
    (product: CartProduct, quantity = 1) => commit(addToCart(getSnapshot(), product, quantity)),
    [],
  );
  const changeQuantity = useCallback(
    (id: string, quantity: number) => commit(setQuantity(getSnapshot(), id, quantity)),
    [],
  );
  const remove = useCallback((id: string) => commit(removeLine(getSnapshot(), id)), []);
  const clear = useCallback(() => commit([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: cartCount(lines),
      subtotalCents: cartSubtotal(lines),
      isOpen,
      add,
      changeQuantity,
      remove,
      clear,
      open,
      close,
    }),
    [lines, isOpen, add, changeQuantity, remove, clear, open, close],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");

  return context;
}
