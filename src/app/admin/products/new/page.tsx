import Link from "next/link";
import { db } from "@/lib/db";
import { AdminTop } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "New product" };

export default async function NewProduct() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <AdminTop title="New product">
        <Link href="/admin/products" className="btn btn-outline btn-sm">
          ← Products
        </Link>
      </AdminTop>
      <ProductForm
        categories={categories}
        initial={{
          name: "", slug: "", categoryId: categories[0]?.id ?? "", summary: "", description: "", badge: "", image: "", gallery: [], tileBg: "#FFF0D4",
          ingredients: "", howToUse: "", storage: "Best within 12 months of packing. Keep the pack sealed, away from heat and direct sunlight.",
          featured: false, active: true, variants: [{ label: "100 g", price: 50, compareAt: 60, stock: 100, sku: "" }],
        }}
      />
    </>
  );
}
