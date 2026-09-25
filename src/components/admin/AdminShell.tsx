"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/actions/auth";

type Counts = { orders: number; inventory: number; enquiries: number; messages: number };

const GROUPS: { label: string; links: { href: string; label: string; count?: keyof Counts; exact?: boolean }[] }[] = [
  { label: "Overview", links: [{ href: "/admin", label: "Dashboard", exact: true }] },
  {
    label: "Sales",
    links: [
      { href: "/admin/orders", label: "Orders", count: "orders" },
      { href: "/admin/customers", label: "Customers" },
      { href: "/admin/coupons", label: "Coupons" },
    ],
  },
  {
    label: "Catalogue",
    links: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/inventory", label: "Inventory", count: "inventory" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/recipes", label: "Recipes" },
    ],
  },
  {
    label: "Inbox",
    links: [
      { href: "/admin/enquiries", label: "Partner enquiries", count: "enquiries" },
      { href: "/admin/messages", label: "Messages", count: "messages" },
    ],
  },
  { label: "Store", links: [{ href: "/admin/settings", label: "Settings" }] },
];

export function AdminShell({ name, counts, children }: { name: string; counts: Counts; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  return (
    <div className="admin-shell">
      <div className="admin-mobilebar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/brand/logo.webp" alt="Home Queen" style={{ height: 32, background: "#FFFBF4", padding: 3 }} />
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <aside className={`admin-side ${open ? "open" : ""}`}>
        <div className="brand">
          <Link href="/admin" className="lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/brand/logo.webp" alt="Home Queen" />
          </Link>
          <div className="tag">Store admin</div>
        </div>
        <nav aria-label="Admin">
          {GROUPS.map((g) => (
            <div key={g.label} style={{ display: "contents" }}>
              <div className="grp">{g.label}</div>
              {g.links.map((l) => {
                const on = l.exact ? path === l.href : path.startsWith(l.href);
                const c = l.count ? counts[l.count] : 0;
                return (
                  <Link key={l.href} href={l.href} className={on ? "on" : ""}>
                    <span>{l.label}</span>
                    {c > 0 && <span className="count">{c}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="foot">
          <div style={{ color: "#FFFBF4", fontWeight: 700, marginBottom: 8 }}>{name}</div>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/" target="_blank">
              View store ↗
            </Link>
            <form action={logoutAction}>
              <button type="submit">Log out</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}

export function AdminTop({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="admin-top">
      <div>
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {children && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{children}</div>}
    </div>
  );
}
