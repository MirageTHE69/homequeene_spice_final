"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { deleteAddress, saveAddress, setDefaultAddress } from "@/app/actions/account";
import { STATES } from "@/lib/india";

type A = { id: string; name: string; phone: string; line1: string; line2: string; city: string; state: string; pincode: string; isDefault: boolean };

export function AddressBook({ addresses, defaults }: { addresses: A[]; defaults: { name: string; phone: string } }) {
  const [editing, setEditing] = useState<A | "new" | null>(addresses.length ? null : "new");
  const [pending, start] = useTransition();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(260px,100%),1fr))", gap: 12 }}>
        {addresses.map((a) => (
          <div key={a.id} className="box" style={{ padding: 22, borderColor: a.isDefault ? "#E4341C" : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
              <b>{a.name}</b>
              {a.isDefault && <span className="status st-NEW">Default</span>}
            </div>
            <p style={{ margin: "0 0 14px", lineHeight: 1.6, fontSize: 14, fontWeight: 500 }}>
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}
              <br />
              {a.city}, {a.state} {a.pincode}
              <br />
              {a.phone}
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button className="link-caps" onClick={() => setEditing(a)}>
                Edit
              </button>
              {!a.isDefault && (
                <button className="link-caps" disabled={pending} onClick={() => start(() => setDefaultAddress(a.id))}>
                  Make default
                </button>
              )}
              <button
                className="link-caps"
                style={{ color: "#8A7C6C" }}
                disabled={pending}
                onClick={() => {
                  if (confirm("Delete this address?")) start(() => deleteAddress(a.id));
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {editing === null && (
          <button className="box" onClick={() => setEditing("new")} style={{ borderStyle: "dashed", fontWeight: 800, color: "#E4341C", minHeight: 150 }}>
            + Add a new address
          </button>
        )}
      </div>
      {editing !== null && (
        <AddressForm
          key={editing === "new" ? "new" : editing.id}
          initial={editing === "new" ? { id: "", name: defaults.name, phone: defaults.phone, line1: "", line2: "", city: "", state: "Gujarat", pincode: "", isDefault: addresses.length === 0 } : editing}
          onDone={() => setEditing(null)}
          canCancel={addresses.length > 0}
        />
      )}
    </div>
  );
}

function AddressForm({ initial, onDone, canCancel }: { initial: A; onDone: () => void; canCancel: boolean }) {
  const [state, action, pending] = useActionState(saveAddress, undefined);
  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);
  return (
    <form action={action} className="box form-grid">
      <div className="box-title" style={{ marginBottom: 4 }}>
        {initial.id ? "Edit address" : "New address"}
      </div>
      <input type="hidden" name="id" value={initial.id} />
      <div className="two">
        <input name="name" className="field" placeholder="Full name" defaultValue={initial.name} required />
        <input name="phone" className="field" placeholder="Mobile number" defaultValue={initial.phone} required inputMode="tel" />
      </div>
      <input name="line1" className="field" placeholder="House no., building, street" defaultValue={initial.line1} required />
      <input name="line2" className="field" placeholder="Area, landmark (optional)" defaultValue={initial.line2} />
      <div className="two">
        <input name="city" className="field" placeholder="City" defaultValue={initial.city} required />
        <input name="pincode" className="field" placeholder="PIN code" defaultValue={initial.pincode} required inputMode="numeric" maxLength={6} />
      </div>
      <select name="state" className="field" defaultValue={initial.state} aria-label="State">
        {STATES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <label className="check-row" style={{ fontSize: 14 }}>
        <input type="checkbox" name="isDefault" defaultChecked={initial.isDefault} /> Use as my default address
      </label>
      {state?.error && <div className="alert alert-err">{state.error}</div>}
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-red" disabled={pending}>
          {pending ? "Saving…" : "Save address"}
        </button>
        {canCancel && (
          <button type="button" className="btn btn-outline" onClick={onDone}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
