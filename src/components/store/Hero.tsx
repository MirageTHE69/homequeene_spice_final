"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { NAV, accountLink, UserIcon, type HeaderUser } from "./SiteHeader";

type Slide = {
  tab: string; eyebrow: string; h1a: string; h1b: string; body: string; price: string;
  cta1: string; href1: string; cta2: string; href2: string; pack: string;
  /** Mobile composition: [front, back-left, back-right] - transparent cut-out packs only. */
  fan: [string, string, string];
  stamp: [big: string, small: string];
  bg: string; fg: string; accentText: string; btnBg: string; btnFg: string; dot: string;
  deco: string; deco2: string; pillBg: string; line: string; track: string;
};

const SLIDES: Slide[] = [
  { tab: "Our mill", eyebrow: "Har ghar mein swad bharde", h1a: "Real masala, ground in", h1b: "our own mill.",
    body: "26 spices and masalas from one family-run unit in Vadodara. Mixed, ground and sealed by us since 1987 — never outsourced, never dyed.",
    price: "Free shipping above ₹249", cta1: "Shop all 26 →", href1: "/shop", cta2: "See the mill", href2: "/about",
    pack: "/images/products/kitchen-e-bahar.webp",
    fan: ["/images/products/kashmiri-chilli.webp", "/images/products/cumin-coriander.png", "/images/products/amchur-masala.png"], stamp: ["0%", "added colour"],
    bg: "#E4341C", fg: "#FFFBF4", accentText: "#FFB703", btnBg: "#FFB703", btnFg: "#1C1917", dot: "#FFB703",
    deco: "#D42A12", deco2: "rgba(255,183,3,.16)", pillBg: "rgba(255,251,244,.14)", line: "rgba(255,251,244,.5)", track: "rgba(255,251,244,.3)" },
  { tab: "Kashmiri Chilli", eyebrow: "Bestseller · Kashmiri Chilli", h1a: "Deep red.", h1b: "Zero dye.",
    body: "Whole Kashmiri chillies, stalks removed by hand and ground fine. The colour in your gravy comes from the chilli — nothing else.",
    price: "From ₹60 · 100 g to 1 kg", cta1: "Shop Kashmiri Chilli →", href1: "/product/kashmiri-chilli", cta2: "All basic spices", href2: "/shop?category=basic-spices",
    pack: "/images/products/kashmiri-chilli.webp",
    fan: ["/images/products/kashmiri-chilli.webp", "/images/products/black-pepper-powder.png", "/images/products/paneer-tikka-ready-mix.webp"], stamp: ["₹60", "from · 100 g"],
    bg: "#1C1917", fg: "#FFFBF4", accentText: "#FF5A3C", btnBg: "#E4341C", btnFg: "#FFFBF4", dot: "#E4341C",
    deco: "#2A2420", deco2: "rgba(228,52,28,.2)", pillBg: "rgba(255,251,244,.08)", line: "rgba(255,251,244,.4)", track: "rgba(255,251,244,.24)" },
  { tab: "Kitchen kits", eyebrow: "Kitchen kits · Save up to 20%", h1a: "The whole shelf,", h1b: "in one box.",
    body: "Six to fourteen spices and masalas in a single kit. For a new home, a hostel kitchen, or a gift that actually gets used.",
    price: "Kits from ₹230", cta1: "Shop kits →", href1: "/shop?category=combo-kits", cta2: "Kitchen E Bahar · ₹950", href2: "/product/kitchen-e-bahar",
    pack: "/images/products/curry-spice-kit.webp",
    fan: ["/images/products/paneer-tikka-ready-mix.webp", "/images/products/amchur-masala.png", "/images/products/cumin-coriander.png"], stamp: ["20%", "off on kits"],
    bg: "#FFB703", fg: "#1C1917", accentText: "#A81E0A", btnBg: "#1C1917", btnFg: "#FFB703", dot: "#E4341C",
    deco: "#F5AC00", deco2: "rgba(228,52,28,.12)", pillBg: "rgba(28,25,23,.08)", line: "rgba(28,25,23,.45)", track: "rgba(28,25,23,.2)" },
  { tab: "Since 1987", eyebrow: "Since 1987 · Vadodara", h1a: "39 years.", h1b: "One family mill.",
    body: "Ravneet Kaur Anand started RKR Foods in 1987. Every Home Queen blend is still mixed and ground on the same floor in Gorwa.",
    price: "FSSAI licensed unit", cta1: "Read our story →", href1: "/about", cta2: "Become a partner", href2: "/partner",
    pack: "/images/products/cumin-coriander.png",
    fan: ["/images/products/cumin-coriander.png", "/images/products/black-pepper-powder.png", "/images/products/kashmiri-chilli.webp"], stamp: ["1987", "since"],
    bg: "#167D4E", fg: "#FFFBF4", accentText: "#FFB703", btnBg: "#FFB703", btnFg: "#1C1917", dot: "#FFB703",
    deco: "#127044", deco2: "rgba(255,183,3,.16)", pillBg: "rgba(255,251,244,.12)", line: "rgba(255,251,244,.5)", track: "rgba(255,251,244,.3)" },
];

const SECS = 6;

