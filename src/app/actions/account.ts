"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, getCurrentUser } from "@/lib/auth";
import { restock } from "@/lib/orders";
import type { FormState } from "./auth";

export async function toggleWishlist(productId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, wished: false };
  const key = { userId_productId: { userId: user.id, productId } };
  const existing = await db.wishlistItem.findUnique({ where: key });
  if (existing) await db.wishlistItem.delete({ where: key });
  else await db.wishlistItem.create({ data: { userId: user.id, productId } });
  revalidatePath("/account/wishlist");
  return { ok: true as const, wished: !existing };
}

export async function updateProfile(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  const s = z
    .object({
      name: z.string().trim().min(2, "Enter your name."),
      phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number."),
      email: z.string().trim().toLowerCase().email("Enter a valid email."),
    })
    .safeParse({ name: fd.get("name"), phone: String(fd.get("phone") || "").replace(/\D/g, "").slice(-10), email: fd.get("email") });
  if (!s.success) return { error: s.error.issues[0].message };
  if (s.data.email !== user.email && (await db.user.findUnique({ where: { email: s.data.email } }))) return { error: "Another account already uses that email." };
  await db.user.update({ where: { id: user.id }, data: s.data });
  await createSession({ uid: user.id, role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER", name: s.data.name });
  revalidatePath("/account", "layout");
  return { ok: "Profile updated." };
}

export async function changePassword(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  const current = String(fd.get("current") || "");
  const next = String(fd.get("next") || "");
  const confirm = String(fd.get("confirm") || "");
  if (!(await bcrypt.compare(current, user.passwordHash))) return { error: "Your current password is incorrect." };
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  if (next !== confirm) return { error: "The new passwords don't match." };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  return { ok: "Password changed." };
}

const AddressSchema = z.object({
  name: z.string().trim().min(2, "Enter the recipient's name."),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number."),
  line1: z.string().trim().min(3, "Enter the house / street address."),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter the city."),
  state: z.string().trim().min(2, "Choose the state."),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit PIN code."),
});

export async function saveAddress(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  const s = AddressSchema.safeParse(Object.fromEntries(fd));
  if (!s.success) return { error: s.error.issues[0].message };
  const id = String(fd.get("id") || "");
  const makeDefault = fd.get("isDefault") === "on";
  const count = await db.address.count({ where: { userId: user.id } });
  const data = { ...s.data, line2: s.data.line2 || null };

  await db.$transaction(async (tx) => {
    if (makeDefault || count === 0) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    if (id) {
      await tx.address.updateMany({ where: { id, userId: user.id }, data: { ...data, ...(makeDefault ? { isDefault: true } : {}) } });
    } else {
      await tx.address.create({ data: { ...data, userId: user.id, isDefault: makeDefault || count === 0 } });
    }
  });
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { ok: id ? "Address updated." : "Address added." };
}

export async function deleteAddress(id: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await db.address.deleteMany({ where: { id, userId: user.id } });
  const def = await db.address.findFirst({ where: { userId: user.id, isDefault: true } });
  if (!def) {
    const first = await db.address.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
    if (first) await db.address.update({ where: { id: first.id }, data: { isDefault: true } });
  }
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(id: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await db.$transaction([
    db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    db.address.updateMany({ where: { id, userId: user.id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
}

const CANCELLABLE = new Set(["PENDING_PAYMENT", "PLACED", "CONFIRMED"]);

export async function cancelMyOrder(orderId: string, reason: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in again." };
  const order = await db.order.findFirst({ where: { id: orderId, userId: user.id } });
  if (!order) return { ok: false, error: "Order not found." };
  if (!CANCELLABLE.has(order.status)) return { ok: false, error: "This order has already been packed and can't be cancelled online. Please call us." };
  await db.$transaction(async (tx) => {
    await restock(tx, order.id);
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        events: {
          create: {
            status: "CANCELLED",
            note: `Cancelled by customer${reason ? `: ${reason.slice(0, 200)}` : ""}${order.paymentStatus === "PAID" ? " — refund will be processed to the original payment method" : ""}`,
          },
        },
      },
    });
  });
  revalidatePath(`/account/orders/${order.id}`);
  revalidatePath("/account/orders");
  return { ok: true };
}
