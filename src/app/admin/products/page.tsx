import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { inr, priceRange } from "@/lib/format";
import { AdminTop } from "@/components/admin/AdminShell";
import { PackImage } from "@/components/PackImage";
import { ActiveToggle } from "@/components/admin/ActiveToggle";

export const metadata = { title: "Products" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const where: Prisma.ProductWhereInput = {};
  if (sp.q) where.name = { contains: sp.q };
  if (sp.category) where.categoryId = sp.category;
  if (sp.show === "hidden") where.active = false;
  if (sp.show === "live") where.active = true;
  const [products, categories] = await Promise.all([
    db.product.findMany({ where, include: { category: true, variants: { orderBy: { sortOrder: "asc" } } }, orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }] }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <>
      <AdminTop title="Products" sub={`${products.length} products`}>
        <Link href="/admin/products/new" className="btn btn-red btn-sm">
          + Add product
        </Link>
      </AdminTop>
      <form className="toolbar" method="get">
        <input name="q" className="field" placeholder="Search by name" defaultValue={sp.q} />
        <select name="category" className="field" defaultValue={sp.category ?? ""}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="show" className="field" defaultValue={sp.show ?? ""}>
          <option value="">Live &amp; hidden</option>
          <option value="live">Live only</option>
          <option value="hidden">Hidden only</option>
        </select>
        <button className="btn btn-dark btn-sm">Filter</button>
      </form>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Pack sizes</th>
              <th>Price</th>
              <th className="num">Stock</th>
              <th>Featured</th>
              <th>Live</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = p.variants.reduce((a, v) => a + v.stock, 0);
              const lowest = Math.min(...p.variants.map((v) => v.stock));
              return (
                <tr key={p.id} className="click">
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="thumb-sm" style={{ background: p.tileBg }}>
                        <PackImage src={p.image} name={p.name} />
                      </div>
                      <div>
                        <Link href={`/admin/products/${p.id}`}>{p.name}</Link>
                        <div style={{ fontSize: 12, color: "#8A7C6C" }}>/{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category.name}</td>
                  <td>{p.variants.map((v) => v.label).join(", ")}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{p.variants.length > 1 ? priceRange(p.variants.map((v) => v.price)) : inr(p.variants[0]?.price ?? 0)}</td>
                  <td className="num">
                    <span className={`status ${lowest === 0 ? "st-CANCELLED" : lowest <= 10 ? "st-PLACED" : "st-DELIVERED"}`}>{stock}</span>
                  </td>
                  <td>{p.featured ? "★ Bestseller" : "—"}</td>
                  <td>
                    <ActiveToggle id={p.id} active={p.active} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
