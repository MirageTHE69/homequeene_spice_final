import Link from "next/link";
import { db } from "@/lib/db";
import { STATUS_LABEL, inr } from "@/lib/format";
import { AdminTop } from "@/components/admin/AdminShell";
import { BarChart } from "@/components/admin/BarChart";
import { OrdersTable } from "@/components/account/OrdersTable";
import { PackImage } from "@/components/PackImage";

export const metadata = { title: "Dashboard" };

const RANGES = [7, 30, 90];
const COUNTED = { notIn: ["CANCELLED", "RETURNED", "PENDING_PAYMENT"] };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const sp = await searchParams;
  const days = RANGES.includes(Number(sp.days)) ? Number(sp.days) : 30;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - days);

  const [cur, prev, custNow, custPrev, byStatus, orders, recent, low, topRaw] = await Promise.all([
    db.order.aggregate({ where: { createdAt: { gte: start }, status: COUNTED }, _sum: { total: true }, _count: true }),
    db.order.aggregate({ where: { createdAt: { gte: prevStart, lt: start }, status: COUNTED }, _sum: { total: true }, _count: true }),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: start } } }),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: prevStart, lt: start } } }),
    db.order.groupBy({ by: ["status"], _count: true }),
    db.order.findMany({ where: { createdAt: { gte: start }, status: COUNTED }, select: { createdAt: true, total: true } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { _count: { select: { items: true } } } }),
    db.variant.findMany({ where: { stock: { lte: 10 }, product: { active: true } }, include: { product: true }, orderBy: { stock: "asc" }, take: 6 }),
    db.orderItem.groupBy({
      by: ["productId", "name"],
      where: { order: { createdAt: { gte: start }, status: COUNTED } },
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 5,
    }),
  ]);

  const revenue = cur._sum.total ?? 0;
  const prevRevenue = prev._sum.total ?? 0;
  const aov = cur._count ? Math.round(revenue / cur._count) : 0;
  const prevAov = prev._count ? Math.round(prevRevenue / prev._count) : 0;

  // Daily (or weekly for 90d) revenue buckets.
  const bucketDays = days > 30 ? 7 : 1;
  const buckets: { start: Date; value: number }[] = [];
  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + bucketDays)) buckets.push({ start: new Date(d), value: 0 });
  for (const o of orders) {
    const i = Math.min(buckets.length - 1, Math.floor((o.createdAt.getTime() - start.getTime()) / (bucketDays * 86400000)));
    if (i >= 0) buckets[i].value += o.total;
  }
  const fmtDay = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const chart = buckets.map((b) => ({
    label: fmtDay(b.start),
    value: b.value,
    tip: `${bucketDays > 1 ? "Week of " : ""}${fmtDay(b.start)}: ${inr(b.value)}`,
  }));

  const productImages = await db.product.findMany({ where: { id: { in: topRaw.map((t) => t.productId).filter((x): x is string => !!x) } }, select: { id: true, image: true, slug: true } });
  const top = topRaw.map((t) => ({ ...t, p: productImages.find((p) => p.id === t.productId) }));
  const statusCount = Object.fromEntries(byStatus.map((s) => [s.status, s._count]));
  const pipeline = ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

  const kpis = [
    { k: "Revenue", v: inr(revenue), d: delta(revenue, prevRevenue) },
    { k: "Orders", v: String(cur._count), d: delta(cur._count, prev._count) },
    { k: "Avg. order value", v: inr(aov), d: delta(aov, prevAov) },
    { k: "New customers", v: String(custNow), d: delta(custNow, custPrev) },
  ];

  return (
    <>
      <AdminTop title="Dashboard" sub={`Last ${days} days, compared with the ${days} days before`}>
        <div className="pill-btns">
          {RANGES.map((r) => (
            <Link key={r} href={`/admin?days=${r}`} className={`chip ${r === days ? "on" : ""}`} style={{ padding: "8px 14px" }}>
              {r} days
            </Link>
          ))}
        </div>
      </AdminTop>

      <div className="stat-tiles" style={{ marginBottom: 18 }}>
        {kpis.map((t) => (
          <div key={t.k} className="stat panel" style={{ padding: "20px 22px" }}>
            <div className="k" style={{ color: "#5A5048", opacity: 1 }}>
              {t.k}
            </div>
            <div className="v">{t.v}</div>
            <div className="s" style={{ color: t.d.up === null ? "#8A7C6C" : t.d.up ? "#0F5C38" : "#9C1E0B", opacity: 1, fontWeight: 700 }}>
              {t.d.text}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-grid-2" style={{ marginBottom: 18 }}>
        <div className="panel">
          <div className="panel-h">
            <h2>Revenue {bucketDays > 1 ? "by week" : "by day"}</h2>
            <span className="note">Excludes cancelled &amp; unpaid online orders</span>
          </div>
          <BarChart data={chart} format={(n) => (n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k` : `₹${n}`)} />
        </div>
        <div className="panel">
          <div className="panel-h">
            <h2>Orders by status</h2>
            <Link href="/admin/orders" className="link-caps">
              All orders →
            </Link>
          </div>
          <div style={{ display: "grid", gap: 2 }}>
            {pipeline.map((s) => (
              <Link
                key={s}
                href={`/admin/orders?status=${s}`}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 4px", borderBottom: "1px solid rgba(28,25,23,.08)", color: "#1C1917", fontWeight: 600, fontSize: 14 }}
              >
                <span className={`status st-${s}`}>{STATUS_LABEL[s]}</span>
                <span style={{ fontWeight: 800 }}>{statusCount[s] ?? 0}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-grid-2" style={{ marginBottom: 18 }}>
        <div className="panel">
          <div className="panel-h">
            <h2>Recent orders</h2>
            <Link href="/admin/orders" className="link-caps">
              View all →
            </Link>
          </div>
          <OrdersTable orders={recent} base="/admin/orders" />
        </div>
        <div style={{ display: "grid", gap: 18 }}>
          <div className="panel">
            <div className="panel-h">
              <h2>Top sellers</h2>
              <span className="note">Units, last {days} days</span>
            </div>
            {top.length ? (
              top.map((t) => (
                <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(28,25,23,.08)" }}>
                  <div className="thumb-sm">
                    <PackImage src={t.p?.image} name={t.name} />
                  </div>
                  <div style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontWeight: 800 }}>{t._sum.qty}</div>
                </div>
              ))
            ) : (
              <p className="muted">No sales in this period.</p>
            )}
          </div>
          <div className="panel">
            <div className="panel-h">
              <h2>Low stock</h2>
              <Link href="/admin/inventory" className="link-caps">
                Inventory →
              </Link>
            </div>
            {low.length ? (
              low.map((v) => (
                <Link key={v.id} href={`/admin/products/${v.productId}`} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(28,25,23,.08)", color: "#1C1917", fontSize: 14, fontWeight: 600 }}>
                  <span>
                    {v.product.name} · {v.label}
                  </span>
                  <span className={`status ${v.stock === 0 ? "st-CANCELLED" : "st-PLACED"}`}>{v.stock === 0 ? "Out of stock" : `${v.stock} left`}</span>
                </Link>
              ))
            ) : (
              <p className="muted">Everything is well stocked.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function delta(cur: number, prev: number): { text: string; up: boolean | null } {
  if (!prev) return { text: cur ? "New this period" : "No change", up: null };
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return { text: "Same as previous period", up: null };
  return { text: `${pct > 0 ? "▲" : "▼"} ${Math.abs(pct)}% vs previous`, up: pct > 0 };
}
