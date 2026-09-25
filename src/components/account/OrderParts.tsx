import Link from "next/link";
import type { Order, OrderEvent, OrderItem } from "@prisma/client";
import { PackImage } from "@/components/PackImage";
import { STATUS_FLOW, STATUS_LABEL, formatDateTime, inr } from "@/lib/format";

export function Tracker({ order }: { order: Order & { events: OrderEvent[] } }) {
  if (order.status === "CANCELLED" || order.status === "RETURNED" || order.status === "PENDING_PAYMENT") {
    const last = order.events[order.events.length - 1];
    return (
      <div className={`alert ${order.status === "PENDING_PAYMENT" ? "alert-info" : "alert-err"}`}>
        <b>{STATUS_LABEL[order.status]}</b>
        {last?.note ? ` — ${last.note}` : ""}
      </div>
    );
  }
  const idx = STATUS_FLOW.indexOf(order.status);
  const when = (s: string) => order.events.find((e) => e.status === s)?.createdAt;
  return (
    <div className="tracker">
      {STATUS_FLOW.map((s, i) => {
        const t = when(s);
        return (
          <div key={s} className={`step ${i < idx ? "done" : i === idx ? (s === "DELIVERED" ? "done" : "now") : ""}`}>
            {STATUS_LABEL[s]}
            <small>{t ? formatDateTime(t) : i > idx ? "Pending" : ""}</small>
          </div>
        );
      })}
    </div>
  );
}

export function OrderItems({ items, linkProducts = true }: { items: OrderItem[]; linkProducts?: boolean }) {
  return (
    <div style={{ borderTop: "1px solid rgba(28,25,23,.12)" }}>
      {items.map((it) => (
        <div key={it.id} style={{ display: "grid", gridTemplateColumns: "56px minmax(0,1fr) auto", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(28,25,23,.08)" }}>
          <div className="thumb-sm" style={{ width: 56, height: 56 }}>
            <PackImage src={it.image} name={it.name} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700 }}>{it.name}</div>
            <div style={{ fontSize: 13, color: "#7A6E62", fontWeight: 600 }}>
              {it.variantLabel} · {inr(it.price)} × {it.qty}
            </div>
            {linkProducts && it.productId && (
              <Link href={`/shop?q=${encodeURIComponent(it.name)}`} className="link-caps" style={{ fontSize: 10 }}>
                Buy again
              </Link>
            )}
          </div>
          <div style={{ fontWeight: 800 }}>{inr(it.price * it.qty)}</div>
        </div>
      ))}
    </div>
  );
}

export function OrderTotals({ order }: { order: Order }) {
  const rows: [string, string, boolean?][] = [
    ["Subtotal", inr(order.subtotal)],
    ...(order.discount ? ([[`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`, `−${inr(order.discount)}`, true]] as [string, string, boolean][]) : []),
    ["Shipping", order.shipping ? inr(order.shipping) : "Free"],
  ];
  return (
    <div style={{ display: "grid", gap: 8, fontWeight: 600, fontSize: 15, marginTop: 14 }}>
      {rows.map(([k, v, green]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="muted">{k}</span>
          <span style={green ? { color: "#167D4E" } : undefined}>{v}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(28,25,23,.14)", paddingTop: 10, fontWeight: 800, fontSize: 18 }}>
        <span>Total</span>
        <span style={{ color: "#E4341C" }}>{inr(order.total)}</span>
      </div>
    </div>
  );
}

export function ShipTo({ order }: { order: Order }) {
  return (
    <p style={{ margin: 0, lineHeight: 1.65, fontWeight: 500 }}>
      <b>{order.shipName}</b> · {order.shipPhone}
      <br />
      {order.shipLine1}
      {order.shipLine2 ? `, ${order.shipLine2}` : ""}
      <br />
      {order.shipCity}, {order.shipState} {order.shipPincode}
    </p>
  );
}

export function EventLog({ events }: { events: OrderEvent[] }) {
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
      {[...events].reverse().map((e) => (
        <li key={e.id} style={{ display: "grid", gridTemplateColumns: "12px minmax(0,1fr)", gap: 12 }}>
          <span style={{ width: 10, height: 10, marginTop: 5, background: e.status === "CANCELLED" ? "#E4341C" : "#167D4E" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{STATUS_LABEL[e.status] ?? e.status}</div>
            {e.note && <div style={{ fontSize: 13, color: "#5A5048" }}>{e.note}</div>}
            <div style={{ fontSize: 12, color: "#8A7C6C", fontWeight: 600 }}>{formatDateTime(e.createdAt)}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
