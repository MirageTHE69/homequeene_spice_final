import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <div className="footer-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/brand/logo.webp" alt="Home Queen" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.7, margin: "0 0 18px", maxWidth: "36ch" }}>
            A product of RKR Foods. Spices ground, blended and packed at 4/4 Industrial Estate, Gorwa, Vadodara, Gujarat 390016.
          </p>
          <div className="display" style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.5, color: "#FFB703" }}>
            <a href="tel:+918866911100" style={{ color: "#FFB703" }}>+91 8866 911 100</a>
            <br />
            <a href="mailto:info@homequeenspices.com" style={{ color: "#FFB703" }}>info@homequeenspices.com</a>
          </div>
        </div>
        <div>
          <div className="footer-h">Shop</div>
          <div className="footer-links">
            <Link href="/shop?category=basic-spices">Basic Spices</Link>
            <Link href="/shop?category=veg-masalas">Veg Masalas</Link>
            <Link href="/shop?category=non-veg-masalas">Non-Veg Masalas</Link>
            <Link href="/shop?category=combo-kits">Combo Kits</Link>
          </div>
        </div>
        <div>
          <div className="footer-h">Company</div>
          <div className="footer-links">
            <Link href="/about">Our Story</Link>
            <Link href="/partner">Partner With Us</Link>
            <Link href="/recipes">Recipes</Link>
            <Link href="/contact">Reach Us</Link>
            <Link href="/account">My Account</Link>
          </div>
        </div>
        <div>
          <div className="footer-h">Policies</div>
          <div className="footer-links">
            <Link href="/policies/shipping">Shipping Policy</Link>
            <Link href="/policies/refund">Refund Policy</Link>
            <Link href="/policies/terms">Terms &amp; Conditions</Link>
            <Link href="/policies/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} RKR Foods · FSSAI Lic. 0000000000000</span>
        <span style={{ color: "#FFB703" }}>Har ghar mein swad bharde</span>
      </div>
    </footer>
  );
}
