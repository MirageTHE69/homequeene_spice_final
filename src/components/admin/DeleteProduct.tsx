"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/actions/admin";

export function DeleteProduct({ id, hasOrders }: { id: string; hasOrders: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="btn btn-sm"
      style={{ border: "2px solid #E4341C", color: "#E4341C", background: "transparent", padding: "8px 14px" }}
      disabled={pending}
      onClick={() => {
        const msg = hasOrders
          ? "This product appears in past orders, so it will be hidden from the store rather than deleted. Continue?"
          : "Delete this product permanently?";
        if (confirm(msg)) start(() => deleteProduct(id));
      }}
    >
      {hasOrders ? "Archive" : "Delete"}
    </button>
  );
}
