"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart, type CartItem } from "@/components/cart/CartProvider";
import { cancelMyOrder } from "@/app/actions/account";

export function OrderActions({ orderId, cancellable, reorder }: { orderId: string; cancellable: boolean; reorder: CartItem[] }) {
  const router = useRouter();
  const { add } = useCart();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {reorder.length > 0 && (
        <button
          className="btn btn-dark btn-sm"
          onClick={() => {
            reorder.forEach(({ qty, ...it }) => add(it, qty));
            router.push("/cart");
          }}
        >
          Order again
        </button>
      )}
      <a className="btn btn-outline btn-sm" href={`/invoice/${orderId}`} target="_blank" rel="noreferrer">
        Invoice
      </a>
      {cancellable && (
        <button
          className="btn btn-sm"
          style={{ border: "2px solid #E4341C", color: "#E4341C", background: "transparent", padding: "8px 14px" }}
          disabled={pending}
          onClick={() => {
            const reason = window.prompt("Cancel this order? Tell us why (optional):");
            if (reason === null) return;
            setErr(null);
            start(async () => {
              const r = await cancelMyOrder(orderId, reason);
              if (!r.ok) setErr(r.error ?? "Could not cancel.");
              else router.refresh();
            });
          }}
        >
          {pending ? "Cancelling…" : "Cancel order"}
        </button>
      )}
      {err && <div className="alert alert-err" style={{ width: "100%" }}>{err}</div>}
    </div>
  );
}
