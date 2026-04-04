import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL must be set"); process.exit(1); }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool = new Pool({ connectionString }) as any;
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const LOGO_MAP: Record<string, string> = {
    "samsung-electronics-vietnam": "/logos/samsung.png",
    "canon-vietnam": "/logos/canon.png",
    "toyota-motor-vietnam": "/logos/toyota.png",
    "lg-electronics-vietnam": "/logos/lg.png",
    "bosch-vietnam": "/logos/bosch.png",
    "panasonic-vietnam": "/logos/panasonic.png",
    "nestle-vietnam": "/logos/nestle.png",
    "intel-products-vietnam": "/logos/intel.png",
};

async function main() {
    console.log("🔄 Updating employer logos...\n");

    for (const [slug, logoPath] of Object.entries(LOGO_MAP)) {
        const employer = await prisma.employer.findUnique({ where: { slug } });
        if (!employer) {
            console.log(`⚠️  Employer not found: ${slug}`);
            continue;
        }

        if (employer.logo === logoPath) {
            console.log(`✅ Already correct: ${employer.companyName}`);
            continue;
        }

        await prisma.employer.update({
            where: { slug },
            data: { logo: logoPath },
        });
        console.log(`✅ Updated: ${employer.companyName} → ${logoPath}`);
    }

    console.log("\n🎉 Done!");
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); await pool.end(); });
