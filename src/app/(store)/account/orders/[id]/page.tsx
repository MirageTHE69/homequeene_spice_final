import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/account/OrdersTable";
import { EventLog, OrderItems, OrderTotals, ShipTo, Tracker } from "@/components/account/OrderParts";
import { OrderActions } from "@/components/account/OrderActions";

export const metadata: Metadata = { title: "Order details" };
export const dynamic = "force-dynamic";

export default async function MyOrder({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ pay?: string }> }) {
  const { id } = await params;
  const { pay } = await searchParams;
  const user = await requireUser(`/account/orders/${id}`);
  const order = await db.order.findFirst({
    where: { id, userId: user.id },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) notFound();

  const reorderItems = await db.variant.findMany({
    where: { id: { in: order.items.map((i) => i.variantId).filter((x): x is string => !!x) }, stock: { gt: 0 }, product: { active: true } },
    include: { product: true },
  });

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <Link href="/account/orders" className="link-caps">
            ← All orders
          </Link>
          <h2 className="display" style={{ fontWeight: 800, fontSize: 32, letterSpacing: "-.03em", margin: "8px 0 6px" }}>
            Order {order.number}
          </h2>
          <div className="muted" style={{ fontWeight: 600, fontSize: 14 }}>
            Placed {formatDateTime(order.createdAt)} · <StatusBadge s={order.status} />{" "}
            <StatusBadge s={order.paymentStatus} label={`${order.paymentMethod === "COD" ? "Cash on delivery" : "Online"} · ${order.paymentStatus.toLowerCase()}`} />
          </div>
        </div>
        <OrderActions
          orderId={order.id}
          cancellable={["PENDING_PAYMENT", "PLACED", "CONFIRMED"].includes(order.status)}
          reorder={reorderItems.map((v) => ({
            variantId: v.id, productId: v.productId, slug: v.product.slug, name: v.product.name, label: v.label, price: v.price, image: v.product.image, tileBg: v.product.tileBg,
            qty: order.items.find((i) => i.variantId === v.id)?.qty ?? 1,
          }))}
        />
      </div>

      {pay === "failed" && <div className="alert alert-err">Payment didn&rsquo;t go through. Your order is saved — please contact us on +91 8866 911 100 to complete it, or cancel and order again.</div>}
      {pay === "pending" && <div className="alert alert-info">Payment window closed before completing. If money was deducted it will reflect here shortly; otherwise cancel this order and try again.</div>}

      <div className="box">
        <Tracker order={order} />
        {order.trackingNumber && (
          <div className="alert alert-info" style={{ marginTop: 16 }}>
            Shipped with <b>{order.courier ?? "courier"}</b> · Tracking number <b>{order.trackingNumber}</b>
          </div>
        )}
      </div>

      <div className="split" style={{ gap: 16, alignItems: "start" }}>
        <div className="box">
          <div className="box-title">Items</div>
          <OrderItems items={order.items} />
          <OrderTotals order={order} />
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <div className="box">
            <div className="box-title">Delivery address</div>
            <ShipTo order={order} />
            {order.notes && (
              <p className="muted" style={{ fontSize: 14, marginBottom: 0 }}>
                Note: {order.notes}
              </p>
            )}
          </div>
          <div className="box">
            <div className="box-title">History</div>
            <EventLog events={order.events} />
          </div>
        </div>
      </div>
    </div>
  );
}
