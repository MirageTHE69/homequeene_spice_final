"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/catalog";
import { evaluateCoupon, shippingFor } from "@/lib/pricing";
import { nextOrderNumber } from "@/lib/orders";
import { createRazorpayOrder, razorpayEnabled, razorpayKeyId, verifyRazorpaySignature } from "@/lib/razorpay";
import type { FormState } from "./auth";

/* ---------------- Coupons ---------------- */

export async function applyCoupon(code: string, subtotal: number) {
  const r = await evaluateCoupon(code, Math.max(0, Math.floor(subtotal)));
  if (!r.ok) return { ok: false as const, error: r.error };
  return { ok: true as const, code: r.coupon.code, discount: r.discount, description: r.coupon.description };
}

/* ---------------- Cart refresh ---------------- */

/** Returns current price/stock for the variants in a cart, so stale localStorage prices get corrected. */
export async function refreshCart(variantIds: string[]) {
  const vs = await db.variant.findMany({ where: { id: { in: variantIds.slice(0, 50) } }, include: { product: true } });
  return vs.map((v) => ({ variantId: v.id, price: v.price, stock: v.stock, active: v.product.active, name: v.product.name, label: v.label, image: v.product.image }));
}

/* ---------------- Checkout ---------------- */

const AddressSchema = z.object({
  name: z.string().trim().min(2, "Enter the recipient's name."),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number."),
  line1: z.string().trim().min(3, "Enter the house / street address."),
  line2: z.string().trim().optional().default(""),
  city: z.string().trim().min(2, "Enter the city."),
  state: z.string().trim().min(2, "Choose the state."),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit PIN code."),
});

