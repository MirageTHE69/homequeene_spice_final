"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type Props = {
  categories: { slug: string; name: string; count: string }[];
  sizes: string[];
  priceMin: number;
  priceMax: number;
  current: { cats: string[]; size: string; max: number; q: string };
};

function useUpdate() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const update = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") p.delete(k);
      else p.set(k, v);
    }
    p.delete("show");
    start(() => router.push(`${pathname}?${p.toString()}`, { scroll: false }));
  };
  return { update, pending };
}

export function ShopFilters({ categories, sizes, priceMin, priceMax, current }: Props) {
  const { update, pending } = useUpdate();
  const [open, setOpen] = useState(false);
  const [max, setMax] = useState(current.max);
  const [q, setQ] = useState(current.q);
  useEffect(() => setMax(current.max), [current.max]);

  const toggleCat = (slug: string) => {
    const set = new Set(current.cats);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    update({ category: [...set].join(",") || null });
  };
  const pct = priceMax > priceMin ? ((max - priceMin) / (priceMax - priceMin)) * 100 : 100;
  const anyFilter = current.cats.length || current.size || current.q || current.max < priceMax;

  return (
    <>
      <button className="btn btn-outline btn-sm filters-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? "Hide filters" : "Filters"}
        {anyFilter ? " •" : ""}
      </button>
      <aside className={`shop-aside ${open ? "open" : ""}`} style={{ opacity: pending ? 0.6 : 1 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: q.trim() || null });
          }}
        >
          <input className="search-input" type="search" placeholder="Search spices…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        </form>
        <div>
          <div className="filter-title">Category</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {categories.map((c) => (
              <label key={c.slug} className="check-row">
                <input type="checkbox" checked={current.cats.includes(c.slug)} onChange={() => toggleCat(c.slug)} />
                <span>{c.name}</span>
                <span className="n">{c.count}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="filter-title">Pack size</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {sizes.map((s) => (
              <button key={s} type="button" className={`size-chip ${current.size === s ? "on" : ""}`} onClick={() => update({ size: current.size === s ? null : s })}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="filter-title">Price</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            ₹{priceMin} — ₹{max.toLocaleString("en-IN")}
          </div>
          <div style={{ height: 4, background: "rgba(28,25,23,.16)", marginTop: 14, position: "relative" }}>
            <div style={{ position: "absolute", left: 0, width: `${pct}%`, top: 0, bottom: 0, background: "#E4341C" }} />
          </div>
          <input
            className="range"
            type="range"
            min={priceMin}
            max={priceMax}
            step={10}
            value={max}
            aria-label="Maximum price"
            onChange={(e) => setMax(Number(e.target.value))}
            onMouseUp={() => update({ max: max >= priceMax ? null : String(max) })}
            onTouchEnd={() => update({ max: max >= priceMax ? null : String(max) })}
            onKeyUp={() => update({ max: max >= priceMax ? null : String(max) })}
          />
        </div>
        {anyFilter ? (
          <button type="button" className="link-caps" style={{ alignSelf: "flex-start" }} onClick={() => update({ category: null, size: null, max: null, q: null })}>
            Clear all filters ×
          </button>
        ) : null}
      </aside>
    </>
  );
}

export function ShopToolbar({ showing, total, sort }: { showing: number; total: number; sort: string }) {
  const { update } = useUpdate();
  return (
    <div className="shop-toolbar">
      <span>
        Showing {showing} of {total}
      </span>
      <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
        Sort:
        <select className="sort-select" value={sort} onChange={(e) => update({ sort: e.target.value === "popular" ? null : e.target.value })}>
          <option value="popular">Popularity</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="new">Newest</option>
          <option value="name">Name A–Z</option>
        </select>
      </label>
    </div>
  );
}

