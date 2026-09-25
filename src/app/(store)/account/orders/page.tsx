import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { OrdersTable } from "@/components/account/OrdersTable";

export const metadata: Metadata = { title: "My orders" };
export const dynamic = "force-dynamic";

export default async function MyOrders() {
  const user = await requireUser("/account/orders");
  const orders = await db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } } });
  return (
    <div>
      <h2 className="display" style={{ fontWeight: 700, fontSize: 26, letterSpacing: "-.02em", margin: "0 0 16px" }}>
        My orders
      </h2>
      {orders.length ? (
        <OrdersTable orders={orders} />
      ) : (
        <div className="box" style={{ textAlign: "center", padding: 40 }}>
          <p className="muted" style={{ marginTop: 0 }}>
            No orders yet.
          </p>
          <Link href="/shop" className="btn btn-red">
            Start shopping →
          </Link>
        </div>
      )}
    </div>
  );
}
