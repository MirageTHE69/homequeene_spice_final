"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { toggleWishlist } from "@/app/actions/account";

type Variant = { id: string; label: string; price: number; compareAt: number | null; stock: number };
type Product = { id: string; slug: string; name: string; image: string | null; tileBg: string };

export function BuyBox({ product, variants, loggedIn, wished }: { product: Product; variants: Variant[]; loggedIn: boolean; wished: boolean }) {
  const router = useRouter();
  const { add } = useCart();
  const firstInStock = variants.findIndex((v) => v.stock > 0);
  const [sel, setSel] = useState(firstInStock === -1 ? 0 : firstInStock);
  const [qty, setQty] = useState(1);
  const [wish, setWish] = useState(wished);
  const [pending, start] = useTransition();
  const v = variants[sel];
  if (!v) return null;
  const out = v.stock <= 0;
  const maxQty = Math.min(20, Math.max(1, v.stock));

  const addToCart = () => add({ variantId: v.id, productId: product.id, slug: product.slug, name: product.name, label: v.label, price: v.price, image: product.image, tileBg: product.tileBg }, qty);

  return (
    <>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 32, paddingBottom: 30, borderBottom: "1px solid rgba(28,25,23,.16)", flexWrap: "wrap" }}>
        <span className="display" style={{ fontWeight: 800, fontSize: 48, lineHeight: 1, color: "#E4341C" }}>
          ₹{v.price.toLocaleString("en-IN")}
        </span>
        {v.compareAt && v.compareAt > v.price && (
          <span style={{ fontSize: 17, fontWeight: 600, color: "#9A8E82", textDecoration: "line-through" }}>₹{v.compareAt.toLocaleString("en-IN")}</span>
        )}
        {v.compareAt && v.compareAt > v.price && (
          <span style={{ background: "#FFB703", fontWeight: 800, fontSize: 11, letterSpacing: ".1em", padding: "4px 8px" }}>
            {Math.round((1 - v.price / v.compareAt) * 100)}% OFF
          </span>
        )}
        <span className="tiny-caps" style={{ letterSpacing: ".1em", color: "#8A7C6C" }}>
          Incl. all taxes
        </span>
      </div>

      <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "#E4341C", marginBottom: 14 }}>Pack size</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }} role="radiogroup" aria-label="Pack size">
        {variants.map((x, i) => (
          <button
            key={x.id}
            type="button"
            role="radio"
            aria-checked={i === sel}
            className={`variant ${i === sel ? "on" : ""}`}
            onClick={() => {
              setSel(i);
              setQty(1);
            }}
            style={x.stock <= 0 ? { opacity: 0.5 } : undefined}
          >
            <div className="sz">{x.label}</div>
            <div className="pr">₹{x.price.toLocaleString("en-IN")}</div>
          </button>
        ))}
      </div>

      {!out && v.stock <= 10 && (
        <div style={{ fontWeight: 700, fontSize: 13, color: "#E4341C", marginBottom: 14 }}>Only {v.stock} left in stock</div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div className="qty">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
            −
          </button>
          <span aria-live="polite">{qty}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="Increase quantity">
            +
          </button>
        </div>
        <button type="button" className="btn btn-red btn-lg" style={{ flex: 1, minWidth: 180 }} disabled={out} onClick={addToCart}>
          {out ? "Out of stock" : "Add to cart"}
        </button>
        <button
          type="button"
          className="btn btn-amber btn-lg"
          style={{ padding: "18px 28px" }}
          disabled={out}
          onClick={() => {
            addToCart();
            router.push("/checkout");
          }}
        >
          Buy now
        </button>
        <button
          type="button"
          aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
          title={wish ? "Saved to wishlist" : "Save to wishlist"}
          disabled={pending}
          onClick={() => {
            if (!loggedIn) return router.push(`/login?next=/product/${product.slug}`);
            start(async () => {
              const r = await toggleWishlist(product.id);
              if (r.ok) setWish(r.wished);
            });
          }}
          style={{ width: 58, border: "1px solid rgba(28,25,23,.28)", background: wish ? "#FFF0D4" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={wish ? "#E4341C" : "none"} stroke="#E4341C" strokeWidth="2.2" aria-hidden>
            <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.2 4.5 7 4.5c2.1 0 3.6 1.1 5 3 1.4-1.9 2.9-3 5-3 3.8 0 6 3.8 4.5 7.3C19.5 16.4 12 21 12 21z" />
          </svg>
        </button>
      </div>
    </>
  );
}
