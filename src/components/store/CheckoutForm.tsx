"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { PackImage } from "@/components/PackImage";
import { useSyncedCart } from "./CartView";
import { applyCoupon, confirmOnlinePayment, placeOrder } from "@/app/actions/shop";
import { STATES } from "@/lib/india";

type Address = { id: string; name: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string; isDefault: boolean };
type Settings = { freeShippingThreshold: number; shippingFee: number; codFee: number };

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function CheckoutForm({ user, addresses, settings, onlineEnabled }: { user: { name: string; phone: string }; addresses: Address[]; settings: Settings; onlineEnabled: boolean }) {
  const router = useRouter();
  const { items, ready, subtotal, coupon, setCoupon, clear, notice } = useSyncedCart();
  const [addrId, setAddrId] = useState<string>(addresses[0]?.id ?? "new");
  const [form, setForm] = useState({ name: user.name, phone: user.phone, line1: "", line2: "", city: "", state: "Gujarat", pincode: "" });
  const [save, setSave] = useState(true);
  const [pay, setPay] = useState<"COD" | "ONLINE">(onlineEnabled ? "ONLINE" : "COD");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    if (!ready || !coupon) return;
    applyCoupon(coupon.code, subtotal).then((r) => {
      if (!r.ok) setCoupon(null);
      else if (r.discount !== coupon.discount) setCoupon({ code: r.code, discount: r.discount, description: r.description });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, subtotal]);

  if (!ready) return <div style={{ minHeight: 400 }} />;
  if (items.length === 0 && !placed) {
    return (
      <div className="box" style={{ textAlign: "center", padding: 48 }}>
        <div className="box-title">Your cart is empty</div>
        <Link href="/shop" className="btn btn-red">
          Shop spices →
        </Link>
      </div>
    );
  }

  const discount = coupon?.discount ?? 0;
  const after = subtotal - discount;
  const shipping = after >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const codFee = pay === "COD" ? settings.codFee : 0;
  const total = after + shipping + codFee;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit() {
    setError(null);
    start(async () => {
      const r = await placeOrder({
        items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
        addressId: addrId !== "new" ? addrId : undefined,
        address: addrId === "new" ? { ...form, phone: form.phone.replace(/\D/g, "").slice(-10) } : undefined,
        saveAddress: save,
        paymentMethod: pay,
        couponCode: coupon?.code,
        notes: notes || undefined,
      });
      if (!r.ok) {
        setError(r.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setPlaced(true);
      clear();
      if (!r.razorpay) {
        router.push(`/order-confirmed/${r.orderId}`);
        return;
      }
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) {
        router.push(`/account/orders/${r.orderId}?pay=failed`);
        return;
      }
      const rz = new window.Razorpay({
        key: r.razorpay.key,
        amount: r.razorpay.amount,
        currency: "INR",
        name: "Home Queen Spices",
        description: `Order ${r.number}`,
        order_id: r.razorpay.orderId,
        prefill: { name: r.razorpay.name, email: r.razorpay.email, contact: r.razorpay.phone },
        theme: { color: "#E4341C" },
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const v = await confirmOnlinePayment({ orderId: r.orderId, ...resp });
          router.push(v.ok ? `/order-confirmed/${r.orderId}` : `/account/orders/${r.orderId}?pay=failed`);
        },
        modal: { ondismiss: () => router.push(`/account/orders/${r.orderId}?pay=pending`) },
      });
      rz.open();
    });
  }

  return (
    <div className="checkout-grid">
      <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
        {error && <div className="alert alert-err">{error}</div>}
        {notice && <div className="alert alert-info">{notice}</div>}

        <section className="box">
          <h3>1. Delivery address</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {addresses.map((a) => (
              <label key={a.id} className={`radio-card ${addrId === a.id ? "on" : ""}`}>
                <input type="radio" name="addr" checked={addrId === a.id} onChange={() => setAddrId(a.id)} />
                <div>
                  <div className="t">
                    {a.name} · {a.phone} {a.isDefault && <span className="status st-NEW" style={{ marginLeft: 6 }}>Default</span>}
                  </div>
                  <div className="s">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                  </div>
                </div>
              </label>
            ))}
            <label className={`radio-card ${addrId === "new" ? "on" : ""}`}>
              <input type="radio" name="addr" checked={addrId === "new"} onChange={() => setAddrId("new")} />
              <div className="t">{addresses.length ? "Deliver to a new address" : "Add your delivery address"}</div>
            </label>
          </div>
          {addrId === "new" && (
            <div className="form-grid" style={{ marginTop: 16 }}>
              <div className="two">
                <input className="field" placeholder="Full name" value={form.name} onChange={set("name")} autoComplete="name" />
                <input className="field" placeholder="Mobile number" value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" />
              </div>
              <input className="field" placeholder="House no., building, street" value={form.line1} onChange={set("line1")} autoComplete="address-line1" />
              <input className="field" placeholder="Area, landmark (optional)" value={form.line2} onChange={set("line2")} autoComplete="address-line2" />
              <div className="two">
                <input className="field" placeholder="City" value={form.city} onChange={set("city")} autoComplete="address-level2" />
                <input className="field" placeholder="PIN code" value={form.pincode} onChange={set("pincode")} inputMode="numeric" maxLength={6} autoComplete="postal-code" />
              </div>
              <select className="field" value={form.state} onChange={set("state")} aria-label="State">
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <label className="check-row" style={{ fontSize: 14 }}>
                <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} /> Save this address to my account
              </label>
            </div>
          )}
        </section>

        <section className="box">
          <h3>2. Payment</h3>
          <div style={{ display: "grid", gap: 10 }}>
            <label className={`radio-card ${pay === "ONLINE" ? "on" : ""}`} style={!onlineEnabled ? { opacity: 0.55, cursor: "not-allowed" } : undefined}>
              <input type="radio" name="pay" checked={pay === "ONLINE"} disabled={!onlineEnabled} onChange={() => setPay("ONLINE")} />
              <div>
                <div className="t">UPI · Cards · Netbanking · Wallets</div>
                <div className="s">{onlineEnabled ? "Pay securely with Razorpay." : "Online payment is being set up — please use Cash on Delivery for now."}</div>
              </div>
            </label>
            <label className={`radio-card ${pay === "COD" ? "on" : ""}`}>
              <input type="radio" name="pay" checked={pay === "COD"} onChange={() => setPay("COD")} />
              <div>
                <div className="t">Cash on delivery</div>
                <div className="s">Pay in cash or UPI when your order arrives.{settings.codFee ? ` ₹${settings.codFee} COD fee applies.` : ""}</div>
              </div>
            </label>
          </div>
          <textarea className="field" rows={2} placeholder="Delivery notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ marginTop: 14 }} />
        </section>
      </div>

      <aside className="summary" style={{ position: "sticky", top: 100 }}>
        <h2>Order summary</h2>
        <div style={{ display: "grid", gap: 12, marginBottom: 20, maxHeight: 280, overflowY: "auto" }}>
          {items.map((i) => (
            <div key={i.variantId} style={{ display: "grid", gridTemplateColumns: "48px 1fr auto", gap: 12, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, background: "#FFFBF4", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}>
                <PackImage src={i.image} name={i.name} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>
                {i.name}
                <div style={{ fontWeight: 600, fontSize: 12, opacity: 0.85 }}>
                  {i.label} × {i.qty}
                </div>
              </div>
              <div style={{ fontWeight: 800 }}>₹{(i.price * i.qty).toLocaleString("en-IN")}</div>
            </div>
          ))}
        </div>
        <div className="lines">
          <div>
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          {coupon && (
            <div>
              <span>Coupon {coupon.code}</span>
              <span className="hl">−₹{discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div>
            <span>Shipping</span>
            <span className={shipping === 0 ? "hl" : ""}>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
          </div>
          {codFee > 0 && (
            <div>
              <span>COD fee</span>
              <span>₹{codFee}</span>
            </div>
          )}
        </div>
        <div className="total">
          <span>Total</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
        <button className="btn btn-amber btn-block" style={{ padding: 18, fontSize: 17 }} disabled={pending || placed} onClick={submit}>
          {pending || placed ? "Placing order…" : pay === "COD" ? `Place order — ₹${total.toLocaleString("en-IN")}` : `Pay ₹${total.toLocaleString("en-IN")}`}
        </button>
        {!coupon && (
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 14 }}>
            Have a coupon? <Link href="/cart" style={{ color: "#FFB703", textDecoration: "underline" }}>Apply it in your cart</Link>
          </div>
        )}
        <div className="pay-note">Secure checkout · Dispatch within 24 hours</div>
      </aside>
    </div>
  );
}
