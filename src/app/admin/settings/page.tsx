import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { razorpayEnabled } from "@/lib/razorpay";
import { AdminTop } from "@/components/admin/AdminShell";
import { ActionForm } from "@/components/store/ActionForm";
import { createAdminUser, saveSettings } from "@/app/actions/admin";

export const metadata = { title: "Settings" };

export default async function Settings() {
  const [s, admins] = await Promise.all([getSettings(), db.user.findMany({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } })]);
  const rzp = razorpayEnabled();
  return (
    <>
      <AdminTop title="Settings" />
      <div className="admin-grid-2">
        <div style={{ display: "grid", gap: 18 }}>
          <div className="panel">
            <div className="panel-h">
              <h2>Shipping &amp; charges</h2>
            </div>
            <ActionForm action={saveSettings} resetOnSuccess={false} submitLabel="Save settings" pendingLabel="Saving…">
              <div className="two">
                <div>
                  <label className="label">Free shipping above ₹</label>
                  <input name="freeShippingThreshold" type="number" min={0} className="field" defaultValue={s.freeShippingThreshold} />
                </div>
                <div>
                  <label className="label">Shipping fee below that ₹</label>
                  <input name="shippingFee" type="number" min={0} className="field" defaultValue={s.shippingFee} />
                </div>
              </div>
              <div>
                <label className="label">Cash-on-delivery fee ₹ (0 for none)</label>
                <input name="codFee" type="number" min={0} className="field" defaultValue={s.codFee} />
              </div>
            </ActionForm>
          </div>
          <div className="panel">
            <div className="panel-h">
              <h2>Online payments</h2>
              <span className={`status ${rzp ? "st-DELIVERED" : "st-PLACED"}`}>{rzp ? "Razorpay connected" : "Not connected"}</span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.6, fontSize: 14 }}>
              {rzp
                ? "Customers can pay by UPI, cards, netbanking and wallets through Razorpay."
                : "Only Cash on Delivery is offered right now. To accept UPI and cards, add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the server's environment (.env) and restart the site."}
            </p>
          </div>
        </div>
        <div style={{ display: "grid", gap: 18 }}>
          <div className="panel">
            <div className="panel-h">
              <h2>Admin users</h2>
            </div>
            {admins.map((a) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(28,25,23,.08)", fontSize: 14 }}>
                <Link href={`/admin/customers/${a.id}`} style={{ fontWeight: 700, color: "#1C1917" }}>
                  {a.name}
                </Link>
                <span className="muted">{a.email}</span>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <ActionForm action={createAdminUser} submitLabel="Add admin" submitClass="btn btn-dark btn-sm" pendingLabel="Adding…">
                <input name="name" className="field" placeholder="Name" required />
                <input name="email" type="email" className="field" placeholder="Email" required />
                <input name="password" type="password" className="field" placeholder="Temporary password (8+ characters)" required minLength={8} />
              </ActionForm>
            </div>
          </div>
          <div className="panel">
            <div className="panel-h">
              <h2>Your password</h2>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 14 }}>Change your own password from your account page.</p>
            <Link href="/account/profile" className="link-caps">
              Profile &amp; password →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
