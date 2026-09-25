import Link from "next/link";
import { STATUS_LABEL, formatDate, inr } from "@/lib/format";

type Row = { id: string; number: string; createdAt: Date; status: string; paymentStatus: string; paymentMethod: string; total: number; _count?: { items: number } };

export function StatusBadge({ s, label }: { s: string; label?: string }) {
  return <span className={`status st-${s}`}>{label ?? STATUS_LABEL[s] ?? s}</span>;
}

export function OrdersTable({ orders, base = "/account/orders" }: { orders: Row[]; base?: string }) {
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Items</th>
            <th>Status</th>
            <th>Payment</th>
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="click">
              <td>
                <Link href={`${base}/${o.id}`}>{o.number}</Link>
              </td>
              <td>{formatDate(o.createdAt)}</td>
              <td>{o._count?.items ?? "—"}</td>
              <td>
                <StatusBadge s={o.status} />
              </td>
              <td>
                <StatusBadge s={o.paymentStatus} label={`${o.paymentMethod === "COD" ? "COD" : "Online"} · ${o.paymentStatus.toLowerCase()}`} />
              </td>
              <td className="num" style={{ fontWeight: 800 }}>
                {inr(o.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
