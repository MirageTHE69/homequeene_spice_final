import { db } from "@/lib/db";
import { AdminTop } from "@/components/admin/AdminShell";
import { CouponEditor } from "@/components/admin/CouponEditor";

export const metadata = { title: "Coupons" };

export default async function Coupons() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <AdminTop title="Coupons" sub="Customers apply these in the cart. Discounts are checked again at checkout." />
      <CouponEditor
        coupons={coupons.map((c) => ({
          id: c.id, code: c.code, description: c.description ?? "", type: c.type, value: c.value, minOrder: c.minOrder, maxDiscount: c.maxDiscount,
          usageLimit: c.usageLimit, used: c.used, active: c.active, expiresAt: c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : "",
        }))}
      />
    </>
  );
}
