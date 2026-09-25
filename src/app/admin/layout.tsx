import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Home Queen" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [newOrders, lowStock, enquiries, messages] = await Promise.all([
    db.order.count({ where: { status: "PLACED" } }),
    db.variant.count({ where: { stock: { lte: 10 }, product: { active: true } } }),
    db.enquiry.count({ where: { status: "NEW" } }),
    db.message.count({ where: { status: "NEW" } }),
  ]);
  return (
    <AdminShell name={admin.name} counts={{ orders: newOrders, inventory: lowStock, enquiries, messages }}>
      {children}
    </AdminShell>
  );
}
