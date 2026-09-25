import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings, productInclude, toCard } from "@/lib/catalog";
import { parseGallery } from "@/lib/format";
import { ProductGallery } from "@/components/store/ProductGallery";
import { BuyBox } from "@/components/store/BuyBox";
import { ProductCard } from "@/components/store/ProductCard";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug } });
  if (!p) return { title: "Product not found" };
  return { title: p.name, description: p.summary, openGraph: { images: p.image ? [p.image] : [] } };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug }, include: productInclude });
  if (!p || !p.active) notFound();

  const [user, settings, related] = await Promise.all([
    getCurrentUser(),
    getSettings(),
    db.product.findMany({
      where: { active: true, id: { not: p.id } },
      include: productInclude,
      orderBy: { popularity: "desc" },
      take: 12,
    }),
  ]);
  // Same-category products first, then bestsellers.
  const goesWith = [...related.filter((r) => r.categoryId === p.categoryId), ...related.filter((r) => r.categoryId !== p.categoryId)].slice(0, 4).map(toCard);
  const wished = user ? !!(await db.wishlistItem.findUnique({ where: { userId_productId: { userId: user.id, productId: p.id } } })) : false;

  const images = [p.image, ...parseGallery(p.gallery)].filter((x): x is string => !!x);
  const inStock = p.variants.some((v) => v.stock > 0);

  const accordions = [
    { title: "Ingredients", body: p.ingredients },
    { title: "How to use", body: p.howToUse },
    { title: "Storage & shelf life", body: p.storage },
    {
      title: "Shipping & returns",
      body: `Dispatched within 24 hours from Vadodara. Free shipping above ₹${settings.freeShippingThreshold}. Damaged or wrong items replaced free.`,
    },
  ].filter((a) => a.body);

  return (
    <main className="wrap" style={{ paddingTop: 32, paddingBottom: 80 }}>
      <div className="crumbs" style={{ marginBottom: 26 }}>
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / <Link href={`/shop?category=${p.category.slug}`}>{p.category.name}</Link> / {p.name}
      </div>
      <div className="pdp">
        <ProductGallery images={images} name={p.name} tileBg={p.tileBg} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {inStock ? <span className="tag-green">In stock</span> : <span className="tag-red">Out of stock</span>}
            <Link href={`/shop?category=${p.category.slug}`} className="tag-line">
              {p.category.name}
            </Link>
            {p.badge && <span className="tag-line">{p.badge}</span>}
          </div>
          <h1 className="display" style={{ fontWeight: 800, fontSize: "clamp(38px,5vw,66px)", lineHeight: 0.96, letterSpacing: "-.035em", margin: "0 0 18px" }}>
            {p.name}
          </h1>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.65, color: "#5A5048", margin: "0 0 30px", maxWidth: "48ch" }}>{p.summary}</p>

          <BuyBox
            product={{ id: p.id, slug: p.slug, name: p.name, image: p.image, tileBg: p.tileBg }}
            variants={p.variants.map((v) => ({ id: v.id, label: v.label, price: v.price, compareAt: v.compareAt, stock: v.stock }))}
            loggedIn={!!user}
            wished={wished}
          />

          <div className="perks" style={{ marginBottom: 34 }}>
            <div>Free shipping above ₹{settings.freeShippingThreshold}</div>
            <div>Dispatch in 24 hours</div>
            <div>
              Call <a href="tel:+918866911100" style={{ color: "inherit" }}>+91 8866 911 100</a>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(28,25,23,.16)" }}>
            {accordions.map((a, i) => (
              <details key={a.title} className="acc" open={i === 0}>
                <summary>
                  <span className="t">{a.title}</span>
                  <span className="pm" aria-hidden>
                    +
                  </span>
                </summary>
                <div className="b">{a.body}</div>
              </details>
            ))}
          </div>
          {p.description && (
            <div style={{ marginTop: 24, fontSize: 16, lineHeight: 1.7, color: "#5A5048", whiteSpace: "pre-line" }}>{p.description}</div>
          )}
        </div>
      </div>

      {goesWith.length > 0 && (
        <div style={{ marginTop: 72 }}>
          <h2 className="display" style={{ fontWeight: 700, fontSize: "clamp(28px,3.6vw,44px)", lineHeight: 1, letterSpacing: "-.03em", margin: "0 0 26px" }}>
            Goes with
          </h2>
          <div className="grid-cards">
            {goesWith.map((g) => (
              <ProductCard key={g.id} p={g} badge="none" />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
