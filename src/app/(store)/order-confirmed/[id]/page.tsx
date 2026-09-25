import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { inr } from "@/lib/format";

export const metadata: Metadata = { title: "Order confirmed" };
export const dynamic = "force-dynamic";

export default async function OrderConfirmed({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/order-confirmed/${id}`);
  const order = await db.order.findFirst({ where: { id, userId: user.id }, include: { items: true } });
  if (!order) notFound();

  return (
    <main className="wrap" style={{ paddingTop: 56, paddingBottom: 80, maxWidth: 900 }}>
      <div style={{ background: "#167D4E", color: "#FFFBF4", padding: "48px 40px" }} className="pad-panel">
        <div className="eyebrow" style={{ color: "#FFB703" }}>
          Order {order.number}
        </div>
        <h1 className="display" style={{ fontWeight: 800, fontSize: "clamp(36px,5vw,64px)", lineHeight: 0.96, letterSpacing: "-.035em", margin: "0 0 16px" }}>
          Thank you, {order.shipName.split(" ")[0]}.
        </h1>
        <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.6, margin: 0, maxWidth: "52ch", color: "rgba(255,251,244,.92)" }}>
          {order.paymentStatus === "PAID"
            ? "Your payment is confirmed and the order is with our packing team in Vadodara."
            : order.paymentMethod === "COD"
              ? `Your order is confirmed. Please keep ${inr(order.total)} ready in cash or UPI at delivery.`
              : "We're waiting for payment confirmation. You'll see the status update on your order page."}{" "}
          We dispatch within 24 hours.
        </p>
      </div>
      <div className="box" style={{ marginTop: 16 }}>
        {order.items.map((it) => (
          <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(28,25,23,.08)", fontWeight: 600 }}>
            <span>
              {it.name} · {it.variantLabel} × {it.qty}
            </span>
            <span>{inr(it.price * it.qty)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, fontWeight: 800, fontSize: 18 }}>
          <span>Total</span>
          <span style={{ color: "#E4341C" }}>{inr(order.total)}</span>
        </div>
        <div className="note" style={{ marginTop: 16 }}>
          Delivering to {order.shipName}, {order.shipLine1}, {order.shipCity} {order.shipPincode}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <Link href={`/account/orders/${order.id}`} className="btn btn-red">
          Track this order →
        </Link>
        <Link href="/shop" className="btn btn-outline">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
