"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { PackImage } from "@/components/PackImage";
import type { CardProduct } from "@/lib/catalog";

export function ProductCard({ p, badge = "badge", compact = false }: { p: CardProduct; badge?: "badge" | "category" | "none"; compact?: boolean }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  const label = badge === "badge" ? p.badge : badge === "category" ? p.catShort : null;

  function onAdd() {
    if (!p.variant) return;
    add({ variantId: p.variant.id, productId: p.id, slug: p.slug, name: p.name, label: p.variant.label, price: p.variant.price, image: p.image, tileBg: p.tileBg });
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  }

  return (
    <div className={`pcard ${compact ? "compact" : ""}`}>
      <Link href={`/product/${p.slug}`} className="pic" style={{ background: p.tileBg }} aria-label={p.name}>
        <PackImage src={p.image} name={p.name} />
        {label && <span className="badge">{label}</span>}
      </Link>
      <div className="body">
        <Link href={`/product/${p.slug}`} className="name">
          {p.name}
        </Link>
        {!compact && <div className="sizes">{p.sizes}</div>}
        <div className="prices">
          <span className="price-now">{p.price}</span>
          {p.was && <span className="price-was">{p.was}</span>}
        </div>
        {!compact &&
          (p.inStock ? (
            <button className={`add ${done ? "done" : ""}`} onClick={onAdd}>
              {done ? "Added ✓" : "Add to cart"}
            </button>
          ) : (
            <button className="add" disabled>
              Out of stock
            </button>
          ))}
      </div>
    </div>
  );
}
