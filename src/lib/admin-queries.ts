import "server-only";
import type { Prisma } from "@prisma/client";

export function orderWhere(sp: Record<string, string | undefined>): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};
  if (sp.status) where.status = sp.status;
  if (sp.pay === "COD" || sp.pay === "ONLINE") where.paymentMethod = sp.pay;
  if (sp.paid) where.paymentStatus = sp.paid;
  if (sp.from || sp.to) {
    where.createdAt = {};
    if (sp.from) where.createdAt.gte = new Date(`${sp.from}T00:00:00+05:30`);
    if (sp.to) where.createdAt.lte = new Date(`${sp.to}T23:59:59+05:30`);
  }
  const q = sp.q?.trim();
  if (q) {
    where.OR = [
      { number: { contains: q.toUpperCase() } },
      { shipName: { contains: q } },
      { shipPhone: { contains: q } },
      { user: { email: { contains: q.toLowerCase() } } },
    ];
  }
  return where;
}
