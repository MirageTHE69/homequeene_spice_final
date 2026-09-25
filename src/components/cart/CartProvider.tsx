"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  label: string;
  price: number;
  image: string | null;
  tileBg: string;
  qty: number;
};

export type AppliedCoupon = { code: string; discount: number; description?: string | null };

type Ctx = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  coupon: AppliedCoupon | null;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  patch: (variantId: string, data: Partial<CartItem>) => void;
  clear: () => void;
  setCoupon: (c: AppliedCoupon | null) => void;
  toast: (msg: string) => void;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "hq_cart_v1";
const COUPON_KEY = "hq_coupon_v1";
const MAX_QTY = 20;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCouponState] = useState<AppliedCoupon | null>(null);
  const [ready, setReady] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
      const c = localStorage.getItem(COUPON_KEY);
      if (c) setCouponState(JSON.parse(c));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const setCoupon = useCallback((c: AppliedCoupon | null) => {
    setCouponState(c);
    try {
      if (c) localStorage.setItem(COUPON_KEY, JSON.stringify(c));
      else localStorage.removeItem(COUPON_KEY);
    } catch {}
  }, []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const add = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      setItems((prev) => {
        const i = prev.findIndex((x) => x.variantId === item.variantId);
        if (i === -1) return [...prev, { ...item, qty: Math.min(qty, MAX_QTY) }];
        const next = [...prev];
        next[i] = { ...next[i], ...item, qty: Math.min(next[i].qty + qty, MAX_QTY) };
        return next;
      });
      toast(`${item.name} · ${item.label} added to cart`);
    },
    [toast]
  );

  const setQty = useCallback((variantId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((x) => x.variantId !== variantId)
        : prev.map((x) => (x.variantId === variantId ? { ...x, qty: Math.min(qty, MAX_QTY) } : x))
    );
  }, []);

  const patch = useCallback((variantId: string, data: Partial<CartItem>) => {
    setItems((prev) => prev.map((x) => (x.variantId === variantId ? { ...x, ...data, variantId } : x)));
  }, []);

  const remove = useCallback((variantId: string) => setItems((prev) => prev.filter((x) => x.variantId !== variantId)), []);
  const clear = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, [setCoupon]);

  const value = useMemo<Ctx>(() => {
    const count = items.reduce((a, x) => a + x.qty, 0);
    const subtotal = items.reduce((a, x) => a + x.qty * x.price, 0);
    return { items, ready, count, subtotal, coupon, add, setQty, remove, patch, clear, setCoupon, toast };
  }, [items, ready, coupon, add, setQty, remove, patch, clear, setCoupon, toast]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          left: "50%",
          bottom: 24,
          transform: `translateX(-50%) translateY(${toastMsg ? 0 : 20}px)`,
          opacity: toastMsg ? 1 : 0,
          pointerEvents: "none",
          transition: "opacity .25s ease, transform .25s ease",
          background: "#1C1917",
          color: "#FFFBF4",
          borderLeft: "4px solid #FFB703",
          padding: "14px 20px",
          fontWeight: 700,
          fontSize: 14,
          zIndex: 100,
          maxWidth: "calc(100vw - 32px)",
          boxShadow: "0 12px 30px rgba(0,0,0,.25)",
        }}
      >
        {toastMsg}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
