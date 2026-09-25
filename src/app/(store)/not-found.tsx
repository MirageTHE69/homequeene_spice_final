import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap" style={{ paddingTop: 80, paddingBottom: 100 }}>
      <div className="eyebrow">404</div>
      <h1 className="h-page" style={{ marginBottom: 20 }}>
        This page has gone missing.
      </h1>
      <p className="lede" style={{ marginBottom: 32 }}>
        The link may be old, or the product may have been retired. The spices are all still here.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/shop" className="btn btn-red btn-lg">
          Shop all spices →
        </Link>
        <Link href="/" className="btn btn-outline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
