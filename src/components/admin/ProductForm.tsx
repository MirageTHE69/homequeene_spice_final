"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveProduct, type ProductInput } from "@/app/actions/admin";
import { ImageField } from "./ImageField";
import { slugify } from "@/lib/format";

type V = { id?: string; label: string; price: number; compareAt: number | null; stock: number; sku?: string };
type Initial = Omit<ProductInput, "variants"> & { variants: V[] };

const TILE_SWATCHES = ["#FFF0D4", "#FFE7C2", "#FFDCD2", "#DCEDDF", "#F0E6D6"];

export function ProductForm({ categories, initial }: { categories: { id: string; name: string }[]; initial: Initial }) {
  const router = useRouter();
  const [f, setF] = useState<Initial>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof Initial>(k: K, v: Initial[K]) => setF((x) => ({ ...x, [k]: v }));
  const setV = (i: number, patch: Partial<V>) => setF((x) => ({ ...x, variants: x.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)) }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    start(async () => {
      const r = await saveProduct(f);
      if (!r.ok) {
        setErr(r.error ?? "Could not save.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!f.id && r.id) router.replace(`/admin/products/${r.id}?saved=1`);
      else {
        setOk("Product saved.");
        router.refresh();
      }
    });
  }

  const txt = (k: "name" | "summary" | "description" | "badge" | "ingredients" | "howToUse" | "storage") => ({
    value: f[k] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value),
  });

  return (
    <form onSubmit={submit} className="admin-grid-2">
      <div style={{ display: "grid", gap: 18 }}>
        {err && <div className="alert alert-err">{err}</div>}
        {ok && <div className="alert alert-ok">{ok}</div>}
        <div className="panel form-grid">
          <div className="panel-h" style={{ marginBottom: 4 }}>
            <h2>Details</h2>
          </div>
          <div>
            <label className="label">Name</label>
            <input className="field" required {...txt("name")} onBlur={() => !f.slug && set("slug", slugify(f.name))} />
          </div>
          <div className="two">
            <div>
              <label className="label">URL slug</label>
              <input className="field" value={f.slug ?? ""} onChange={(e) => set("slug", e.target.value)} placeholder="auto from name" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="field" value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Summary (shown under the title)</label>
            <textarea className="field" rows={3} required {...txt("summary")} />
          </div>
          <div>
            <label className="label">Longer description (optional)</label>
            <textarea className="field" rows={3} {...txt("description")} />
          </div>
          <div>
            <label className="label">Ingredients</label>
            <textarea className="field" rows={2} {...txt("ingredients")} />
          </div>
          <div>
            <label className="label">How to use</label>
            <textarea className="field" rows={2} {...txt("howToUse")} />
          </div>
          <div>
            <label className="label">Storage &amp; shelf life</label>
            <textarea className="field" rows={2} {...txt("storage")} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <h2>Pack sizes, prices &amp; stock</h2>
            <button type="button" className="link-caps" onClick={() => set("variants", [...f.variants, { label: "", price: 0, compareAt: null, stock: 0, sku: "" }])}>
              + Add pack size
            </button>
          </div>
          <div className="table-wrap" style={{ border: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Pack</th>
                  <th>Price ₹</th>
                  <th>MRP ₹</th>
                  <th>Stock</th>
                  <th>SKU</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {f.variants.map((v, i) => (
                  <tr key={v.id ?? `n${i}`}>
                    <td>
                      <input className="field" style={{ padding: 8, minWidth: 90 }} value={v.label} onChange={(e) => setV(i, { label: e.target.value })} placeholder="100 g" required />
                    </td>
                    <td>
                      <input className="field" style={{ padding: 8, width: 90 }} type="number" min={1} value={v.price || ""} onChange={(e) => setV(i, { price: Number(e.target.value) })} required />
                    </td>
                    <td>
                      <input className="field" style={{ padding: 8, width: 90 }} type="number" min={0} value={v.compareAt ?? ""} onChange={(e) => setV(i, { compareAt: e.target.value ? Number(e.target.value) : null })} />
                    </td>
                    <td>
                      <input className="field" style={{ padding: 8, width: 80 }} type="number" min={0} value={v.stock} onChange={(e) => setV(i, { stock: Number(e.target.value) })} />
                    </td>
                    <td>
                      <input className="field" style={{ padding: 8, minWidth: 140, fontSize: 12 }} value={v.sku ?? ""} onChange={(e) => setV(i, { sku: e.target.value })} placeholder="auto" />
                    </td>
                    <td>
                      {f.variants.length > 1 && (
                        <button type="button" className="link-caps" onClick={() => set("variants", f.variants.filter((_, j) => j !== i))} aria-label="Remove pack size">
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="note" style={{ margin: "10px 0 0" }}>
            MRP is the struck-through price. Leave it empty for no discount.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 18, position: "sticky", top: 20 }}>
        <div className="panel form-grid">
          <div className="panel-h" style={{ marginBottom: 4 }}>
            <h2>Publishing</h2>
          </div>
          <label className="check-row">
            <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} /> Live in the store
          </label>
          <label className="check-row">
            <input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> Show in &ldquo;Most reordered&rdquo; on the home page
          </label>
          <div>
            <label className="label">Card badge (optional)</label>
            <input className="field" {...txt("badge")} placeholder="Bestseller, Tangy, Save 20%…" />
          </div>
          <button className="btn btn-red" disabled={pending}>
            {pending ? "Saving…" : f.id ? "Save changes" : "Create product"}
          </button>
        </div>

        <div className="panel form-grid">
          <div className="panel-h" style={{ marginBottom: 4 }}>
            <h2>Images</h2>
          </div>
          <div>
            <label className="label">Pack shot (transparent PNG/WEBP works best)</label>
            <ImageField value={f.image ?? ""} onChange={(v) => set("image", v)} tileBg={f.tileBg} />
          </div>
          <div>
            <label className="label">Gallery (texture / in-use photos)</label>
            <div style={{ display: "grid", gap: 8 }}>
              {f.gallery.map((g, i) => (
                <ImageField key={i} value={g} onChange={(v) => set("gallery", v ? f.gallery.map((x, j) => (j === i ? v : x)) : f.gallery.filter((_, j) => j !== i))} />
              ))}
              <button type="button" className="link-caps" style={{ justifySelf: "start" }} onClick={() => set("gallery", [...f.gallery, ""])}>
                + Add gallery image
              </button>
            </div>
          </div>
          <div>
            <label className="label">Card background</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {TILE_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() => set("tileBg", c)}
                  style={{ width: 30, height: 30, background: c, border: f.tileBg === c ? "2px solid #E4341C" : "1px solid rgba(28,25,23,.2)" }}
                />
              ))}
              <input className="field" value={f.tileBg} onChange={(e) => set("tileBg", e.target.value)} style={{ width: 110, padding: 8 }} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
