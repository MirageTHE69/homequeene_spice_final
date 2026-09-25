import "server-only";
import type { Coupon } from "@prisma/client";
import { db } from "./db";

export type CouponResult = { ok: true; coupon: Coupon; discount: number } | { ok: false; error: string };

export function couponDiscount(c: Coupon, subtotal: number) {
  let d = c.type === "FLAT" ? c.value : Math.floor((subtotal * c.value) / 100);
  if (c.maxDiscount) d = Math.min(d, c.maxDiscount);
  return Math.max(0, Math.min(d, subtotal));
}

export async function evaluateCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const clean = code.trim().toUpperCase();
  if (!clean) return { ok: false, error: "Enter a coupon code." };
  const c = await db.coupon.findUnique({ where: { code: clean } });
  if (!c || !c.active) return { ok: false, error: "That code isn't valid." };
  if (c.expiresAt && c.expiresAt < new Date()) return { ok: false, error: "That code has expired." };
  if (c.usageLimit != null && c.used >= c.usageLimit) return { ok: false, error: "That code has been fully used." };
  if (subtotal < c.minOrder) return { ok: false, error: `Add ₹${(c.minOrder - subtotal).toLocaleString("en-IN")} more to use ${c.code} (min. order ₹${c.minOrder}).` };
  return { ok: true, coupon: c, discount: couponDiscount(c, subtotal) };
}

export function shippingFor(subtotalAfterDiscount: number, s: { freeShippingThreshold: number; shippingFee: number }) {
  return subtotalAfterDiscount >= s.freeShippingThreshold ? 0 : s.shippingFee;
}
