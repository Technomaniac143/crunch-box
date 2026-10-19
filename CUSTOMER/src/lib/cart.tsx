import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  variant: string;
  price: number;
  qty: number;
  image: string;
};

export const cartSubtotal = (items: CartItem[]) => items.reduce((s, i) => s + i.price * i.qty, 0);
export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.qty, 0);

export function addToItems(items: CartItem[], item: Omit<CartItem, "qty">, qty = 1): CartItem[] {
  const found = items.find((i) => i.key === item.key);
  if (found) return items.map((i) => (i.key === item.key ? { ...i, qty: i.qty + qty } : i));
  return [...items, { ...item, qty }];
}

type Ctx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "crunchbox-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Ignore localStorage errors
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<Ctx>(
    () => ({
      items,
      count: cartCount(items),
      subtotal: cartSubtotal(items),
      add: (item, qty = 1) => setItems((s) => addToItems(s, item, qty)),
      setQty: (key, qty) =>
        setItems((s) =>
          qty <= 0
            ? s.filter((i) => i.key !== key)
            : s.map((i) => (i.key === key ? { ...i, qty } : i)),
        ),
      remove: (key) => setItems((s) => s.filter((i) => i.key !== key)),
      clear: () => setItems([]),
    }),
    [items],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
