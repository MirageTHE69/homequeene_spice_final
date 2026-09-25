import "server-only";
import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

/** Put stock back for every line of an order (used on cancel / return). */
export async function restock(tx: Tx, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const it of items) {
    if (!it.variantId) continue;
    await tx.variant.updateMany({ where: { id: it.variantId }, data: { stock: { increment: it.qty } } });
  }
}

export async function nextOrderNumber(tx: Tx) {
  const last = await tx.order.findFirst({ orderBy: { createdAt: "desc" }, select: { number: true } });
  const n = last ? Number(last.number.replace(/\D/g, "")) || 100000 : 100000;
  let candidate = n + 1;
  // Guard against gaps / manual edits.
  while (await tx.order.findUnique({ where: { number: `HQ${candidate}` }, select: { id: true } })) candidate++;
  return `HQ${candidate}`;
}

/** Statuses from which stock has already been returned. */
export const RESTOCKED = new Set(["CANCELLED", "RETURNED"]);
