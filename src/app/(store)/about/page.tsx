import type { Metadata } from "next";
import { PROCESS, TIMELINE } from "@/lib/content";
import { STOCK } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Our story",
  description: "RKR Foods has run the same unit in Gorwa, Vadodara since 1987. Home Queen is the brand we put on the shelf.",
};

export default function AboutPage() {
  return (
    <main>
      <section style={{ background: "#167D4E", color: "#FFFBF4" }}>
        <div className="wrap" style={{ maxWidth: 1000, paddingTop: 88, paddingBottom: 80 }}>
          <div className="eyebrow" style={{ color: "#FFB703", letterSpacing: ".16em", marginBottom: 26 }}>
            Our story
          </div>
          <h1 className="display" style={{ fontWeight: 800, fontSize: "clamp(42px,6vw,88px)", lineHeight: 0.94, letterSpacing: "-.04em", margin: "0 0 26px", textWrap: "balance" }}>
            Thirty-nine years of grinding our own spices.
          </h1>
          <p style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.7, margin: 0, maxWidth: "58ch", color: "rgba(255,251,244,.92)", textWrap: "pretty" }}>
            RKR Foods has run the same unit in Gorwa, Vadodara since 1987. Home Queen is the brand we put on the shelf — the blends we make for our own kitchens.
          </p>
        </div>
      </section>
      <div className="wrap" style={{ paddingTop: 32 }}>
        <div className="photo-panel" style={{ aspectRatio: "21/9", minHeight: 240 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={STOCK.spiceBowls} alt="Bowls of whole and ground Indian spices" />
          <div className="cap">Whole spice in, fine masala out — every lot checked on the floor in Gorwa</div>
        </div>
      </div>
      <section className="wrap" style={{ paddingTop: 72, paddingBottom: 80, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))", gap: 64, alignItems: "start" }}>
        <div style={{ minWidth: 0, position: "sticky", top: 104 }}>
          <div className="eyebrow" style={{ marginBottom: 20 }}>
            The timeline
          </div>
          <h2 className="display" style={{ fontWeight: 700, fontSize: "clamp(30px,3.8vw,46px)", lineHeight: 1.02, letterSpacing: "-.03em", margin: "0 0 20px" }}>
            From one grinder to twenty-six SKUs.
          </h2>
          <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.7, color: "#5A5048", margin: 0 }}>
            Ravneet Kaur Anand was an insurance underwriter before she was a spice manufacturer. She still sets the quality standard the unit works to.
          </p>
        </div>
        <div style={{ minWidth: 0 }}>
          {TIMELINE.map((t) => (
            <div key={t.year} className="tl-row">
              <div className="y">{t.year}</div>
              <div>
                <div className="t">{t.title}</div>
                <div className="b">{t.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ background: "#1C1917", color: "#FFFBF4" }}>
        <div className="wrap" style={{ paddingTop: 88, paddingBottom: 88 }}>
          <h2 className="display" style={{ fontWeight: 700, fontSize: "clamp(30px,4vw,52px)", lineHeight: 1, letterSpacing: "-.03em", margin: "0 0 44px" }}>
            From whole spice to sealed pack
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16 }}>
            {PROCESS.map((s) => (
              <div key={s.no}>
                <div className="process-shot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={s.alt} loading="lazy" />
                </div>
                <div className="display" style={{ fontWeight: 800, fontSize: 22, lineHeight: 1, color: "#FFB703", marginBottom: 12 }}>
                  {s.no}
                </div>
                <div className="display" style={{ fontWeight: 700, fontSize: 21, lineHeight: 1.1, letterSpacing: "-.02em", marginBottom: 10 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.65, color: "#B8ADA2" }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
