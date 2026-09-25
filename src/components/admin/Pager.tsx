import Link from "next/link";

export function Pager({ page, total, per, base, qs }: { page: number; total: number; per: number; base: string; qs: string }) {
  const pages = Math.ceil(total / per);
  if (pages <= 1) return null;
  const href = (p: number) => `${base}?${qs ? qs + "&" : ""}page=${p}`;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontWeight: 700, fontSize: 13 }}>
      <span className="muted">
        Page {page} of {pages}
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        {page > 1 && (
          <Link href={href(page - 1)} className="btn btn-outline btn-sm">
            ← Previous
          </Link>
        )}
        {page < pages && (
          <Link href={href(page + 1)} className="btn btn-outline btn-sm">
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
