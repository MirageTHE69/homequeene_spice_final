"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteRecipe, saveRecipe } from "@/app/actions/admin";
import { RECIPE_TAGS } from "@/lib/content";
import { ImageField } from "./ImageField";

type R = { id: string; title: string; slug: string; tag: string; time: string; summary: string; image: string; ingredients: string; steps: string; products: string; published: boolean; sortOrder: number };

export function RecipeForm({ initial, products }: { initial: R; products: { slug: string; name: string }[] }) {
  const [state, action, pending] = useActionState(saveRecipe, undefined);
  const [image, setImage] = useState(initial.image);
  const [picked, setPicked] = useState<string[]>(initial.products.split(",").map((s) => s.trim()).filter(Boolean));
  const [deleting, startDelete] = useTransition();

  return (
    <form action={action} className="admin-grid-2">
      <input type="hidden" name="id" value={initial.id} />
      <input type="hidden" name="image" value={image} />
      <input type="hidden" name="products" value={picked.join(",")} />
      <div className="panel form-grid">
        <div>
          <label className="label">Title</label>
          <input name="title" className="field" defaultValue={initial.title} required />
        </div>
        <div>
          <label className="label">One-line summary</label>
          <input name="summary" className="field" defaultValue={initial.summary} required />
        </div>
        <div>
          <label className="label">Ingredients — one per line</label>
          <textarea name="ingredients" className="field" rows={8} defaultValue={initial.ingredients} />
        </div>
        <div>
          <label className="label">Method — one step per line</label>
          <textarea name="steps" className="field" rows={10} defaultValue={initial.steps} />
        </div>
      </div>
      <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
        <div className="panel form-grid">
          <div className="two">
            <div>
              <label className="label">Section</label>
              <select name="tag" className="field" defaultValue={initial.tag}>
                {RECIPE_TAGS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Time</label>
              <input name="time" className="field" defaultValue={initial.time} placeholder="35 min" />
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
            <label className="label">Photo</label>
            <ImageField value={image} onChange={setImage} placeholder="https://images.unsplash.com/…" />
          </div>
          <label className="check-row">
            <input type="checkbox" name="published" defaultChecked={initial.published} /> Published
          </label>
          {state?.error && <div className="alert alert-err">{state.error}</div>}
          {state?.ok && <div className="alert alert-ok">{state.ok}</div>}
          <button className="btn btn-red" disabled={pending}>
            {pending ? "Saving…" : initial.id ? "Save recipe" : "Create recipe"}
          </button>
          {initial.id && (
            <button type="button" className="link-caps" style={{ color: "#8A7C6C", justifySelf: "start" }} disabled={deleting} onClick={() => confirm("Delete this recipe?") && startDelete(() => deleteRecipe(initial.id))}>
              Delete recipe
            </button>
          )}
        </div>
        <div className="panel">
          <div className="panel-h">
            <h2>Spices used</h2>
          </div>
          <div style={{ display: "grid", gap: 8, maxHeight: 280, overflowY: "auto" }}>
            {products.map((p) => (
              <label key={p.slug} className="check-row" style={{ fontSize: 14 }}>
                <input type="checkbox" checked={picked.includes(p.slug)} onChange={(e) => setPicked((x) => (e.target.checked ? [...x, p.slug] : x.filter((s) => s !== p.slug)))} />
                {p.name}
              </label>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
