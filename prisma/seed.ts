import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt-ts";

// Load env vars
import * as dotenv from "dotenv";
dotenv.config();

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
  console.log("Start seeding team accounts...");

  const passwordHash = await bcrypt.hash("headhunt123", 10);

  const users = [
    {
      name: "Admin Manager",
      email: "admin@headhunt.com",
      password: passwordHash,
      role: "ADMIN" as const,
    },
    {
      name: "Recruiter 1",
      email: "recruiter1@headhunt.com",
      password: passwordHash,
      role: "MEMBER" as const,
    },
    {
      name: "Recruiter 2",
      email: "recruiter2@headhunt.com",
      password: passwordHash,
      role: "MEMBER" as const,
    },
    {
      name: "Recruiter 3",
      email: "recruiter3@headhunt.com",
      password: passwordHash,
      role: "MEMBER" as const,
    },
  ];

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: user,
      });
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
