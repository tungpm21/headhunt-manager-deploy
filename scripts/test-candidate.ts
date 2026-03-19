// Quick debug script - test candidate creation directly
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool = new Pool({ connectionString: process.env.DATABASE_URL }) as any;
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Verify user exists
  const user = await prisma.user.findUnique({ where: { email: "admin@headhunt.com" } });
  console.log("User found:", user ? `id=${user.id}, name=${user.name}` : "NOT FOUND");
  if (!user) process.exit(1);

  // 2. Try creating a candidate
  try {
    const candidate = await prisma.candidate.create({
      data: {
        fullName: "Test Candidate Debug",
        phone: "0901234567",
        email: "test@debug.com",
        status: "AVAILABLE",
        createdById: user.id,
      },
    });
    console.log("✅ Candidate created:", candidate.id, candidate.fullName);
    
    // Clean up
    await prisma.candidate.delete({ where: { id: candidate.id } });
    console.log("✅ Cleaned up test candidate");
  } catch (e) {
    console.error("❌ Candidate creation failed:", e);
  }
}

main().finally(() => {
  prisma.$disconnect();
  pool.end();
});
