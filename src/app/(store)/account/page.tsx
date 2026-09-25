import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { inr } from "@/lib/format";
import { OrdersTable } from "@/components/account/OrdersTable";

export const metadata: Metadata = { title: "My account" };
export const dynamic = "force-dynamic";

export default async function AccountHome() {
  const user = await requireUser("/account");
  const [orders, totals, active, wish, address] = await Promise.all([
    db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5, include: { _count: { select: { items: true } } } }),
    db.order.aggregate({ where: { userId: user.id, status: { notIn: ["CANCELLED", "RETURNED", "PENDING_PAYMENT"] } }, _sum: { total: true }, _count: true }),
    db.order.count({ where: { userId: user.id, status: { in: ["PLACED", "CONFIRMED", "PACKED", "SHIPPED"] } } }),
    db.wishlistItem.count({ where: { userId: user.id } }),
    db.address.findFirst({ where: { userId: user.id, isDefault: true } }),
  ]);

  const tiles = [
    { k: "Orders placed", v: String(totals._count), bg: "#FFB703", fg: "#1C1917" },
    { k: "On the way", v: String(active), bg: "#E4341C", fg: "#FFFBF4" },
    { k: "Total spent", v: inr(totals._sum.total ?? 0), bg: "#167D4E", fg: "#FFFBF4" },
    { k: "Wishlist", v: String(wish), bg: "#1C1917", fg: "#FFB703" },
  ];

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <div className="stat-tiles">
        {tiles.map((t) => (
          <div key={t.k} className="stat" style={{ background: t.bg, color: t.fg }}>
            <div className="k">{t.k}</div>
            <div className="v">{t.v}</div>
          </div>
        ))}
      </div>

      <section>
        <div className="section-head" style={{ marginBottom: 16 }}>
          <h2 className="display" style={{ fontWeight: 700, fontSize: 26, letterSpacing: "-.02em", margin: 0 }}>
            Recent orders
          </h2>
          {orders.length > 0 && (
            <Link href="/account/orders" className="link-caps">
              View all →
            </Link>
          )}
        </div>
        {orders.length ? (
          <OrdersTable orders={orders} />
        ) : (
          <div className="box" style={{ textAlign: "center", padding: 40 }}>
            <p className="muted" style={{ marginTop: 0 }}>
              You haven&rsquo;t ordered yet.
            </p>
            <Link href="/shop" className="btn btn-red">
              Start shopping →
            </Link>
          </div>
        )}
      </section>

      <section className="split" style={{ gap: 16 }}>
        <div className="box">
          <div className="box-title">Default address</div>
          {address ? (
            <p style={{ margin: "0 0 16px", lineHeight: 1.6, fontWeight: 500 }}>
              <b>{address.name}</b> · {address.phone}
              <br />
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.city}, {address.state} {address.pincode}
            </p>
          ) : (
            <p className="muted" style={{ marginTop: 0 }}>
              No saved address yet.
            </p>
          )}
          <Link href="/account/addresses" className="link-caps">
            Manage addresses →
          </Link>
        </div>
        <div className="box">
          <div className="box-title">Account details</div>
          <p style={{ margin: "0 0 16px", lineHeight: 1.6, fontWeight: 500 }}>
            {user.name}
            <br />
            {user.email}
            <br />
            {user.phone ?? "No phone added"}
          </p>
          <Link href="/account/profile" className="link-caps">
            Edit profile →
          </Link>
        </div>
      </section>
    </div>
  );
}
