import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { activeProductCount, getFeatured } from "@/lib/catalog";
import { priceRange } from "@/lib/format";
import { MARQUEE, PROMISES } from "@/lib/content";
import { STOCK } from "@/lib/stock";
import { Hero } from "@/components/store/Hero";
import { ProductCard } from "@/components/store/ProductCard";
import { RecipeCard } from "@/components/store/RecipeCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [session, count, bestsellers, categories, recipes, kit] = await Promise.all([
    getSession(),
    activeProductCount(),
    getFeatured(4),
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      take: 4,
      include: { products: { where: { active: true }, include: { variants: true } } },
    }),
    db.recipe.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    db.product.findUnique({ where: { slug: "kitchen-e-bahar" }, include: { variants: true } }),
  ]);
  const user = session ? { name: session.name, role: session.role } : null;
  const kitV = kit?.variants[0];

  return (
    <main>
      <h1 style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        Home Queen Spices — real masala, ground in our own mill in Vadodara
      </h1>
      <Hero user={user} productCount={count} />

      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} style={{ display: "contents" }}>
              <span>{m}</span>
              <span className="gem">◆</span>
            </span>
          ))}
        </div>
      </div>

      <section className="wrap section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Browse the range</div>
            <h2 className="h-section">Pick your shelf</h2>
          </div>
          <Link href="/shop" className="btn btn-outline">
            All {count} products →
          </Link>
        </div>
        <div className="grid-cards">
          {categories.map((c) => {
            const prices = c.products.flatMap((p) => p.variants.map((v) => v.price));
            return (
              <Link key={c.id} href={`/shop?category=${c.slug}`} className="cat-tile" style={{ background: c.bg, color: c.fg }}>
                <div className="pic">
                  <span className="stage">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {c.image && <img src={c.image} alt={c.name} loading="lazy" />}
                  </span>
                </div>
                <div className="meta">
                  <div className="name">{c.name}</div>
                  <div className="sub">
                    {c.products.length} {/kit/i.test(c.name) ? "kits" : "products"} · {priceRange(prices)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Most reordered</div>
            <h2 className="h-section">Everybody buys these twice</h2>
          </div>
        </div>
        <div className="grid-cards">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="promise-panel">
          <div className="section-head" style={{ marginBottom: 36, gap: 32 }}>
            <h2 className="display" style={{ fontWeight: 700, fontSize: "clamp(30px,4vw,50px)", lineHeight: 1.02, letterSpacing: "-.03em", margin: 0, maxWidth: "20ch" }}>
              Five things we control end to end
            </h2>
            <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.55, margin: 0, maxWidth: "44ch", color: "rgba(255,251,244,.92)" }}>
              &ldquo;Jo apno se kare pyaar, wo kaise kare unki health se khilwad.&rdquo; One who loves their family cannot compromise on their health.
            </p>
          </div>
          <div className="promise-grid">
            {PROMISES.map((q) => (
              <div key={q.no} className="promise">
                <div className="no">{q.no}</div>
                <div className="t">{q.title}</div>
                <div className="b">{q.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section split">
        <div className="pad-panel" style={{ minWidth: 0, background: "#FFB703", color: "#1C1917", padding: "48px 42px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="chip-dark" style={{ marginBottom: 26 }}>Since 1987 · Vadodara</div>
          <h2 className="display" style={{ fontWeight: 700, fontSize: "clamp(30px,3.8vw,48px)", lineHeight: 1.02, letterSpacing: "-.03em", margin: "0 0 20px", textWrap: "pretty" }}>
            She left insurance to grind spices properly.
          </h2>
          <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.65, margin: "0 0 30px", maxWidth: "46ch" }}>
            Ravneet Kaur Anand founded RKR Foods in 1987 with one rule: nothing leaves the unit that she would not cook with at home. Thirty-nine years on, every blend is still mixed and ground on that same floor in Gorwa.
          </p>
          <Link href="/about" className="btn btn-dark" style={{ alignSelf: "flex-start" }}>
            Read the full story →
          </Link>
        </div>
        <div className="photo-panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={STOCK.handsGrinding} alt="Whole spices being ground by hand" loading="lazy" />
          <div className="cap">Nothing leaves the unit that we wouldn&rsquo;t cook with at home</div>
        </div>
      </section>

      {kit && kitV && (
        <section className="wrap" style={{ paddingTop: 16 }}>
          <div className="split" style={{ background: "#E4341C", color: "#FFFBF4", gap: 0, alignItems: "center" }}>
            <div className="pad-panel" style={{ minWidth: 0, padding: "52px 44px" }}>
              <div style={{ display: "inline-flex", background: "#FFB703", color: "#1C1917", fontWeight: 700, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", padding: "8px 13px", marginBottom: 24 }}>
                Save {kitV.compareAt ? Math.round((1 - kitV.price / kitV.compareAt) * 100) : 20}%
              </div>
              <h2 className="display" style={{ fontWeight: 800, fontSize: "clamp(32px,4.2vw,54px)", lineHeight: 1, letterSpacing: "-.03em", margin: "0 0 20px" }}>
                Kitchen E Bahar — the whole shelf in one box.
              </h2>
              <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.65, margin: "0 0 28px", maxWidth: "44ch", color: "rgba(255,251,244,.92)" }}>
                Fourteen spices and masalas in a single crate. For a new home, a hostel kitchen, or a wedding gift that actually gets used.
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 30, flexWrap: "wrap" }}>
                <span className="display" style={{ fontWeight: 800, fontSize: 56, lineHeight: 1, color: "#FFB703" }}>
                  ₹{kitV.price.toLocaleString("en-IN")}
                </span>
                {kitV.compareAt && (
                  <span style={{ fontSize: 18, fontWeight: 600, textDecoration: "line-through", opacity: 0.8 }}>₹{kitV.compareAt.toLocaleString("en-IN")}</span>
                )}
              </div>
              <Link href="/product/kitchen-e-bahar" className="btn btn-lg btn-cream">
                Get the kit →
              </Link>
            </div>
            <div style={{ minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 36, minHeight: 420 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={kit.image ?? ""} alt="Kitchen E Bahar kit" loading="lazy" style={{ width: "100%", maxWidth: 520, height: "auto", display: "block", filter: "drop-shadow(0 24px 44px rgba(60,10,0,.38))" }} />
            </div>
          </div>
        </section>
      )}

      <section className="wrap section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Recipes</div>
            <h2 className="h-section">Cook something tonight</h2>
          </div>
          <Link href="/recipes" className="btn btn-outline">
            All recipes →
          </Link>
        </div>
        <div className="grid-cards" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
          {recipes.map((r) => (
            <RecipeCard key={r.id} r={r} />
          ))}
        </div>
      </section>

      <section className="wrap" style={{ padding: "76px var(--gutter) 80px" }}>
        <div className="pad-panel" style={{ background: "#1C1917", color: "#FFFBF4", padding: "52px 44px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 36, flexWrap: "wrap" }}>
          <div style={{ maxWidth: "54ch" }}>
            <div className="eyebrow" style={{ color: "#FFB703", marginBottom: 18 }}>Distributors · Retailers · HoReCa</div>
            <h2 className="display" style={{ fontWeight: 700, fontSize: "clamp(28px,3.6vw,46px)", lineHeight: 1.02, letterSpacing: "-.03em", margin: "0 0 16px" }}>
              Stock a spice brand that makes its own spices.
            </h2>
            <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.65, margin: 0, color: "#B8ADA2" }}>
              Manufacturer-direct margins, display-ready packs, dispatch straight from Vadodara.
            </p>
          </div>
          <Link href="/partner" className="btn btn-lg btn-amber btn-amber-red">
            Become a partner →
          </Link>
        </div>
      </section>
    </main>
  );
}
