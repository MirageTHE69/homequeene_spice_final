import type { Metadata } from "next";
import { CONTACT_ROWS } from "@/lib/content";
import { ActionForm } from "@/components/store/ActionForm";
import { submitMessage } from "@/app/actions/shop";

export const metadata: Metadata = { title: "Reach us", description: "Order queries, bulk enquiries, or a spice question — we answer all of them." };

export default function ContactPage() {
  return (
    <main className="wrap" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <h1 className="h-page" style={{ marginBottom: 48 }}>
        Reach us
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(340px,100%),1fr))", gap: 56, alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ borderTop: "1px solid rgba(28,25,23,.16)" }}>
            {CONTACT_ROWS.map((c) => (
              <div key={c.label} style={{ padding: "24px 0", borderBottom: "1px solid rgba(28,25,23,.14)" }}>
                <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#E4341C", marginBottom: 11 }}>{c.label}</div>
                <div style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.5 }}>
                  {c.href ? (
                    <a href={c.href} style={{ color: "#1C1917" }}>
                      {c.value}
                    </a>
                  ) : (
                    c.value
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ aspectRatio: "16/10", marginTop: 32, background: "#F0E6D6", border: "1px solid rgba(28,25,23,.16)", overflow: "hidden" }}>
            <iframe
              title="Map — 4/4 Industrial Estate, Gorwa, Vadodara"
              src="https://maps.google.com/maps?q=Gorwa%20Industrial%20Estate%2C%20Vadodara%2C%20Gujarat%20390016&z=15&output=embed"
              style={{ width: "100%", height: "100%", border: 0, display: "block", filter: "saturate(.85)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        <div className="ph-light pad-panel" style={{ minWidth: 0, background: "#1C1917", color: "#FFFBF4", padding: "40px 36px" }}>
          <div className="display" style={{ fontWeight: 700, fontSize: 30, letterSpacing: "-.025em", marginBottom: 12 }}>
            Write to us
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.65, color: "#B8ADA2", margin: "0 0 28px" }}>
            Order queries, bulk enquiries, or a spice question — we answer all of them.
          </p>
          <ActionForm action={submitMessage} submitLabel="Send message" submitClass="btn btn-amber" submitStyle={{ padding: 17, fontSize: 16 }} dark>
            <div className="two">
              <input name="name" className="field field-dark" placeholder="Name" required autoComplete="name" />
              <input name="phone" className="field field-dark" placeholder="Phone" inputMode="tel" autoComplete="tel" />
            </div>
            <input name="email" type="email" className="field field-dark" placeholder="Email" autoComplete="email" />
            <input name="orderNumber" className="field field-dark" placeholder="Order number (if any)" />
            <textarea name="message" className="field field-dark" placeholder="Your message" rows={5} required />
          </ActionForm>
        </div>
      </div>
    </main>
  );
}
