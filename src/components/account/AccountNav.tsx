"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

const LINKS = [
  { href: "/account", label: "Overview", exact: true },
  { href: "/account/orders", label: "My orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/profile", label: "Profile & password" },
];

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname();
  return (
    <nav className="acct-nav" aria-label="Account">
      {LINKS.map((l) => {
        const on = l.exact ? path === l.href : path.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={on ? "on" : ""}>
            {l.label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link href="/admin" style={{ color: "#167D4E" }}>
          Admin panel →
        </Link>
      )}
      <form action={logoutAction}>
        <button type="submit" style={{ color: "#E4341C", width: "100%" }}>
          Log out
        </button>
      </form>
    </nav>
  );
}
