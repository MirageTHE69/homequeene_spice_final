import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parseGallery } from "@/lib/format";
import { AdminTop } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteProduct } from "@/components/admin/DeleteProduct";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, categories, sold] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { variants: { orderBy: { sortOrder: "asc" } } } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.orderItem.aggregate({ where: { productId: id }, _sum: { qty: true } }),
  ]);
  if (!p) notFound();

  return (
    <>
      <AdminTop title={p.name} sub={`${sold._sum.qty ?? 0} units sold all-time`}>
        <Link href="/admin/products" className="btn btn-outline btn-sm">
          ← Products
        </Link>
        <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer" className="btn btn-dark btn-sm">
          View in store ↗
        </a>
        <DeleteProduct id={p.id} hasOrders={(sold._sum.qty ?? 0) > 0} />
      </AdminTop>
      <ProductForm
        categories={categories}
        initial={{
          id: p.id, name: p.name, slug: p.slug, categoryId: p.categoryId, summary: p.summary, description: p.description ?? "", badge: p.badge ?? "",
          image: p.image ?? "", gallery: parseGallery(p.gallery), tileBg: p.tileBg, ingredients: p.ingredients ?? "", howToUse: p.howToUse ?? "",
          storage: p.storage ?? "", featured: p.featured, active: p.active,
          variants: p.variants.map((v) => ({ id: v.id, label: v.label, price: v.price, compareAt: v.compareAt, stock: v.stock, sku: v.sku })),
        }}
      />
    </>
  );
}
