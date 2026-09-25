"use client";

import { useTransition } from "react";
import { setUserBlocked, setUserRole } from "@/app/actions/admin";

export function CustomerActions({ id, blocked, role }: { id: string; blocked: boolean; role: string }) {
  const [pending, start] = useTransition();
  return (
    <>
      <button
        className="btn btn-outline btn-sm"
        disabled={pending}
        onClick={() => {
          const next = role === "ADMIN" ? "CUSTOMER" : "ADMIN";
          if (confirm(next === "ADMIN" ? "Give this person full admin access?" : "Remove admin access?")) start(() => setUserRole(id, next));
        }}
      >
        {role === "ADMIN" ? "Remove admin" : "Make admin"}
      </button>
      <button
        className="btn btn-sm"
        style={{ border: "2px solid #E4341C", color: blocked ? "#FFFBF4" : "#E4341C", background: blocked ? "#E4341C" : "transparent", padding: "8px 14px" }}
        disabled={pending}
        onClick={() => {
          if (confirm(blocked ? "Unblock this account?" : "Block this account? They won't be able to log in or order.")) start(() => setUserBlocked(id, !blocked));
        }}
      >
        {blocked ? "Unblock" : "Block"}
      </button>
    </>
  );
}
