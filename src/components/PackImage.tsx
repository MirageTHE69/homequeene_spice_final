// Product pack shot, with a branded typographic fallback for products that don't have a photo yet.
const FALLBACKS = [
  { bg: "#E4341C", fg: "#FFFBF4" },
  { bg: "#167D4E", fg: "#FFFBF4" },
  { bg: "#FFB703", fg: "#1C1917" },
  { bg: "#8A3B12", fg: "#FFFBF4" },
  { bg: "#1C1917", fg: "#FFB703" },
];

function pick(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACKS[h % FALLBACKS.length];
}

export function PackImage({ src, name, loading = "lazy" }: { src?: string | null; name: string; loading?: "lazy" | "eager" }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} loading={loading} />;
  }
  const c = pick(name);
  return (
    <div className="pack-fallback" role="img" aria-label={name} style={{ background: c.bg, color: c.fg }}>
      <span className="brand">Home Queen</span>
      <span className="pname">{name}</span>
      <span className="pure">100% pure · RKR Foods</span>
    </div>
  );
}
