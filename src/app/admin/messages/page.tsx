import Link from "next/link";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { AdminTop } from "@/components/admin/AdminShell";
import { StatusSelect } from "@/components/admin/StatusSelect";

export const metadata = { title: "Messages" };

export default async function Messages() {
  const rows = await db.message.findMany({ orderBy: [{ status: "desc" }, { createdAt: "desc" }] });
  const orders = await db.order.findMany({ where: { number: { in: rows.map((r) => r.orderNumber?.toUpperCase()).filter((x): x is string => !!x) } }, select: { id: true, number: true } });
  return (
    <>
      <AdminTop title="Messages" sub="From the Reach Us page." />
      <div style={{ display: "grid", gap: 12 }}>
        {rows.map((m) => {
          const order = orders.find((o) => o.number === m.orderNumber?.toUpperCase());
          return (
            <div key={m.id} className="panel" style={{ borderLeft: m.status === "NEW" ? "4px solid #E4341C" : undefined }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                <div>
                  <b>{m.name}</b>
                  <span className="muted" style={{ fontSize: 13 }}>
                    {" "}
                    · {formatDateTime(m.createdAt)}
                  </span>
                  <div style={{ fontSize: 13, marginTop: 4, display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {m.email && <a href={`mailto:${m.email}?subject=Re: your message to Home Queen`}>{m.email}</a>}
                    {m.phone && <a href={`tel:${m.phone}`}>{m.phone}</a>}
                    {m.orderNumber && (order ? <Link href={`/admin/orders/${order.id}`}>Order {order.number}</Link> : <span>Order {m.orderNumber}</span>)}
                  </div>
                </div>
                <StatusSelect kind="message" id={m.id} value={m.status} />
              </div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-line" }}>{m.message}</p>
            </div>
          );
        })}
        {rows.length === 0 && <div className="panel muted">No messages yet.</div>}
      </div>
    </>
  );
}
