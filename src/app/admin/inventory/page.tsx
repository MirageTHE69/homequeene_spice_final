import Link from "next/link";
import { db } from "@/lib/db";
import { inr } from "@/lib/format";
import { AdminTop } from "@/components/admin/AdminShell";
import { StockInput } from "@/components/admin/StockInput";

export const metadata = { title: "Inventory" };

export default async function Inventory({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  const variants = await db.variant.findMany({
    where: { product: { active: true }, ...(filter === "low" ? { stock: { lte: 10 } } : filter === "out" ? { stock: 0 } : {}) },
    include: { product: { include: { category: true } } },
    orderBy: [{ stock: "asc" }, { product: { name: "asc" } }],
  });
  const value = variants.reduce((a, v) => a + v.stock * v.price, 0);

  return (
    <>
      <AdminTop title="Inventory" sub={`${variants.length} SKUs · stock value ${inr(value)} at selling price`}>
        <div className="pill-btns">
          {[
            ["", "All"],
            ["low", "Low (≤10)"],
            ["out", "Out of stock"],
          ].map(([k, l]) => (
            <Link key={k} href={k ? `/admin/inventory?filter=${k}` : "/admin/inventory"} className={`chip ${(filter ?? "") === k ? "on" : ""}`} style={{ padding: "8px 14px" }}>
              {l}
            </Link>
          ))}
        </div>
      </AdminTop>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Product</th>
              <th>Pack</th>
              <th>SKU</th>
              <th>Category</th>
              <th className="num">Price</th>
              <th>Status</th>
              <th>Stock (edit &amp; press Enter)</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id}>
                <td>
                  <Link href={`/admin/products/${v.productId}`}>{v.product.name}</Link>
                </td>
                <td>{v.label}</td>
                <td style={{ fontSize: 12, color: "#7A6E62" }}>{v.sku}</td>
                <td>{v.product.category.name}</td>
                <td className="num">{inr(v.price)}</td>
                <td>
                  <span className={`status ${v.stock === 0 ? "st-CANCELLED" : v.stock <= 10 ? "st-PLACED" : "st-DELIVERED"}`}>{v.stock === 0 ? "Out" : v.stock <= 10 ? "Low" : "OK"}</span>
                </td>
                <td>
                  <StockInput id={v.id} stock={v.stock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
