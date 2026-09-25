import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDateTime, inr } from "@/lib/format";
import { AdminTop } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/account/OrdersTable";
import { EventLog, OrderItems, OrderTotals, ShipTo, Tracker } from "@/components/account/OrderParts";
import { OrderUpdateForm } from "@/components/admin/OrderUpdateForm";

export const metadata = { title: "Order" };

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true, events: { orderBy: { createdAt: "asc" } }, user: true } });
  if (!order) notFound();
  const prevOrders = await db.order.count({ where: { userId: order.userId, id: { not: order.id } } });

  return (
    <>
      <AdminTop
        title={`Order ${order.number}`}
        sub={
          <>
            {formatDateTime(order.createdAt)} · <StatusBadge s={order.status} />{" "}
            <StatusBadge s={order.paymentStatus} label={`${order.paymentMethod === "COD" ? "COD" : "Online"} · ${order.paymentStatus.toLowerCase()}`} />
          </>
        }
      >
        <Link href="/admin/orders" className="btn btn-outline btn-sm">
          ← Orders
        </Link>
        <a href={`/invoice/${order.id}`} target="_blank" rel="noreferrer" className="btn btn-dark btn-sm">
          Invoice / packing slip
        </a>
      </AdminTop>

      <div className="panel" style={{ marginBottom: 18 }}>
        <Tracker order={order} />
      </div>

      <div className="admin-grid-2">
        <div style={{ display: "grid", gap: 18 }}>
          <div className="panel">
            <div className="panel-h">
              <h2>Items</h2>
            </div>
            <OrderItems items={order.items} linkProducts={false} />
            <OrderTotals order={order} />
          </div>
          <div className="panel">
            <div className="panel-h">
              <h2>Update order</h2>
            </div>
            <OrderUpdateForm
              order={{ id: order.id, status: order.status, paymentStatus: order.paymentStatus, courier: order.courier ?? "", trackingNumber: order.trackingNumber ?? "" }}
            />
          </div>
        </div>
        <div style={{ display: "grid", gap: 18 }}>
          <div className="panel">
            <div className="panel-h">
              <h2>Customer</h2>
              <Link href={`/admin/customers/${order.userId}`} className="link-caps">
                Profile →
              </Link>
            </div>
            <dl className="kv">
              <dt>Name</dt>
              <dd>{order.user.name}</dd>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </dd>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:+91${order.shipPhone}`}>{order.shipPhone}</a>
              </dd>
              <dt>Other orders</dt>
              <dd>{prevOrders}</dd>
            </dl>
          </div>
          <div className="panel">
            <div className="panel-h">
              <h2>Ship to</h2>
            </div>
            <ShipTo order={order} />
            {order.notes && <div className="alert alert-info" style={{ marginTop: 12 }}>Customer note: {order.notes}</div>}
          </div>
          <div className="panel">
            <div className="panel-h">
              <h2>Payment</h2>
            </div>
            <dl className="kv">
              <dt>Method</dt>
              <dd>{order.paymentMethod === "COD" ? "Cash on delivery" : "Online (Razorpay)"}</dd>
              <dt>Status</dt>
              <dd>
                <StatusBadge s={order.paymentStatus} label={order.paymentStatus} />
              </dd>
              <dt>Amount</dt>
              <dd>{inr(order.total)}</dd>
              {order.razorpayPaymentId && (
                <>
                  <dt>Payment ID</dt>
                  <dd style={{ wordBreak: "break-all" }}>{order.razorpayPaymentId}</dd>
                </>
              )}
            </dl>
          </div>
          <div className="panel">
            <div className="panel-h">
              <h2>History</h2>
            </div>
            <EventLog events={order.events} />
          </div>
        </div>
      </div>
    </>
  );
}
