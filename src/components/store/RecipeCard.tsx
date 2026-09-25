import Link from "next/link";

type R = { slug: string; title: string; tag: string; time: string; summary: string; image: string | null };

export function RecipeCard({ r, withSummary = false }: { r: R; withSummary?: boolean }) {
  return (
    <Link href={`/recipes/${r.slug}`} className="rcard">
      <div className="pic">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {r.image && <img src={r.image} alt={r.title} loading="lazy" />}
      </div>
      <div className="body">
        <div className="meta">
          {r.tag} · {r.time}
        </div>
        <div className="title">{r.title}</div>
        {withSummary && <div className="sum">{r.summary}</div>}
      </div>
    </Link>
  );
}
