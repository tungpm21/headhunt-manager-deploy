/**
 * patch-demo-images.ts
 * Updates existing demo employers with real logo URLs + cover images.
 * Run: npx tsx prisma/patch-demo-images.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local", override: true });
dotenv.config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL must be set");
  process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool = new Pool({ connectionString }) as any;
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Logo URLs (Wikipedia Commons SVG — stable, no auth) ──────────────────────
// ── Cover URLs (Unsplash — stable photo IDs, 1200×400) ───────────────────────

const DEMO_DATA: Record<
  string,
  {
    logo: string;
    coverImage: string | null;
    showBanner: boolean;
    // Subscription tier to grant showBanner
    bannerTier?: "VIP" | "PREMIUM" | "STANDARD" | "BASIC";
  }
> = {
  "samsung-electronics-vietnam": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
    coverImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop&q=80",
    showBanner: true,
  },
  "lg-electronics-vietnam": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg",
    coverImage:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=400&fit=crop&q=80",
    showBanner: true,
  },
  "toyota-motor-vietnam": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Toyota_logo_%28Red%29.svg",
    coverImage:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&h=400&fit=crop&q=80",
    showBanner: true,
  },
  "canon-vietnam": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/80/Canon_logo.svg",
    coverImage:
      "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1200&h=400&fit=crop&q=80",
    showBanner: false,
  },
  "bosch-vietnam": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/Bosch-logotype.svg",
    coverImage:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=400&fit=crop&q=80",
    showBanner: false,
  },
  "panasonic-vietnam": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Panasonic_logo.svg",
    coverImage: null,
    showBanner: false,
  },
  "nestle-vietnam": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Nestl%C3%A9.svg",
    coverImage: null,
    showBanner: false,
  },
  "intel-products-vietnam": {
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Intel-logo.svg",
    coverImage:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=400&fit=crop&q=80",
    showBanner: false,
  },
};

async function main() {
  console.log("🖼️  Patching demo employer images...\n");

  for (const [slug, data] of Object.entries(DEMO_DATA)) {
    const employer = await prisma.employer.findUnique({
      where: { slug },
      include: { subscription: true },
    });

    if (!employer) {
      console.log(`⚠️  Không tìm thấy: ${slug}`);
      continue;
    }

    // Update employer images
    await prisma.employer.update({
      where: { slug },
      data: {
        logo: data.logo,
        coverImage: data.coverImage,
      },
    });

    // Update showBanner on subscription if needed
    if (employer.subscription && employer.subscription.showBanner !== data.showBanner) {
      await prisma.subscription.update({
        where: { id: employer.subscription.id },
        data: { showBanner: data.showBanner },
      });
      console.log(
        `✅ ${employer.companyName} — logo ✓, cover ${data.coverImage ? "✓" : "—"}, showBanner → ${data.showBanner}`
      );
    } else {
      console.log(
        `✅ ${employer.companyName} — logo ✓, cover ${data.coverImage ? "✓" : "—"}`
      );
    }
  }

  // Summary
  const bannerCount = await prisma.subscription.count({
    where: { showBanner: true, status: "ACTIVE" },
  });
  const coverCount = await prisma.employer.count({
    where: { coverImage: { not: null } },
  });
  console.log(`\n📊 Kết quả:`);
  console.log(`   - ${coverCount} employers có cover image`);
  console.log(`   - ${bannerCount} employers showBanner=true → sẽ xuất hiện ở carousel`);
  console.log("\n✨ Done!");
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
