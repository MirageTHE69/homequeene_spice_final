import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { orderWhere } from "@/lib/admin-queries";

const esc = (v: unknown) => {
  const s = v == null ? "" : String(v);
  // Quote everything; neutralise spreadsheet formula injection.
  return `"${(/^[=+\-@]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return new Response("Forbidden", { status: 403 });
  const sp = Object.fromEntries(new URL(req.url).searchParams) as Record<string, string>;
  const orders = await db.order.findMany({ where: orderWhere(sp), orderBy: { createdAt: "desc" }, include: { items: true, user: true } });
  const head = ["Order", "Date", "Customer", "Email", "Phone", "Address", "City", "State", "PIN", "Items", "Subtotal", "Discount", "Coupon", "Shipping", "Total", "Payment method", "Payment status", "Status", "Courier", "Tracking"];
  const rows = orders.map((o) => [
    o.number, o.createdAt.toISOString(), o.shipName, o.user.email, o.shipPhone, [o.shipLine1, o.shipLine2].filter(Boolean).join(", "), o.shipCity, o.shipState, o.shipPincode,
    o.items.map((i) => `${i.name} ${i.variantLabel} x${i.qty}`).join("; "), o.subtotal, o.discount, o.couponCode, o.shipping, o.total,
    o.paymentMethod, o.paymentStatus, o.status, o.courier, o.trackingNumber,
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
