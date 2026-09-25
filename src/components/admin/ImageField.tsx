"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/app/actions/admin";

/** URL text field + upload button. Uploaded files are saved under /public/uploads/products. */
export function ImageField({ value, onChange, placeholder = "/images/products/… or https://…", tileBg }: { value: string; onChange: (v: string) => void; placeholder?: string; tileBg?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "64px minmax(0,1fr)", gap: 10, alignItems: "center" }}>
      <div className="thumb-sm" style={{ width: 64, height: 64, background: tileBg ?? "#FFF0D4" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value ? <img src={value} alt="" /> : <span style={{ fontSize: 10, color: "#8A7C6C", fontWeight: 700 }}>No image</span>}
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="field" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ padding: "10px 12px", fontSize: 14 }} />
          <button type="button" className="btn btn-dark btn-sm" disabled={busy} onClick={() => ref.current?.click()}>
            {busy ? "Uploading…" : "Upload"}
          </button>
          {value && (
            <button type="button" className="link-caps" onClick={() => onChange("")} aria-label="Remove image">
              ✕
            </button>
          )}
        </div>
        {err && <div style={{ color: "#9C1E0B", fontSize: 13, fontWeight: 600 }}>{err}</div>}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          setErr(null);
          const fd = new FormData();
          fd.set("file", f);
          const r = await uploadImage(fd);
          setBusy(false);
          e.target.value = "";
          if (r.url) onChange(r.url);
          else setErr(r.error ?? "Upload failed.");
        }}
      />
    </div>
  );
}
