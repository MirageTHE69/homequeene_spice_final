"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { deleteCoupon, saveCoupon } from "@/app/actions/admin";

type C = { id: string; code: string; description: string; type: string; value: number; minOrder: number; maxDiscount: number | null; usageLimit: number | null; used: number; active: boolean; expiresAt: string };

export function CouponEditor({ coupons }: { coupons: C[] }) {
  const [edit, setEdit] = useState<C | null>(null);
  const [pending, start] = useTransition();
  const blank: C = { id: "", code: "", description: "", type: "PERCENT", value: 10, minOrder: 0, maxDiscount: null, usageLimit: null, used: 0, active: true, expiresAt: "" };
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="admin-grid-2">
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Min. order</th>
              <th>Used</th>
              <th>Expires</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const expired = c.expiresAt && c.expiresAt < today;
              return (
                <tr key={c.id}>
                  <td>
                    <b style={{ letterSpacing: ".04em" }}>{c.code}</b>
                    {c.description && <div style={{ fontSize: 12, color: "#8A7C6C" }}>{c.description}</div>}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {c.type === "PERCENT" ? `${c.value}%` : `₹${c.value}`}
                    {c.maxDiscount ? <div style={{ fontSize: 12, color: "#8A7C6C" }}>max ₹{c.maxDiscount}</div> : null}
                  </td>
                  <td>₹{c.minOrder}</td>
                  <td>
                    {c.used}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td>{c.expiresAt || "—"}</td>
                  <td>{!c.active ? <span className="status st-CLOSED">Off</span> : expired ? <span className="status st-CANCELLED">Expired</span> : <span className="status st-DELIVERED">Active</span>}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="link-caps" onClick={() => setEdit(c)}>
                      Edit
                    </button>
                    <button
                      className="link-caps"
                      style={{ color: "#8A7C6C", marginLeft: 10 }}
                      disabled={pending}
                      onClick={() => confirm(`Delete ${c.code}?`) && start(() => deleteCoupon(c.id))}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#8A7C6C" }}>
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <CouponForm key={edit?.id ?? "new"} initial={edit ?? blank} onDone={() => setEdit(null)} />
    </div>
  );
}

function CouponForm({ initial, onDone }: { initial: C; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveCoupon, undefined);
  const [type, setType] = useState(initial.type);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!state?.ok) return;
    if (initial.id) onDone();
    else ref.current?.reset();
  }, [state, initial.id, onDone]);
  return (
    <form ref={ref} action={action} className="panel form-grid">
      <div className="panel-h" style={{ marginBottom: 4 }}>
        <h2>{initial.id ? `Edit ${initial.code}` : "New coupon"}</h2>
        {initial.id && (
          <button type="button" className="link-caps" onClick={onDone}>
            Cancel
          </button>
        )}
      </div>
      <input type="hidden" name="id" value={initial.id} />
      <div className="two">
        <div>
          <label className="label">Code</label>
          <input name="code" className="field" defaultValue={initial.code} required style={{ textTransform: "uppercase" }} />
        </div>
        <div>
          <label className="label">Type</label>
          <select name="type" className="field" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="PERCENT">% off</option>
            <option value="FLAT">₹ off</option>
          </select>
        </div>
      </div>
      <div className="two">
        <div>
          <label className="label">{type === "PERCENT" ? "Percent off" : "Rupees off"}</label>
          <input name="value" type="number" min={1} className="field" defaultValue={initial.value} required />
        </div>
        <div>
          <label className="label">Min. order ₹</label>
          <input name="minOrder" type="number" min={0} className="field" defaultValue={initial.minOrder} />
        </div>
      </div>
      <div className="two">
        <div>
          <label className="label">Max. discount ₹ (optional)</label>
          <input name="maxDiscount" type="number" min={0} className="field" defaultValue={initial.maxDiscount ?? ""} />
        </div>
        <div>
          <label className="label">Usage limit (optional)</label>
          <input name="usageLimit" type="number" min={0} className="field" defaultValue={initial.usageLimit ?? ""} />
        </div>
      </div>
      <div className="two">
        <div>
          <label className="label">Expires on (optional)</label>
          <input name="expiresAt" type="date" className="field" defaultValue={initial.expiresAt} />
        </div>
        <label className="check-row" style={{ alignSelf: "end", paddingBottom: 14 }}>
          <input type="checkbox" name="active" defaultChecked={initial.active} /> Active
        </label>
      </div>
      <div>
        <label className="label">Description shown to customer</label>
        <input name="description" className="field" defaultValue={initial.description} placeholder="10% off your first order" />
      </div>
      {state?.error && <div className="alert alert-err">{state.error}</div>}
      {state?.ok && <div className="alert alert-ok">{state.ok}</div>}
      <button className="btn btn-red" disabled={pending}>
        {pending ? "Saving…" : initial.id ? "Save coupon" : "Create coupon"}
      </button>
    </form>
  );
}
