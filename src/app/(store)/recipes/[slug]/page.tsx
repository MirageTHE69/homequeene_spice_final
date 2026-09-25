import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { productInclude, toCard } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { RecipeCard } from "@/components/store/RecipeCard";

export const dynamic = "force-dynamic";
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const r = await db.recipe.findUnique({ where: { slug } });
  return r ? { title: r.title, description: r.summary, openGraph: { images: r.image ? [r.image] : [] } } : { title: "Recipe not found" };
}

export default async function RecipePage({ params }: { params: Params }) {
  const { slug } = await params;
  const r = await db.recipe.findUnique({ where: { slug } });
  if (!r || !r.published) notFound();

  const slugs = r.products.split(",").map((s) => s.trim()).filter(Boolean);
  const [products, more] = await Promise.all([
    db.product.findMany({ where: { slug: { in: slugs }, active: true }, include: productInclude }),
    db.recipe.findMany({ where: { published: true, id: { not: r.id } }, orderBy: { sortOrder: "asc" }, take: 3 }),
  ]);
  const ingredients = r.ingredients.split("\n").map((s) => s.trim()).filter(Boolean);
  const steps = r.steps.split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <main>
      <section style={{ background: "#1C1917", color: "#FFFBF4" }}>
        <div className="wrap split" style={{ paddingTop: 56, paddingBottom: 56, gap: 48, alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <div className="crumbs">
              <Link href="/recipes" style={{ color: "#B8ADA2" }}>
                Recipes
              </Link>{" "}
              / <span style={{ color: "#B8ADA2" }}>{r.tag}</span>
            </div>
            <div className="eyebrow" style={{ color: "#FFB703" }}>
              {r.tag} · {r.time}
            </div>
            <h1 className="display" style={{ fontWeight: 800, fontSize: "clamp(36px,5vw,68px)", lineHeight: 0.96, letterSpacing: "-.04em", margin: "0 0 20px" }}>
              {r.title}
            </h1>
            <p style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.6, color: "#B8ADA2", margin: 0, maxWidth: "46ch" }}>{r.summary}</p>
          </div>
          <div className="photo-panel" style={{ minHeight: 360 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {r.image && <img src={r.image} alt={r.title} />}
          </div>
        </div>
      </section>

      <section className="wrap recipe-body" style={{ paddingTop: 64, paddingBottom: 40 }}>
        <div className="pad-panel" style={{ background: "#FFF0D4", padding: "32px 30px" }}>
          <div className="eyebrow">You&rsquo;ll need</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
            {ingredients.map((i) => (
              <li key={i} style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.45, paddingLeft: 18, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, top: 7, width: 7, height: 7, background: "#E4341C" }} />
                {i}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow">Method</div>
          <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {steps.map((s, i) => (
              <li key={i} className="tl-row" style={{ gridTemplateColumns: "56px minmax(0,1fr)", gap: 18, padding: "22px 0" }}>
                <div className="y">{String(i + 1).padStart(2, "0")}</div>
                <div className="b" style={{ fontSize: 17, color: "#1C1917" }}>
                  {s}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {products.length > 0 && (
        <section className="wrap" style={{ paddingTop: 40 }}>
          <h2 className="h-section" style={{ fontSize: "clamp(28px,3.6vw,44px)", marginBottom: 26 }}>
            Spices in this recipe
          </h2>
          <div className="grid-fill">
            {products.map((p) => (
              <ProductCard key={p.id} p={toCard(p)} />
            ))}
          </div>
        </section>
      )}

      <section className="wrap" style={{ paddingTop: 76, paddingBottom: 80 }}>
        <div className="section-head">
          <h2 className="h-section" style={{ fontSize: "clamp(28px,3.6vw,44px)" }}>
            Cook something else
          </h2>
          <Link href="/recipes" className="btn btn-outline">
            All recipes →
          </Link>
        </div>
        <div className="grid-cards" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))" }}>
          {more.map((m) => (
            <RecipeCard key={m.id} r={m} />
          ))}
        </div>
      </section>
    </main>
  );
}
