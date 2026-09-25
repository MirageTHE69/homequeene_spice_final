import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDate, inr } from "@/lib/format";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = { title: "Invoice", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Invoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/invoice/${id}`);
  const order = await db.order.findFirst({
    where: user.role === "ADMIN" ? { id } : { id, userId: user.id },
    include: { items: true, user: true },
  });
  if (!order) notFound();

  const cell: React.CSSProperties = { padding: "10px 8px", borderBottom: "1px solid #e8e0d4", fontSize: 14 };
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px", background: "#fff", color: "#1C1917", minHeight: "100vh" }}>
      <style>{`@media print { .no-print { display: none !important } body { background: #fff } }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", borderBottom: "4px solid #E4341C", paddingBottom: 20 }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/brand/logo.webp" alt="Home Queen" style={{ height: 54 }} />
          <div style={{ fontSize: 13, lineHeight: 1.6, marginTop: 10, color: "#5A5048" }}>
            RKR Foods · 4/4 Industrial Estate, Gorwa, Vadodara, Gujarat 390016
            <br />
            +91 8866 911 100 · info@homequeenspices.com
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="display" style={{ fontWeight: 800, fontSize: 30, letterSpacing: "-.02em" }}>
            Tax Invoice
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.7, marginTop: 6 }}>
            Order <b>{order.number}</b>
            <br />
            Date {formatDate(order.createdAt)}
            <br />
            Payment: {order.paymentMethod === "COD" ? "Cash on delivery" : "Online"} ({order.paymentStatus.toLowerCase()})
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 40, margin: "24px 0", fontSize: 14, lineHeight: 1.6, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "#E4341C" }}>Bill & ship to</div>
          <b>{order.shipName}</b>
          <br />
          {order.shipLine1}
          {order.shipLine2 ? `, ${order.shipLine2}` : ""}
          <br />
          {order.shipCity}, {order.shipState} {order.shipPincode}
          <br />
          {order.shipPhone} · {order.user.email}
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#FFF0D4", textAlign: "left" }}>
            <th style={cell}>#</th>
            <th style={cell}>Item</th>
            <th style={cell}>Pack</th>
            <th style={{ ...cell, textAlign: "right" }}>Rate</th>
            <th style={{ ...cell, textAlign: "right" }}>Qty</th>
            <th style={{ ...cell, textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it, i) => (
            <tr key={it.id}>
              <td style={cell}>{i + 1}</td>
              <td style={cell}>{it.name}</td>
              <td style={cell}>{it.variantLabel}</td>
              <td style={{ ...cell, textAlign: "right" }}>{inr(it.price)}</td>
              <td style={{ ...cell, textAlign: "right" }}>{it.qty}</td>
              <td style={{ ...cell, textAlign: "right" }}>{inr(it.price * it.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginLeft: "auto", maxWidth: 300, marginTop: 16, fontSize: 14, display: "grid", gap: 6 }}>
        <Row k="Subtotal" v={inr(order.subtotal)} />
        {order.discount > 0 && <Row k={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} v={`−${inr(order.discount)}`} />}
        <Row k="Shipping" v={order.shipping ? inr(order.shipping) : "Free"} />
        <div style={{ borderTop: "2px solid #1C1917", paddingTop: 8, marginTop: 4 }}>
          <Row k="Total (incl. taxes)" v={inr(order.total)} bold />
        </div>
      </div>
      <p style={{ fontSize: 12, color: "#8A7C6C", marginTop: 40 }}>Prices are inclusive of GST. This is a computer-generated invoice and does not require a signature.</p>
      <div className="no-print" style={{ marginTop: 24 }}>
        <PrintButton />
      </div>
    </main>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: bold ? 800 : 600, fontSize: bold ? 16 : 14 }}>
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}