export function Hero({ user, productCount }: { user: HeaderUser; productCount: number }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [menu, setMenu] = useState(false);
  const touchX = useRef<number | null>(null);
  const { count, ready } = useCart();
  const n = SLIDES.length;
  const go = useCallback((i: number) => setActive(((i % n) + n) % n), [n]);
  const cur = SLIDES[active];
  const acct = accountLink(user);

  // Respect reduced-motion: no autoplay.
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);

  const slides = SLIDES.map((s) => ({
    ...s,
    body: s.body.replace("26 spices", `${productCount} spices`),
    cta1: s.cta1.replace("all 26", `all ${productCount}`),
  }));

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Home Queen highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
      }}
    >
      <header className="hero-header" style={{ borderColor: cur.line, color: cur.fg }}>
        <div className="wrap bar">
          <Link href="/" className="logo" aria-label="Home Queen — home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/brand/logo.webp" alt="Home Queen" />
          </Link>
          <nav className="nav" aria-label="Main" style={{ color: cur.fg }}>
            {NAV.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
            <Link href={acct.href} className="acct">
              <UserIcon /> {acct.label}
            </Link>
            <Link href="/cart" className="cart-btn" style={{ background: cur.btnBg, color: cur.btnFg }}>
              Cart · {ready ? count : 0}
            </Link>
          </nav>
          <button className="menu-toggle" aria-expanded={menu} aria-label="Menu" onClick={() => setMenu((m) => !m)} style={{ color: cur.fg }}>
            {menu ? "✕" : "☰"}
          </button>
        </div>
        <div className={`wrap mobile-nav ${menu ? "open" : ""}`} style={{ background: cur.bg }}>
          {NAV.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          <Link href={acct.href}>{user ? "My account" : "Log in / Register"}</Link>
          <Link href="/cart">Cart · {ready ? count : 0}</Link>
        </div>
      </header>

      <div className="hero-stage">
        {slides.map((s, i) => {
          const on = i === active;
          return (
            <div
              key={s.tab}
              className="slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}: ${s.tab}`}
              aria-hidden={!on}
              style={{ background: s.bg, color: s.fg, opacity: on ? 1 : 0, zIndex: on ? 3 : 1, pointerEvents: on ? "auto" : "none" }}
            >
              <div className="slide-deco deco-a" style={{ top: "-16%", right: "-8%", width: "min(64vw,900px)", aspectRatio: "1/1", background: s.deco }} />
              <div className="slide-deco deco-b" style={{ bottom: "-26%", left: "-12%", width: "min(50vw,640px)", aspectRatio: "1/1", background: s.deco2 }} />
              <div className="wrap slide-inner">
                <div className="slide-fan" aria-hidden>
                  <div className="fan-stamp" style={{ background: s.btnBg, color: s.btnFg }}>
                    <b>{s.stamp[0]}</b>
                    <span>{s.stamp[1]}</span>
                  </div>
                  {s.fan.map((src, k) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={k} src={src} alt="" className={["fan-f", "fan-l", "fan-r"][k]} loading={i === 0 ? "eager" : "lazy"} />
                  ))}
                </div>
                <div className="slide-copy" style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(28px)" }}>
                  <div className="slide-pill" style={{ background: s.pillBg, borderColor: s.line }}>
                    <span className="dot" style={{ background: s.dot }} />
                    <span>{s.eyebrow}</span>
                  </div>
                  <h2>
                    {s.h1a}
                    <br />
                    <span style={{ color: s.accentText }}>{s.h1b}</span>
                  </h2>
                  <p>{s.body}</p>
                  <div className="price">{s.price}</div>
                  <div className="ctas">
                    <Link href={s.href1} className="cta1" style={{ background: s.btnBg, color: s.btnFg }} tabIndex={on ? 0 : -1}>
                      {s.cta1}
                    </Link>
                    <Link href={s.href2} className="cta2" style={{ borderColor: s.line, color: s.fg }} tabIndex={on ? 0 : -1}>
                      {s.cta2}
                    </Link>
                  </div>
                </div>
                <div className="slide-pack">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.pack}
                    alt=""
                    loading={i === 0 ? "eager" : "lazy"}
                    style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0) scale(1)" : "translateY(24px) scale(.92)" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hero-controls">
        <div className="wrap row">
          <div className="hero-caption" aria-live="polite" style={{ color: cur.fg }}>
            <span>{cur.tab}</span>
            <span>
              {String(active + 1).padStart(2, "0")} <span style={{ opacity: 0.55 }}>/ {String(n).padStart(2, "0")}</span>
            </span>
          </div>
          <div className="hero-tabs">
            {slides.map((s, i) => (
              <button key={s.tab} className="hero-tab" onClick={() => go(i)} aria-label={`${i + 1} of ${n}: ${s.tab}`} style={{ color: cur.fg }}>
                <div className="track" style={{ background: cur.track }}>
                  <div
                    className="fill"
                    onAnimationEnd={() => go(active + 1)}
                    style={{
                      background: cur.fg,
                      transform: i < active ? "scaleX(1)" : "scaleX(0)",
                      animationName: i === active ? "v4bar" : "none",
                      animationDuration: `${SECS}s`,
                      animationTimingFunction: "linear",
                      animationFillMode: "forwards",
                      animationPlayState: paused ? "paused" : "running",
                    }}
                  />
                </div>
                <div className="lbl" style={{ opacity: i === active ? 1 : 0.6 }}>
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  {s.tab}
                </div>
              </button>
            ))}
          </div>
          <div className="hero-arrows" style={{ color: cur.fg }}>
            <div className="count">
              {String(active + 1).padStart(2, "0")} <span style={{ opacity: 0.55 }}>/ {String(n).padStart(2, "0")}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="prev" onClick={() => go(active - 1)} aria-label="Previous slide" style={{ borderColor: cur.line }}>
                ←
              </button>
              <button className="next" onClick={() => go(active + 1)} aria-label="Next slide" style={{ background: cur.btnBg, color: cur.btnFg }}>
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