const PlaceOrderSchema = z.object({
  items: z.array(z.object({ variantId: z.string().min(1), qty: z.number().int().min(1).max(20) })).min(1, "Your cart is empty."),
  addressId: z.string().optional(),
  address: AddressSchema.optional(),
  saveAddress: z.boolean().optional(),
  paymentMethod: z.enum(["COD", "ONLINE"]),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;
export type PlaceOrderResult =
  | { ok: true; orderId: string; number: string; razorpay?: { key: string; orderId: string; amount: number; name: string; email: string; phone: string } }
  | { ok: false; error: string };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in to place your order." };

  const parsed = PlaceOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;

  if (data.paymentMethod === "ONLINE" && !razorpayEnabled()) return { ok: false, error: "Online payment isn't available right now. Please choose Cash on Delivery." };

  // Resolve shipping address.
  let addr: z.infer<typeof AddressSchema>;
  if (data.addressId) {
    const a = await db.address.findFirst({ where: { id: data.addressId, userId: user.id } });
    if (!a) return { ok: false, error: "Please choose a delivery address." };
    addr = { name: a.name, phone: a.phone, line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state, pincode: a.pincode };
  } else if (data.address) {
    addr = data.address;
  } else {
    return { ok: false, error: "Please add a delivery address." };
  }

  // Merge duplicate lines.
  const qtyById = new Map<string, number>();
  for (const it of data.items) qtyById.set(it.variantId, Math.min(20, (qtyById.get(it.variantId) ?? 0) + it.qty));

  const settings = await getSettings();

  try {
    const order = await db.$transaction(async (tx) => {
      const variants = await tx.variant.findMany({ where: { id: { in: [...qtyById.keys()] } }, include: { product: true } });
      if (variants.length !== qtyById.size) throw new Error("Some items in your cart are no longer available. Please review your cart.");
      for (const v of variants) {
        const q = qtyById.get(v.id)!;
        if (!v.product.active) throw new Error(`${v.product.name} is no longer available.`);
        if (v.stock < q) throw new Error(v.stock <= 0 ? `${v.product.name} (${v.label}) is out of stock.` : `Only ${v.stock} of ${v.product.name} (${v.label}) left.`);
      }
      const subtotal = variants.reduce((a, v) => a + v.price * qtyById.get(v.id)!, 0);

      let discount = 0;
      let couponCode: string | null = null;
      if (data.couponCode) {
        const c = await evaluateCoupon(data.couponCode, subtotal);
        if (!c.ok) throw new Error(c.error);
        discount = c.discount;
        couponCode = c.coupon.code;
        await tx.coupon.update({ where: { id: c.coupon.id }, data: { used: { increment: 1 } } });
      }
      const shipping = shippingFor(subtotal - discount, settings);
      const codFee = data.paymentMethod === "COD" ? settings.codFee : 0;
      const total = subtotal - discount + shipping + codFee;

      for (const v of variants) {
        const q = qtyById.get(v.id)!;
        const upd = await tx.variant.updateMany({ where: { id: v.id, stock: { gte: q } }, data: { stock: { decrement: q } } });
        if (upd.count !== 1) throw new Error(`${v.product.name} just sold out. Please update your cart.`);
        await tx.product.update({ where: { id: v.productId }, data: { popularity: { increment: q } } });
      }

      if (!data.addressId && data.saveAddress) {
        const hasDefault = await tx.address.count({ where: { userId: user.id, isDefault: true } });
        await tx.address.create({ data: { ...addr, line2: addr.line2 || null, userId: user.id, isDefault: hasDefault === 0 } });
      }

      const status = data.paymentMethod === "ONLINE" ? "PENDING_PAYMENT" : "PLACED";
      return tx.order.create({
        data: {
          number: await nextOrderNumber(tx),
          userId: user.id,
          status,
          paymentMethod: data.paymentMethod,
          paymentStatus: "PENDING",
          subtotal,
          discount,
          shipping: shipping + codFee,
          total,
          couponCode,
          notes: data.notes || null,
          shipName: addr.name, shipPhone: addr.phone, shipLine1: addr.line1, shipLine2: addr.line2 || null,
          shipCity: addr.city, shipState: addr.state, shipPincode: addr.pincode,
          items: {
            create: variants.map((v) => ({
              productId: v.productId, variantId: v.id, name: v.product.name, variantLabel: v.label, image: v.product.image, price: v.price, qty: qtyById.get(v.id)!,
            })),
          },
          events: { create: { status, note: data.paymentMethod === "COD" ? "Order placed — cash on delivery" : "Waiting for online payment" } },
        },
      });
    });

    if (data.paymentMethod === "ONLINE") {
      const rz = await createRazorpayOrder(order.total, order.number);
      await db.order.update({ where: { id: order.id }, data: { razorpayOrderId: rz.id } });
      return {
        ok: true, orderId: order.id, number: order.number,
        razorpay: { key: razorpayKeyId(), orderId: rz.id, amount: rz.amount, name: user.name, email: user.email, phone: user.phone ?? "" },
      };
    }
    return { ok: true, orderId: order.id, number: order.number };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not place the order. Please try again." };
  }
}

export async function confirmOnlinePayment(input: { orderId: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not logged in." };
  const order = await db.order.findFirst({ where: { id: input.orderId, userId: user.id } });
  if (!order || order.razorpayOrderId !== input.razorpay_order_id) return { ok: false, error: "Order not found." };
  if (!verifyRazorpaySignature(input.razorpay_order_id, input.razorpay_payment_id, input.razorpay_signature)) {
    await db.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
    return { ok: false, error: "Payment could not be verified." };
  }
  await db.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      razorpayPaymentId: input.razorpay_payment_id,
      status: order.status === "PENDING_PAYMENT" ? "PLACED" : order.status,
      events: { create: { status: "PLACED", note: `Payment received (${input.razorpay_payment_id})` } },
    },
  });
  return { ok: true };
}

/* ---------------- Public forms ---------------- */

export async function submitEnquiry(_: FormState, fd: FormData): Promise<FormState> {
  const s = z
    .object({
      name: z.string().trim().min(2, "Enter your full name."),
      firm: z.string().trim().min(2, "Enter your firm or shop name."),
      city: z.string().trim().min(2, "Enter your city."),
      phone: z.string().trim().regex(/^[+\d][\d\s-]{8,15}$/, "Enter a valid phone number."),
      type: z.string().trim().min(2),
      volume: z.string().trim().max(1000).optional(),
    })
    .safeParse(Object.fromEntries(fd));
  if (!s.success) return { error: s.error.issues[0].message };
  await db.enquiry.create({ data: s.data });
  return { ok: "Thank you — we'll call you within one working day." };
}

export async function submitMessage(_: FormState, fd: FormData): Promise<FormState> {
  const s = z
    .object({
      name: z.string().trim().min(2, "Enter your name."),
      phone: z.string().trim().optional(),
      email: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
      orderNumber: z.string().trim().optional(),
      message: z.string().trim().min(5, "Write a short message.").max(3000),
    })
    .safeParse(Object.fromEntries(fd));
  if (!s.success) return { error: s.error.issues[0].message };
  if (!s.data.phone && !s.data.email) return { error: "Leave a phone number or email so we can reply." };
  await db.message.create({ data: { ...s.data, email: s.data.email || null, phone: s.data.phone || null, orderNumber: s.data.orderNumber || null } });
  return { ok: "Message sent. We usually reply the same working day." };
}
