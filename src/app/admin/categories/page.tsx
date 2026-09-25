import { db } from "@/lib/db";
import { AdminTop } from "@/components/admin/AdminShell";
import { CategoryEditor } from "@/components/admin/CategoryEditor";

export const metadata = { title: "Categories" };

export default async function Categories() {
  const cats = await db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <>
      <AdminTop title="Categories" sub="The first four appear as the “Pick your shelf” tiles on the home page, in this order." />
      <CategoryEditor
        categories={cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, short: c.short, description: c.description ?? "", bg: c.bg, fg: c.fg, image: c.image ?? "", sortOrder: c.sortOrder, count: c._count.products }))}
      />
    </>
  );
}
