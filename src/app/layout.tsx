import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const body = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Home Queen Spices — Real masala, ground in our own mill",
    template: "%s · Home Queen Spices",
  },
  description:
    "26 spices and masalas from one family-run unit in Vadodara. Mixed, ground and sealed by RKR Foods since 1987 — never outsourced, never dyed.",
  icons: { icon: "/images/brand/logo.webp" },
  openGraph: { siteName: "Home Queen Spices", type: "website", locale: "en_IN" },
};

export const viewport: Viewport = { themeColor: "#E4341C" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
