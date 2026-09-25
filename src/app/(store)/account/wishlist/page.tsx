import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { productInclude, toCard } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { RemoveWish } from "@/components/account/RemoveWish";

export const metadata: Metadata = { title: "Wishlist" };
export const dynamic = "force-dynamic";

export default async function Wishlist() {
  const user = await requireUser("/account/wishlist");
  const rows = await db.wishlistItem.findMany({
    where: { userId: user.id, product: { active: true } },
    include: { product: { include: productInclude } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h2 className="display" style={{ fontWeight: 700, fontSize: 26, letterSpacing: "-.02em", margin: "0 0 16px" }}>
        Wishlist
      </h2>
      {rows.length ? (
        <div className="grid-fill">
          {rows.map((r) => (
            <div key={r.id} style={{ display: "grid", gap: 6 }}>
              <ProductCard p={toCard(r.product)} />
              <RemoveWish productId={r.productId} />
            </div>
          ))}
        </div>
      ) : (
        <div className="box" style={{ textAlign: "center", padding: 40 }}>
          <p className="muted" style={{ marginTop: 0 }}>
            Tap the heart on any product to save it here.
          </p>
          <Link href="/shop" className="btn btn-red">
            Browse spices →
          </Link>
        </div>
      )}
    </div>
  );
}
