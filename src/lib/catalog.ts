import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { inr, sizesLabel } from "./format";

export const productInclude = {
  category: true,
  variants: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProductInclude;

export type ProductWithVariants = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  tileBg: string;
  badge: string;
  catShort: string;
  sizes: string;
  price: string;
  was: string | null;
  inStock: boolean;
  variant: { id: string; label: string; price: number } | null;
};

export function toCard(p: ProductWithVariants): CardProduct {
  const vs = p.variants;
  const first = vs.find((v) => v.stock > 0) ?? vs[0];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.image,
    tileBg: p.tileBg,
    badge: p.badge || p.category.short,
    catShort: p.category.short,
    sizes: sizesLabel(vs.map((v) => v.label)),
    price: first ? inr(first.price) : "",
    was: first?.compareAt && first.compareAt > first.price ? inr(first.compareAt) : null,
    inStock: vs.some((v) => v.stock > 0),
    variant: first ? { id: first.id, label: first.label, price: first.price } : null,
  };
}

export async function getSettings() {
  const rows = await db.setting.findMany();
  const m = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    freeShippingThreshold: Number(m.freeShippingThreshold ?? 249),
    shippingFee: Number(m.shippingFee ?? 40),
    codFee: Number(m.codFee ?? 0),
  };
}

export async function getFeatured(limit = 4) {
  const rows = await db.product.findMany({
    where: { active: true, featured: true },
    include: productInclude,
    orderBy: { popularity: "desc" },
    take: limit,
  });
  return rows.map(toCard);
}

export async function activeProductCount() {
  return db.product.count({ where: { active: true } });
}
