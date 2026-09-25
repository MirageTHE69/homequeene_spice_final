import { STOCK } from "@/lib/stock";

export function AuthShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <main className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className="split" style={{ gap: 0, border: "1px solid rgba(28,25,23,.14)", background: "#fff" }}>
        <div className="pad-panel" style={{ padding: "48px 44px", minWidth: 0 }}>
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="display" style={{ fontWeight: 800, fontSize: "clamp(34px,4vw,52px)", lineHeight: 0.98, letterSpacing: "-.035em", margin: "0 0 30px" }}>
            {title}
          </h1>
          {children}
        </div>
        <div className="photo-panel" style={{ minHeight: 480 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={STOCK.spiceFlatlay} alt="Whole spices on a wooden board" />
          <div className="cap" style={{ fontSize: 13 }}>
            Track orders · Save addresses · Reorder your favourites in two taps
          </div>
        </div>
      </div>
    </main>
  );
}
