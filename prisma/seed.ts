import { PrismaClient, Prisma, CandidateStatus, CandidateSource, CandidateSeniority } from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt-ts";
import * as dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL must be set"); process.exit(1); }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool = new Pool({ connectionString }) as any;
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("ðŸŒ± Start seeding...\n");
  const pw = await bcrypt.hash("headhunt123", 10);
  const epw = await bcrypt.hash("employer123", 10);

  // ==================== CRM USERS ====================
  for (const u of [
    { name: "Admin Manager", email: "admin@headhunt.com", password: pw, role: "ADMIN" as const },
    { name: "Nguyá»…n Thá»‹ Lan", email: "lan.nguyen@headhunt.com", password: pw, role: "MEMBER" as const },
    { name: "Tráº§n VÄƒn Minh", email: "minh.tran@headhunt.com", password: pw, role: "MEMBER" as const },
  ]) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } });
    if (!exists) { await prisma.user.create({ data: u }); console.log(`âœ… User: ${u.name}`); }
  }

  // ==================== EMPLOYERS ====================
  console.log("\nðŸ“¦ Seeding Employers...");

  // Clear existing FDIWork data for fresh seed
  await prisma.application.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.employer.deleteMany();

  const employers = await Promise.all([
    prisma.employer.create({
      data: {
        email: "hr@samsung-vn.com", password: epw, companyName: "Samsung Electronics Vietnam",
        logo: "/logos/samsung.png", industry: "Sáº£n xuáº¥t - Äiá»‡n tá»­", companySize: "ENTERPRISE",
        address: "KCN YÃªn Phong, Báº¯c Ninh", website: "https://samsung.com/vn", phone: "0222 3710 000",
        status: "ACTIVE", slug: "samsung-electronics-vietnam",
        description: "Samsung Electronics Vietnam (SEV) lÃ  tá»• há»£p nhÃ  mÃ¡y sáº£n xuáº¥t smartphone vÃ  linh kiá»‡n Ä‘iá»‡n tá»­ lá»›n nháº¥t tháº¿ giá»›i cá»§a Samsung. ÄÆ°á»£c thÃ nh láº­p nÄƒm 2009, SEV Ä‘Ã£ trá»Ÿ thÃ nh má»™t trong nhá»¯ng doanh nghiá»‡p FDI lá»›n nháº¥t Viá»‡t Nam vá»›i hÆ¡n 100.000 nhÃ¢n viÃªn. SEV liÃªn tá»¥c má»Ÿ rá»™ng quy mÃ´ vÃ  Ä‘áº§u tÆ° vÃ o cÃ´ng nghá»‡ cao, Ä‘Ã³ng gÃ³p quan trá»ng vÃ o kim ngáº¡ch xuáº¥t kháº©u cá»§a Viá»‡t Nam.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@canon-vn.com", password: epw, companyName: "Canon Vietnam",
        logo: "/logos/canon.png", industry: "Sáº£n xuáº¥t - Thiáº¿t bá»‹ vÄƒn phÃ²ng", companySize: "LARGE",
        address: "KCN Quáº¿ VÃµ, Báº¯c Ninh", website: "https://canon.com.vn", phone: "0222 3636 636",
        status: "ACTIVE", slug: "canon-vietnam",
        description: "Canon Vietnam Co., Ltd lÃ  cÃ´ng ty 100% vá»‘n Nháº­t Báº£n thuá»™c táº­p Ä‘oÃ n Canon Inc., chuyÃªn sáº£n xuáº¥t mÃ¡y in laser, cartridge vÃ  linh kiá»‡n quang há»c. Vá»›i hÆ¡n 20 nÄƒm hoáº¡t Ä‘á»™ng táº¡i Viá»‡t Nam, Canon Ä‘Ã£ xÃ¢y dá»±ng mÃ´i trÆ°á»ng lÃ m viá»‡c chuáº©n Nháº­t Báº£n vá»›i vÄƒn hÃ³a Kaizen vÃ  phÃ¡t triá»ƒn nhÃ¢n sá»± bá»n vá»¯ng.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@toyota-vn.com", password: epw, companyName: "Toyota Motor Vietnam",
        logo: "/logos/toyota.png", industry: "Ã” tÃ´ - Váº­n táº£i", companySize: "ENTERPRISE",
        address: "KCN PhÃºc Tháº¯ng, VÄ©nh PhÃºc", website: "https://toyota.com.vn", phone: "0211 3862 100",
        status: "ACTIVE", slug: "toyota-motor-vietnam",
        description: "Toyota Motor Vietnam (TMV) lÃ  liÃªn doanh sáº£n xuáº¥t vÃ  phÃ¢n phá»‘i Ã´ tÃ´ hÃ ng Ä‘áº§u Viá»‡t Nam. TMV váº­n hÃ nh nhÃ  mÃ¡y láº¯p rÃ¡p táº¡i VÄ©nh PhÃºc vá»›i dÃ¢y chuyá»n sáº£n xuáº¥t hiá»‡n Ä‘áº¡i theo tiÃªu chuáº©n Toyota Production System (TPS). CÃ´ng ty cam káº¿t phÃ¡t triá»ƒn bá»n vá»¯ng vÃ  Ä‘Ã o táº¡o nguá»“n nhÃ¢n lá»±c cháº¥t lÆ°á»£ng cao.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@lg-vn.com", password: epw, companyName: "LG Electronics Vietnam",
        logo: "/logos/lg.png", industry: "Sáº£n xuáº¥t - Äiá»‡n tá»­", companySize: "ENTERPRISE",
        address: "KCN TrÃ ng Duá»‡, Háº£i PhÃ²ng", website: "https://lg.com/vn", phone: "0225 3552 000",
        status: "ACTIVE", slug: "lg-electronics-vietnam",
        description: "LG Electronics Vietnam váº­n hÃ nh tá»• há»£p nhÃ  mÃ¡y sáº£n xuáº¥t TV, mÃ n hÃ¬nh vÃ  thiáº¿t bá»‹ gia dá»¥ng táº¡i Háº£i PhÃ²ng. Vá»›i Ä‘áº§u tÆ° hÆ¡n 5 tá»· USD, LG lÃ  má»™t trong nhá»¯ng nhÃ  Ä‘áº§u tÆ° FDI lá»›n nháº¥t miá»n Báº¯c. CÃ´ng ty ná»•i tiáº¿ng vá»›i cháº¿ Ä‘á»™ Ä‘Ã£i ngá»™ tá»‘t vÃ  cÆ¡ há»™i thÄƒng tiáº¿n cho nhÃ¢n viÃªn tráº».",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@bosch-vn.com", password: epw, companyName: "Bosch Vietnam",
        logo: "/logos/bosch.png", industry: "CÃ´ng nghá»‡ - Ká»¹ thuáº­t", companySize: "LARGE",
        address: "Táº§ng 12, TÃ²a nhÃ  Mapletree, Quáº­n 7, TP.HCM", website: "https://bosch.com.vn", phone: "028 6258 3100",
        status: "ACTIVE", slug: "bosch-vietnam",
        description: "Bosch Vietnam lÃ  cÃ´ng ty cÃ´ng nghá»‡ vÃ  ká»¹ thuáº­t hÃ ng Ä‘áº§u tháº¿ giá»›i Ä‘áº¿n tá»« Äá»©c. Táº¡i Viá»‡t Nam, Bosch hoáº¡t Ä‘á»™ng trong cÃ¡c lÄ©nh vá»±c giáº£i phÃ¡p di chuyá»ƒn, cÃ´ng nghá»‡ cÃ´ng nghiá»‡p, hÃ ng tiÃªu dÃ¹ng vÃ  nÄƒng lÆ°á»£ng. Bosch ná»•i tiáº¿ng vá»›i mÃ´i trÆ°á»ng lÃ m viá»‡c quá»‘c táº¿, cháº¿ Ä‘á»™ Ä‘Ã£i ngá»™ háº¥p dáº«n vÃ  cÆ¡ há»™i phÃ¡t triá»ƒn sá»± nghiá»‡p toÃ n cáº§u.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@panasonic-vn.com", password: epw, companyName: "Panasonic Vietnam",
        logo: "/logos/panasonic.png", industry: "Sáº£n xuáº¥t - Äiá»‡n tá»­ gia dá»¥ng", companySize: "LARGE",
        address: "KCN ThÄƒng Long II, HÆ°ng YÃªn", website: "https://panasonic.com/vn", phone: "0221 3981 234",
        status: "ACTIVE", slug: "panasonic-vietnam",
        description: "Panasonic Vietnam thuá»™c táº­p Ä‘oÃ n Panasonic Nháº­t Báº£n, chuyÃªn sáº£n xuáº¥t vÃ  phÃ¢n phá»‘i thiáº¿t bá»‹ Ä‘iá»‡n tá»­, Ä‘iá»‡n láº¡nh. Vá»›i hÆ¡n 7.000 nhÃ¢n viÃªn, Panasonic cam káº¿t mang Ä‘áº¿n mÃ´i trÆ°á»ng lÃ m viá»‡c an toÃ n, phÃºc lá»£i tá»‘t vÃ  cÆ¡ há»™i phÃ¡t triá»ƒn nghá» nghiá»‡p lÃ¢u dÃ i.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@nestle-vn.com", password: epw, companyName: "NestlÃ© Vietnam",
        logo: "/logos/nestle.png", industry: "FMCG - Thá»±c pháº©m", companySize: "LARGE",
        address: "Táº§ng 8, Empress Tower, Quáº­n 1, TP.HCM", website: "https://nestle.com.vn", phone: "028 3821 1000",
        status: "ACTIVE", slug: "nestle-vietnam",
        description: "NestlÃ© Vietnam lÃ  chi nhÃ¡nh cá»§a táº­p Ä‘oÃ n thá»±c pháº©m lá»›n nháº¥t tháº¿ giá»›i NestlÃ© S.A. (Thá»¥y SÄ©). Vá»›i hÆ¡n 2.300 nhÃ¢n viÃªn vÃ  4 nhÃ  mÃ¡y trÃªn cáº£ nÆ°á»›c, NestlÃ© sáº£n xuáº¥t cÃ¡c thÆ°Æ¡ng hiá»‡u ná»•i tiáº¿ng nhÆ° NESCAFÃ‰, MILO, MAGGI, KitKat. MÃ´i trÆ°á»ng lÃ m viá»‡c Ä‘a dáº¡ng, sÃ¡ng táº¡o vÃ  táº­p trung phÃ¡t triá»ƒn con ngÆ°á»i.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@intel-vn.com", password: epw, companyName: "Intel Products Vietnam",
        logo: "/logos/intel.png", industry: "BÃ¡n dáº«n - CÃ´ng nghá»‡ cao", companySize: "ENTERPRISE",
        address: "LÃ´ I2, D1, Khu CÃ´ng nghá»‡ cao, Quáº­n 9, TP.HCM", website: "https://intel.com", phone: "028 3636 9000",
        status: "ACTIVE", slug: "intel-products-vietnam",
        description: "Intel Products Vietnam (IPV) lÃ  nhÃ  mÃ¡y kiá»ƒm Ä‘á»‹nh vÃ  Ä‘Ã³ng gÃ³i chip bÃ¡n dáº«n lá»›n nháº¥t cá»§a Intel trÃªn toÃ n cáº§u. Äáº§u tÆ° hÆ¡n 1.5 tá»· USD, IPV lÃ  má»™t trong nhá»¯ng doanh nghiá»‡p FDI cÃ´ng nghá»‡ cao hÃ ng Ä‘áº§u táº¡i Viá»‡t Nam. CÃ´ng ty táº¡o cÆ¡ há»™i cho ká»¹ sÆ° Viá»‡t Nam tham gia vÃ o chuá»—i giÃ¡ trá»‹ bÃ¡n dáº«n toÃ n cáº§u.",
      }
    }),
  ]);

  const [samsung, canon, toyota, lg, bosch, panasonic, nestle, intel] = employers;
  console.log(`âœ… Created ${employers.length} employers`);

  // ==================== SUBSCRIPTIONS ====================
  console.log("\nðŸ’Ž Seeding Subscriptions...");
  const subBase = { status: "ACTIVE" as const, startDate: new Date("2026-03-01"), endDate: new Date("2026-09-01") };
  await Promise.all([
    prisma.subscription.create({ data: { ...subBase, tier: "VIP", jobQuota: 50, jobsUsed: 5, jobDuration: 60, showLogo: true, showBanner: true, price: 25000000, employerId: samsung.id } }),
    prisma.subscription.create({ data: { ...subBase, tier: "PREMIUM", jobQuota: 20, jobsUsed: 3, jobDuration: 45, showLogo: true, showBanner: false, price: 15000000, employerId: toyota.id } }),
    prisma.subscription.create({ data: { ...subBase, tier: "PREMIUM", jobQuota: 20, jobsUsed: 4, jobDuration: 45, showLogo: true, showBanner: false, price: 15000000, employerId: lg.id } }),
    prisma.subscription.create({ data: { ...subBase, tier: "STANDARD", jobQuota: 10, jobsUsed: 2, jobDuration: 30, showLogo: true, showBanner: false, price: 8000000, employerId: canon.id } }),
    prisma.subscription.create({ data: { ...subBase, tier: "STANDARD", jobQuota: 10, jobsUsed: 2, jobDuration: 30, showLogo: true, showBanner: false, price: 8000000, employerId: bosch.id } }),
    prisma.subscription.create({ data: { ...subBase, tier: "STANDARD", jobQuota: 10, jobsUsed: 3, jobDuration: 30, showLogo: true, showBanner: false, price: 8000000, employerId: intel.id } }),
    prisma.subscription.create({ data: { ...subBase, tier: "BASIC", jobQuota: 5, jobsUsed: 1, jobDuration: 15, showLogo: false, showBanner: false, price: 3000000, employerId: panasonic.id } }),
    prisma.subscription.create({ data: { ...subBase, tier: "BASIC", jobQuota: 5, jobsUsed: 2, jobDuration: 15, showLogo: false, showBanner: false, price: 3000000, employerId: nestle.id } }),
  ]);
  console.log("âœ… Created 8 subscriptions");

  // ==================== JOB POSTINGS ====================
  console.log("\nðŸ“‹ Seeding Job Postings...");
  const pub = (daysAgo: number) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d; };
  const exp = (daysLater: number) => { const d = new Date(); d.setDate(d.getDate() + daysLater); return d; };

  await prisma.jobPosting.createMany({
    data: [
      // Samsung (5 jobs)
      {
        title: "Ká»¹ sÆ° sáº£n xuáº¥t (Production Engineer)", slug: "ky-su-san-xuat-samsung", employerId: samsung.id,
        description: "GiÃ¡m sÃ¡t vÃ  tá»‘i Æ°u hÃ³a quy trÃ¬nh sáº£n xuáº¥t smartphone táº¡i nhÃ  mÃ¡y Samsung Báº¯c Ninh. PhÃ¢n tÃ­ch dá»¯ liá»‡u sáº£n xuáº¥t, Ä‘á» xuáº¥t cáº£i tiáº¿n nÄƒng suáº¥t vÃ  cháº¥t lÆ°á»£ng. Phá»‘i há»£p vá»›i Ä‘á»™i ngÅ© ká»¹ sÆ° HÃ n Quá»‘c Ä‘á»ƒ triá»ƒn khai cÃ´ng nghá»‡ má»›i.",
        requirements: "- Tá»‘t nghiá»‡p ÄH ngÃ nh CÆ¡ khÃ­, Äiá»‡n tá»­, CÆ¡ Ä‘iá»‡n tá»­ hoáº·c tÆ°Æ¡ng Ä‘Æ°Æ¡ng\n- Ãt nháº¥t 2 nÄƒm kinh nghiá»‡m trong mÃ´i trÆ°á»ng sáº£n xuáº¥t\n- ThÃ nh tháº¡o MS Office, AutoCAD\n- Tiáº¿ng HÃ n TOPIK 3 hoáº·c tiáº¿ng Anh TOEIC 600+\n- Sáºµn sÃ ng lÃ m ca theo lá»‹ch nhÃ  mÃ¡y",
        benefits: "- LÆ°Æ¡ng cáº¡nh tranh top thá»‹ trÆ°á»ng + thÆ°á»Ÿng quÃ½\n- Xe Ä‘Æ°a Ä‘Ã³n HÃ  Ná»™i - Báº¯c Ninh\n- Báº£o hiá»ƒm sá»©c khá»e PVI cao cáº¥p cho nhÃ¢n viÃªn + gia Ä‘Ã¬nh\n- CÆ¡ há»™i Ä‘Ã o táº¡o ngáº¯n háº¡n táº¡i HÃ n Quá»‘c\n- Phá»¥ cáº¥p Äƒn trÆ°a, Ä‘á»“ng phá»¥c, thiáº¿t bá»‹ báº£o há»™",
        salaryMin: 18, salaryMax: 30, salaryDisplay: "18 - 30 triá»‡u", industry: "Sáº£n xuáº¥t", position: "NhÃ¢n viÃªn", location: "Báº¯c Ninh", workType: "Full-time", quantity: 5, skills: "Sáº£n xuáº¥t, QC, Lean, 5S, AutoCAD, Tiáº¿ng HÃ n", status: "APPROVED", publishedAt: pub(3), expiresAt: exp(40), viewCount: 234, applyCount: 12
      },

      {
        title: "TrÆ°á»Ÿng phÃ²ng NhÃ¢n sá»± (HR Manager)", slug: "truong-phong-nhan-su-samsung", employerId: samsung.id,
        description: "Quáº£n lÃ½ toÃ n bá»™ hoáº¡t Ä‘á»™ng nhÃ¢n sá»± táº¡i nhÃ  mÃ¡y SEV bao gá»“m tuyá»ƒn dá»¥ng quy mÃ´ lá»›n (200+ ngÆ°á»i/thÃ¡ng), Ä‘Ã o táº¡o onboarding, quáº£n lÃ½ C&B cho 5.000+ nhÃ¢n viÃªn, vÃ  duy trÃ¬ quan há»‡ lao Ä‘á»™ng á»•n Ä‘á»‹nh.",
        requirements: "- Tá»‘t nghiá»‡p ÄH trá»Ÿ lÃªn ngÃ nh Quáº£n trá»‹ nhÃ¢n lá»±c, Luáº­t, QTKD\n- 5+ nÄƒm kinh nghiá»‡m HR, trong Ä‘Ã³ 2+ nÄƒm á»Ÿ vá»‹ trÃ­ quáº£n lÃ½\n- Kinh nghiá»‡m trong nhÃ  mÃ¡y sáº£n xuáº¥t FDI lÃ  báº¯t buá»™c\n- Náº¯m vá»¯ng Luáº­t lao Ä‘á»™ng, BHXH, BHYT\n- Tiáº¿ng Anh hoáº·c tiáº¿ng HÃ n giao tiáº¿p tá»‘t",
        benefits: "- LÆ°Æ¡ng thá»a thuáº­n (cáº¡nh tranh nháº¥t thá»‹ trÆ°á»ng)\n- ThÆ°á»Ÿng KPI quÃ½ + thÆ°á»Ÿng cuá»‘i nÄƒm 2-4 thÃ¡ng lÆ°Æ¡ng\n- Báº£o hiá»ƒm cao cáº¥p cho cáº£ gia Ä‘Ã¬nh\n- Xe cÃ´ng ty, Ä‘iá»‡n thoáº¡i, laptop\n- NgÃ y phÃ©p: 15 ngÃ y/nÄƒm",
        salaryMin: 35, salaryMax: 55, salaryDisplay: "35 - 55 triá»‡u", industry: "NhÃ¢n sá»±", position: "TrÆ°á»Ÿng phÃ²ng", location: "Báº¯c Ninh", workType: "Full-time", quantity: 1, skills: "HR, Tuyá»ƒn dá»¥ng, C&B, Luáº­t lao Ä‘á»™ng, Tiáº¿ng HÃ n", status: "APPROVED", publishedAt: pub(1), expiresAt: exp(45), isFeatured: true, viewCount: 567, applyCount: 23
      },

      {
        title: "Ká»¹ sÆ° QA/QC (Quality Engineer)", slug: "ky-su-qa-qc-samsung", employerId: samsung.id,
        description: "Kiá»ƒm tra cháº¥t lÆ°á»£ng sáº£n pháº©m smartphone theo tiÃªu chuáº©n Samsung Global. PhÃ¢n tÃ­ch lá»—i sáº£n pháº©m, xÃ¢y dá»±ng bÃ¡o cÃ¡o cháº¥t lÆ°á»£ng hÃ ng tuáº§n. Tham gia audit ISO 9001, ISO 14001.",
        requirements: "- ÄH ngÃ nh Ká»¹ thuáº­t, Äiá»‡n tá»­, Váº­t lÃ½\n- 1+ nÄƒm kinh nghiá»‡m QC trong sáº£n xuáº¥t Ä‘iá»‡n tá»­\n- Sá»­ dá»¥ng thÃ nh tháº¡o cÃ´ng cá»¥ Ä‘o lÆ°á»ng (caliper, micrometer)\n- Hiá»ƒu biáº¿t vá» SPC, FMEA, 8D Report",
        benefits: "- LÆ°Æ¡ng thÃ¡ng 13, 14 + thÆ°á»Ÿng quÃ½\n- Xe Ä‘Æ°a Ä‘Ã³n\n- CÆ¡m trÆ°a miá»…n phÃ­\n- Báº£o hiá»ƒm PVI",
        salaryMin: 12, salaryMax: 20, salaryDisplay: "12 - 20 triá»‡u", industry: "Sáº£n xuáº¥t", position: "NhÃ¢n viÃªn", location: "Báº¯c Ninh", workType: "Full-time", quantity: 8, skills: "QA, QC, ISO, SPC, FMEA", status: "APPROVED", publishedAt: pub(5), expiresAt: exp(35), viewCount: 189, applyCount: 31
      },

      {
        title: "NhÃ¢n viÃªn IT Support", slug: "it-support-samsung", employerId: samsung.id,
        description: "Há»— trá»£ ká»¹ thuáº­t IT cho hÆ¡n 5.000 user táº¡i nhÃ  mÃ¡y. Quáº£n lÃ½ há»‡ thá»‘ng máº¡ng LAN, WiFi, server. Triá»ƒn khai vÃ  báº£o trÃ¬ cÃ¡c há»‡ thá»‘ng MES, ERP (SAP).",
        requirements: "- ÄH CNTT, Máº¡ng mÃ¡y tÃ­nh\n- 1-3 nÄƒm kinh nghiá»‡m IT helpdesk\n- CCNA hoáº·c tÆ°Æ¡ng Ä‘Æ°Æ¡ng\n- Tiáº¿ng Anh Ä‘á»c hiá»ƒu tÃ i liá»‡u ká»¹ thuáº­t",
        salaryMin: 12, salaryMax: 18, salaryDisplay: "12 - 18 triá»‡u", industry: "IT - Pháº§n má»m", position: "NhÃ¢n viÃªn", location: "Báº¯c Ninh", workType: "Full-time", quantity: 2, skills: "IT Support, CCNA, SAP, Windows Server", status: "APPROVED", publishedAt: pub(2), expiresAt: exp(30), viewCount: 145, applyCount: 8
      },

      {
        title: "PhiÃªn dá»‹ch tiáº¿ng HÃ n (Korean Interpreter)", slug: "phien-dich-tieng-han-samsung", employerId: samsung.id,
        description: "PhiÃªn dá»‹ch cÃ¡c cuá»™c há»p cáº¥p quáº£n lÃ½, Ä‘Ã o táº¡o ká»¹ thuáº­t, vÃ  giao tiáº¿p hÃ ng ngÃ y giá»¯a chuyÃªn gia HÃ n Quá»‘c vÃ  nhÃ¢n viÃªn Viá»‡t Nam. Dá»‹ch tÃ i liá»‡u ká»¹ thuáº­t sáº£n xuáº¥t.",
        requirements: "- TOPIK 5 trá»Ÿ lÃªn\n- Æ¯u tiÃªn cÃ³ kinh nghiá»‡m phiÃªn dá»‹ch trong nhÃ  mÃ¡y\n- Ká»¹ nÄƒng giao tiáº¿p tá»‘t, nhanh nháº¹n",
        salaryMin: 15, salaryMax: 25, salaryDisplay: "15 - 25 triá»‡u", industry: "PhiÃªn dá»‹ch", position: "NhÃ¢n viÃªn", location: "Báº¯c Ninh", workType: "Full-time", quantity: 3, skills: "Tiáº¿ng HÃ n, PhiÃªn dá»‹ch, TOPIK 5", status: "APPROVED", publishedAt: pub(4), expiresAt: exp(25), viewCount: 312, applyCount: 18
      },

      // Canon (3 jobs)
      {
        title: "NhÃ¢n viÃªn Káº¿ toÃ¡n tá»•ng há»£p", slug: "ke-toan-tong-hop-canon", employerId: canon.id,
        description: "Thá»±c hiá»‡n nghiá»‡p vá»¥ káº¿ toÃ¡n tá»•ng há»£p, láº­p bÃ¡o cÃ¡o tÃ i chÃ­nh theo chuáº©n IFRS vÃ  VAS. Quáº£n lÃ½ thuáº¿ GTGT, TNDN. Phá»‘i há»£p vá»›i kiá»ƒm toÃ¡n ná»™i bá»™ vÃ  kiá»ƒm toÃ¡n Ä‘á»™c láº­p.",
        requirements: "- ÄH Káº¿ toÃ¡n, TÃ i chÃ­nh\n- 2+ nÄƒm kinh nghiá»‡m káº¿ toÃ¡n tá»•ng há»£p\n- ThÃ nh tháº¡o SAP FI/CO\n- Tiáº¿ng Nháº­t N3 hoáº·c tiáº¿ng Anh TOEIC 550+",
        benefits: "- LÆ°Æ¡ng thÃ¡ng 13, 14, 15\n- Xe Ä‘Æ°a Ä‘Ã³n HÃ  Ná»™i - Báº¯c Ninh\n- Ä‚n trÆ°a miá»…n phÃ­ (buffet)\n- Du lá»‹ch cÃ´ng ty hÃ ng nÄƒm",
        salaryMin: 15, salaryMax: 22, salaryDisplay: "15 - 22 triá»‡u", industry: "Káº¿ toÃ¡n - TÃ i chÃ­nh", position: "NhÃ¢n viÃªn", location: "Báº¯c Ninh", workType: "Full-time", quantity: 2, skills: "Káº¿ toÃ¡n, SAP, IFRS, Tiáº¿ng Nháº­t", status: "APPROVED", publishedAt: pub(8), expiresAt: exp(22), viewCount: 167, applyCount: 14
      },

      {
        title: "PhiÃªn dá»‹ch tiáº¿ng Nháº­t", slug: "phien-dich-tieng-nhat-canon", employerId: canon.id,
        description: "PhiÃªn dá»‹ch trong cuá»™c há»p, training, vÃ  giao tiáº¿p giá»¯a ban lÃ£nh Ä‘áº¡o Nháº­t Báº£n vÃ  nhÃ¢n viÃªn Viá»‡t Nam. Há»— trá»£ dá»‹ch tÃ i liá»‡u ká»¹ thuáº­t, há»£p Ä‘á»“ng, quy trÃ¬nh ISO.",
        requirements: "- Tiáº¿ng Nháº­t N2 trá»Ÿ lÃªn (N1 Æ°u tiÃªn)\n- Æ¯u tiÃªn kinh nghiá»‡m trong FDI Nháº­t\n- Ká»¹ nÄƒng viáº¿t vÃ  nÃ³i tá»‘t cáº£ tiáº¿ng Viá»‡t láº«n tiáº¿ng Nháº­t",
        salaryMin: 18, salaryMax: 28, salaryDisplay: "18 - 28 triá»‡u", industry: "PhiÃªn dá»‹ch", position: "NhÃ¢n viÃªn", location: "Báº¯c Ninh", workType: "Full-time", quantity: 1, skills: "Tiáº¿ng Nháº­t N2, PhiÃªn dá»‹ch, FDI", status: "APPROVED", publishedAt: pub(6), expiresAt: exp(24), viewCount: 201, applyCount: 9
      },

      {
        title: "Ká»¹ sÆ° báº£o trÃ¬ (Maintenance Engineer)", slug: "ky-su-bao-tri-canon", employerId: canon.id,
        description: "Báº£o trÃ¬, sá»­a chá»¯a há»‡ thá»‘ng mÃ¡y in laser vÃ  dÃ¢y chuyá»n sáº£n xuáº¥t. Láº­p káº¿ hoáº¡ch báº£o trÃ¬ phÃ²ng ngá»«a (PM). Quáº£n lÃ½ phá»¥ tÃ¹ng vÃ  thiáº¿t bá»‹ dá»± phÃ²ng.",
        requirements: "- ÄH ngÃ nh CÆ¡ khÃ­, Äiá»‡n, CÆ¡ Ä‘iá»‡n tá»­\n- 2+ nÄƒm kinh nghiá»‡m báº£o trÃ¬ trong nhÃ  mÃ¡y\n- Äá»c hiá»ƒu báº£n váº½ ká»¹ thuáº­t\n- Tiáº¿ng Nháº­t hoáº·c tiáº¿ng Anh giao tiáº¿p",
        salaryMin: 14, salaryMax: 22, salaryDisplay: "14 - 22 triá»‡u", industry: "Sáº£n xuáº¥t", position: "NhÃ¢n viÃªn", location: "Báº¯c Ninh", workType: "Full-time", quantity: 3, skills: "Báº£o trÃ¬, PLC, CÆ¡ khÃ­, Äiá»‡n", status: "APPROVED", publishedAt: pub(3), expiresAt: exp(27), viewCount: 98, applyCount: 5
      },

      // Toyota (3 jobs)
      {
        title: "Ká»¹ sÆ° Ã´ tÃ´ (Automotive Engineer)", slug: "ky-su-o-to-toyota", employerId: toyota.id,
        description: "Tham gia thiáº¿t káº¿ vÃ  cáº£i tiáº¿n quy trÃ¬nh láº¯p rÃ¡p Ã´ tÃ´ theo Toyota Production System (TPS). PhÃ¢n tÃ­ch vÃ  giáº£i quyáº¿t váº¥n Ä‘á» cháº¥t lÆ°á»£ng trÃªn dÃ¢y chuyá»n sáº£n xuáº¥t.",
        requirements: "- ÄH ngÃ nh CÆ¡ khÃ­ Ã” tÃ´, CÆ¡ khÃ­ cháº¿ táº¡o mÃ¡y\n- 2+ nÄƒm kinh nghiá»‡m trong ngÃ nh Ã´ tÃ´\n- Hiá»ƒu biáº¿t vá» TPS, Kaizen, Just-in-Time\n- Tiáº¿ng Nháº­t N3 hoáº·c tiáº¿ng Anh TOEIC 600+",
        benefits: "- LÆ°Æ¡ng 3 thÃ¡ng thá»­ viá»‡c 100%\n- ThÆ°á»Ÿng Táº¿t 3-5 thÃ¡ng lÆ°Æ¡ng\n- Xe Ä‘Æ°a Ä‘Ã³n HÃ  Ná»™i - VÄ©nh PhÃºc\n- ÄÃ o táº¡o táº¡i Nháº­t Báº£n",
        salaryMin: 20, salaryMax: 35, salaryDisplay: "20 - 35 triá»‡u", industry: "CÆ¡ khÃ­ - Ã” tÃ´", position: "NhÃ¢n viÃªn", location: "VÄ©nh PhÃºc", workType: "Full-time", quantity: 4, skills: "TPS, Kaizen, AutoCAD, SolidWorks, Tiáº¿ng Nháº­t", status: "APPROVED", publishedAt: pub(2), expiresAt: exp(38), isFeatured: true, viewCount: 445, applyCount: 19
      },

      {
        title: "ChuyÃªn viÃªn Marketing & Truyá»n thÃ´ng", slug: "marketing-toyota", employerId: toyota.id,
        description: "LÃªn káº¿ hoáº¡ch vÃ  triá»ƒn khai cÃ¡c chiáº¿n dá»‹ch marketing cho dÃ²ng xe Toyota táº¡i Viá»‡t Nam. Quáº£n lÃ½ ná»™i dung website, social media, vÃ  quan há»‡ bÃ¡o chÃ­.",
        requirements: "- ÄH Marketing, Truyá»n thÃ´ng, BÃ¡o chÃ­\n- 3+ nÄƒm kinh nghiá»‡m marketing (ngÃ nh Ã´ tÃ´ Æ°u tiÃªn)\n- SÃ¡ng táº¡o ná»™i dung, quáº£n lÃ½ KOL/KOC\n- Tiáº¿ng Anh thÃ nh tháº¡o",
        salaryMin: 18, salaryMax: 28, salaryDisplay: "18 - 28 triá»‡u", industry: "Marketing", position: "ChuyÃªn viÃªn", location: "HÃ  Ná»™i", workType: "Full-time", quantity: 1, skills: "Marketing, Digital Marketing, Content, KOL", status: "APPROVED", publishedAt: pub(1), expiresAt: exp(30), viewCount: 289, applyCount: 15
      },

      {
        title: "TrÆ°á»Ÿng ca sáº£n xuáº¥t (Production Supervisor)", slug: "truong-ca-san-xuat-toyota", employerId: toyota.id,
        description: "Quáº£n lÃ½ ca sáº£n xuáº¥t láº¯p rÃ¡p Ã´ tÃ´. Äáº£m báº£o tiáº¿n Ä‘á»™, cháº¥t lÆ°á»£ng vÃ  an toÃ n lao Ä‘á»™ng. Huáº¥n luyá»‡n cÃ´ng nhÃ¢n má»›i, triá»ƒn khai cáº£i tiáº¿n Kaizen.",
        requirements: "- CÄ/ÄH ngÃ nh CÆ¡ khÃ­, Quáº£n lÃ½ CN\n- 3+ nÄƒm kinh nghiá»‡m giÃ¡m sÃ¡t sáº£n xuáº¥t\n- Ká»¹ nÄƒng quáº£n lÃ½ Ä‘á»™i nhÃ³m 50+ ngÆ°á»i",
        salaryMin: 16, salaryMax: 25, salaryDisplay: "16 - 25 triá»‡u", industry: "Sáº£n xuáº¥t", position: "TrÆ°á»Ÿng ca", location: "VÄ©nh PhÃºc", workType: "Full-time", quantity: 2, skills: "Quáº£n lÃ½ sáº£n xuáº¥t, TPS, Kaizen, 5S", status: "APPROVED", publishedAt: pub(5), expiresAt: exp(25), viewCount: 134, applyCount: 7
      },

      // LG (3 jobs)
      {
        title: "Ká»¹ sÆ° pháº§n má»m nhÃºng (Embedded Software Engineer)", slug: "ky-su-embedded-lg", employerId: lg.id,
        description: "PhÃ¡t triá»ƒn firmware cho TV vÃ  mÃ n hÃ¬nh thÃ´ng minh. Láº­p trÃ¬nh C/C++ trÃªn ná»n táº£ng Linux embedded. Tá»‘i Æ°u hiá»‡u nÄƒng xá»­ lÃ½ hÃ¬nh áº£nh vÃ  Ã¢m thanh.",
        requirements: "- ÄH CNTT, Äiá»‡n tá»­, Viá»…n thÃ´ng\n- 2+ nÄƒm kinh nghiá»‡m embedded C/C++\n- Hiá»ƒu biáº¿t vá» Linux kernel, device driver\n- Tiáº¿ng Anh Ä‘á»c hiá»ƒu tÃ i liá»‡u ká»¹ thuáº­t",
        benefits: "- Review lÆ°Æ¡ng 2 láº§n/nÄƒm\n- ThÆ°á»Ÿng sÃ¡ng kiáº¿n cáº£i tiáº¿n\n- Báº£o hiá»ƒm sá»©c khá»e Báº£o Viá»‡t\n- CÃ¢u láº¡c bá»™ thá»ƒ thao, gym miá»…n phÃ­",
        salaryMin: 20, salaryMax: 40, salaryDisplay: "20 - 40 triá»‡u", industry: "IT - Pháº§n má»m", position: "Ká»¹ sÆ°", location: "Háº£i PhÃ²ng", workType: "Full-time", quantity: 3, skills: "C/C++, Linux, Embedded, IoT", status: "APPROVED", publishedAt: pub(1), expiresAt: exp(40), isFeatured: true, viewCount: 523, applyCount: 27
      },

      {
        title: "NhÃ¢n viÃªn Supply Chain", slug: "supply-chain-lg", employerId: lg.id,
        description: "Quáº£n lÃ½ chuá»—i cung á»©ng linh kiá»‡n cho nhÃ  mÃ¡y sáº£n xuáº¥t TV. Láº­p káº¿ hoáº¡ch nháº­p kháº©u nguyÃªn váº­t liá»‡u, theo dÃµi tá»“n kho, phá»‘i há»£p vá»›i nhÃ  cung cáº¥p quá»‘c táº¿.",
        requirements: "- ÄH Logistics, Ngoáº¡i thÆ°Æ¡ng, QTKD\n- 2+ nÄƒm kinh nghiá»‡m SCM trong sáº£n xuáº¥t\n- ThÃ nh tháº¡o SAP MM\n- Tiáº¿ng Anh TOEIC 650+",
        salaryMin: 14, salaryMax: 22, salaryDisplay: "14 - 22 triá»‡u", industry: "Logistics", position: "NhÃ¢n viÃªn", location: "Háº£i PhÃ²ng", workType: "Full-time", quantity: 2, skills: "SCM, SAP MM, Logistics, Import/Export", status: "APPROVED", publishedAt: pub(4), expiresAt: exp(26), viewCount: 167, applyCount: 11
      },

      {
        title: "GiÃ¡m Ä‘á»‘c nhÃ  mÃ¡y (Plant Manager)", slug: "giam-doc-nha-may-lg", employerId: lg.id,
        description: "Äiá»u hÃ nh toÃ n bá»™ hoáº¡t Ä‘á»™ng nhÃ  mÃ¡y sáº£n xuáº¥t mÃ n hÃ¬nh LG táº¡i Háº£i PhÃ²ng. Quáº£n lÃ½ 3.000+ nhÃ¢n viÃªn, Ä‘áº£m báº£o KPI sáº£n lÆ°á»£ng, cháº¥t lÆ°á»£ng, chi phÃ­ vÃ  an toÃ n.",
        requirements: "- ThS trá»Ÿ lÃªn ngÃ nh Ká»¹ thuáº­t, QTKD\n- 10+ nÄƒm kinh nghiá»‡m sáº£n xuáº¥t, 5+ nÄƒm vá»‹ trÃ­ quáº£n lÃ½ cáº¥p cao\n- Kinh nghiá»‡m trong FDI quy mÃ´ lá»›n\n- Tiáº¿ng Anh hoáº·c tiáº¿ng HÃ n thÃ nh tháº¡o",
        salaryDisplay: "Thá»a thuáº­n (80 - 150 triá»‡u)", industry: "Sáº£n xuáº¥t", position: "GiÃ¡m Ä‘á»‘c", location: "Háº£i PhÃ²ng", workType: "Full-time", quantity: 1, skills: "Plant Management, Lean, Six Sigma, P&L", status: "APPROVED", publishedAt: pub(0), expiresAt: exp(60), isFeatured: true, viewCount: 892, applyCount: 5
      },

      // Bosch (2 jobs)
      {
        title: "Ká»¹ sÆ° pháº§n má»m Java (Java Software Engineer)", slug: "java-engineer-bosch", employerId: bosch.id,
        description: "PhÃ¡t triá»ƒn á»©ng dá»¥ng IoT vÃ  giáº£i phÃ¡p cÃ´ng nghiá»‡p 4.0 báº±ng Java/Spring Boot. LÃ m viá»‡c theo Agile Scrum trong team quá»‘c táº¿ (Äá»©c, áº¤n Äá»™, Viá»‡t Nam).",
        requirements: "- ÄH CNTT, Khoa há»c mÃ¡y tÃ­nh\n- 2+ nÄƒm kinh nghiá»‡m Java, Spring Boot\n- Hiá»ƒu biáº¿t DevOps: Docker, Kubernetes, CI/CD\n- Tiáº¿ng Anh giao tiáº¿p tá»‘t (lÃ m viá»‡c vá»›i team global)",
        benefits: "- LÆ°Æ¡ng thÃ¡ng 13, 14\n- Flexible working hours\n- 18 ngÃ y phÃ©p/nÄƒm\n- ÄÃ o táº¡o táº¡i Äá»©c\n- Báº£o hiá»ƒm sá»©c khá»e quá»‘c táº¿",
        salaryMin: 25, salaryMax: 45, salaryDisplay: "25 - 45 triá»‡u", industry: "IT - Pháº§n má»m", position: "Ká»¹ sÆ°", location: "TP. Há»“ ChÃ­ Minh", workType: "Hybrid", quantity: 5, skills: "Java, Spring Boot, Docker, K8s, Agile", status: "APPROVED", publishedAt: pub(1), expiresAt: exp(45), isFeatured: true, viewCount: 678, applyCount: 34
      },

      {
        title: "ChuyÃªn viÃªn An toÃ n lao Ä‘á»™ng (HSE Specialist)", slug: "hse-bosch", employerId: bosch.id,
        description: "Triá»ƒn khai há»‡ thá»‘ng quáº£n lÃ½ an toÃ n vá»‡ sinh lao Ä‘á»™ng theo tiÃªu chuáº©n ISO 45001. Tá»• chá»©c Ä‘Ã o táº¡o ATVSLÄ, Ä‘iá»u tra sá»± cá»‘, vÃ  Ä‘Ã¡nh giÃ¡ rá»§i ro táº¡i nhÃ  mÃ¡y.",
        requirements: "- ÄH ngÃ nh MÃ´i trÆ°á»ng, An toÃ n lao Ä‘á»™ng\n- 2+ nÄƒm kinh nghiá»‡m HSE trong sáº£n xuáº¥t\n- Chá»©ng chá»‰ HSE Officer\n- Tiáº¿ng Anh giao tiáº¿p",
        salaryMin: 15, salaryMax: 25, salaryDisplay: "15 - 25 triá»‡u", industry: "An toÃ n lao Ä‘á»™ng", position: "ChuyÃªn viÃªn", location: "Äá»“ng Nai", workType: "Full-time", quantity: 1, skills: "HSE, ISO 45001, ÄÃ¡nh giÃ¡ rá»§i ro, PCCC", status: "APPROVED", publishedAt: pub(6), expiresAt: exp(24), viewCount: 89, applyCount: 4
      },

      // NestlÃ© (2 jobs)
      {
        title: "Brand Manager - NESCAFÃ‰", slug: "brand-manager-nescafe-nestle", employerId: nestle.id,
        description: "Quáº£n lÃ½ thÆ°Æ¡ng hiá»‡u NESCAFÃ‰ táº¡i thá»‹ trÆ°á»ng Viá»‡t Nam. XÃ¢y dá»±ng chiáº¿n lÆ°á»£c marketing, phÃ¡t triá»ƒn sáº£n pháº©m má»›i, phÃ¢n tÃ­ch thá»‹ trÆ°á»ng vÃ  Ä‘á»‘i thá»§ cáº¡nh tranh.",
        requirements: "- ÄH/ThS Marketing, QTKD\n- 5+ nÄƒm FMCG marketing, 2+ nÄƒm quáº£n lÃ½ thÆ°Æ¡ng hiá»‡u\n- Kinh nghiá»‡m quáº£n lÃ½ P&L thÆ°Æ¡ng hiá»‡u\n- Tiáº¿ng Anh thÃ nh tháº¡o (C1+)",
        benefits: "- LÆ°Æ¡ng net + bonus 2-4 thÃ¡ng\n- Flexible working (3 ngÃ y WFH/tuáº§n)\n- Báº£o hiá»ƒm sá»©c khá»e AIA cao cáº¥p\n- Sáº£n pháº©m NestlÃ© miá»…n phÃ­ hÃ ng thÃ¡ng",
        salaryMin: 40, salaryMax: 60, salaryDisplay: "40 - 60 triá»‡u", industry: "Marketing", position: "Manager", location: "TP. Há»“ ChÃ­ Minh", workType: "Hybrid", quantity: 1, skills: "Brand Management, FMCG, P&L, Digital Marketing", status: "APPROVED", publishedAt: pub(3), expiresAt: exp(30), isFeatured: true, viewCount: 734, applyCount: 21
      },

      {
        title: "Ká»¹ sÆ° Quáº£n lÃ½ cháº¥t lÆ°á»£ng nhÃ  mÃ¡y", slug: "qc-factory-nestle", employerId: nestle.id,
        description: "Äáº£m báº£o cháº¥t lÆ°á»£ng sáº£n pháº©m thá»±c pháº©m theo tiÃªu chuáº©n NestlÃ© Global vÃ  FSSC 22000. Kiá»ƒm soÃ¡t nguyÃªn liá»‡u Ä‘áº§u vÃ o, quy trÃ¬nh sáº£n xuáº¥t, vÃ  thÃ nh pháº©m.",
        requirements: "- ÄH CÃ´ng nghá»‡ Thá»±c pháº©m, HÃ³a há»c\n- 2+ nÄƒm QC trong nhÃ  mÃ¡y thá»±c pháº©m\n- Hiá»ƒu biáº¿t HACCP, GMP, FSSC 22000\n- Tiáº¿ng Anh giao tiáº¿p (bÃ¡o cÃ¡o báº±ng tiáº¿ng Anh)",
        salaryMin: 15, salaryMax: 25, salaryDisplay: "15 - 25 triá»‡u", industry: "Sáº£n xuáº¥t", position: "Ká»¹ sÆ°", location: "Äá»“ng Nai", workType: "Full-time", quantity: 2, skills: "QC, HACCP, GMP, FSSC 22000, Thá»±c pháº©m", status: "APPROVED", publishedAt: pub(7), expiresAt: exp(23), viewCount: 112, applyCount: 6
      },

      // Intel (2 jobs)
      {
        title: "Ká»¹ sÆ° Test bÃ¡n dáº«n (Semiconductor Test Engineer)", slug: "test-engineer-intel", employerId: intel.id,
        description: "PhÃ¡t triá»ƒn vÃ  tá»‘i Æ°u chÆ°Æ¡ng trÃ¬nh test cho chip bÃ¡n dáº«n Intel tháº¿ há»‡ má»›i. PhÃ¢n tÃ­ch dá»¯ liá»‡u yield, debug lá»—i silicon, vÃ  cáº£i tiáº¿n hiá»‡u suáº¥t test.",
        requirements: "- ÄH/ThS Äiá»‡n tá»­, Vi Ä‘iá»‡n tá»­, Váº­t lÃ½ bÃ¡n dáº«n\n- 2+ nÄƒm kinh nghiá»‡m semiconductor test\n- ThÃ nh tháº¡o Python, MATLAB\n- Hiá»ƒu biáº¿t vá» ATE (Automated Test Equipment)\n- Tiáº¿ng Anh thÃ nh tháº¡o",
        benefits: "- LÆ°Æ¡ng thuá»™c top 5% thá»‹ trÆ°á»ng IT\n- RSU (Restricted Stock Units) Intel\n- Flex time & WFH 2 ngÃ y/tuáº§n\n- ÄÃ o táº¡o táº¡i Intel campuses (US, Malaysia)\n- Báº£o hiá»ƒm quá»‘c táº¿ cho cáº£ gia Ä‘Ã¬nh",
        salaryMin: 30, salaryMax: 55, salaryDisplay: "30 - 55 triá»‡u", industry: "BÃ¡n dáº«n - CÃ´ng nghá»‡ cao", position: "Ká»¹ sÆ°", location: "TP. Há»“ ChÃ­ Minh", workType: "Hybrid", quantity: 4, skills: "Semiconductor, ATE, Python, MATLAB, Debug", status: "APPROVED", publishedAt: pub(2), expiresAt: exp(50), isFeatured: true, viewCount: 456, applyCount: 16
      },

      {
        title: "Ká»¹ sÆ° DevOps / SRE", slug: "devops-sre-intel", employerId: intel.id,
        description: "XÃ¢y dá»±ng vÃ  váº­n hÃ nh háº¡ táº§ng CI/CD cho há»‡ thá»‘ng test tá»± Ä‘á»™ng hÃ³a. Quáº£n lÃ½ Kubernetes clusters, monitoring, vÃ  tá»± Ä‘á»™ng hÃ³a quy trÃ¬nh phÃ¡t triá»ƒn pháº§n má»m.",
        requirements: "- ÄH CNTT, Khoa há»c mÃ¡y tÃ­nh\n- 3+ nÄƒm kinh nghiá»‡m DevOps/SRE\n- ThÃ nh tháº¡o Kubernetes, Terraform, Ansible\n- Kinh nghiá»‡m AWS hoáº·c Azure\n- Tiáº¿ng Anh thÃ nh tháº¡o",
        salaryMin: 35, salaryMax: 60, salaryDisplay: "35 - 60 triá»‡u", industry: "IT - Pháº§n má»m", position: "Ká»¹ sÆ°", location: "TP. Há»“ ChÃ­ Minh", workType: "Hybrid", quantity: 2, skills: "DevOps, Kubernetes, Terraform, AWS, CI/CD", status: "APPROVED", publishedAt: pub(3), expiresAt: exp(35), viewCount: 345, applyCount: 12
      },

      // Panasonic (2 jobs)
      {
        title: "Ká»¹ sÆ° R&D Äiá»‡n tá»­", slug: "r-and-d-panasonic", employerId: panasonic.id,
        description: "NghiÃªn cá»©u vÃ  phÃ¡t triá»ƒn sáº£n pháº©m Ä‘iá»‡n tá»­ gia dá»¥ng má»›i. Thiáº¿t káº¿ máº¡ch PCB, phÃ¡t triá»ƒn firmware, vÃ  kiá»ƒm thá»­ sáº£n pháº©m theo tiÃªu chuáº©n Panasonic.",
        requirements: "- ÄH/ThS Äiá»‡n tá»­, Viá»…n thÃ´ng\n- 2+ nÄƒm R&D trong ngÃ nh Ä‘iá»‡n tá»­\n- ThÃ nh tháº¡o Altium Designer, OrCAD\n- Láº­p trÃ¬nh C cho MCU (STM32, Arduino)\n- Tiáº¿ng Nháº­t N3 hoáº·c tiáº¿ng Anh TOEIC 600+",
        benefits: "- ThÆ°á»Ÿng sÃ¡ng cháº¿, báº±ng sÃ¡ng kiáº¿n\n- ÄÃ o táº¡o táº¡i Nháº­t Báº£n 3-6 thÃ¡ng\n- Báº£o hiá»ƒm sá»©c khá»e + life insurance",
        salaryMin: 18, salaryMax: 30, salaryDisplay: "18 - 30 triá»‡u", industry: "Sáº£n xuáº¥t", position: "Ká»¹ sÆ°", location: "HÆ°ng YÃªn", workType: "Full-time", quantity: 2, skills: "PCB Design, Firmware, C/C++, Altium", status: "APPROVED", publishedAt: pub(4), expiresAt: exp(28), viewCount: 156, applyCount: 8
      },

      {
        title: "NhÃ¢n viÃªn Xuáº¥t nháº­p kháº©u", slug: "xnk-panasonic", employerId: panasonic.id,
        description: "Thá»±c hiá»‡n thá»§ tá»¥c háº£i quan, xuáº¥t nháº­p kháº©u linh kiá»‡n vÃ  thÃ nh pháº©m. Quáº£n lÃ½ chá»©ng tá»« thÆ°Æ¡ng máº¡i quá»‘c táº¿, phá»‘i há»£p vá»›i forwarder vÃ  háº£i quan.",
        requirements: "- ÄH Ngoáº¡i thÆ°Æ¡ng, Kinh táº¿ quá»‘c táº¿\n- 1+ nÄƒm kinh nghiá»‡m XNK\n- Hiá»ƒu biáº¿t thá»§ tá»¥c háº£i quan Ä‘iá»‡n tá»­\n- Tiáº¿ng Nháº­t hoáº·c tiáº¿ng Anh",
        salaryMin: 10, salaryMax: 16, salaryDisplay: "10 - 16 triá»‡u", industry: "Logistics", position: "NhÃ¢n viÃªn", location: "HÆ°ng YÃªn", workType: "Full-time", quantity: 1, skills: "XNK, Háº£i quan, Logistics, Tiáº¿ng Nháº­t", status: "APPROVED", publishedAt: pub(9), expiresAt: exp(21), viewCount: 78, applyCount: 3
      },
    ]
  });

  const jobCount = await prisma.jobPosting.count({ where: { status: "APPROVED" } });
  console.log(`âœ… Created ${jobCount} approved job postings`);

  // ==================== CRM DEMO CANDIDATES ====================
  console.log("\nðŸ‘¤ Seeding CRM demo Candidates...");

  // Get the admin user to assign as createdBy
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@headhunt.com" } });
  const createdById = adminUser?.id ?? 1;

  const demoCandidates: Prisma.CandidateCreateManyInput[] = [
    {
      fullName: "Nguyá»…n Minh Khoa", phone: "0901234567", email: "khoa.nguyen@gmail.com",
      currentPosition: "Senior Frontend Developer", currentCompany: "FPT Software",
      industry: "IT / Pháº§n má»m", yearsOfExp: 5, location: "TP.HCM",
      expectedSalary: 45, currentSalary: 35,
      level: "SENIOR" as CandidateSeniority, skills: ["React", "Next.js", "TypeScript", "GraphQL", "TailwindCSS"],
      status: "AVAILABLE" as CandidateStatus, source: "LINKEDIN" as CandidateSource, createdById,

    },
    {
      fullName: "Tráº§n Thá»‹ HÆ°Æ¡ng", phone: "0912345678", email: "huong.tran@outlook.com",
      currentPosition: "HR Business Partner", currentCompany: "Samsung Vietnam",
      industry: "NhÃ¢n sá»±", yearsOfExp: 8, location: "HÃ  Ná»™i",
      expectedSalary: 55, currentSalary: 48,
      level: "MANAGER", skills: ["HR Business Partner", "Talent Acquisition", "C&B", "HRIS", "Luáº­t Lao Äá»™ng"],
      status: "EMPLOYED", source: "REFERRAL", createdById,
    },
    {
      fullName: "LÃª VÄƒn Äá»©c", phone: "0987654321", email: "duc.le@gmail.com",
      currentPosition: "Java Backend Developer", currentCompany: "VNG Corporation",
      industry: "IT / Pháº§n má»m", yearsOfExp: 3, location: "TP.HCM",
      expectedSalary: 30, currentSalary: 22,
      level: "MID_LEVEL" as CandidateSeniority, skills: ["Java", "Spring Boot", "Microservices", "Docker", "PostgreSQL"],
      status: "AVAILABLE" as CandidateStatus, source: "TOPCV" as CandidateSource, createdById,

    },
    {
      fullName: "Pháº¡m Thá»‹ Lan Anh", phone: "0963123456", email: "lananh.pham@gmail.com",
      currentPosition: "Marketing Manager", currentCompany: "NestlÃ© Vietnam",
      industry: "Marketing / Truyá»n thÃ´ng", yearsOfExp: 10, location: "TP.HCM",
      expectedSalary: 70, currentSalary: 65,
      level: "MANAGER" as CandidateSeniority, skills: ["Brand Management", "Digital Marketing", "P&L", "FMCG", "Content Strategy"],
      status: "INTERVIEWING" as CandidateStatus, source: "LINKEDIN" as CandidateSource, createdById,

    },
    {
      fullName: "VÃµ Quá»‘c HÃ¹ng", phone: "0978456123", email: "hung.vo@gmail.com",
      currentPosition: "Supply Chain Lead", currentCompany: "Toyota Vietnam",
      industry: "Ká»¹ thuáº­t / Sáº£n xuáº¥t", yearsOfExp: 7, location: "HÃ  Ná»™i",
      expectedSalary: 50, currentSalary: 42,
      level: "LEAD" as CandidateSeniority, skills: ["Supply Chain", "SAP MM", "Logistics", "Kaizen", "Lean"],
      status: "AVAILABLE" as CandidateStatus, source: "REFERRAL" as CandidateSource, createdById,

    },
    {
      fullName: "Äá»— Thanh TÃ¹ng", phone: "0934789012", email: "tung.do@gmail.com",
      currentPosition: "Junior Accountant", currentCompany: "Deloitte Vietnam",
      industry: "TÃ i chÃ­nh / NgÃ¢n hÃ ng", yearsOfExp: 1, location: "TP.HCM",
      expectedSalary: 15, currentSalary: 12,
      level: "JUNIOR" as CandidateSeniority, skills: ["Kế toán", "Excel", "SAP", "Thuế GTGT"],
      status: "AVAILABLE" as CandidateStatus, source: "TOPCV" as CandidateSource, createdById,

    },
    {
      fullName: "Nguyá»…n Thá»‹ BÃ­ch Ngá»c", phone: "0945123789", email: "bicngoc.nguyen@gmail.com",
      currentPosition: "DevOps Engineer", currentCompany: "Intel Vietnam",
      industry: "IT / Pháº§n má»m", yearsOfExp: 4, location: "TP.HCM",
      expectedSalary: 50, currentSalary: 40,
      level: "MID_LEVEL" as CandidateSeniority, skills: ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Python"],
      status: "AVAILABLE" as CandidateStatus, source: "LINKEDIN" as CandidateSource, createdById,

    },
    {
      fullName: "BÃ¹i VÄƒn Tháº¯ng", phone: "0921456789", email: "thang.bui@gmail.com",
      currentPosition: "Intern Software Engineer", currentCompany: "Bosch Vietnam",
      industry: "IT / Pháº§n má»m", yearsOfExp: 0, location: "TP.HCM",
      expectedSalary: 8, currentSalary: 5,
      level: "INTERN" as CandidateSeniority, skills: ["Python", "React", "Git", "REST API"],
      status: "AVAILABLE" as CandidateStatus, source: "OTHER" as CandidateSource, createdById,

    },
  ];

  let createdCandidateCount = 0;
  for (const candidateData of demoCandidates) {
    const exists = await prisma.candidate.findFirst({
      where: {
        isDeleted: false,
        OR: [
          { email: candidateData.email },
          { phone: candidateData.phone },
        ],
      },
      select: { id: true },
    });

    if (!exists) {
      await prisma.candidate.create({ data: candidateData });
      createdCandidateCount += 1;
    }
  }

  if (createdCandidateCount > 0) {
    console.log(`Created ${createdCandidateCount} CRM demo candidates with skills & levels`);
  } else {
    console.log("Demo candidates already exist");
  }
  const demoCvBaseUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  const candidateEmails = [
    "khoa.nguyen@gmail.com",
    "huong.tran@outlook.com",
    "duc.le@gmail.com",
    "lananh.pham@gmail.com",
    "hung.vo@gmail.com",
    "tung.do@gmail.com",
    "bicngoc.nguyen@gmail.com",
    "thang.bui@gmail.com",
  ];

  const candidateProfiles: Record<
    string,
    {
      cvs: Array<{ fileUrl: string; fileName: string; label: string; isPrimary?: boolean }>;
      languages: Array<{ language: string; level?: string; certificate?: string }>;
      workHistory: Array<{
        companyName: string;
        position: string;
        startDate?: Date;
        endDate?: Date;
        isCurrent?: boolean;
        notes?: string;
      }>;
    }
  > = {
    "khoa.nguyen@gmail.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=khoa-primary`, fileName: "Nguyen-Minh-Khoa-CV.pdf", label: "CV goc", isPrimary: true },
        { fileUrl: `${demoCvBaseUrl}?candidate=khoa-en`, fileName: "Nguyen-Minh-Khoa-CV-English.pdf", label: "CV English" },
      ],
      languages: [
        { language: "Tiáº¿ng Anh", level: "IELTS 7.5", certificate: "IELTS Academic" },
      ],
      workHistory: [
        { companyName: "FPT Software", position: "Senior Frontend Developer", startDate: new Date("2022-05-01"), isCurrent: true, notes: "Lead frontend cho dá»± Ã¡n enterprise dÃ¹ng Next.js vÃ  TypeScript." },
        { companyName: "TMA Solutions", position: "Frontend Developer", startDate: new Date("2020-01-01"), endDate: new Date("2022-04-30"), notes: "PhÃ¡t triá»ƒn React dashboard cho khÃ¡ch hÃ ng US." },
      ],
    },
    "huong.tran@outlook.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=huong-primary`, fileName: "Tran-Thi-Huong-CV.pdf", label: "CV HRBP", isPrimary: true },
      ],
      languages: [
        { language: "Tiáº¿ng Anh", level: "TOEIC 850", certificate: "TOEIC" },
        { language: "Tiáº¿ng HÃ n", level: "TOPIK 4", certificate: "TOPIK" },
      ],
      workHistory: [
        { companyName: "Samsung Vietnam", position: "HR Business Partner", startDate: new Date("2021-06-01"), isCurrent: true, notes: "Phá»¥ trÃ¡ch HRBP cho khá»‘i sáº£n xuáº¥t vÃ  váº­n hÃ nh." },
        { companyName: "Unilever Vietnam", position: "Talent Acquisition Specialist", startDate: new Date("2018-03-01"), endDate: new Date("2021-05-31"), notes: "Tuyá»ƒn mass vÃ  tuyá»ƒn middle management." },
      ],
    },
    "duc.le@gmail.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=duc-primary`, fileName: "Le-Van-Duc-CV.pdf", label: "CV backend", isPrimary: true },
      ],
      languages: [
        { language: "Tiáº¿ng Anh", level: "TOEIC 780", certificate: "TOEIC" },
      ],
      workHistory: [
        { companyName: "VNG Corporation", position: "Java Backend Developer", startDate: new Date("2023-01-01"), isCurrent: true, notes: "PhÃ¡t triá»ƒn microservices vÃ  API cho há»‡ thá»‘ng payment." },
        { companyName: "KMS Technology", position: "Software Engineer Intern", startDate: new Date("2022-05-01"), endDate: new Date("2022-12-31"), notes: "Tham gia Ä‘á»™i platform vÃ  automation test." },
      ],
    },
    "lananh.pham@gmail.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=lananh-primary`, fileName: "Pham-Thi-Lan-Anh-CV.pdf", label: "CV marketing", isPrimary: true },
        { fileUrl: `${demoCvBaseUrl}?candidate=lananh-en`, fileName: "Pham-Thi-Lan-Anh-CV-English.pdf", label: "CV English" },
      ],
      languages: [
        { language: "Tiáº¿ng Anh", level: "IELTS 7.0", certificate: "IELTS Academic" },
      ],
      workHistory: [
        { companyName: "Nestle Vietnam", position: "Marketing Manager", startDate: new Date("2020-08-01"), isCurrent: true, notes: "Quáº£n lÃ½ brand FMCG vÃ  ngÃ¢n sÃ¡ch truyá»n thÃ´ng." },
        { companyName: "Coca-Cola Vietnam", position: "Brand Executive", startDate: new Date("2016-06-01"), endDate: new Date("2020-07-31"), notes: "Phá»¥ trÃ¡ch activation vÃ  digital campaign." },
      ],
    },
    "hung.vo@gmail.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=hung-primary`, fileName: "Vo-Quoc-Hung-CV.pdf", label: "CV supply chain", isPrimary: true },
      ],
      languages: [
        { language: "Tiáº¿ng Anh", level: "TOEIC 700", certificate: "TOEIC" },
        { language: "Tiáº¿ng Nháº­t", level: "JLPT N3", certificate: "JLPT" },
      ],
      workHistory: [
        { companyName: "Toyota Vietnam", position: "Supply Chain Lead", startDate: new Date("2021-01-01"), isCurrent: true, notes: "Quáº£n lÃ½ inbound logistics vÃ  vendor coordination." },
        { companyName: "Yazaki Vietnam", position: "Supply Chain Supervisor", startDate: new Date("2018-02-01"), endDate: new Date("2020-12-31"), notes: "Láº­p káº¿ hoáº¡ch nguyÃªn váº­t liá»‡u vÃ  tá»‘i Æ°u tá»“n kho." },
      ],
    },
    "tung.do@gmail.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=tung-primary`, fileName: "Do-Thanh-Tung-CV.pdf", label: "CV accountant", isPrimary: true },
      ],
      languages: [
        { language: "Tiáº¿ng Anh", level: "TOEIC 600", certificate: "TOEIC" },
      ],
      workHistory: [
        { companyName: "Deloitte Vietnam", position: "Junior Accountant", startDate: new Date("2025-01-01"), isCurrent: true, notes: "Há»— trá»£ bÃ¡o cÃ¡o tÃ i chÃ­nh vÃ  Ä‘á»‘i soÃ¡t chá»©ng tá»«." },
      ],
    },
    "bicngoc.nguyen@gmail.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=ngoc-primary`, fileName: "Nguyen-Thi-Bich-Ngoc-CV.pdf", label: "CV DevOps", isPrimary: true },
        { fileUrl: `${demoCvBaseUrl}?candidate=ngoc-en`, fileName: "Nguyen-Thi-Bich-Ngoc-CV-English.pdf", label: "CV English" },
      ],
      languages: [
        { language: "Tiáº¿ng Anh", level: "IELTS 7.0", certificate: "IELTS Academic" },
      ],
      workHistory: [
        { companyName: "Intel Vietnam", position: "DevOps Engineer", startDate: new Date("2022-09-01"), isCurrent: true, notes: "Phá»¥ trÃ¡ch Kubernetes, CI/CD vÃ  cloud automation." },
        { companyName: "NashTech", position: "Cloud Engineer", startDate: new Date("2020-06-01"), endDate: new Date("2022-08-31"), notes: "Triá»ƒn khai háº¡ táº§ng AWS vÃ  observability." },
      ],
    },
    "thang.bui@gmail.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=thang-primary`, fileName: "Bui-Van-Thang-CV.pdf", label: "CV intern", isPrimary: true },
      ],
      languages: [
        { language: "Tiáº¿ng Anh", level: "TOEIC 550", certificate: "TOEIC" },
      ],
      workHistory: [
        { companyName: "Bosch Vietnam", position: "Intern Software Engineer", startDate: new Date("2025-06-01"), isCurrent: true, notes: "Há»— trá»£ team backend vÃ  automation script." },
      ],
    },
  };

  const seededCandidates = await prisma.candidate.findMany({
    where: { email: { in: candidateEmails }, isDeleted: false },
    select: { id: true, email: true, createdById: true },
  });

  let cvSeedCount = 0;
  let languageSeedCount = 0;
  let workSeedCount = 0;

  for (const candidate of seededCandidates) {
    if (!candidate.email) continue;
    const profile = candidateProfiles[candidate.email];
    if (!profile) continue;

    const existingCvCount = await prisma.candidateCV.count({
      where: { candidateId: candidate.id },
    });
    if (existingCvCount === 0 && profile.cvs.length > 0) {
      await prisma.candidateCV.createMany({
        data: profile.cvs.map((cv, index) => ({
          candidateId: candidate.id,
          fileUrl: cv.fileUrl,
          fileName: cv.fileName,
          label: cv.label,
          isPrimary: cv.isPrimary ?? index === 0,
          uploadedById: candidate.createdById,
        })),
      });

      const primaryCv = profile.cvs.find((cv) => cv.isPrimary) ?? profile.cvs[0];
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          cvFileUrl: primaryCv.fileUrl,
          cvFileName: primaryCv.fileName,
        },
      });
      cvSeedCount += profile.cvs.length;
    }

    const existingLanguageCount = await prisma.candidateLanguage.count({
      where: { candidateId: candidate.id },
    });
    if (existingLanguageCount === 0 && profile.languages.length > 0) {
      await prisma.candidateLanguage.createMany({
        data: profile.languages.map((language) => ({
          candidateId: candidate.id,
          language: language.language,
          level: language.level,
          certificate: language.certificate,
        })),
      });
      languageSeedCount += profile.languages.length;
    }

    const existingWorkCount = await prisma.workExperience.count({
      where: { candidateId: candidate.id },
    });
    if (existingWorkCount === 0 && profile.workHistory.length > 0) {
      await prisma.workExperience.createMany({
        data: profile.workHistory.map((work) => ({
          candidateId: candidate.id,
          companyName: work.companyName,
          position: work.position,
          startDate: work.startDate,
          endDate: work.isCurrent ? null : work.endDate,
          isCurrent: work.isCurrent ?? false,
          notes: work.notes,
        })),
      });
      workSeedCount += profile.workHistory.length;
    }
  }

  console.log(`Ã¢Å“â€¦ Seeded ${cvSeedCount} CVs, ${languageSeedCount} languages, ${workSeedCount} work experiences`);

  // ==================== DEMO APPLICATIONS ====================
  console.log("\nðŸ“ Seeding demo Applications...");
  const firstJob = await prisma.jobPosting.findFirst({ where: { status: "APPROVED" }, orderBy: { publishedAt: "desc" } });
  if (firstJob) {
    await prisma.application.createMany({
      data: [
        { jobPostingId: firstJob.id, fullName: "Nguyá»…n VÄƒn HÃ¹ng", email: "hung.nguyen@gmail.com", phone: "0912345678", coverLetter: "TÃ´i ráº¥t mong muá»‘n Ä‘Æ°á»£c lÃ m viá»‡c táº¡i Samsung. Vá»›i 3 nÄƒm kinh nghiá»‡m trong sáº£n xuáº¥t...", status: "NEW" },
        { jobPostingId: firstJob.id, fullName: "Tráº§n Thá»‹ Mai", email: "mai.tran@hotmail.com", phone: "0987654321", coverLetter: "KÃ­nh gá»­i phÃ²ng NhÃ¢n sá»±, tÃ´i xin á»©ng tuyá»ƒn vÃ o vá»‹ trÃ­ nÃ y...", status: "REVIEWED" },
      ]
    });
    console.log("âœ… Created 2 demo applications");
  }

  console.log("\nðŸŽ‰ Seeding finished!");
  console.log("â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•");
  console.log("CRM Login:      admin@headhunt.com / headhunt123");
  console.log("Employer Login:  hr@samsung-vn.com / employer123");
  console.log("â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
