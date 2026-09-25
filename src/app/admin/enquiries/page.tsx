import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { AdminTop } from "@/components/admin/AdminShell";
import { StatusSelect } from "@/components/admin/StatusSelect";

export const metadata = { title: "Partner enquiries" };

export default async function Enquiries() {
  const rows = await db.enquiry.findMany({ orderBy: [{ status: "desc" }, { createdAt: "desc" }] });
  return (
    <>
      <AdminTop title="Partner enquiries" sub="From the Partner page form. Promise on the site: a reply within one working day." />
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Received</th>
              <th>Name &amp; firm</th>
              <th>Type</th>
              <th>City</th>
              <th>Phone</th>
              <th>Expected volume</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(e.createdAt)}</td>
                <td>
                  <b>{e.name}</b>
                  <div style={{ fontSize: 12, color: "#7A6E62" }}>{e.firm}</div>
                </td>
                <td>{e.type}</td>
                <td>{e.city}</td>
                <td>
                  <a href={`tel:${e.phone.replace(/\s/g, "")}`}>{e.phone}</a>
                </td>
                <td style={{ maxWidth: 320, fontSize: 13 }}>{e.volume || "—"}</td>
                <td>
                  <StatusSelect kind="enquiry" id={e.id} value={e.status} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#8A7C6C" }}>
                  No enquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
