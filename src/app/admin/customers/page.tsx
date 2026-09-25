import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatDate, inr } from "@/lib/format";
import { AdminTop } from "@/components/admin/AdminShell";
import { Pager } from "@/components/admin/Pager";

export const metadata = { title: "Customers" };
const PER = 30;

export default async function Customers({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.UserWhereInput = {};
  if (sp.role === "ADMIN" || sp.role === "CUSTOMER") where.role = sp.role;
  if (sp.q) where.OR = [{ name: { contains: sp.q } }, { email: { contains: sp.q.toLowerCase() } }, { phone: { contains: sp.q } }];

  const [users, total] = await Promise.all([
    db.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER, take: PER }),
    db.user.count({ where }),
  ]);
  const stats = await db.order.groupBy({
    by: ["userId"],
    where: { userId: { in: users.map((u) => u.id) }, status: { notIn: ["CANCELLED", "RETURNED", "PENDING_PAYMENT"] } },
    _sum: { total: true },
    _count: true,
    _max: { createdAt: true },
  });
  const byUser = new Map(stats.map((s) => [s.userId, s]));
  const qs = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "page") as [string, string][]).toString();

  return (
    <>
      <AdminTop title="Customers" sub={`${total} accounts`} />
      <form className="toolbar" method="get">
        <input name="q" className="field" placeholder="Name, email or phone" defaultValue={sp.q} style={{ minWidth: 240 }} />
        <select name="role" className="field" defaultValue={sp.role ?? ""}>
          <option value="">Everyone</option>
          <option value="CUSTOMER">Customers</option>
          <option value="ADMIN">Admins</option>
        </select>
        <button className="btn btn-dark btn-sm">Filter</button>
      </form>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
              <th className="num">Orders</th>
              <th className="num">Spent</th>
              <th>Last order</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const s = byUser.get(u.id);
              return (
                <tr key={u.id} className="click">
                  <td>
                    <Link href={`/admin/customers/${u.id}`}>{u.name}</Link>{" "}
                    {u.role === "ADMIN" && <span className="status st-SHIPPED">Admin</span>} {u.blocked && <span className="status st-CANCELLED">Blocked</span>}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone ?? "—"}</td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td className="num">{s?._count ?? 0}</td>
                  <td className="num" style={{ fontWeight: 800 }}>
                    {inr(s?._sum.total ?? 0)}
                  </td>
                  <td>{s?._max.createdAt ? formatDate(s._max.createdAt) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pager page={page} total={total} per={PER} base="/admin/customers" qs={qs} />
    </>
  );
}
