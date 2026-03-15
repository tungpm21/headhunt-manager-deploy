import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL must be set");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testAuth() {
  console.log("Testing DB connection and seeded users...");

  try {
    const admin = await prisma.user.findUnique({
      where: { email: "admin@headhunt.com" }
    });

    if (!admin) {
      console.log("❌ Admin user not found!");
      process.exit(1);
    }

    console.log(`✅ Found user: ${admin.name} (${admin.email}) with role ${admin.role}`);

    const isMatch = await bcrypt.compare("headhunt123", admin.password);
    
    if (isMatch) {
      console.log("✅ Password hash verification successful!");
      console.log("NextAuth credentials provider will work.");
    } else {
      console.log("❌ Password hash verification failed!");
    }

  } catch (error) {
    console.error("❌ Database connection error:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testAuth();
