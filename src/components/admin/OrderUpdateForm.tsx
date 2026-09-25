"use client";

import { useActionState, useState } from "react";
import { updateOrder } from "@/app/actions/admin";
import { ORDER_STATUSES, STATUS_LABEL } from "@/lib/format";

export function OrderUpdateForm({ order }: { order: { id: string; status: string; paymentStatus: string; courier: string; trackingNumber: string } }) {
  const [state, action, pending] = useActionState(updateOrder, undefined);
  const [status, setStatus] = useState(order.status);
  return (
    <form action={action} className="form-grid">
      <input type="hidden" name="id" value={order.id} />
      <div className="two">
        <div>
          <label className="label">Order status</label>
          <select name="status" className="field" value={status} onChange={(e) => setStatus(e.target.value)}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Payment status</label>
          <select name="paymentStatus" className="field" defaultValue={order.paymentStatus}>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>
      {(status === "SHIPPED" || status === "DELIVERED" || order.trackingNumber) && (
        <div className="two">
          <div>
            <label className="label">Courier</label>
            <input name="courier" className="field" defaultValue={order.courier} placeholder="Delhivery, DTDC, India Post…" />
          </div>
          <div>
            <label className="label">Tracking number</label>
            <input name="trackingNumber" className="field" defaultValue={order.trackingNumber} />
          </div>
        </div>
      )}
      <div>
        <label className="label">Note for the timeline (visible to customer)</label>
        <input name="note" className="field" placeholder="e.g. Packed with a free sample of tea masala" />
      </div>
      {(status === "CANCELLED" || status === "RETURNED") && order.status !== status && (
        <div className="alert alert-info">Stock for every item in this order will be added back to inventory.</div>
      )}
      {state?.error && <div className="alert alert-err">{state.error}</div>}
      {state?.ok && <div className="alert alert-ok">{state.ok}</div>}
      <button className="btn btn-red" disabled={pending}>
        {pending ? "Saving…" : "Save update"}
      </button>
    </form>
  );
}
