import { PrismaClient } from "@prisma/client";

// Vercel's storage integration prefixes the variable with the store name.
const url = process.env.DATABASE_URL || process.env.homequeen_DATABASE_URL || process.env.homequeen_POSTGRES_URL;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient(url ? { datasourceUrl: url } : undefined);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
