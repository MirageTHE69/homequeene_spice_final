# Home Queen Spices — website, customer dashboard & admin panel

A Next.js 15 e-commerce site built from the `claude-desing/Home Queen Revamp v4` design.

## Run it locally

The database is Postgres (Prisma Postgres, connected through Vercel Storage). Put its connection string in `.env` as `DATABASE_URL`, then:

```bash
npm install          # also generates the Prisma client
npm run setup        # creates the tables and loads products, recipes, demo orders
npm run dev          # http://localhost:3000
```

Start over with fresh demo data at any time: `npm run db:reset`.

### Logins created by the seed

| Role | Email | Password |
|---|---|---|
| Admin | admin@homequeenspices.com | `Admin@123` |
| Customer (has sample orders) | customer@example.com | `Customer@123` |

**Change the admin password before going live** (Account → Profile & password).

## What's included

**Storefront** — home page with the 4-slide hero carousel, shop with category / pack-size / price filters, search, sort and "load more"; product pages with pack-size pricing, gallery, wishlist and "Goes with"; cart with coupons and a free-shipping meter; checkout with saved addresses, Cash on Delivery and Razorpay; Our Story, Recipes (with full recipe pages), Partner enquiry form, Reach Us form with map, policy pages.

**Customer dashboard** (`/account`) — overview, order history, order tracking with status timeline, cancel order (until packed), order again, printable invoice, wishlist, address book, profile & password.

**Admin panel** (`/admin`) — sales dashboard (revenue, orders, AOV, new customers, revenue chart, top sellers, low stock); orders (filters, CSV export, status / payment / tracking updates, invoice & packing slip); products (create / edit, image upload, gallery, pack sizes with price, MRP, stock, SKU; hide / archive); inventory with inline stock editing; categories; customers (history, block, make admin); coupons (% or ₹, minimum order, cap, usage limit, expiry); recipes; partner enquiries; contact messages; settings (free-shipping threshold, shipping fee, COD fee, admin users).

Stock is reserved when an order is placed and returned automatically when an order is cancelled or returned.

## Images

- Product packs and the logo come from the design folder (`public/images/products`, `public/images/brand`).
- Lifestyle and recipe photography is from Unsplash (free for commercial use) — see `src/lib/stock.ts` and the recipe records. Replace them with your own photos from the mill whenever you have them.
- Products without a pack photo yet (Turmeric, Coriander, Chilli Powder, Garam Masala, Kitchen King, Chat Masala, Chicken Masala) show a branded placeholder pack. Upload the real photo in **Admin → Products**.

## Hosting on Vercel

1. **Database** — Vercel Storage → Prisma Postgres, connected to the project. The app reads `DATABASE_URL`, or the prefixed `homequeen_DATABASE_URL` that Vercel creates (see `src/lib/db.ts`).
2. **Image uploads** — Vercel Storage → Blob, connected to the project (provides `BLOB_READ_WRITE_TOKEN`). Without it, admin image upload shows an error on Vercel; pasting an image URL still works.
3. **Environment variables** — `AUTH_SECRET` (long random string) and `NEXT_PUBLIC_SITE_URL` (your live address).
4. **Online payments** — add `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`. Without them the checkout offers Cash on Delivery only.

Pushing to `main` on GitHub redeploys automatically.

Also replace the placeholder FSSAI licence number in `src/components/store/SiteFooter.tsx`, and have the policy text in `src/app/(store)/policies/[slug]/page.tsx` checked against how you actually operate.

## Project layout

```
prisma/            schema.prisma, seed.ts
public/images/     product packs and logo
src/app/(store)/   storefront + customer account pages
src/app/admin/     admin panel
src/app/actions/   server actions (auth, shop, account, admin)
src/components/    store, account and admin components
src/lib/           db, auth/session, pricing, catalogue queries, content
```
