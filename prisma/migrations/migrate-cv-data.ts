import { config } from "dotenv";
config({ path: ".env.local", override: true });
config({ path: ".env" });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL must be set");
  process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool = new Pool({ connectionString }) as any;
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const candidates = await prisma.candidate.findMany({
    where: { cvFileUrl: { not: null } },
    select: {
      id: true,
      cvFileUrl: true,
      cvFileName: true,
      createdById: true,
    },
  });

  console.log(`Found ${candidates.length} candidates with legacy CV fields`);

  let migrated = 0;

  for (const candidate of candidates) {
    if (!candidate.cvFileUrl) continue;

    const existing = await prisma.candidateCV.findFirst({
      where: {
        candidateId: candidate.id,
        fileUrl: candidate.cvFileUrl,
      },
      select: { id: true },
    });

    if (existing) continue;

    const hasPrimary = await prisma.candidateCV.findFirst({
      where: {
        candidateId: candidate.id,
        isPrimary: true,
      },
      select: { id: true },
    });

    await prisma.candidateCV.create({
      data: {
        candidateId: candidate.id,
        fileUrl: candidate.cvFileUrl,
        fileName: candidate.cvFileName ?? `candidate-${candidate.id}-legacy-cv`,
        label: "CV migrated từ field cũ",
        isPrimary: !hasPrimary,
        uploadedById: candidate.createdById,
      },
    });

    migrated += 1;
  }

  console.log(`Migrated ${migrated} legacy CV records`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
