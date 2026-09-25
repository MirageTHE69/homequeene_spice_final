"use client";

import { useState, useTransition } from "react";
import { setVariantStock } from "@/app/actions/admin";

export function StockInput({ id, stock }: { id: string; stock: number }) {
  const [v, setV] = useState(String(stock));
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const dirty = Number(v) !== stock;
  const save = () => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0 || !dirty) return;
    start(async () => {
      await setVariantStock(id, n);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  };
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <input
        className="field"
        type="number"
        min={0}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        onBlur={save}
        style={{ width: 90, padding: 7, borderColor: dirty ? "#E4341C" : undefined }}
        aria-label="Stock"
      />
      {pending ? <span className="note">Saving…</span> : saved ? <span style={{ color: "#167D4E", fontWeight: 800 }}>✓</span> : null}
    </div>
  );
}
