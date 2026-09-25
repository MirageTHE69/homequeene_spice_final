import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { RECIPE_TAGS } from "@/lib/content";
import { RecipeCard } from "@/components/store/RecipeCard";

export const metadata: Metadata = { title: "Recipes & kitchen notes" };
export const dynamic = "force-dynamic";

export default async function RecipesPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams;
  const recipes = await db.recipe.findMany({ where: { published: true, ...(tag ? { tag } : {}) }, orderBy: { sortOrder: "asc" } });

  return (
    <main>
      <section style={{ background: "#E4341C", color: "#FFFBF4" }}>
        <div className="wrap" style={{ paddingTop: 80, paddingBottom: 72 }}>
          <div className="eyebrow" style={{ color: "#FFB703", letterSpacing: ".16em", marginBottom: 24 }}>
            Recipes &amp; kitchen notes
          </div>
          <h1 className="display" style={{ fontWeight: 800, fontSize: "clamp(40px,5.6vw,78px)", lineHeight: 0.96, letterSpacing: "-.04em", margin: "0 0 20px", maxWidth: "22ch" }}>
            Cook with the masala, not around it.
          </h1>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.7, margin: 0, maxWidth: "54ch", color: "rgba(255,251,244,.92)" }}>
            Short, tested recipes built on our own blends — plus notes on how to store, roast and actually taste a spice.
          </p>
        </div>
      </section>
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="chips" style={{ marginBottom: 40 }}>
          <Link href="/recipes" scroll={false} className={`chip ${!tag ? "on" : ""}`}>
            All
          </Link>
          {RECIPE_TAGS.map((t) => (
            <Link key={t} href={`/recipes?tag=${encodeURIComponent(t)}`} scroll={false} className={`chip ${tag === t ? "on" : ""}`}>
              {t}
            </Link>
          ))}
        </div>
        {recipes.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(280px,100%),1fr))", gap: 16 }}>
            {recipes.map((r) => (
              <RecipeCard key={r.id} r={r} withSummary />
            ))}
          </div>
        ) : (
          <div className="alert alert-info">No recipes in this section yet.</div>
        )}
      </div>
    </main>
  );
}
