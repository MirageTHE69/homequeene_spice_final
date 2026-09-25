"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

export type HeaderUser = { name: string; role: string } | null;

export const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Our Story" },
  { href: "/recipes", label: "Recipes" },
  { href: "/partner", label: "Partner" },
  { href: "/contact", label: "Reach Us" },
];

export function accountLink(user: HeaderUser) {
  if (!user) return { href: "/login", label: "Log in" };
  if (user.role === "ADMIN") return { href: "/admin", label: "Admin" };
  return { href: "/account", label: user.name.split(" ")[0] || "Account" };
}

/** Sticky cream header used on every page except home (home has its own over the hero). */
export function SiteHeader({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  if (pathname === "/") return null;
  const acct = accountLink(user);

  return (
    <header className="site-header">
      <div className="wrap bar">
        <Link href="/" className="logo" aria-label="Home Queen — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/brand/logo.webp" alt="Home Queen" />
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={pathname.startsWith(n.href) ? "active" : ""}>
              {n.label}
            </Link>
          ))}
          <Link href={acct.href} className={`acct ${pathname.startsWith(acct.href) ? "active" : ""}`}>
            <UserIcon /> {acct.label}
          </Link>
          <Link href="/cart" className="cart-btn">
            Cart · {ready ? count : 0}
          </Link>
        </nav>
        <button className="menu-toggle" aria-expanded={open} aria-label="Menu" onClick={() => setOpen((o) => !o)}>
          {open ? "✕" : "☰"}
        </button>
      </div>
      <div className={`wrap mobile-nav ${open ? "open" : ""}`}>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href}>
            {n.label}
          </Link>
        ))}
        <Link href={acct.href}>{user ? "My account" : "Log in / Register"}</Link>
        <Link href="/cart" style={{ color: "#E4341C" }}>
          Cart · {ready ? count : 0}
        </Link>
      </div>
    </header>
  );
}

export function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}
