import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/catalog";
import { razorpayEnabled } from "@/lib/razorpay";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const [addresses, settings] = await Promise.all([
    db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }),
    getSettings(),
  ]);

  return (
    <main className="wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div className="crumbs">
        <Link href="/cart">Cart</Link> / Checkout
      </div>
      <h1 className="display" style={{ fontWeight: 800, fontSize: "clamp(36px,4.8vw,62px)", lineHeight: 0.98, letterSpacing: "-.035em", margin: "0 0 36px" }}>
        Checkout
      </h1>
      <CheckoutForm
        user={{ name: user.name, phone: user.phone ?? "" }}
        addresses={addresses.map((a) => ({ id: a.id, name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pincode: a.pincode, isDefault: a.isDefault }))}
        settings={settings}
        onlineEnabled={razorpayEnabled()}
      />
    </main>
  );
}
