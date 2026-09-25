import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings, productInclude, toCard } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopFilters, ShopToolbar } from "@/components/store/ShopFilters";
import { pad2 } from "@/lib/format";

export const metadata: Metadata = { title: "Shop all spices & masalas" };
export const dynamic = "force-dynamic";

const PAGE = 12;
const SIZES = ["50 g", "100 g", "200 g", "500 g", "1 kg"];

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined)) ?? "";
  const cats = one("category").split(",").filter(Boolean);
  const size = one("size");
  const max = Number(one("max")) || 0;
  const q = one("q").trim().toLowerCase();
  const sort = one("sort") || "popular";
  const show = Math.max(PAGE, Number(one("show")) || PAGE);

  const [categories, all, settings] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: { where: { active: true } } } } } }),
    db.product.findMany({ where: { active: true }, include: productInclude }),
    getSettings(),
  ]);

  const allPrices = all.flatMap((p) => p.variants.map((v) => v.price));
  const priceMin = allPrices.length ? Math.min(...allPrices) : 0;
  const priceMax = allPrices.length ? Math.max(...allPrices) : 0;

  let list = all.filter((p) => {
    if (cats.length && !cats.includes(p.category.slug)) return false;
    if (size && !p.variants.some((v) => v.label === size)) return false;
    if (max && !p.variants.some((v) => v.price <= max)) return false;
    if (q && !(`${p.name} ${p.summary} ${p.category.name} ${p.ingredients ?? ""}`.toLowerCase().includes(q))) return false;
    return true;
  });

  const minPrice = (p: (typeof all)[number]) => Math.min(...p.variants.map((v) => v.price));
  list = list.sort((a, b) => {
    switch (sort) {
      case "price-asc": return minPrice(a) - minPrice(b);
      case "price-desc": return minPrice(b) - minPrice(a);
      case "new": return b.createdAt.getTime() - a.createdAt.getTime();
      case "name": return a.name.localeCompare(b.name);
      default: return b.popularity - a.popularity;
    }
  });

  const total = list.length;
  const visible = list.slice(0, show).map(toCard);
  const activeCat = cats.length === 1 ? categories.find((c) => c.slug === cats[0]) : undefined;

  const moreHref = (() => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && v) p.set(k, v);
    p.set("show", String(show + PAGE));
    return `/shop?${p.toString()}`;
  })();

  return (
    <main className="wrap" style={{ paddingTop: 32, paddingBottom: 80 }}>
      <div className="crumbs">
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link>
        {activeCat && <> / {activeCat.name}</>}
      </div>
      <h1 className="display" style={{ fontWeight: 800, fontSize: "clamp(40px,5.6vw,76px)", lineHeight: 0.96, letterSpacing: "-.035em", margin: "0 0 16px" }}>
        {activeCat ? activeCat.name : "All spices & masalas"}
      </h1>
      <p className="lede" style={{ marginBottom: 40 }}>
        {activeCat?.description ? `${activeCat.description} ` : `${all.length} products, every one ground in our own unit. `}
        Free shipping above ₹{settings.freeShippingThreshold}.
      </p>

      <div className="shop-layout">
        <ShopFilters
          categories={categories.map((c) => ({ slug: c.slug, name: c.name, count: pad2(c._count.products) }))}
          sizes={SIZES}
          priceMin={priceMin}
          priceMax={priceMax}
          current={{ cats, size, max: max || priceMax, q }}
        />
        <div>
          <ShopToolbar showing={Math.min(show, total)} total={total} sort={sort} />
          {visible.length ? (
            <div className="grid-fill">
              {visible.map((p) => (
                <ProductCard key={p.id} p={p} badge="category" />
              ))}
            </div>
          ) : (
            <div className="alert alert-info" style={{ padding: 28 }}>
              Nothing matches those filters. <Link href="/shop">Clear all filters</Link>
            </div>
          )}
          {total > show && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 44 }}>
              <Link href={moreHref} scroll={false} className="btn btn-outline" style={{ padding: "16px 44px" }}>
                Load {Math.min(PAGE, total - show)} more
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
