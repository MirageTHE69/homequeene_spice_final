import Link from "next/link";
import { db } from "@/lib/db";
import { AdminTop } from "@/components/admin/AdminShell";

export const metadata = { title: "Recipes" };

export default async function AdminRecipes() {
  const recipes = await db.recipe.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <>
      <AdminTop title="Recipes" sub="The first three published recipes appear on the home page.">
        <Link href="/admin/recipes/new" className="btn btn-red btn-sm">
          + New recipe
        </Link>
      </AdminTop>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Recipe</th>
              <th>Section</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((r) => (
              <tr key={r.id} className="click">
                <td>{r.sortOrder}</td>
                <td>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {r.image && <img src={r.image} alt="" style={{ width: 56, height: 42, objectFit: "cover" }} />}
                    <Link href={`/admin/recipes/${r.id}`}>{r.title}</Link>
                  </div>
                </td>
                <td>{r.tag}</td>
                <td>{r.time}</td>
                <td>{r.published ? <span className="status st-DELIVERED">Published</span> : <span className="status st-CLOSED">Draft</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
