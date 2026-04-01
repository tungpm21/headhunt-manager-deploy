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
    { name: "Trần VÄƒn Minh", email: "minh.tran@headhunt.com", password: pw, role: "MEMBER" as const },
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
        logo: "/logos/samsung.png", industry: "Sản xuất - Điá»‡n tử", companySize: "ENTERPRISE",
        address: "KCN Yên Phong, Bắc Ninh", website: "https://samsung.com/vn", phone: "0222 3710 000",
        status: "ACTIVE", slug: "samsung-electronics-vietnam",
        description: "Samsung Electronics Vietnam (SEV) là tá»• hợp nhà máy sản xuất smartphone và linh kiá»‡n Ä‘iá»‡n tử lá»›n nhất thế giá»›i của Samsung. Được thành lập nÄƒm 2009, SEV Ä‘ã trá»Ÿ thành má»™t trong những doanh nghiá»‡p FDI lá»›n nhất Viá»‡t Nam vá»›i hơn 100.000 nhân viên. SEV liên tục má»Ÿ rá»™ng quy mô và Ä‘ầu tư vào công nghá»‡ cao, Ä‘óng góp quan trọng vào kim ngạch xuất khẩu của Viá»‡t Nam.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@canon-vn.com", password: epw, companyName: "Canon Vietnam",
        logo: "/logos/canon.png", industry: "Sản xuất - Thiết bá»‹ vÄƒn phòng", companySize: "LARGE",
        address: "KCN Quế Võ, Bắc Ninh", website: "https://canon.com.vn", phone: "0222 3636 636",
        status: "ACTIVE", slug: "canon-vietnam",
        description: "Canon Vietnam Co., Ltd là công ty 100% vá»‘n Nhật Bản thuá»™c tập Ä‘oàn Canon Inc., chuyên sản xuất máy in laser, cartridge và linh kiá»‡n quang học. Vá»›i hơn 20 nÄƒm hoạt Ä‘á»™ng tại Viá»‡t Nam, Canon Ä‘ã xây dựng môi trường làm viá»‡c chuẩn Nhật Bản vá»›i vÄƒn hóa Kaizen và phát triá»ƒn nhân sự bền vững.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@toyota-vn.com", password: epw, companyName: "Toyota Motor Vietnam",
        logo: "/logos/toyota.png", industry: "Ã” tô - Vận tải", companySize: "ENTERPRISE",
        address: "KCN Phúc Thắng, VÄ©nh Phúc", website: "https://toyota.com.vn", phone: "0211 3862 100",
        status: "ACTIVE", slug: "toyota-motor-vietnam",
        description: "Toyota Motor Vietnam (TMV) là liên doanh sản xuất và phân phá»‘i ô tô hàng Ä‘ầu Viá»‡t Nam. TMV vận hành nhà máy lắp ráp tại VÄ©nh Phúc vá»›i dây chuyền sản xuất hiá»‡n Ä‘ại theo tiêu chuẩn Toyota Production System (TPS). Công ty cam kết phát triá»ƒn bền vững và Ä‘ào tạo nguá»“n nhân lực chất lượng cao.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@lg-vn.com", password: epw, companyName: "LG Electronics Vietnam",
        logo: "/logos/lg.png", industry: "Sản xuất - Điá»‡n tử", companySize: "ENTERPRISE",
        address: "KCN Tràng Duá»‡, Hải Phòng", website: "https://lg.com/vn", phone: "0225 3552 000",
        status: "ACTIVE", slug: "lg-electronics-vietnam",
        description: "LG Electronics Vietnam vận hành tá»• hợp nhà máy sản xuất TV, màn hình và thiết bá»‹ gia dụng tại Hải Phòng. Vá»›i Ä‘ầu tư hơn 5 tỷ USD, LG là má»™t trong những nhà Ä‘ầu tư FDI lá»›n nhất miền Bắc. Công ty ná»•i tiếng vá»›i chế Ä‘á»™ Ä‘ãi ngá»™ tá»‘t và cơ há»™i thÄƒng tiến cho nhân viên tráº».",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@bosch-vn.com", password: epw, companyName: "Bosch Vietnam",
        logo: "/logos/bosch.png", industry: "Công nghá»‡ - Kỹ thuật", companySize: "LARGE",
        address: "Tầng 12, Tòa nhà Mapletree, Quận 7, TP.HCM", website: "https://bosch.com.vn", phone: "028 6258 3100",
        status: "ACTIVE", slug: "bosch-vietnam",
        description: "Bosch Vietnam là công ty công nghá»‡ và kỹ thuật hàng Ä‘ầu thế giá»›i Ä‘ến từ Đức. Tại Viá»‡t Nam, Bosch hoạt Ä‘á»™ng trong các lÄ©nh vực giải pháp di chuyá»ƒn, công nghá»‡ công nghiá»‡p, hàng tiêu dùng và nÄƒng lượng. Bosch ná»•i tiếng vá»›i môi trường làm viá»‡c quá»‘c tế, chế Ä‘á»™ Ä‘ãi ngá»™ hấp dáº«n và cơ há»™i phát triá»ƒn sự nghiá»‡p toàn cầu.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@panasonic-vn.com", password: epw, companyName: "Panasonic Vietnam",
        logo: "/logos/panasonic.png", industry: "Sản xuất - Điá»‡n tử gia dụng", companySize: "LARGE",
        address: "KCN ThÄƒng Long II, Hưng Yên", website: "https://panasonic.com/vn", phone: "0221 3981 234",
        status: "ACTIVE", slug: "panasonic-vietnam",
        description: "Panasonic Vietnam thuá»™c tập Ä‘oàn Panasonic Nhật Bản, chuyên sản xuất và phân phá»‘i thiết bá»‹ Ä‘iá»‡n tử, Ä‘iá»‡n lạnh. Vá»›i hơn 7.000 nhân viên, Panasonic cam kết mang Ä‘ến môi trường làm viá»‡c an toàn, phúc lợi tá»‘t và cơ há»™i phát triá»ƒn nghề nghiá»‡p lâu dài.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@nestle-vn.com", password: epw, companyName: "Nestlé Vietnam",
        logo: "/logos/nestle.png", industry: "FMCG - Thực phẩm", companySize: "LARGE",
        address: "Tầng 8, Empress Tower, Quận 1, TP.HCM", website: "https://nestle.com.vn", phone: "028 3821 1000",
        status: "ACTIVE", slug: "nestle-vietnam",
        description: "Nestlé Vietnam là chi nhánh của tập Ä‘oàn thực phẩm lá»›n nhất thế giá»›i Nestlé S.A. (Thụy SÄ©). Vá»›i hơn 2.300 nhân viên và 4 nhà máy trên cả nưá»›c, Nestlé sản xuất các thương hiá»‡u ná»•i tiếng như NESCAFÃ‰, MILO, MAGGI, KitKat. Môi trường làm viá»‡c Ä‘a dạng, sáng tạo và tập trung phát triá»ƒn con người.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@intel-vn.com", password: epw, companyName: "Intel Products Vietnam",
        logo: "/logos/intel.png", industry: "Bán dáº«n - Công nghá»‡ cao", companySize: "ENTERPRISE",
        address: "Lô I2, D1, Khu Công nghá»‡ cao, Quận 9, TP.HCM", website: "https://intel.com", phone: "028 3636 9000",
        status: "ACTIVE", slug: "intel-products-vietnam",
        description: "Intel Products Vietnam (IPV) là nhà máy kiá»ƒm Ä‘á»‹nh và Ä‘óng gói chip bán dáº«n lá»›n nhất của Intel trên toàn cầu. Đầu tư hơn 1.5 tỷ USD, IPV là má»™t trong những doanh nghiá»‡p FDI công nghá»‡ cao hàng Ä‘ầu tại Viá»‡t Nam. Công ty tạo cơ há»™i cho kỹ sư Viá»‡t Nam tham gia vào chuá»—i giá trá»‹ bán dáº«n toàn cầu.",
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
        title: "Kỹ sư sản xuất (Production Engineer)", slug: "ky-su-san-xuat-samsung", employerId: samsung.id,
        description: "Giám sát và tá»‘i ưu hóa quy trình sản xuất smartphone tại nhà máy Samsung Bắc Ninh. Phân tích dữ liá»‡u sản xuất, Ä‘ề xuất cải tiến nÄƒng suất và chất lượng. Phá»‘i hợp vá»›i Ä‘á»™i ngÅ© kỹ sư Hàn Quá»‘c Ä‘á»ƒ triá»ƒn khai công nghá»‡ má»›i.",
        requirements: "- Tá»‘t nghiá»‡p ĐH ngành Cơ khí, Điá»‡n tử, Cơ Ä‘iá»‡n tử hoặc tương Ä‘ương\n- Ãt nhất 2 nÄƒm kinh nghiá»‡m trong môi trường sản xuất\n- Thành thạo MS Office, AutoCAD\n- Tiếng Hàn TOPIK 3 hoặc tiếng Anh TOEIC 600+\n- Sáºµn sàng làm ca theo lá»‹ch nhà máy",
        benefits: "- Lương cạnh tranh top thá»‹ trường + thưá»Ÿng quÃ½\n- Xe Ä‘ưa Ä‘ón Hà Ná»™i - Bắc Ninh\n- Bảo hiá»ƒm sức khỏe PVI cao cấp cho nhân viên + gia Ä‘ình\n- Cơ há»™i Ä‘ào tạo ngắn hạn tại Hàn Quá»‘c\n- Phụ cấp Äƒn trưa, Ä‘á»“ng phục, thiết bá»‹ bảo há»™",
        salaryMin: 18, salaryMax: 30, salaryDisplay: "18 - 30 triá»‡u", industry: "Sản xuất", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 5, skills: "Sản xuất, QC, Lean, 5S, AutoCAD, Tiếng Hàn", status: "APPROVED", publishedAt: pub(3), expiresAt: exp(40), viewCount: 234, applyCount: 12
      },

      {
        title: "Trưá»Ÿng phòng Nhân sự (HR Manager)", slug: "truong-phong-nhan-su-samsung", employerId: samsung.id,
        description: "Quản lÃ½ toàn bá»™ hoạt Ä‘á»™ng nhân sự tại nhà máy SEV bao gá»“m tuyá»ƒn dụng quy mô lá»›n (200+ người/tháng), Ä‘ào tạo onboarding, quản lÃ½ C&B cho 5.000+ nhân viên, và duy trì quan há»‡ lao Ä‘á»™ng á»•n Ä‘á»‹nh.",
        requirements: "- Tá»‘t nghiá»‡p ĐH trá»Ÿ lên ngành Quản trá»‹ nhân lực, Luật, QTKD\n- 5+ nÄƒm kinh nghiá»‡m HR, trong Ä‘ó 2+ nÄƒm á»Ÿ vá»‹ trí quản lÃ½\n- Kinh nghiá»‡m trong nhà máy sản xuất FDI là bắt buá»™c\n- Nắm vững Luật lao Ä‘á»™ng, BHXH, BHYT\n- Tiếng Anh hoặc tiếng Hàn giao tiếp tá»‘t",
        benefits: "- Lương thỏa thuận (cạnh tranh nhất thá»‹ trường)\n- Thưá»Ÿng KPI quÃ½ + thưá»Ÿng cuá»‘i nÄƒm 2-4 tháng lương\n- Bảo hiá»ƒm cao cấp cho cả gia Ä‘ình\n- Xe công ty, Ä‘iá»‡n thoại, laptop\n- Ngày phép: 15 ngày/nÄƒm",
        salaryMin: 35, salaryMax: 55, salaryDisplay: "35 - 55 triá»‡u", industry: "Nhân sự", position: "Trưá»Ÿng phòng", location: "Bắc Ninh", workType: "Full-time", quantity: 1, skills: "HR, Tuyá»ƒn dụng, C&B, Luật lao Ä‘á»™ng, Tiếng Hàn", status: "APPROVED", publishedAt: pub(1), expiresAt: exp(45), isFeatured: true, viewCount: 567, applyCount: 23
      },

      {
        title: "Kỹ sư QA/QC (Quality Engineer)", slug: "ky-su-qa-qc-samsung", employerId: samsung.id,
        description: "Kiá»ƒm tra chất lượng sản phẩm smartphone theo tiêu chuẩn Samsung Global. Phân tích lá»—i sản phẩm, xây dựng báo cáo chất lượng hàng tuần. Tham gia audit ISO 9001, ISO 14001.",
        requirements: "- ĐH ngành Kỹ thuật, Điá»‡n tử, Vật lÃ½\n- 1+ nÄƒm kinh nghiá»‡m QC trong sản xuất Ä‘iá»‡n tử\n- Sử dụng thành thạo công cụ Ä‘o lường (caliper, micrometer)\n- Hiá»ƒu biết về SPC, FMEA, 8D Report",
        benefits: "- Lương tháng 13, 14 + thưá»Ÿng quÃ½\n- Xe Ä‘ưa Ä‘ón\n- Cơm trưa miá»…n phí\n- Bảo hiá»ƒm PVI",
        salaryMin: 12, salaryMax: 20, salaryDisplay: "12 - 20 triá»‡u", industry: "Sản xuất", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 8, skills: "QA, QC, ISO, SPC, FMEA", status: "APPROVED", publishedAt: pub(5), expiresAt: exp(35), viewCount: 189, applyCount: 31
      },

      {
        title: "Nhân viên IT Support", slug: "it-support-samsung", employerId: samsung.id,
        description: "Há»— trợ kỹ thuật IT cho hơn 5.000 user tại nhà máy. Quản lÃ½ há»‡ thá»‘ng mạng LAN, WiFi, server. Triá»ƒn khai và bảo trì các há»‡ thá»‘ng MES, ERP (SAP).",
        requirements: "- ĐH CNTT, Mạng máy tính\n- 1-3 nÄƒm kinh nghiá»‡m IT helpdesk\n- CCNA hoặc tương Ä‘ương\n- Tiếng Anh Ä‘ọc hiá»ƒu tài liá»‡u kỹ thuật",
        salaryMin: 12, salaryMax: 18, salaryDisplay: "12 - 18 triá»‡u", industry: "IT - Phần mềm", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 2, skills: "IT Support, CCNA, SAP, Windows Server", status: "APPROVED", publishedAt: pub(2), expiresAt: exp(30), viewCount: 145, applyCount: 8
      },

      {
        title: "Phiên dá»‹ch tiếng Hàn (Korean Interpreter)", slug: "phien-dich-tieng-han-samsung", employerId: samsung.id,
        description: "Phiên dá»‹ch các cuá»™c họp cấp quản lÃ½, Ä‘ào tạo kỹ thuật, và giao tiếp hàng ngày giữa chuyên gia Hàn Quá»‘c và nhân viên Viá»‡t Nam. Dá»‹ch tài liá»‡u kỹ thuật sản xuất.",
        requirements: "- TOPIK 5 trá»Ÿ lên\n- Æ¯u tiên có kinh nghiá»‡m phiên dá»‹ch trong nhà máy\n- Kỹ nÄƒng giao tiếp tá»‘t, nhanh nháº¹n",
        salaryMin: 15, salaryMax: 25, salaryDisplay: "15 - 25 triá»‡u", industry: "Phiên dá»‹ch", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 3, skills: "Tiếng Hàn, Phiên dá»‹ch, TOPIK 5", status: "APPROVED", publishedAt: pub(4), expiresAt: exp(25), viewCount: 312, applyCount: 18
      },

      // Canon (3 jobs)
      {
        title: "Nhân viên Kế toán tá»•ng hợp", slug: "ke-toan-tong-hop-canon", employerId: canon.id,
        description: "Thực hiá»‡n nghiá»‡p vụ kế toán tá»•ng hợp, lập báo cáo tài chính theo chuẩn IFRS và VAS. Quản lÃ½ thuế GTGT, TNDN. Phá»‘i hợp vá»›i kiá»ƒm toán ná»™i bá»™ và kiá»ƒm toán Ä‘á»™c lập.",
        requirements: "- ĐH Kế toán, Tài chính\n- 2+ nÄƒm kinh nghiá»‡m kế toán tá»•ng hợp\n- Thành thạo SAP FI/CO\n- Tiếng Nhật N3 hoặc tiếng Anh TOEIC 550+",
        benefits: "- Lương tháng 13, 14, 15\n- Xe Ä‘ưa Ä‘ón Hà Ná»™i - Bắc Ninh\n- Ä‚n trưa miá»…n phí (buffet)\n- Du lá»‹ch công ty hàng nÄƒm",
        salaryMin: 15, salaryMax: 22, salaryDisplay: "15 - 22 triá»‡u", industry: "Kế toán - Tài chính", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 2, skills: "Kế toán, SAP, IFRS, Tiếng Nhật", status: "APPROVED", publishedAt: pub(8), expiresAt: exp(22), viewCount: 167, applyCount: 14
      },

      {
        title: "Phiên dá»‹ch tiếng Nhật", slug: "phien-dich-tieng-nhat-canon", employerId: canon.id,
        description: "Phiên dá»‹ch trong cuá»™c họp, training, và giao tiếp giữa ban lãnh Ä‘ạo Nhật Bản và nhân viên Viá»‡t Nam. Há»— trợ dá»‹ch tài liá»‡u kỹ thuật, hợp Ä‘á»“ng, quy trình ISO.",
        requirements: "- Tiếng Nhật N2 trá»Ÿ lên (N1 ưu tiên)\n- Æ¯u tiên kinh nghiá»‡m trong FDI Nhật\n- Kỹ nÄƒng viết và nói tá»‘t cả tiếng Viá»‡t láº«n tiếng Nhật",
        salaryMin: 18, salaryMax: 28, salaryDisplay: "18 - 28 triá»‡u", industry: "Phiên dá»‹ch", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 1, skills: "Tiếng Nhật N2, Phiên dá»‹ch, FDI", status: "APPROVED", publishedAt: pub(6), expiresAt: exp(24), viewCount: 201, applyCount: 9
      },

      {
        title: "Kỹ sư bảo trì (Maintenance Engineer)", slug: "ky-su-bao-tri-canon", employerId: canon.id,
        description: "Bảo trì, sửa chữa há»‡ thá»‘ng máy in laser và dây chuyền sản xuất. Lập kế hoạch bảo trì phòng ngừa (PM). Quản lÃ½ phụ tùng và thiết bá»‹ dự phòng.",
        requirements: "- ĐH ngành Cơ khí, Điá»‡n, Cơ Ä‘iá»‡n tử\n- 2+ nÄƒm kinh nghiá»‡m bảo trì trong nhà máy\n- Đọc hiá»ƒu bản váº½ kỹ thuật\n- Tiếng Nhật hoặc tiếng Anh giao tiếp",
        salaryMin: 14, salaryMax: 22, salaryDisplay: "14 - 22 triá»‡u", industry: "Sản xuất", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 3, skills: "Bảo trì, PLC, Cơ khí, Điá»‡n", status: "APPROVED", publishedAt: pub(3), expiresAt: exp(27), viewCount: 98, applyCount: 5
      },

      // Toyota (3 jobs)
      {
        title: "Kỹ sư ô tô (Automotive Engineer)", slug: "ky-su-o-to-toyota", employerId: toyota.id,
        description: "Tham gia thiết kế và cải tiến quy trình lắp ráp ô tô theo Toyota Production System (TPS). Phân tích và giải quyết vấn Ä‘ề chất lượng trên dây chuyền sản xuất.",
        requirements: "- ĐH ngành Cơ khí Ã” tô, Cơ khí chế tạo máy\n- 2+ nÄƒm kinh nghiá»‡m trong ngành ô tô\n- Hiá»ƒu biết về TPS, Kaizen, Just-in-Time\n- Tiếng Nhật N3 hoặc tiếng Anh TOEIC 600+",
        benefits: "- Lương 3 tháng thử viá»‡c 100%\n- Thưá»Ÿng Tết 3-5 tháng lương\n- Xe Ä‘ưa Ä‘ón Hà Ná»™i - VÄ©nh Phúc\n- Đào tạo tại Nhật Bản",
        salaryMin: 20, salaryMax: 35, salaryDisplay: "20 - 35 triá»‡u", industry: "Cơ khí - Ã” tô", position: "Nhân viên", location: "VÄ©nh Phúc", workType: "Full-time", quantity: 4, skills: "TPS, Kaizen, AutoCAD, SolidWorks, Tiếng Nhật", status: "APPROVED", publishedAt: pub(2), expiresAt: exp(38), isFeatured: true, viewCount: 445, applyCount: 19
      },

      {
        title: "Chuyên viên Marketing & Truyền thông", slug: "marketing-toyota", employerId: toyota.id,
        description: "Lên kế hoạch và triá»ƒn khai các chiến dá»‹ch marketing cho dòng xe Toyota tại Viá»‡t Nam. Quản lÃ½ ná»™i dung website, social media, và quan há»‡ báo chí.",
        requirements: "- ĐH Marketing, Truyền thông, Báo chí\n- 3+ nÄƒm kinh nghiá»‡m marketing (ngành ô tô ưu tiên)\n- Sáng tạo ná»™i dung, quản lÃ½ KOL/KOC\n- Tiếng Anh thành thạo",
        salaryMin: 18, salaryMax: 28, salaryDisplay: "18 - 28 triá»‡u", industry: "Marketing", position: "Chuyên viên", location: "Hà Ná»™i", workType: "Full-time", quantity: 1, skills: "Marketing, Digital Marketing, Content, KOL", status: "APPROVED", publishedAt: pub(1), expiresAt: exp(30), viewCount: 289, applyCount: 15
      },

      {
        title: "Trưá»Ÿng ca sản xuất (Production Supervisor)", slug: "truong-ca-san-xuat-toyota", employerId: toyota.id,
        description: "Quản lÃ½ ca sản xuất lắp ráp ô tô. Đảm bảo tiến Ä‘á»™, chất lượng và an toàn lao Ä‘á»™ng. Huấn luyá»‡n công nhân má»›i, triá»ƒn khai cải tiến Kaizen.",
        requirements: "- CĐ/ĐH ngành Cơ khí, Quản lÃ½ CN\n- 3+ nÄƒm kinh nghiá»‡m giám sát sản xuất\n- Kỹ nÄƒng quản lÃ½ Ä‘á»™i nhóm 50+ người",
        salaryMin: 16, salaryMax: 25, salaryDisplay: "16 - 25 triá»‡u", industry: "Sản xuất", position: "Trưá»Ÿng ca", location: "VÄ©nh Phúc", workType: "Full-time", quantity: 2, skills: "Quản lÃ½ sản xuất, TPS, Kaizen, 5S", status: "APPROVED", publishedAt: pub(5), expiresAt: exp(25), viewCount: 134, applyCount: 7
      },

      // LG (3 jobs)
      {
        title: "Kỹ sư phần mềm nhúng (Embedded Software Engineer)", slug: "ky-su-embedded-lg", employerId: lg.id,
        description: "Phát triá»ƒn firmware cho TV và màn hình thông minh. Lập trình C/C++ trên nền tảng Linux embedded. Tá»‘i ưu hiá»‡u nÄƒng xử lÃ½ hình ảnh và âm thanh.",
        requirements: "- ĐH CNTT, Điá»‡n tử, Viá»…n thông\n- 2+ nÄƒm kinh nghiá»‡m embedded C/C++\n- Hiá»ƒu biết về Linux kernel, device driver\n- Tiếng Anh Ä‘ọc hiá»ƒu tài liá»‡u kỹ thuật",
        benefits: "- Review lương 2 lần/nÄƒm\n- Thưá»Ÿng sáng kiến cải tiến\n- Bảo hiá»ƒm sức khỏe Bảo Viá»‡t\n- Câu lạc bá»™ thá»ƒ thao, gym miá»…n phí",
        salaryMin: 20, salaryMax: 40, salaryDisplay: "20 - 40 triá»‡u", industry: "IT - Phần mềm", position: "Kỹ sư", location: "Hải Phòng", workType: "Full-time", quantity: 3, skills: "C/C++, Linux, Embedded, IoT", status: "APPROVED", publishedAt: pub(1), expiresAt: exp(40), isFeatured: true, viewCount: 523, applyCount: 27
      },

      {
        title: "Nhân viên Supply Chain", slug: "supply-chain-lg", employerId: lg.id,
        description: "Quản lÃ½ chuá»—i cung ứng linh kiá»‡n cho nhà máy sản xuất TV. Lập kế hoạch nhập khẩu nguyên vật liá»‡u, theo dõi tá»“n kho, phá»‘i hợp vá»›i nhà cung cấp quá»‘c tế.",
        requirements: "- ĐH Logistics, Ngoại thương, QTKD\n- 2+ nÄƒm kinh nghiá»‡m SCM trong sản xuất\n- Thành thạo SAP MM\n- Tiếng Anh TOEIC 650+",
        salaryMin: 14, salaryMax: 22, salaryDisplay: "14 - 22 triá»‡u", industry: "Logistics", position: "Nhân viên", location: "Hải Phòng", workType: "Full-time", quantity: 2, skills: "SCM, SAP MM, Logistics, Import/Export", status: "APPROVED", publishedAt: pub(4), expiresAt: exp(26), viewCount: 167, applyCount: 11
      },

      {
        title: "Giám Ä‘á»‘c nhà máy (Plant Manager)", slug: "giam-doc-nha-may-lg", employerId: lg.id,
        description: "Điều hành toàn bá»™ hoạt Ä‘á»™ng nhà máy sản xuất màn hình LG tại Hải Phòng. Quản lÃ½ 3.000+ nhân viên, Ä‘ảm bảo KPI sản lượng, chất lượng, chi phí và an toàn.",
        requirements: "- ThS trá»Ÿ lên ngành Kỹ thuật, QTKD\n- 10+ nÄƒm kinh nghiá»‡m sản xuất, 5+ nÄƒm vá»‹ trí quản lÃ½ cấp cao\n- Kinh nghiá»‡m trong FDI quy mô lá»›n\n- Tiếng Anh hoặc tiếng Hàn thành thạo",
        salaryDisplay: "Thỏa thuận (80 - 150 triá»‡u)", industry: "Sản xuất", position: "Giám Ä‘á»‘c", location: "Hải Phòng", workType: "Full-time", quantity: 1, skills: "Plant Management, Lean, Six Sigma, P&L", status: "APPROVED", publishedAt: pub(0), expiresAt: exp(60), isFeatured: true, viewCount: 892, applyCount: 5
      },

      // Bosch (2 jobs)
      {
        title: "Kỹ sư phần mềm Java (Java Software Engineer)", slug: "java-engineer-bosch", employerId: bosch.id,
        description: "Phát triá»ƒn ứng dụng IoT và giải pháp công nghiá»‡p 4.0 bằng Java/Spring Boot. Làm viá»‡c theo Agile Scrum trong team quá»‘c tế (Đức, áº¤n Đá»™, Viá»‡t Nam).",
        requirements: "- ĐH CNTT, Khoa học máy tính\n- 2+ nÄƒm kinh nghiá»‡m Java, Spring Boot\n- Hiá»ƒu biết DevOps: Docker, Kubernetes, CI/CD\n- Tiếng Anh giao tiếp tá»‘t (làm viá»‡c vá»›i team global)",
        benefits: "- Lương tháng 13, 14\n- Flexible working hours\n- 18 ngày phép/nÄƒm\n- Đào tạo tại Đức\n- Bảo hiá»ƒm sức khỏe quá»‘c tế",
        salaryMin: 25, salaryMax: 45, salaryDisplay: "25 - 45 triá»‡u", industry: "IT - Phần mềm", position: "Kỹ sư", location: "TP. Há»“ Chí Minh", workType: "Hybrid", quantity: 5, skills: "Java, Spring Boot, Docker, K8s, Agile", status: "APPROVED", publishedAt: pub(1), expiresAt: exp(45), isFeatured: true, viewCount: 678, applyCount: 34
      },

      {
        title: "Chuyên viên An toàn lao Ä‘á»™ng (HSE Specialist)", slug: "hse-bosch", employerId: bosch.id,
        description: "Triá»ƒn khai há»‡ thá»‘ng quản lÃ½ an toàn vá»‡ sinh lao Ä‘á»™ng theo tiêu chuẩn ISO 45001. Tá»• chức Ä‘ào tạo ATVSLĐ, Ä‘iều tra sự cá»‘, và Ä‘ánh giá rủi ro tại nhà máy.",
        requirements: "- ĐH ngành Môi trường, An toàn lao Ä‘á»™ng\n- 2+ nÄƒm kinh nghiá»‡m HSE trong sản xuất\n- Chứng chá»‰ HSE Officer\n- Tiếng Anh giao tiếp",
        salaryMin: 15, salaryMax: 25, salaryDisplay: "15 - 25 triá»‡u", industry: "An toàn lao Ä‘á»™ng", position: "Chuyên viên", location: "Đá»“ng Nai", workType: "Full-time", quantity: 1, skills: "HSE, ISO 45001, Đánh giá rủi ro, PCCC", status: "APPROVED", publishedAt: pub(6), expiresAt: exp(24), viewCount: 89, applyCount: 4
      },

      // Nestlé (2 jobs)
      {
        title: "Brand Manager - NESCAFÃ‰", slug: "brand-manager-nescafe-nestle", employerId: nestle.id,
        description: "Quản lÃ½ thương hiá»‡u NESCAFÃ‰ tại thá»‹ trường Viá»‡t Nam. Xây dựng chiến lược marketing, phát triá»ƒn sản phẩm má»›i, phân tích thá»‹ trường và Ä‘á»‘i thủ cạnh tranh.",
        requirements: "- ĐH/ThS Marketing, QTKD\n- 5+ nÄƒm FMCG marketing, 2+ nÄƒm quản lÃ½ thương hiá»‡u\n- Kinh nghiá»‡m quản lÃ½ P&L thương hiá»‡u\n- Tiếng Anh thành thạo (C1+)",
        benefits: "- Lương net + bonus 2-4 tháng\n- Flexible working (3 ngày WFH/tuần)\n- Bảo hiá»ƒm sức khỏe AIA cao cấp\n- Sản phẩm Nestlé miá»…n phí hàng tháng",
        salaryMin: 40, salaryMax: 60, salaryDisplay: "40 - 60 triá»‡u", industry: "Marketing", position: "Manager", location: "TP. Há»“ Chí Minh", workType: "Hybrid", quantity: 1, skills: "Brand Management, FMCG, P&L, Digital Marketing", status: "APPROVED", publishedAt: pub(3), expiresAt: exp(30), isFeatured: true, viewCount: 734, applyCount: 21
      },

      {
        title: "Kỹ sư Quản lÃ½ chất lượng nhà máy", slug: "qc-factory-nestle", employerId: nestle.id,
        description: "Đảm bảo chất lượng sản phẩm thực phẩm theo tiêu chuẩn Nestlé Global và FSSC 22000. Kiá»ƒm soát nguyên liá»‡u Ä‘ầu vào, quy trình sản xuất, và thành phẩm.",
        requirements: "- ĐH Công nghá»‡ Thực phẩm, Hóa học\n- 2+ nÄƒm QC trong nhà máy thực phẩm\n- Hiá»ƒu biết HACCP, GMP, FSSC 22000\n- Tiếng Anh giao tiếp (báo cáo bằng tiếng Anh)",
        salaryMin: 15, salaryMax: 25, salaryDisplay: "15 - 25 triá»‡u", industry: "Sản xuất", position: "Kỹ sư", location: "Đá»“ng Nai", workType: "Full-time", quantity: 2, skills: "QC, HACCP, GMP, FSSC 22000, Thực phẩm", status: "APPROVED", publishedAt: pub(7), expiresAt: exp(23), viewCount: 112, applyCount: 6
      },

      // Intel (2 jobs)
      {
        title: "Kỹ sư Test bán dáº«n (Semiconductor Test Engineer)", slug: "test-engineer-intel", employerId: intel.id,
        description: "Phát triá»ƒn và tá»‘i ưu chương trình test cho chip bán dáº«n Intel thế há»‡ má»›i. Phân tích dữ liá»‡u yield, debug lá»—i silicon, và cải tiến hiá»‡u suất test.",
        requirements: "- ĐH/ThS Điá»‡n tử, Vi Ä‘iá»‡n tử, Vật lÃ½ bán dáº«n\n- 2+ nÄƒm kinh nghiá»‡m semiconductor test\n- Thành thạo Python, MATLAB\n- Hiá»ƒu biết về ATE (Automated Test Equipment)\n- Tiếng Anh thành thạo",
        benefits: "- Lương thuá»™c top 5% thá»‹ trường IT\n- RSU (Restricted Stock Units) Intel\n- Flex time & WFH 2 ngày/tuần\n- Đào tạo tại Intel campuses (US, Malaysia)\n- Bảo hiá»ƒm quá»‘c tế cho cả gia Ä‘ình",
        salaryMin: 30, salaryMax: 55, salaryDisplay: "30 - 55 triá»‡u", industry: "Bán dáº«n - Công nghá»‡ cao", position: "Kỹ sư", location: "TP. Há»“ Chí Minh", workType: "Hybrid", quantity: 4, skills: "Semiconductor, ATE, Python, MATLAB, Debug", status: "APPROVED", publishedAt: pub(2), expiresAt: exp(50), isFeatured: true, viewCount: 456, applyCount: 16
      },

      {
        title: "Kỹ sư DevOps / SRE", slug: "devops-sre-intel", employerId: intel.id,
        description: "Xây dựng và vận hành hạ tầng CI/CD cho há»‡ thá»‘ng test tự Ä‘á»™ng hóa. Quản lÃ½ Kubernetes clusters, monitoring, và tự Ä‘á»™ng hóa quy trình phát triá»ƒn phần mềm.",
        requirements: "- ĐH CNTT, Khoa học máy tính\n- 3+ nÄƒm kinh nghiá»‡m DevOps/SRE\n- Thành thạo Kubernetes, Terraform, Ansible\n- Kinh nghiá»‡m AWS hoặc Azure\n- Tiếng Anh thành thạo",
        salaryMin: 35, salaryMax: 60, salaryDisplay: "35 - 60 triá»‡u", industry: "IT - Phần mềm", position: "Kỹ sư", location: "TP. Há»“ Chí Minh", workType: "Hybrid", quantity: 2, skills: "DevOps, Kubernetes, Terraform, AWS, CI/CD", status: "APPROVED", publishedAt: pub(3), expiresAt: exp(35), viewCount: 345, applyCount: 12
      },

      // Panasonic (2 jobs)
      {
        title: "Kỹ sư R&D Điá»‡n tử", slug: "r-and-d-panasonic", employerId: panasonic.id,
        description: "Nghiên cứu và phát triá»ƒn sản phẩm Ä‘iá»‡n tử gia dụng má»›i. Thiết kế mạch PCB, phát triá»ƒn firmware, và kiá»ƒm thử sản phẩm theo tiêu chuẩn Panasonic.",
        requirements: "- ĐH/ThS Điá»‡n tử, Viá»…n thông\n- 2+ nÄƒm R&D trong ngành Ä‘iá»‡n tử\n- Thành thạo Altium Designer, OrCAD\n- Lập trình C cho MCU (STM32, Arduino)\n- Tiếng Nhật N3 hoặc tiếng Anh TOEIC 600+",
        benefits: "- Thưá»Ÿng sáng chế, bằng sáng kiến\n- Đào tạo tại Nhật Bản 3-6 tháng\n- Bảo hiá»ƒm sức khỏe + life insurance",
        salaryMin: 18, salaryMax: 30, salaryDisplay: "18 - 30 triá»‡u", industry: "Sản xuất", position: "Kỹ sư", location: "Hưng Yên", workType: "Full-time", quantity: 2, skills: "PCB Design, Firmware, C/C++, Altium", status: "APPROVED", publishedAt: pub(4), expiresAt: exp(28), viewCount: 156, applyCount: 8
      },

      {
        title: "Nhân viên Xuất nhập khẩu", slug: "xnk-panasonic", employerId: panasonic.id,
        description: "Thực hiá»‡n thủ tục hải quan, xuất nhập khẩu linh kiá»‡n và thành phẩm. Quản lÃ½ chứng từ thương mại quá»‘c tế, phá»‘i hợp vá»›i forwarder và hải quan.",
        requirements: "- ĐH Ngoại thương, Kinh tế quá»‘c tế\n- 1+ nÄƒm kinh nghiá»‡m XNK\n- Hiá»ƒu biết thủ tục hải quan Ä‘iá»‡n tử\n- Tiếng Nhật hoặc tiếng Anh",
        salaryMin: 10, salaryMax: 16, salaryDisplay: "10 - 16 triá»‡u", industry: "Logistics", position: "Nhân viên", location: "Hưng Yên", workType: "Full-time", quantity: 1, skills: "XNK, Hải quan, Logistics, Tiếng Nhật", status: "APPROVED", publishedAt: pub(9), expiresAt: exp(21), viewCount: 78, applyCount: 3
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
      industry: "IT / Phần mềm", yearsOfExp: 5, location: "TP.HCM",
      expectedSalary: 45, currentSalary: 35,
      level: "SENIOR" as CandidateSeniority, skills: ["React", "Next.js", "TypeScript", "GraphQL", "TailwindCSS"],
      status: "AVAILABLE" as CandidateStatus, source: "LINKEDIN" as CandidateSource, createdById,

    },
    {
      fullName: "Trần Thá»‹ Hương", phone: "0912345678", email: "huong.tran@outlook.com",
      currentPosition: "HR Business Partner", currentCompany: "Samsung Vietnam",
      industry: "Nhân sự", yearsOfExp: 8, location: "Hà Ná»™i",
      expectedSalary: 55, currentSalary: 48,
      level: "MANAGER", skills: ["HR Business Partner", "Talent Acquisition", "C&B", "HRIS", "Luật Lao Đá»™ng"],
      status: "EMPLOYED", source: "REFERRAL", createdById,
    },
    {
      fullName: "Lê VÄƒn Đức", phone: "0987654321", email: "duc.le@gmail.com",
      currentPosition: "Java Backend Developer", currentCompany: "VNG Corporation",
      industry: "IT / Phần mềm", yearsOfExp: 3, location: "TP.HCM",
      expectedSalary: 30, currentSalary: 22,
      level: "MID_LEVEL" as CandidateSeniority, skills: ["Java", "Spring Boot", "Microservices", "Docker", "PostgreSQL"],
      status: "AVAILABLE" as CandidateStatus, source: "TOPCV" as CandidateSource, createdById,

    },
    {
      fullName: "Phạm Thá»‹ Lan Anh", phone: "0963123456", email: "lananh.pham@gmail.com",
      currentPosition: "Marketing Manager", currentCompany: "Nestlé Vietnam",
      industry: "Marketing / Truyền thông", yearsOfExp: 10, location: "TP.HCM",
      expectedSalary: 70, currentSalary: 65,
      level: "MANAGER" as CandidateSeniority, skills: ["Brand Management", "Digital Marketing", "P&L", "FMCG", "Content Strategy"],
      status: "INTERVIEWING" as CandidateStatus, source: "LINKEDIN" as CandidateSource, createdById,

    },
    {
      fullName: "Võ Quá»‘c Hùng", phone: "0978456123", email: "hung.vo@gmail.com",
      currentPosition: "Supply Chain Lead", currentCompany: "Toyota Vietnam",
      industry: "Kỹ thuật / Sản xuất", yearsOfExp: 7, location: "Hà Ná»™i",
      expectedSalary: 50, currentSalary: 42,
      level: "LEAD" as CandidateSeniority, skills: ["Supply Chain", "SAP MM", "Logistics", "Kaizen", "Lean"],
      status: "AVAILABLE" as CandidateStatus, source: "REFERRAL" as CandidateSource, createdById,

    },
    {
      fullName: "Đá»— Thanh Tùng", phone: "0934789012", email: "tung.do@gmail.com",
      currentPosition: "Junior Accountant", currentCompany: "Deloitte Vietnam",
      industry: "Tài chính / Ngân hàng", yearsOfExp: 1, location: "TP.HCM",
      expectedSalary: 15, currentSalary: 12,
      level: "JUNIOR" as CandidateSeniority, skills: ["Kế toán", "Excel", "SAP", "Thuế GTGT"],
      status: "AVAILABLE" as CandidateStatus, source: "TOPCV" as CandidateSource, createdById,

    },
    {
      fullName: "Nguyá»…n Thá»‹ Bích Ngọc", phone: "0945123789", email: "bicngoc.nguyen@gmail.com",
      currentPosition: "DevOps Engineer", currentCompany: "Intel Vietnam",
      industry: "IT / Phần mềm", yearsOfExp: 4, location: "TP.HCM",
      expectedSalary: 50, currentSalary: 40,
      level: "MID_LEVEL" as CandidateSeniority, skills: ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Python"],
      status: "AVAILABLE" as CandidateStatus, source: "LINKEDIN" as CandidateSource, createdById,

    },
    {
      fullName: "Bùi VÄƒn Thắng", phone: "0921456789", email: "thang.bui@gmail.com",
      currentPosition: "Intern Software Engineer", currentCompany: "Bosch Vietnam",
      industry: "IT / Phần mềm", yearsOfExp: 0, location: "TP.HCM",
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
        { language: "Tiếng Anh", level: "IELTS 7.5", certificate: "IELTS Academic" },
      ],
      workHistory: [
        { companyName: "FPT Software", position: "Senior Frontend Developer", startDate: new Date("2022-05-01"), isCurrent: true, notes: "Lead frontend cho dự án enterprise dùng Next.js và TypeScript." },
        { companyName: "TMA Solutions", position: "Frontend Developer", startDate: new Date("2020-01-01"), endDate: new Date("2022-04-30"), notes: "Phát triá»ƒn React dashboard cho khách hàng US." },
      ],
    },
    "huong.tran@outlook.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=huong-primary`, fileName: "Tran-Thi-Huong-CV.pdf", label: "CV HRBP", isPrimary: true },
      ],
      languages: [
        { language: "Tiếng Anh", level: "TOEIC 850", certificate: "TOEIC" },
        { language: "Tiếng Hàn", level: "TOPIK 4", certificate: "TOPIK" },
      ],
      workHistory: [
        { companyName: "Samsung Vietnam", position: "HR Business Partner", startDate: new Date("2021-06-01"), isCurrent: true, notes: "Phụ trách HRBP cho khá»‘i sản xuất và vận hành." },
        { companyName: "Unilever Vietnam", position: "Talent Acquisition Specialist", startDate: new Date("2018-03-01"), endDate: new Date("2021-05-31"), notes: "Tuyá»ƒn mass và tuyá»ƒn middle management." },
      ],
    },
    "duc.le@gmail.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=duc-primary`, fileName: "Le-Van-Duc-CV.pdf", label: "CV backend", isPrimary: true },
      ],
      languages: [
        { language: "Tiếng Anh", level: "TOEIC 780", certificate: "TOEIC" },
      ],
      workHistory: [
        { companyName: "VNG Corporation", position: "Java Backend Developer", startDate: new Date("2023-01-01"), isCurrent: true, notes: "Phát triá»ƒn microservices và API cho há»‡ thá»‘ng payment." },
        { companyName: "KMS Technology", position: "Software Engineer Intern", startDate: new Date("2022-05-01"), endDate: new Date("2022-12-31"), notes: "Tham gia Ä‘á»™i platform và automation test." },
      ],
    },
    "lananh.pham@gmail.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=lananh-primary`, fileName: "Pham-Thi-Lan-Anh-CV.pdf", label: "CV marketing", isPrimary: true },
        { fileUrl: `${demoCvBaseUrl}?candidate=lananh-en`, fileName: "Pham-Thi-Lan-Anh-CV-English.pdf", label: "CV English" },
      ],
      languages: [
        { language: "Tiếng Anh", level: "IELTS 7.0", certificate: "IELTS Academic" },
      ],
      workHistory: [
        { companyName: "Nestle Vietnam", position: "Marketing Manager", startDate: new Date("2020-08-01"), isCurrent: true, notes: "Quản lÃ½ brand FMCG và ngân sách truyền thông." },
        { companyName: "Coca-Cola Vietnam", position: "Brand Executive", startDate: new Date("2016-06-01"), endDate: new Date("2020-07-31"), notes: "Phụ trách activation và digital campaign." },
      ],
    },
    "hung.vo@gmail.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=hung-primary`, fileName: "Vo-Quoc-Hung-CV.pdf", label: "CV supply chain", isPrimary: true },
      ],
      languages: [
        { language: "Tiếng Anh", level: "TOEIC 700", certificate: "TOEIC" },
        { language: "Tiếng Nhật", level: "JLPT N3", certificate: "JLPT" },
      ],
      workHistory: [
        { companyName: "Toyota Vietnam", position: "Supply Chain Lead", startDate: new Date("2021-01-01"), isCurrent: true, notes: "Quản lÃ½ inbound logistics và vendor coordination." },
        { companyName: "Yazaki Vietnam", position: "Supply Chain Supervisor", startDate: new Date("2018-02-01"), endDate: new Date("2020-12-31"), notes: "Lập kế hoạch nguyên vật liá»‡u và tá»‘i ưu tá»“n kho." },
      ],
    },
    "tung.do@gmail.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=tung-primary`, fileName: "Do-Thanh-Tung-CV.pdf", label: "CV accountant", isPrimary: true },
      ],
      languages: [
        { language: "Tiếng Anh", level: "TOEIC 600", certificate: "TOEIC" },
      ],
      workHistory: [
        { companyName: "Deloitte Vietnam", position: "Junior Accountant", startDate: new Date("2025-01-01"), isCurrent: true, notes: "Há»— trợ báo cáo tài chính và Ä‘á»‘i soát chứng từ." },
      ],
    },
    "bicngoc.nguyen@gmail.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=ngoc-primary`, fileName: "Nguyen-Thi-Bich-Ngoc-CV.pdf", label: "CV DevOps", isPrimary: true },
        { fileUrl: `${demoCvBaseUrl}?candidate=ngoc-en`, fileName: "Nguyen-Thi-Bich-Ngoc-CV-English.pdf", label: "CV English" },
      ],
      languages: [
        { language: "Tiếng Anh", level: "IELTS 7.0", certificate: "IELTS Academic" },
      ],
      workHistory: [
        { companyName: "Intel Vietnam", position: "DevOps Engineer", startDate: new Date("2022-09-01"), isCurrent: true, notes: "Phụ trách Kubernetes, CI/CD và cloud automation." },
        { companyName: "NashTech", position: "Cloud Engineer", startDate: new Date("2020-06-01"), endDate: new Date("2022-08-31"), notes: "Triá»ƒn khai hạ tầng AWS và observability." },
      ],
    },
    "thang.bui@gmail.com": {
      cvs: [
        { fileUrl: `${demoCvBaseUrl}?candidate=thang-primary`, fileName: "Bui-Van-Thang-CV.pdf", label: "CV intern", isPrimary: true },
      ],
      languages: [
        { language: "Tiếng Anh", level: "TOEIC 550", certificate: "TOEIC" },
      ],
      workHistory: [
        { companyName: "Bosch Vietnam", position: "Intern Software Engineer", startDate: new Date("2025-06-01"), isCurrent: true, notes: "Há»— trợ team backend và automation script." },
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

  console.log(`✅ Seeded ${cvSeedCount} CVs, ${languageSeedCount} languages, ${workSeedCount} work experiences`);

  // ==================== DEMO APPLICATIONS ====================
  console.log("\n📝 Seeding demo Applications...");
  const firstJob = await prisma.jobPosting.findFirst({ where: { status: "APPROVED" }, orderBy: { publishedAt: "desc" } });
  if (firstJob) {
    await prisma.application.createMany({
      data: [
        { jobPostingId: firstJob.id, fullName: "Nguyễn Văn Hùng", email: "hung.nguyen@gmail.com", phone: "0912345678", coverLetter: "Tôi rất mong muốn được làm việc tại Samsung. Với 3 năm kinh nghiệm trong sản xuất...", status: "NEW" },
        { jobPostingId: firstJob.id, fullName: "Trần Thị Mai", email: "mai.tran@hotmail.com", phone: "0987654321", coverLetter: "Kính gửi phòng Nhân sự, tôi xin ứng tuyển vào vị trí này...", status: "REVIEWED" },
      ]
    });
    console.log("✅ Created 2 demo applications");
  }

  console.log("\n🎉 Seeding finished!");
  console.log("═══════════════════════════════════════");
  console.log("CRM Login:      admin@headhunt.com / headhunt123");
  console.log("Employer Login:  hr@samsung-vn.com / employer123");
  console.log("═══════════════════════════════════════");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
