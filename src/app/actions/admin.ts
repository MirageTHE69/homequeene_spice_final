"use server";

import { mkdir, writeFile } from "fs/promises";
import { put } from "@vercel/blob";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { restock, RESTOCKED } from "@/lib/orders";
import { ORDER_STATUSES, slugify } from "@/lib/format";
import type { FormState } from "./auth";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => {
  const v = str(fd, k);
  return v === "" ? null : Number(v);
};

/* ---------------- Uploads ---------------- */

const ALLOWED = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

/** Saves an uploaded image and returns its public URL: Vercel Blob in production, /public/uploads locally. */
export async function uploadImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image file." };
  const ext = ALLOWED.get(file.type);
  if (!ext) return { error: "Use a PNG, JPG, WEBP or AVIF image." };
  if (file.size > 5 * 1024 * 1024) return { error: "Image must be under 5 MB." };
  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${name}`, file, { access: "public", contentType: file.type });
    return { url: blob.url };
  }
  if (process.env.VERCEL) return { error: "Image storage isn't connected. Connect a Vercel Blob store to this project." };
  const dir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/products/${name}` };
}

/* ---------------- Orders ---------------- */

export async function updateOrder(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const status = str(fd, "status");
  const paymentStatus = str(fd, "paymentStatus");
  const note = str(fd, "note");
  const courier = str(fd, "courier");
  const trackingNumber = str(fd, "trackingNumber");
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return { error: "Unknown status." };
  if (!["PENDING", "PAID", "FAILED", "REFUNDED"].includes(paymentStatus)) return { error: "Unknown payment status." };

  const order = await db.order.findUnique({ where: { id } });
  if (!order) return { error: "Order not found." };
  if (status === "SHIPPED" && !trackingNumber && !order.trackingNumber) return { error: "Add a tracking number before marking as shipped." };

  await db.$transaction(async (tx) => {
    // Stock moves only when crossing into / out of a cancelled or returned state.
    const wasOut = RESTOCKED.has(order.status);
    const nowOut = RESTOCKED.has(status);
    if (!wasOut && nowOut) await restock(tx, order.id);
    if (wasOut && !nowOut) {
      const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
      for (const it of items) if (it.variantId) await tx.variant.updateMany({ where: { id: it.variantId }, data: { stock: { decrement: it.qty } } });
    }
    const events = [];
    if (status !== order.status || note) events.push({ status, note: note || null });
    if (paymentStatus !== order.paymentStatus) events.push({ status, note: `Payment marked ${paymentStatus.toLowerCase()}` });
    await tx.order.update({
      where: { id },
      data: {
        status,
        paymentStatus: status === "DELIVERED" && order.paymentMethod === "COD" && paymentStatus === "PENDING" ? "PAID" : paymentStatus,
        ...(fd.has("courier") ? { courier: courier || null, trackingNumber: trackingNumber || null } : {}),
        events: { create: events },
      },
    });
  });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: "Order updated." };
}

/* ---------------- Products ---------------- */

const VariantSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, "Each pack size needs a label."),
  price: z.number().int().min(1, "Price must be at least ₹1."),
  compareAt: z.number().int().nullable(),
  stock: z.number().int().min(0),
  sku: z.string().trim().optional(),
});

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Enter a product name."),
  slug: z.string().trim().optional(),
  categoryId: z.string().min(1, "Choose a category."),
  summary: z.string().trim().min(10, "Write a short summary (10+ characters)."),
  description: z.string().trim().optional(),
  badge: z.string().trim().optional(),
  image: z.string().trim().optional(),
  gallery: z.array(z.string().trim()).default([]),
  tileBg: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Tile colour must be a hex code like #FFF0D4."),
  ingredients: z.string().trim().optional(),
  howToUse: z.string().trim().optional(),
  storage: z.string().trim().optional(),
  featured: z.boolean(),
  active: z.boolean(),
  variants: z.array(VariantSchema).min(1, "Add at least one pack size."),
});

export type ProductInput = z.infer<typeof ProductSchema>;

