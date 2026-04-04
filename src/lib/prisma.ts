import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Prefer a pooled Postgres URL in production, such as Neon pooled connections.
const connectionString =
  process.env.DATABASE_POOLER_URL?.trim() ||
  process.env.DATABASE_URL?.trim() ||
  "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool = new Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
}) as any;
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
