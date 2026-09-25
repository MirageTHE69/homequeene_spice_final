import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatDate, inr } from "@/lib/format";
import { AdminTop } from "@/components/admin/AdminShell";
import { OrdersTable } from "@/components/account/OrdersTable";
import { CustomerActions } from "@/components/admin/CustomerActions";

export const metadata = { title: "Customer" };

export default async function Customer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await requireAdmin();
  const u = await db.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: { orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } } },
      _count: { select: { wishlist: true } },
    },
  });
  if (!u) notFound();
  const counted = u.orders.filter((o) => !["CANCELLED", "RETURNED", "PENDING_PAYMENT"].includes(o.status));
  const spent = counted.reduce((a, o) => a + o.total, 0);

  return (
    <>
      <AdminTop title={u.name} sub={`Customer since ${formatDate(u.createdAt)}`}>
        <Link href="/admin/customers" className="btn btn-outline btn-sm">
          ← Customers
        </Link>
        {me.id !== u.id && <CustomerActions id={u.id} blocked={u.blocked} role={u.role} />}
      </AdminTop>
      <div className="stat-tiles" style={{ marginBottom: 18 }}>
        {[
          ["Orders", String(counted.length)],
          ["Total spent", inr(spent)],
          ["Avg. order", inr(counted.length ? Math.round(spent / counted.length) : 0)],
          ["Wishlist items", String(u._count.wishlist)],
        ].map(([k, v]) => (
          <div key={k} className="stat panel" style={{ padding: "18px 20px" }}>
            <div className="k" style={{ color: "#5A5048", opacity: 1 }}>
              {k}
            </div>
            <div className="v" style={{ fontSize: 28 }}>
              {v}
            </div>
          </div>
        ))}
      </div>
      <div className="admin-grid-2">
        <div className="panel">
          <div className="panel-h">
            <h2>Orders</h2>
          </div>
          {u.orders.length ? <OrdersTable orders={u.orders} base="/admin/orders" /> : <p className="muted">No orders yet.</p>}
        </div>
        <div style={{ display: "grid", gap: 18 }}>
          <div className="panel">
            <div className="panel-h">
              <h2>Contact</h2>
            </div>
            <dl className="kv">
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${u.email}`}>{u.email}</a>
              </dd>
              <dt>Phone</dt>
              <dd>{u.phone ? <a href={`tel:+91${u.phone}`}>{u.phone}</a> : "—"}</dd>
              <dt>Role</dt>
              <dd>{u.role === "ADMIN" ? "Admin" : "Customer"}</dd>
              <dt>Status</dt>
              <dd>{u.blocked ? <span className="status st-CANCELLED">Blocked</span> : <span className="status st-DELIVERED">Active</span>}</dd>
            </dl>
          </div>
          <div className="panel">
            <div className="panel-h">
              <h2>Addresses</h2>
            </div>
            {u.addresses.length ? (
              u.addresses.map((a) => (
                <p key={a.id} style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.55 }}>
                  <b>{a.name}</b> {a.isDefault && <span className="status st-NEW">Default</span>}
                  <br />
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode} · {a.phone}
                </p>
              ))
            ) : (
              <p className="muted">No saved addresses.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
