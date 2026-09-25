import type { Metadata } from "next";
import { getSettings } from "@/lib/catalog";
import { CartView } from "@/components/store/CartView";

export const metadata: Metadata = { title: "Your cart" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <main className="wrap" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <h1 className="display" style={{ fontWeight: 800, fontSize: "clamp(36px,4.8vw,62px)", lineHeight: 0.98, letterSpacing: "-.035em", margin: "0 0 44px" }}>
        Your cart
      </h1>
      <CartView settings={settings} />
    </main>
  );
}
