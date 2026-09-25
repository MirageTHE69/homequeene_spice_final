import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminTop } from "@/components/admin/AdminShell";
import { RecipeForm } from "@/components/admin/RecipeForm";

export const metadata = { title: "Recipe" };

export default async function RecipeEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const [r, products, count] = await Promise.all([
    isNew ? null : db.recipe.findUnique({ where: { id } }),
    db.product.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { slug: true, name: true } }),
    db.recipe.count(),
  ]);
  if (!isNew && !r) notFound();

  return (
    <>
      <AdminTop title={r ? r.title : "New recipe"}>
        <Link href="/admin/recipes" className="btn btn-outline btn-sm">
          ← Recipes
        </Link>
        {r && (
          <a href={`/recipes/${r.slug}`} target="_blank" rel="noreferrer" className="btn btn-dark btn-sm">
            View ↗
          </a>
        )}
      </AdminTop>
      <RecipeForm
        products={products}
        initial={{
          id: r?.id ?? "", title: r?.title ?? "", slug: r?.slug ?? "", tag: r?.tag ?? "Everyday sabzi", time: r?.time ?? "30 min", summary: r?.summary ?? "",
          image: r?.image ?? "", ingredients: r?.ingredients ?? "", steps: r?.steps ?? "", products: r?.products ?? "", published: r?.published ?? true, sortOrder: r?.sortOrder ?? count,
        }}
      />
    </>
  );
}
