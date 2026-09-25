import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// NOTE: This is starter policy text. Have it reviewed against your actual operations before launch.
const POLICIES: Record<string, { title: string; updated: string; sections: { h: string; p: string[] }[] }> = {
  shipping: {
    title: "Shipping Policy",
    updated: "September 2026",
    sections: [
      { h: "Dispatch", p: ["Orders placed before 4 pm on a working day are dispatched the same day from our unit in Gorwa, Vadodara. Orders placed later, or on Sundays and public holidays, go out the next working day."] },
      { h: "Delivery times", p: ["Gujarat: 2–4 working days.", "Rest of India: 4–7 working days. Remote PIN codes in the North-East, J&K and island territories may take up to 10 working days."] },
      { h: "Shipping charges", p: ["Shipping is free on orders of ₹249 and above (after discounts). Below that, a flat ₹40 is added at checkout."] },
      { h: "Tracking", p: ["Once your order ships you'll see the courier name and tracking number on the order page in your account."] },
    ],
  },
  refund: {
    title: "Refund & Return Policy",
    updated: "September 2026",
    sections: [
      { h: "Damaged or wrong items", p: ["If a pack arrives damaged, leaking or is not what you ordered, tell us within 48 hours of delivery with a photo. We'll replace it free or refund the item — your choice."] },
      { h: "Food safety", p: ["Because spices are food products, we can't accept returns of opened packs that aren't faulty."] },
      { h: "Cancellations", p: ["You can cancel from your account until the order is packed. After that, call us on +91 8866 911 100 and we'll do our best."] },
      { h: "Refund timing", p: ["Online payments are refunded to the original method within 5–7 working days of approval. Cash-on-delivery refunds are made by UPI or bank transfer."] },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    updated: "September 2026",
    sections: [
      { h: "About us", p: ["homequeenspices.com is operated by RKR Foods, 4/4 Industrial Estate, Gorwa, Vadodara, Gujarat 390016."] },
      { h: "Orders and pricing", p: ["All prices are in Indian Rupees and include applicable taxes. We may cancel an order if an item is out of stock or a price was listed in error; any payment will be refunded in full."] },
      { h: "Your account", p: ["Keep your password private. You are responsible for orders placed from your account."] },
      { h: "Governing law", p: ["These terms are governed by the laws of India. Courts in Vadodara, Gujarat have exclusive jurisdiction."] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "September 2026",
    sections: [
      { h: "What we collect", p: ["Your name, phone, email and delivery address when you create an account or order, and your order history."] },
      { h: "How we use it", p: ["To deliver your orders, contact you about them, and — only if you ask us to — send offers. We never sell your data."] },
      { h: "Payments", p: ["Online payments are processed by Razorpay. We don't see or store your card or bank details."] },
      { h: "Your choices", p: ["You can update your details from your account at any time, or write to info@homequeenspices.com to have your account deleted."] },
    ],
  },
};

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return { title: POLICIES[slug]?.title ?? "Policy" };
}

export default async function PolicyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const doc = POLICIES[slug];
  if (!doc) notFound();
  return (
    <main className="wrap" style={{ paddingTop: 56, paddingBottom: 80, maxWidth: 900 }}>
      <div className="crumbs">
        <Link href="/">Home</Link> / Policies
      </div>
      <h1 className="h-page" style={{ fontSize: "clamp(36px,5vw,64px)", marginBottom: 14 }}>
        {doc.title}
      </h1>
      <div className="note" style={{ marginBottom: 40 }}>
        Last updated {doc.updated}
      </div>
      {doc.sections.map((s) => (
        <section key={s.h} style={{ borderTop: "1px solid rgba(28,25,23,.16)", padding: "24px 0" }}>
          <h2 className="display" style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-.02em", margin: "0 0 10px" }}>
            {s.h}
          </h2>
          {s.p.map((t) => (
            <p key={t} style={{ fontSize: 16, lineHeight: 1.7, color: "#5A5048", margin: "0 0 8px", fontWeight: 500 }}>
              {t}
            </p>
          ))}
        </section>
      ))}
      <div className="alert alert-info" style={{ marginTop: 24 }}>
        Questions? Call +91 8866 911 100 or write to <a href="mailto:info@homequeenspices.com">info@homequeenspices.com</a>.
      </div>
    </main>
  );
}
