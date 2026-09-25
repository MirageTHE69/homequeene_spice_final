"use client";

import { useTransition } from "react";
import { setEnquiryStatus, setMessageStatus } from "@/app/actions/admin";

const OPTIONS = {
  enquiry: [
    ["NEW", "New"],
    ["CONTACTED", "Contacted"],
    ["CLOSED", "Closed"],
  ],
  message: [
    ["NEW", "New"],
    ["REPLIED", "Replied"],
    ["CLOSED", "Closed"],
  ],
} as const;

export function StatusSelect({ kind, id, value }: { kind: "enquiry" | "message"; id: string; value: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      className={`status st-${value}`}
      style={{ border: 0, cursor: "pointer", opacity: pending ? 0.5 : 1 }}
      defaultValue={value}
      disabled={pending}
      aria-label="Status"
      onChange={(e) => {
        const v = e.target.value;
        start(() => (kind === "enquiry" ? setEnquiryStatus(id, v) : setMessageStatus(id, v)));
      }}
    >
      {OPTIONS[kind].map(([k, l]) => (
        <option key={k} value={k}>
          {l}
        </option>
      ))}
    </select>
  );
}
