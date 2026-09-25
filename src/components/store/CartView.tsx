"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { PackImage } from "@/components/PackImage";
import { applyCoupon, refreshCart } from "@/app/actions/shop";

type Settings = { freeShippingThreshold: number; shippingFee: number };

export function useSyncedCart() {
  const cart = useCart();
  const synced = useRef(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Re-price the cart from the server once: prices or stock may have changed since it was saved.
  useEffect(() => {
    if (!cart.ready || synced.current || cart.items.length === 0) return;
    synced.current = true;
    refreshCart(cart.items.map((i) => i.variantId)).then((rows) => {
      const byId = new Map(rows.map((r) => [r.variantId, r]));
      const changes: string[] = [];
      for (const it of cart.items) {
        const r = byId.get(it.variantId);
        if (!r || !r.active || r.stock <= 0) {
          cart.remove(it.variantId);
          changes.push(`${it.name} is no longer available and was removed`);
          continue;
        }
        if (r.price !== it.price) {
          cart.patch(it.variantId, { price: r.price, image: r.image });
          changes.push(`${it.name} price updated to ₹${r.price}`);
        }
        if (it.qty > r.stock) {
          cart.setQty(it.variantId, r.stock);
          changes.push(`Only ${r.stock} of ${it.name} left — quantity adjusted`);
        }
      }
      if (changes.length) setNotice(changes.join(". ") + ".");
    });
  }, [cart]);

  return { ...cart, notice };
}

export function CartView({ settings }: { settings: Settings }) {
  const router = useRouter();
  const { items, ready, subtotal, setQty, remove, coupon, setCoupon, notice } = useSyncedCart();
  const [code, setCode] = useState(coupon?.code ?? "");
  const [couponErr, setCouponErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // Re-validate an applied coupon whenever the subtotal changes.
  useEffect(() => {
    if (!ready || !coupon) return;
    applyCoupon(coupon.code, subtotal).then((r) => {
      if (r.ok) {
        if (r.discount !== coupon.discount) setCoupon({ code: r.code, discount: r.discount, description: r.description });
      } else {
        setCoupon(null);
        setCouponErr(r.error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, ready]);

  if (!ready) return <div style={{ minHeight: 300 }} />;

  if (items.length === 0) {
    return (
      <div style={{ border: "1px solid rgba(28,25,23,.14)", background: "#fff", padding: "56px 32px", textAlign: "center" }}>
        <div className="display" style={{ fontWeight: 700, fontSize: 28, marginBottom: 12 }}>
          Your cart is empty
        </div>
        <p className="muted" style={{ margin: "0 0 26px", fontSize: 16 }}>
          Start with a bestseller — Kashmiri Chilli, Cumin Coriander or the Kitchen E Bahar kit.
        </p>
        <Link href="/shop" className="btn btn-red btn-lg">
          Shop spices →
        </Link>
      </div>
    );
  }

  const discount = coupon?.discount ?? 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const total = afterDiscount + shipping;
  const toFree = settings.freeShippingThreshold - afterDiscount;

  return (
    <div className="cart-grid">
      <div style={{ minWidth: 0 }}>
        {notice && (
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            {notice}
          </div>
        )}
        <div style={{ borderTop: "1px solid rgba(28,25,23,.16)" }}>
          {items.map((i) => (
            <div key={i.variantId} className="cart-row">
              <Link href={`/product/${i.slug}`} className="pic" style={{ background: i.tileBg || "#FFF0D4" }}>
                <PackImage src={i.image} name={i.name} />
              </Link>
              <div style={{ minWidth: 0 }}>
                <Link href={`/product/${i.slug}`} className="n" style={{ display: "block" }}>
                  {i.name}
                </Link>
                <div className="sz">
                  {i.label} pack · ₹{i.price} each
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div className="qty sm">
                    <button onClick={() => setQty(i.variantId, i.qty - 1)} aria-label={`Decrease ${i.name}`}>
                      −
                    </button>
                    <span>{i.qty}</span>
                    <button onClick={() => setQty(i.variantId, i.qty + 1)} aria-label={`Increase ${i.name}`}>
                      +
                    </button>
                  </div>
                  <button className="link-caps" onClick={() => remove(i.variantId)}>
                    Remove
                  </button>
                </div>
              </div>
              <div className="tot">₹{(i.qty * i.price).toLocaleString("en-IN")}</div>
            </div>
          ))}
        </div>
        <Link href="/shop" className="btn btn-outline" style={{ marginTop: 28, padding: "14px 26px" }}>
          ← Continue shopping
        </Link>
      </div>

      <div className="summary">
        <h2>Order summary</h2>
        <div className="lines">
          <div>
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div>
            <span>Shipping</span>
            <span className={shipping === 0 ? "hl" : ""}>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
          </div>
          {coupon && (
            <div>
              <span>
                Coupon {coupon.code}{" "}
                <button
                  onClick={() => {
                    setCoupon(null);
                    setCode("");
                  }}
                  style={{ background: "none", border: 0, color: "inherit", textDecoration: "underline", fontSize: 12, padding: 0 }}
                >
                  remove
                </button>
              </span>
              <span className="hl">−₹{discount.toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>
        <div className="total">
          <span>Total</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
        <form
          className="coupon"
          onSubmit={(e) => {
            e.preventDefault();
            setCouponErr(null);
            start(async () => {
              const r = await applyCoupon(code, subtotal);
              if (r.ok) setCoupon({ code: r.code, discount: r.discount, description: r.description });
              else setCouponErr(r.error);
            });
          }}
        >
          <input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} aria-label="Coupon code" />
          <button type="submit" disabled={pending || !code}>
            {pending ? "…" : "Apply"}
          </button>
        </form>
        {couponErr && <div style={{ background: "rgba(0,0,0,.18)", padding: "10px 12px", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>{couponErr}</div>}
        {coupon?.description && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: "#FFB703" }}>✓ {coupon.description}</div>}
        <button className="btn btn-amber btn-block" style={{ padding: 18, fontSize: 17 }} onClick={() => router.push("/checkout")}>
          Checkout — ₹{total.toLocaleString("en-IN")}
        </button>
        {toFree > 0 && (
          <div className="ship-meter">
            Add ₹{toFree} more for free shipping
            <div className="bar">
              <div style={{ width: `${Math.min(100, (afterDiscount / settings.freeShippingThreshold) * 100)}%` }} />
            </div>
          </div>
        )}
        <div className="pay-note">UPI · Cards · Netbanking · Cash on delivery</div>
      </div>
    </div>
  );
}
