import Link from "next/link";
import { db } from "@/lib/db";
import { ORDER_STATUSES, STATUS_LABEL, formatDateTime, inr } from "@/lib/format";
import { orderWhere } from "@/lib/admin-queries";
import { AdminTop } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/account/OrdersTable";
import { Pager } from "@/components/admin/Pager";

export const metadata = { title: "Orders" };
const PER = 25;

export default async function AdminOrders({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = orderWhere(sp);
  const [orders, total, agg] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER, take: PER, include: { user: true, _count: { select: { items: true } } } }),
    db.order.count({ where }),
    db.order.aggregate({ where, _sum: { total: true } }),
  ]);
  const qs = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "page") as [string, string][]).toString();

  return (
    <>
      <AdminTop title="Orders" sub={`${total} orders · ${inr(agg._sum.total ?? 0)} total value`}>
        <a href={`/admin/orders/export?${qs}`} className="btn btn-outline btn-sm">
          Export CSV
        </a>
      </AdminTop>

      <form className="toolbar" method="get">
        <input name="q" className="field" placeholder="Order no., name, phone, email" defaultValue={sp.q} style={{ minWidth: 240 }} />
        <select name="status" className="field" defaultValue={sp.status ?? ""}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select name="pay" className="field" defaultValue={sp.pay ?? ""}>
          <option value="">Any payment</option>
          <option value="COD">Cash on delivery</option>
          <option value="ONLINE">Online</option>
        </select>
        <select name="paid" className="field" defaultValue={sp.paid ?? ""}>
          <option value="">Paid or unpaid</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Payment pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <input type="date" name="from" className="field" defaultValue={sp.from} aria-label="From date" />
        <input type="date" name="to" className="field" defaultValue={sp.to} aria-label="To date" />
        <button className="btn btn-dark btn-sm">Filter</button>
        {qs && (
          <Link href="/admin/orders" className="link-caps">
            Clear
          </Link>
        )}
      </form>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Ship to</th>
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
                  <Link href={`/admin/orders/${o.id}`}>{o.number}</Link>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(o.createdAt)}</td>
                <td>
                  <Link href={`/admin/customers/${o.userId}`} style={{ fontWeight: 600 }}>
                    {o.user.name}
                  </Link>
                  <div style={{ fontSize: 12, color: "#8A7C6C" }}>{o.shipPhone}</div>
                </td>
                <td>
                  {o.shipCity}, {o.shipState}
                </td>
                <td>{o._count.items}</td>
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
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#8A7C6C" }}>
                  No orders match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} total={total} per={PER} base="/admin/orders" qs={qs} />
    </>
  );
}
