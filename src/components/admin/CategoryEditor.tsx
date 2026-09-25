"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { deleteCategory, saveCategory } from "@/app/actions/admin";
import { ImageField } from "./ImageField";

type C = { id: string; name: string; slug: string; short: string; description: string; bg: string; fg: string; image: string; sortOrder: number; count: number };
const PALETTE: [string, string][] = [
  ["#FFB703", "#1C1917"],
  ["#167D4E", "#FFFBF4"],
  ["#E4341C", "#FFFBF4"],
  ["#1C1917", "#FFB703"],
];

export function CategoryEditor({ categories }: { categories: C[] }) {
  const [edit, setEdit] = useState<C | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const blank: C = { id: "", name: "", slug: "", short: "", description: "", bg: "#FFB703", fg: "#1C1917", image: "", sortOrder: categories.length + 1, count: 0 };

  return (
    <div className="admin-grid-2">
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Category</th>
              <th>Badge</th>
              <th>Products</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.sortOrder}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 28, height: 28, background: c.bg, color: c.fg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>{c.name[0]}</span>
                    <div>
                      <b>{c.name}</b>
                      <div style={{ fontSize: 12, color: "#8A7C6C" }}>/shop?category={c.slug}</div>
                    </div>
                  </div>
                </td>
                <td>{c.short}</td>
                <td>{c.count}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button className="link-caps" onClick={() => setEdit(c)}>
                    Edit
                  </button>{" "}
                  <button
                    className="link-caps"
                    style={{ color: "#8A7C6C", marginLeft: 10 }}
                    disabled={pending}
                    onClick={() => {
                      if (!confirm(`Delete ${c.name}?`)) return;
                      setErr(null);
                      start(async () => {
                        const r = await deleteCategory(c.id);
                        if (!r.ok) setErr(r.error ?? "Could not delete.");
                      });
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {err && <div className="alert alert-err" style={{ margin: 12 }}>{err}</div>}
      </div>
      <CategoryForm key={edit?.id ?? "new"} initial={edit ?? blank} onDone={() => setEdit(null)} />
    </div>
  );
}

function CategoryForm({ initial, onDone }: { initial: C; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveCategory, undefined);
  const [image, setImage] = useState(initial.image);
  const [colors, setColors] = useState<[string, string]>([initial.bg, initial.fg]);
  useEffect(() => {
    if (state?.ok && initial.id) onDone();
  }, [state, initial.id, onDone]);
  return (
    <form action={action} className="panel form-grid">
      <div className="panel-h" style={{ marginBottom: 4 }}>
        <h2>{initial.id ? `Edit ${initial.name}` : "New category"}</h2>
        {initial.id && (
          <button type="button" className="link-caps" onClick={onDone}>
            Cancel
          </button>
        )}
      </div>
      <input type="hidden" name="id" value={initial.id} />
      <input type="hidden" name="image" value={image} />
      <input type="hidden" name="bg" value={colors[0]} />
      <input type="hidden" name="fg" value={colors[1]} />
      <div className="two">
        <div>
          <label className="label">Name</label>
          <input name="name" className="field" defaultValue={initial.name} required />
        </div>
        <div>
          <label className="label">Card badge</label>
          <input name="short" className="field" defaultValue={initial.short} placeholder="Basic, Veg, Kit…" />
        </div>
      </div>
      <div className="two">
        <div>
          <label className="label">URL slug</label>
          <input name="slug" className="field" defaultValue={initial.slug} placeholder="auto" />
        </div>
        <div>
          <label className="label">Order</label>
          <input name="sortOrder" type="number" className="field" defaultValue={initial.sortOrder} />
        </div>
      </div>
      <div>
        <label className="label">Description (shop page intro)</label>
        <textarea name="description" className="field" rows={2} defaultValue={initial.description} />
      </div>
      <div>
        <label className="label">Tile image</label>
        <ImageField value={image} onChange={setImage} tileBg={colors[0]} />
      </div>
      <div>
        <label className="label">Tile colours</label>
        <div style={{ display: "flex", gap: 8 }}>
          {PALETTE.map(([bg, fg]) => (
            <button
              key={bg}
              type="button"
              onClick={() => setColors([bg, fg])}
              style={{ width: 44, height: 32, background: bg, color: fg, fontWeight: 800, border: colors[0] === bg ? "3px solid #E4341C" : "1px solid rgba(28,25,23,.2)" }}
            >
              Aa
            </button>
          ))}
        </div>
      </div>
      {state?.error && <div className="alert alert-err">{state.error}</div>}
      {state?.ok && <div className="alert alert-ok">{state.ok}</div>}
      <button className="btn btn-red" disabled={pending}>
        {pending ? "Saving…" : initial.id ? "Save category" : "Add category"}
      </button>
    </form>
  );
}
