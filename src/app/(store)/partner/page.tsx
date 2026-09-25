import type { Metadata } from "next";
import { PARTNER_POINTS } from "@/lib/content";
import { ActionForm } from "@/components/store/ActionForm";
import { submitEnquiry } from "@/app/actions/shop";

export const metadata: Metadata = {
  title: "Partner with us",
  description: "Distributors, retailers and HoReCa — manufacturer-direct supply of Home Queen spices from Vadodara.",
};

export default function PartnerPage() {
  return (
    <main>
      <section style={{ background: "#1C1917", color: "#FFFBF4" }}>
        <div className="wrap" style={{ paddingTop: 80, paddingBottom: 80, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(360px,100%),1fr))", gap: 56, alignItems: "center" }}>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ color: "#FFB703", letterSpacing: ".16em", marginBottom: 26 }}>
              Distributors · Retailers · HoReCa
            </div>
            <h1 className="display" style={{ fontWeight: 800, fontSize: "clamp(38px,5.2vw,72px)", lineHeight: 0.96, letterSpacing: "-.04em", margin: "0 0 22px" }}>
              Sell a spice brand that makes its own spices.
            </h1>
            <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.7, margin: 0, maxWidth: "48ch", color: "#B8ADA2" }}>
              Manufacturer-direct supply from Vadodara. No middle layer, no contract blender, consistent lot-to-lot quality across 26 SKUs.
            </p>
          </div>
          <div className="pad-panel" style={{ minWidth: 0, background: "#FFFBF4", color: "#1C1917", padding: "40px 36px" }}>
            <div className="display" style={{ fontWeight: 700, fontSize: 28, letterSpacing: "-.025em", marginBottom: 24 }}>
              Partnership enquiry
            </div>
            <ActionForm action={submitEnquiry} submitLabel="Send enquiry" submitStyle={{ padding: 17, fontSize: 16 }}>
              <input name="name" className="field" placeholder="Full name" required autoComplete="name" />
              <input name="firm" className="field" placeholder="Firm / shop name" required autoComplete="organization" />
              <div className="two">
                <input name="city" className="field" placeholder="City" required />
                <input name="phone" className="field" placeholder="Phone" required inputMode="tel" autoComplete="tel" />
              </div>
              <select name="type" className="field" style={{ color: "#5A5048" }} defaultValue="Distributor" aria-label="Business type">
                <option value="Distributor">I am a … distributor</option>
                <option value="Retailer / kirana">Retailer / kirana</option>
                <option value="Restaurant / caterer">Restaurant / caterer</option>
                <option value="Exporter">Exporter</option>
              </select>
              <textarea name="volume" className="field" placeholder="Monthly volume you expect to move" rows={3} />
            </ActionForm>
            <div className="note" style={{ marginTop: 12 }}>
              We reply within one working day on +91 8866 911 100
            </div>
          </div>
        </div>
      </section>
      <section className="wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: 16 }}>
          {PARTNER_POINTS.map((p) => (
            <div key={p.no} style={{ background: p.bg, color: p.fg, padding: "32px 28px 36px" }}>
              <div className="display" style={{ fontWeight: 800, fontSize: 26, lineHeight: 1, marginBottom: 16, opacity: 0.75 }}>
                {p.no}
              </div>
              <div className="display" style={{ fontWeight: 700, fontSize: 22, lineHeight: 1.1, letterSpacing: "-.02em", marginBottom: 11 }}>
                {p.title}
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.65 }}>{p.body}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