export async function saveProduct(input: ProductInput): Promise<{ ok: boolean; error?: string; id?: string }> {
  await requireAdmin();
  const s = ProductSchema.safeParse(input);
  if (!s.success) return { ok: false, error: s.error.issues[0].message };
  const d = s.data;
  const slug = slugify(d.slug || d.name);
  if (!slug) return { ok: false, error: "Enter a valid URL slug." };
  const clash = await db.product.findFirst({ where: { slug, NOT: d.id ? { id: d.id } : undefined } });
  if (clash) return { ok: false, error: `Another product already uses the URL "${slug}".` };

  const base = {
    name: d.name, slug, categoryId: d.categoryId, summary: d.summary, description: d.description || null, badge: d.badge || null,
    image: d.image || null, gallery: JSON.stringify(d.gallery.filter(Boolean)), tileBg: d.tileBg,
    ingredients: d.ingredients || null, howToUse: d.howToUse || null, storage: d.storage || null, featured: d.featured, active: d.active,
  };

  try {
    const id = await db.$transaction(async (tx) => {
      const p = d.id ? await tx.product.update({ where: { id: d.id }, data: base }) : await tx.product.create({ data: base });
      const existing = await tx.variant.findMany({ where: { productId: p.id } });
      const keep = new Set(d.variants.map((v) => v.id).filter(Boolean));
      // Removed variants: delete (order history keeps its own copy of name/price).
      for (const v of existing) if (!keep.has(v.id)) await tx.variant.delete({ where: { id: v.id } });
      for (const [i, v] of d.variants.entries()) {
        const sku = (v.sku || `HQ-${slug.toUpperCase().replace(/-/g, "").slice(0, 12)}-${v.label.replace(/\s+/g, "").toUpperCase()}`).slice(0, 40);
        const data = { label: v.label, price: v.price, compareAt: v.compareAt && v.compareAt > v.price ? v.compareAt : null, stock: v.stock, sortOrder: i, sku };
        if (v.id && existing.some((e) => e.id === v.id)) await tx.variant.update({ where: { id: v.id }, data });
        else await tx.variant.create({ data: { ...data, productId: p.id } });
      }
      return p.id;
    });
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath(`/product/${slug}`);
    return { ok: true, id };
  } catch (e) {
    const msg = e instanceof Error && /Unique constraint.*sku/i.test(e.message) ? "Two pack sizes share the same SKU — give each a unique SKU." : "Could not save the product.";
    return { ok: false, error: msg };
  }
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const used = await db.orderItem.count({ where: { productId: id } });
  if (used) {
    // Keep it for order history; just hide it from the store.
    await db.product.update({ where: { id }, data: { active: false } });
  } else {
    await db.product.delete({ where: { id } });
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function setProductActive(id: string, active: boolean) {
  await requireAdmin();
  await db.product.update({ where: { id }, data: { active } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function setVariantStock(id: string, stock: number) {
  await requireAdmin();
  if (!Number.isInteger(stock) || stock < 0) return;
  await db.variant.update({ where: { id }, data: { stock } });
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
}

/* ---------------- Categories ---------------- */

export async function saveCategory(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (name.length < 2) return { error: "Enter a category name." };
  const slug = slugify(str(fd, "slug") || name);
  const clash = await db.category.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) return { error: "Another category already uses that URL." };
  const data = {
    name, slug, short: str(fd, "short") || name.split(" ")[0], description: str(fd, "description") || null,
    bg: str(fd, "bg") || "#FFB703", fg: str(fd, "fg") || "#1C1917", image: str(fd, "image") || null, sortOrder: num(fd, "sortOrder") ?? 0,
  };
  if (id) await db.category.update({ where: { id }, data });
  else await db.category.create({ data });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: id ? "Category updated." : "Category added." };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const n = await db.product.count({ where: { categoryId: id } });
  if (n) return { ok: false, error: `Move or delete its ${n} products first.` };
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { ok: true };
}

/* ---------------- Customers ---------------- */

export async function setUserBlocked(id: string, blocked: boolean) {
  const me = await requireAdmin();
  if (me.id === id) return;
  await db.user.update({ where: { id }, data: { blocked } });
  revalidatePath(`/admin/customers/${id}`);
}

export async function setUserRole(id: string, role: "ADMIN" | "CUSTOMER") {
  const me = await requireAdmin();
  if (me.id === id) return;
  await db.user.update({ where: { id }, data: { role } });
  revalidatePath(`/admin/customers/${id}`);
}

export async function createAdminUser(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a name and a valid email." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (await db.user.findUnique({ where: { email } })) return { error: "That email already has an account — open it under Customers and make it admin." };
  await db.user.create({ data: { name, email, role: "ADMIN", passwordHash: await bcrypt.hash(password, 10) } });
  revalidatePath("/admin/settings");
  return { ok: `${name} can now log in to the admin panel.` };
}

/* ---------------- Coupons ---------------- */

export async function saveCoupon(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const code = str(fd, "code").toUpperCase().replace(/\s+/g, "");
  const type = str(fd, "type") === "FLAT" ? "FLAT" : "PERCENT";
  const value = num(fd, "value");
  if (!/^[A-Z0-9_-]{3,20}$/.test(code)) return { error: "Code must be 3–20 letters/numbers." };
  if (!value || value <= 0 || (type === "PERCENT" && value > 90)) return { error: type === "PERCENT" ? "Percent must be 1–90." : "Enter a discount amount." };
  const clash = await db.coupon.findFirst({ where: { code, NOT: id ? { id } : undefined } });
  if (clash) return { error: "That code already exists." };
  const exp = str(fd, "expiresAt");
  const data = {
    code, type, value, description: str(fd, "description") || null, minOrder: num(fd, "minOrder") ?? 0,
    maxDiscount: num(fd, "maxDiscount"), usageLimit: num(fd, "usageLimit"), active: fd.get("active") === "on",
    expiresAt: exp ? new Date(`${exp}T23:59:59+05:30`) : null,
  };
  if (id) await db.coupon.update({ where: { id }, data });
  else await db.coupon.create({ data });
  revalidatePath("/admin/coupons");
  return { ok: id ? "Coupon updated." : "Coupon created." };
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  await db.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}

/* ---------------- Recipes ---------------- */

export async function saveRecipe(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const title = str(fd, "title");
  if (title.length < 3) return { error: "Enter a title." };
  const slug = slugify(str(fd, "slug") || title);
  const clash = await db.recipe.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) return { error: "Another recipe already uses that URL." };
  const data = {
    title, slug, tag: str(fd, "tag") || "Everyday sabzi", time: str(fd, "time") || "30 min", summary: str(fd, "summary"),
    image: str(fd, "image") || null, ingredients: str(fd, "ingredients"), steps: str(fd, "steps"), products: str(fd, "products"),
    published: fd.get("published") === "on", sortOrder: num(fd, "sortOrder") ?? 0,
  };
  if (!data.summary) return { error: "Write a one-line summary." };
  if (id) await db.recipe.update({ where: { id }, data });
  else await db.recipe.create({ data });
  revalidatePath("/admin/recipes");
  revalidatePath("/recipes");
  revalidatePath("/");
  if (!id) redirect("/admin/recipes");
  return { ok: "Recipe saved." };
}

export async function deleteRecipe(id: string) {
  await requireAdmin();
  await db.recipe.delete({ where: { id } });
  revalidatePath("/admin/recipes");
  redirect("/admin/recipes");
}

/* ---------------- Enquiries & messages ---------------- */

export async function setEnquiryStatus(id: string, status: string) {
  await requireAdmin();
  if (!["NEW", "CONTACTED", "CLOSED"].includes(status)) return;
  await db.enquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/enquiries");
}

export async function setMessageStatus(id: string, status: string) {
  await requireAdmin();
  if (!["NEW", "REPLIED", "CLOSED"].includes(status)) return;
  await db.message.update({ where: { id }, data: { status } });
  revalidatePath("/admin/messages");
}

/* ---------------- Settings ---------------- */

export async function saveSettings(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const vals = { freeShippingThreshold: num(fd, "freeShippingThreshold"), shippingFee: num(fd, "shippingFee"), codFee: num(fd, "codFee") };
  for (const [k, v] of Object.entries(vals)) {
    if (v === null || !Number.isFinite(v) || v < 0) return { error: `Enter a valid number for ${k}.` };
    await db.setting.upsert({ where: { key: k }, update: { value: String(Math.round(v)) }, create: { key: k, value: String(Math.round(v)) } });
  }
  revalidatePath("/", "layout");
  return { ok: "Settings saved." };
}
