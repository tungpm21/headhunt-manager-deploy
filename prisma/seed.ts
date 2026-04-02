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
    { name: "Nguyễn Thị Lan", email: "lan.nguyen@headhunt.com", password: pw, role: "MEMBER" as const },
    { name: "Trần Văn Minh", email: "minh.tran@headhunt.com", password: pw, role: "MEMBER" as const },
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
        logo: "/logos/samsung.png", industry: "Sản xuất - Điện tử", companySize: "ENTERPRISE",
        address: "KCN Yên Phong, Bắc Ninh", website: "https://samsung.com/vn", phone: "0222 3710 000",
        status: "ACTIVE", slug: "samsung-electronics-vietnam",
        description: "Samsung Electronics Vietnam (SEV) là tổ hợp nhà máy sản xuất smartphone và linh kiện điện tử lớn nhất thế giới của Samsung. Được thành lập năm 2009, SEV đã trở thành một trong những doanh nghiệp FDI lớn nhất Việt Nam với hơn 100.000 nhân viên. SEV liên tục mở rộng quy mô và đầu tư vào công nghệ cao, đóng góp quan trọng vào kim ngạch xuất khẩu của Việt Nam.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@canon-vn.com", password: epw, companyName: "Canon Vietnam",
        logo: "/logos/canon.png", industry: "Sản xuất - Thiết bị văn phòng", companySize: "LARGE",
        address: "KCN Quế Võ, Bắc Ninh", website: "https://canon.com.vn", phone: "0222 3636 636",
        status: "ACTIVE", slug: "canon-vietnam",
        description: "Canon Vietnam Co., Ltd là công ty 100% vốn Nhật Bản thuộc tập đoàn Canon Inc., chuyên sản xuất máy in laser, cartridge và linh kiện quang học. Với hơn 20 năm hoạt động tại Việt Nam, Canon đã xây dựng môi trường làm việc chuẩn Nhật Bản với văn hóa Kaizen và phát triển nhân sự bền vững.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@toyota-vn.com", password: epw, companyName: "Toyota Motor Vietnam",
        logo: "/logos/toyota.png", industry: "Ô tô - Vận tải", companySize: "ENTERPRISE",
        address: "KCN Phúc Thắng, Vĩnh Phúc", website: "https://toyota.com.vn", phone: "0211 3862 100",
        status: "ACTIVE", slug: "toyota-motor-vietnam",
        description: "Toyota Motor Vietnam (TMV) là liên doanh sản xuất và phân phối ô tô hàng đầu Việt Nam. TMV vận hành nhà máy lắp ráp tại Vĩnh Phúc với dây chuyền sản xuất hiện đại theo tiêu chuẩn Toyota Production System (TPS). Công ty cam kết phát triển bền vững và đào tạo nguồn nhân lực chất lượng cao.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@lg-vn.com", password: epw, companyName: "LG Electronics Vietnam",
        logo: "/logos/lg.png", industry: "Sản xuất - Điện tử", companySize: "ENTERPRISE",
        address: "KCN Tràng Duệ, Hải Phòng", website: "https://lg.com/vn", phone: "0225 3552 000",
        status: "ACTIVE", slug: "lg-electronics-vietnam",
        description: "LG Electronics Vietnam vận hành tổ hợp nhà máy sản xuất TV, màn hình và thiết bị gia dụng tại Hải Phòng. Với đầu tư hơn 5 tỷ USD, LG là một trong những nhà đầu tư FDI lớn nhất miền Bắc. Công ty nổi tiếng với chế độ đãi ngộ tốt và cơ hội thăng tiến cho nhân viên trẻ.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@bosch-vn.com", password: epw, companyName: "Bosch Vietnam",
        logo: "/logos/bosch.png", industry: "Công nghệ - Kỹ thuật", companySize: "LARGE",
        address: "Tầng 12, Tòa nhà Mapletree, Quận 7, TP.HCM", website: "https://bosch.com.vn", phone: "028 6258 3100",
        status: "ACTIVE", slug: "bosch-vietnam",
        description: "Bosch Vietnam là công ty công nghệ và kỹ thuật hàng đầu thế giới đến từ Đức. Tại Việt Nam, Bosch hoạt động trong các lĩnh vực giải pháp di chuyển, công nghệ công nghiệp, hàng tiêu dùng và năng lượng. Bosch nổi tiếng với môi trường làm việc quốc tế, chế độ đãi ngộ hấp dẫn và cơ hội phát triển sự nghiệp toàn cầu.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@panasonic-vn.com", password: epw, companyName: "Panasonic Vietnam",
        logo: "/logos/panasonic.png", industry: "Sản xuất - Điện tử gia dụng", companySize: "LARGE",
        address: "KCN Thăng Long II, Hưng Yên", website: "https://panasonic.com/vn", phone: "0221 3981 234",
        status: "ACTIVE", slug: "panasonic-vietnam",
        description: "Panasonic Vietnam thuộc tập đoàn Panasonic Nhật Bản, chuyên sản xuất và phân phối thiết bị điện tử, điện lạnh. Với hơn 7.000 nhân viên, Panasonic cam kết mang đến môi trường làm việc an toàn, phúc lợi tốt và cơ hội phát triển nghề nghiệp lâu dài.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@nestle-vn.com", password: epw, companyName: "Nestlé Vietnam",
        logo: "/logos/nestle.png", industry: "FMCG - Thực phẩm", companySize: "LARGE",
        address: "Tầng 8, Empress Tower, Quận 1, TP.HCM", website: "https://nestle.com.vn", phone: "028 3821 1000",
        status: "ACTIVE", slug: "nestle-vietnam",
        description: "Nestlé Vietnam là chi nhánh của tập đoàn thực phẩm lớn nhất thế giới Nestlé S.A. (Thụy Sĩ). Với hơn 2.300 nhân viên và 4 nhà máy trên cả nước, Nestlé sản xuất các thương hiệu nổi tiếng như NESCAFÉ, MILO, MAGGI, KitKat. Môi trường làm việc đa dạng, sáng tạo và tập trung phát triển con người.",
      }
    }),
    prisma.employer.create({
      data: {
        email: "hr@intel-vn.com", password: epw, companyName: "Intel Products Vietnam",
        logo: "/logos/intel.png", industry: "Bán dẫn - Công nghệ cao", companySize: "ENTERPRISE",
        address: "Lô I2, D1, Khu Công nghệ cao, Quận 9, TP.HCM", website: "https://intel.com", phone: "028 3636 9000",
        status: "ACTIVE", slug: "intel-products-vietnam",
        description: "Intel Products Vietnam (IPV) là nhà máy kiểm định và đóng gói chip bán dẫn lớn nhất của Intel trên toàn cầu. Đầu tư hơn 1.5 tỷ USD, IPV là một trong những doanh nghiệp FDI công nghệ cao hàng đầu tại Việt Nam. Công ty tạo cơ hội cho kỹ sư Việt Nam tham gia vào chuỗi giá trị bán dẫn toàn cầu.",
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
        description: "Giám sát và tối ưu hóa quy trình sản xuất smartphone tại nhà máy Samsung Bắc Ninh. Phân tích dữ liệu sản xuất, đề xuất cải tiến năng suất và chất lượng. Phối hợp với đội ngũ kỹ sư Hàn Quốc để triển khai công nghệ mới.",
        requirements: "- Tốt nghiệp ĐH ngành Cơ khí, Điện tử, Cơ điện tử hoặc tương đương\n- Ít nhất 2 năm kinh nghiệm trong môi trường sản xuất\n- Thành thạo MS Office, AutoCAD\n- Tiếng Hàn TOPIK 3 hoặc tiếng Anh TOEIC 600+\n- Sẵn sàng làm ca theo lịch nhà máy",
        benefits: "- Lương cạnh tranh top thị trường + thưởng quý\n- Xe đưa đón Hà Nội - Bắc Ninh\n- Bảo hiểm sức khỏe PVI cao cấp cho nhân viên + gia đình\n- Cơ hội đào tạo ngắn hạn tại Hàn Quốc\n- Phụ cấp ăn trưa, đồng phục, thiết bị bảo hộ",
        salaryMin: 18, salaryMax: 30, salaryDisplay: "18 - 30 triệu", industry: "Sản xuất", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 5, skills: "Sản xuất, QC, Lean, 5S, AutoCAD, Tiếng Hàn", status: "APPROVED", publishedAt: pub(3), expiresAt: exp(40), viewCount: 234, applyCount: 12
      },

      {
        title: "Trưởng phòng Nhân sự (HR Manager)", slug: "truong-phong-nhan-su-samsung", employerId: samsung.id,
        description: "Quản lý toàn bộ hoạt động nhân sự tại nhà máy SEV bao gồm tuyển dụng quy mô lớn (200+ người/tháng), đào tạo onboarding, quản lý C&B cho 5.000+ nhân viên, và duy trì quan hệ lao động ổn định.",
        requirements: "- Tốt nghiệp ĐH trở lên ngành Quản trị nhân lực, Luật, QTKD\n- 5+ năm kinh nghiệm HR, trong đó 2+ năm ở vị trí quản lý\n- Kinh nghiệm trong nhà máy sản xuất FDI là bắt buộc\n- Nắm vững Luật lao động, BHXH, BHYT\n- Tiếng Anh hoặc tiếng Hàn giao tiếp tốt",
        benefits: "- Lương thỏa thuận (cạnh tranh nhất thị trường)\n- Thưởng KPI quý + thưởng cuối năm 2-4 tháng lương\n- Bảo hiểm cao cấp cho cả gia đình\n- Xe công ty, điện thoại, laptop\n- Ngày phép: 15 ngày/năm",
        salaryMin: 35, salaryMax: 55, salaryDisplay: "35 - 55 triệu", industry: "Nhân sự", position: "Trưởng phòng", location: "Bắc Ninh", workType: "Full-time", quantity: 1, skills: "HR, Tuyển dụng, C&B, Luật lao động, Tiếng Hàn", status: "APPROVED", publishedAt: pub(1), expiresAt: exp(45), isFeatured: true, viewCount: 567, applyCount: 23
      },

      {
        title: "Kỹ sư QA/QC (Quality Engineer)", slug: "ky-su-qa-qc-samsung", employerId: samsung.id,
        description: "Kiểm tra chất lượng sản phẩm smartphone theo tiêu chuẩn Samsung Global. Phân tích lỗi sản phẩm, xây dựng báo cáo chất lượng hàng tuần. Tham gia audit ISO 9001, ISO 14001.",
        requirements: "- ĐH ngành Kỹ thuật, Điện tử, Vật lý\n- 1+ năm kinh nghiệm QC trong sản xuất điện tử\n- Sử dụng thành thạo công cụ đo lường (caliper, micrometer)\n- Hiểu biết về SPC, FMEA, 8D Report",
        benefits: "- Lương tháng 13, 14 + thưởng quý\n- Xe đưa đón\n- Cơm trưa miễn phí\n- Bảo hiểm PVI",
        salaryMin: 12, salaryMax: 20, salaryDisplay: "12 - 20 triệu", industry: "Sản xuất", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 8, skills: "QA, QC, ISO, SPC, FMEA", status: "APPROVED", publishedAt: pub(5), expiresAt: exp(35), viewCount: 189, applyCount: 31
      },

      {
        title: "Nhân viên IT Support", slug: "it-support-samsung", employerId: samsung.id,
        description: "Hỗ trợ kỹ thuật IT cho hơn 5.000 user tại nhà máy. Quản lý hệ thống mạng LAN, WiFi, server. Triển khai và bảo trì các hệ thống MES, ERP (SAP).",
        requirements: "- ĐH CNTT, Mạng máy tính\n- 1-3 năm kinh nghiệm IT helpdesk\n- CCNA hoặc tương đương\n- Tiếng Anh đọc hiểu tài liệu kỹ thuật",
        salaryMin: 12, salaryMax: 18, salaryDisplay: "12 - 18 triệu", industry: "IT - Phần mềm", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 2, skills: "IT Support, CCNA, SAP, Windows Server", status: "APPROVED", publishedAt: pub(2), expiresAt: exp(30), viewCount: 145, applyCount: 8
      },

      {
        title: "Phiên dịch tiếng Hàn (Korean Interpreter)", slug: "phien-dich-tieng-han-samsung", employerId: samsung.id,
        description: "Phiên dịch các cuộc họp cấp quản lý, đào tạo kỹ thuật, và giao tiếp hàng ngày giữa chuyên gia Hàn Quốc và nhân viên Việt Nam. Dịch tài liệu kỹ thuật sản xuất.",
        requirements: "- TOPIK 5 trở lên\n- Ưu tiên có kinh nghiệm phiên dịch trong nhà máy\n- Kỹ năng giao tiếp tốt, nhanh nhẹn",
        salaryMin: 15, salaryMax: 25, salaryDisplay: "15 - 25 triệu", industry: "Phiên dịch", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 3, skills: "Tiếng Hàn, Phiên dịch, TOPIK 5", status: "APPROVED", publishedAt: pub(4), expiresAt: exp(25), viewCount: 312, applyCount: 18
      },

      // Canon (3 jobs)
      {
        title: "Nhân viên Kế toán tổng hợp", slug: "ke-toan-tong-hop-canon", employerId: canon.id,
        description: "Thực hiện nghiệp vụ kế toán tổng hợp, lập báo cáo tài chính theo chuẩn IFRS và VAS. Quản lý thuế GTGT, TNDN. Phối hợp với kiểm toán nội bộ và kiểm toán độc lập.",
        requirements: "- ĐH Kế toán, Tài chính\n- 2+ năm kinh nghiệm kế toán tổng hợp\n- Thành thạo SAP FI/CO\n- Tiếng Nhật N3 hoặc tiếng Anh TOEIC 550+",
        benefits: "- Lương tháng 13, 14, 15\n- Xe đưa đón Hà Nội - Bắc Ninh\n- Ăn trưa miễn phí (buffet)\n- Du lịch công ty hàng năm",
        salaryMin: 15, salaryMax: 22, salaryDisplay: "15 - 22 triệu", industry: "Kế toán - Tài chính", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 2, skills: "Kế toán, SAP, IFRS, Tiếng Nhật", status: "APPROVED", publishedAt: pub(8), expiresAt: exp(22), viewCount: 167, applyCount: 14
      },

      {
        title: "Phiên dịch tiếng Nhật", slug: "phien-dich-tieng-nhat-canon", employerId: canon.id,
        description: "Phiên dịch trong cuộc họp, training, và giao tiếp giữa ban lãnh đạo Nhật Bản và nhân viên Việt Nam. Hỗ trợ dịch tài liệu kỹ thuật, hợp đồng, quy trình ISO.",
        requirements: "- Tiếng Nhật N2 trở lên (N1 ưu tiên)\n- Ưu tiên kinh nghiệm trong FDI Nhật\n- Kỹ năng viết và nói tốt cả tiếng Việt lẫn tiếng Nhật",
        salaryMin: 18, salaryMax: 28, salaryDisplay: "18 - 28 triệu", industry: "Phiên dịch", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 1, skills: "Tiếng Nhật N2, Phiên dịch, FDI", status: "APPROVED", publishedAt: pub(6), expiresAt: exp(24), viewCount: 201, applyCount: 9
      },

      {
        title: "Kỹ sư bảo trì (Maintenance Engineer)", slug: "ky-su-bao-tri-canon", employerId: canon.id,
        description: "Bảo trì, sửa chữa hệ thống máy in laser và dây chuyền sản xuất. Lập kế hoạch bảo trì phòng ngừa (PM). Quản lý phụ tùng và thiết bị dự phòng.",
        requirements: "- ĐH ngành Cơ khí, Điện, Cơ điện tử\n- 2+ năm kinh nghiệm bảo trì trong nhà máy\n- Đọc hiểu bản vẽ kỹ thuật\n- Tiếng Nhật hoặc tiếng Anh giao tiếp",
        salaryMin: 14, salaryMax: 22, salaryDisplay: "14 - 22 triệu", industry: "Sản xuất", position: "Nhân viên", location: "Bắc Ninh", workType: "Full-time", quantity: 3, skills: "Bảo trì, PLC, Cơ khí, Điện", status: "APPROVED", publishedAt: pub(3), expiresAt: exp(27), viewCount: 98, applyCount: 5
      },

      // Toyota (3 jobs)
      {
        title: "Kỹ sư ô tô (Automotive Engineer)", slug: "ky-su-o-to-toyota", employerId: toyota.id,
        description: "Tham gia thiết kế và cải tiến quy trình lắp ráp ô tô theo Toyota Production System (TPS). Phân tích và giải quyết vấn đề chất lượng trên dây chuyền sản xuất.",
        requirements: "- ĐH ngành Cơ khí Ô tô, Cơ khí chế tạo máy\n- 2+ năm kinh nghiệm trong ngành ô tô\n- Hiểu biết về TPS, Kaizen, Just-in-Time\n- Tiếng Nhật N3 hoặc tiếng Anh TOEIC 600+",
        benefits: "- Lương 3 tháng thử việc 100%\n- Thưởng Tết 3-5 tháng lương\n- Xe đưa đón Hà Nội - Vĩnh Phúc\n- Đào tạo tại Nhật Bản",
        salaryMin: 20, salaryMax: 35, salaryDisplay: "20 - 35 triệu", industry: "Cơ khí - Ô tô", position: "Nhân viên", location: "Vĩnh Phúc", workType: "Full-time", quantity: 4, skills: "TPS, Kaizen, AutoCAD, SolidWorks, Tiếng Nhật", status: "APPROVED", publishedAt: pub(2), expiresAt: exp(38), isFeatured: true, viewCount: 445, applyCount: 19
      },

      {
        title: "Chuyên viên Marketing & Truyền thông", slug: "marketing-toyota", employerId: toyota.id,
        description: "Lên kế hoạch và triển khai các chiến dịch marketing cho dòng xe Toyota tại Việt Nam. Quản lý nội dung website, social media, và quan hệ báo chí.",
        requirements: "- ĐH Marketing, Truyền thông, Báo chí\n- 3+ năm kinh nghiệm marketing (ngành ô tô ưu tiên)\n- Sáng tạo nội dung, quản lý KOL/KOC\n- Tiếng Anh thành thạo",
        salaryMin: 18, salaryMax: 28, salaryDisplay: "18 - 28 triệu", industry: "Marketing", position: "Chuyên viên", location: "Hà Nội", workType: "Full-time", quantity: 1, skills: "Marketing, Digital Marketing, Content, KOL", status: "APPROVED", publishedAt: pub(1), expiresAt: exp(30), viewCount: 289, applyCount: 15
      },

      {
        title: "Trưởng ca sản xuất (Production Supervisor)", slug: "truong-ca-san-xuat-toyota", employerId: toyota.id,
        description: "Quản lý ca sản xuất lắp ráp ô tô. Đảm bảo tiến độ, chất lượng và an toàn lao động. Huấn luyện công nhân mới, triển khai cải tiến Kaizen.",
        requirements: "- CĐ/ĐH ngành Cơ khí, Quản lý CN\n- 3+ năm kinh nghiệm giám sát sản xuất\n- Kỹ năng quản lý đội nhóm 50+ người",
        salaryMin: 16, salaryMax: 25, salaryDisplay: "16 - 25 triệu", industry: "Sản xuất", position: "Trưởng ca", location: "Vĩnh Phúc", workType: "Full-time", quantity: 2, skills: "Quản lý sản xuất, TPS, Kaizen, 5S", status: "APPROVED", publishedAt: pub(5), expiresAt: exp(25), viewCount: 134, applyCount: 7
      },

      // LG (3 jobs)
      {
        title: "Kỹ sư phần mềm nhúng (Embedded Software Engineer)", slug: "ky-su-embedded-lg", employerId: lg.id,
        description: "Phát triển firmware cho TV và màn hình thông minh. Lập trình C/C++ trên nền tảng Linux embedded. Tối ưu hiệu năng xử lý hình ảnh và âm thanh.",
        requirements: "- ĐH CNTT, Điện tử, Viễn thông\n- 2+ năm kinh nghiệm embedded C/C++\n- Hiểu biết về Linux kernel, device driver\n- Tiếng Anh đọc hiểu tài liệu kỹ thuật",
        benefits: "- Review lương 2 lần/năm\n- Thưởng sáng kiến cải tiến\n- Bảo hiểm sức khỏe Bảo Việt\n- Câu lạc bộ thể thao, gym miễn phí",
        salaryMin: 20, salaryMax: 40, salaryDisplay: "20 - 40 triệu", industry: "IT - Phần mềm", position: "Kỹ sư", location: "Hải Phòng", workType: "Full-time", quantity: 3, skills: "C/C++, Linux, Embedded, IoT", status: "APPROVED", publishedAt: pub(1), expiresAt: exp(40), isFeatured: true, viewCount: 523, applyCount: 27
      },

      {
        title: "Nhân viên Supply Chain", slug: "supply-chain-lg", employerId: lg.id,
        description: "Quản lý chuỗi cung ứng linh kiện cho nhà máy sản xuất TV. Lập kế hoạch nhập khẩu nguyên vật liệu, theo dõi tồn kho, phối hợp với nhà cung cấp quốc tế.",
        requirements: "- ĐH Logistics, Ngoại thương, QTKD\n- 2+ năm kinh nghiệm SCM trong sản xuất\n- Thành thạo SAP MM\n- Tiếng Anh TOEIC 650+",
        salaryMin: 14, salaryMax: 22, salaryDisplay: "14 - 22 triệu", industry: "Logistics", position: "Nhân viên", location: "Hải Phòng", workType: "Full-time", quantity: 2, skills: "SCM, SAP MM, Logistics, Import/Export", status: "APPROVED", publishedAt: pub(4), expiresAt: exp(26), viewCount: 167, applyCount: 11
      },

      {
        title: "Giám đốc nhà máy (Plant Manager)", slug: "giam-doc-nha-may-lg", employerId: lg.id,
        description: "Điều hành toàn bộ hoạt động nhà máy sản xuất màn hình LG tại Hải Phòng. Quản lý 3.000+ nhân viên, đảm bảo KPI sản lượng, chất lượng, chi phí và an toàn.",
        requirements: "- ThS trở lên ngành Kỹ thuật, QTKD\n- 10+ năm kinh nghiệm sản xuất, 5+ năm vị trí quản lý cấp cao\n- Kinh nghiệm trong FDI quy mô lớn\n- Tiếng Anh hoặc tiếng Hàn thành thạo",
        salaryDisplay: "Thỏa thuận (80 - 150 triệu)", industry: "Sản xuất", position: "Giám đốc", location: "Hải Phòng", workType: "Full-time", quantity: 1, skills: "Plant Management, Lean, Six Sigma, P&L", status: "APPROVED", publishedAt: pub(0), expiresAt: exp(60), isFeatured: true, viewCount: 892, applyCount: 5
      },

      // Bosch (2 jobs)
      {
        title: "Kỹ sư phần mềm Java (Java Software Engineer)", slug: "java-engineer-bosch", employerId: bosch.id,
        description: "Phát triển ứng dụng IoT và giải pháp công nghiệp 4.0 bằng Java/Spring Boot. Làm việc theo Agile Scrum trong team quốc tế (Đức, Ấn Độ, Việt Nam).",
        requirements: "- ĐH CNTT, Khoa học máy tính\n- 2+ năm kinh nghiệm Java, Spring Boot\n- Hiểu biết DevOps: Docker, Kubernetes, CI/CD\n- Tiếng Anh giao tiếp tốt (làm việc với team global)",
        benefits: "- Lương tháng 13, 14\n- Flexible working hours\n- 18 ngày phép/năm\n- Đào tạo tại Đức\n- Bảo hiểm sức khỏe quốc tế",
        salaryMin: 25, salaryMax: 45, salaryDisplay: "25 - 45 triệu", industry: "IT - Phần mềm", position: "Kỹ sư", location: "TP. Hồ Chí Minh", workType: "Hybrid", quantity: 5, skills: "Java, Spring Boot, Docker, K8s, Agile", status: "APPROVED", publishedAt: pub(1), expiresAt: exp(45), isFeatured: true, viewCount: 678, applyCount: 34
      },

      {
        title: "Chuyên viên An toàn lao động (HSE Specialist)", slug: "hse-bosch", employerId: bosch.id,
        description: "Triển khai hệ thống quản lý an toàn vệ sinh lao động theo tiêu chuẩn ISO 45001. Tổ chức đào tạo ATVSLĐ, điều tra sự cố, và đánh giá rủi ro tại nhà máy.",
        requirements: "- ĐH ngành Môi trường, An toàn lao động\n- 2+ năm kinh nghiệm HSE trong sản xuất\n- Chứng chỉ HSE Officer\n- Tiếng Anh giao tiếp",
        salaryMin: 15, salaryMax: 25, salaryDisplay: "15 - 25 triệu", industry: "An toàn lao động", position: "Chuyên viên", location: "Đồng Nai", workType: "Full-time", quantity: 1, skills: "HSE, ISO 45001, Đánh giá rủi ro, PCCC", status: "APPROVED", publishedAt: pub(6), expiresAt: exp(24), viewCount: 89, applyCount: 4
      },

      // Nestlé (2 jobs)
      {
        title: "Brand Manager - NESCAFÉ", slug: "brand-manager-nescafe-nestle", employerId: nestle.id,
        description: "Quản lý thương hiệu NESCAFÉ tại thị trường Việt Nam. Xây dựng chiến lược marketing, phát triển sản phẩm mới, phân tích thị trường và đối thủ cạnh tranh.",
        requirements: "- ĐH/ThS Marketing, QTKD\n- 5+ năm FMCG marketing, 2+ năm quản lý thương hiệu\n- Kinh nghiệm quản lý P&L thương hiệu\n- Tiếng Anh thành thạo (C1+)",
        benefits: "- Lương net + bonus 2-4 tháng\n- Flexible working (3 ngày WFH/tuần)\n- Bảo hiểm sức khỏe AIA cao cấp\n- Sản phẩm Nestlé miễn phí hàng tháng",
        salaryMin: 40, salaryMax: 60, salaryDisplay: "40 - 60 triệu", industry: "Marketing", position: "Manager", location: "TP. Hồ Chí Minh", workType: "Hybrid", quantity: 1, skills: "Brand Management, FMCG, P&L, Digital Marketing", status: "APPROVED", publishedAt: pub(3), expiresAt: exp(30), isFeatured: true, viewCount: 734, applyCount: 21
      },

      {
        title: "Kỹ sư Quản lý chất lượng nhà máy", slug: "qc-factory-nestle", employerId: nestle.id,
        description: "Đảm bảo chất lượng sản phẩm thực phẩm theo tiêu chuẩn Nestlé Global và FSSC 22000. Kiểm soát nguyên liệu đầu vào, quy trình sản xuất, và thành phẩm.",
        requirements: "- ĐH Công nghệ Thực phẩm, Hóa học\n- 2+ năm QC trong nhà máy thực phẩm\n- Hiểu biết HACCP, GMP, FSSC 22000\n- Tiếng Anh giao tiếp (báo cáo bằng tiếng Anh)",
        salaryMin: 15, salaryMax: 25, salaryDisplay: "15 - 25 triệu", industry: "Sản xuất", position: "Kỹ sư", location: "Đồng Nai", workType: "Full-time", quantity: 2, skills: "QC, HACCP, GMP, FSSC 22000, Thực phẩm", status: "APPROVED", publishedAt: pub(7), expiresAt: exp(23), viewCount: 112, applyCount: 6
      },

      // Intel (2 jobs)
      {
        title: "Kỹ sư Test bán dẫn (Semiconductor Test Engineer)", slug: "test-engineer-intel", employerId: intel.id,
        description: "Phát triển và tối ưu chương trình test cho chip bán dẫn Intel thế hệ mới. Phân tích dữ liệu yield, debug lỗi silicon, và cải tiến hiệu suất test.",
        requirements: "- ĐH/ThS Điện tử, Vi điện tử, Vật lý bán dẫn\n- 2+ năm kinh nghiệm semiconductor test\n- Thành thạo Python, MATLAB\n- Hiểu biết về ATE (Automated Test Equipment)\n- Tiếng Anh thành thạo",
        benefits: "- Lương thuộc top 5% thị trường IT\n- RSU (Restricted Stock Units) Intel\n- Flex time & WFH 2 ngày/tuần\n- Đào tạo tại Intel campuses (US, Malaysia)\n- Bảo hiểm quốc tế cho cả gia đình",
        salaryMin: 30, salaryMax: 55, salaryDisplay: "30 - 55 triệu", industry: "Bán dẫn - Công nghệ cao", position: "Kỹ sư", location: "TP. Hồ Chí Minh", workType: "Hybrid", quantity: 4, skills: "Semiconductor, ATE, Python, MATLAB, Debug", status: "APPROVED", publishedAt: pub(2), expiresAt: exp(50), isFeatured: true, viewCount: 456, applyCount: 16
      },

      {
        title: "Kỹ sư DevOps / SRE", slug: "devops-sre-intel", employerId: intel.id,
        description: "Xây dựng và vận hành hạ tầng CI/CD cho hệ thống test tự động hóa. Quản lý Kubernetes clusters, monitoring, và tự động hóa quy trình phát triển phần mềm.",
        requirements: "- ĐH CNTT, Khoa học máy tính\n- 3+ năm kinh nghiệm DevOps/SRE\n- Thành thạo Kubernetes, Terraform, Ansible\n- Kinh nghiệm AWS hoặc Azure\n- Tiếng Anh thành thạo",
        salaryMin: 35, salaryMax: 60, salaryDisplay: "35 - 60 triệu", industry: "IT - Phần mềm", position: "Kỹ sư", location: "TP. Hồ Chí Minh", workType: "Hybrid", quantity: 2, skills: "DevOps, Kubernetes, Terraform, AWS, CI/CD", status: "APPROVED", publishedAt: pub(3), expiresAt: exp(35), viewCount: 345, applyCount: 12
      },

      // Panasonic (2 jobs)
      {
        title: "Kỹ sư R&D Điện tử", slug: "r-and-d-panasonic", employerId: panasonic.id,
        description: "Nghiên cứu và phát triển sản phẩm điện tử gia dụng mới. Thiết kế mạch PCB, phát triển firmware, và kiểm thử sản phẩm theo tiêu chuẩn Panasonic.",
        requirements: "- ĐH/ThS Điện tử, Viễn thông\n- 2+ năm R&D trong ngành điện tử\n- Thành thạo Altium Designer, OrCAD\n- Lập trình C cho MCU (STM32, Arduino)\n- Tiếng Nhật N3 hoặc tiếng Anh TOEIC 600+",
        benefits: "- Thưởng sáng chế, bằng sáng kiến\n- Đào tạo tại Nhật Bản 3-6 tháng\n- Bảo hiểm sức khỏe + life insurance",
        salaryMin: 18, salaryMax: 30, salaryDisplay: "18 - 30 triệu", industry: "Sản xuất", position: "Kỹ sư", location: "Hưng Yên", workType: "Full-time", quantity: 2, skills: "PCB Design, Firmware, C/C++, Altium", status: "APPROVED", publishedAt: pub(4), expiresAt: exp(28), viewCount: 156, applyCount: 8
      },

      {
        title: "Nhân viên Xuất nhập khẩu", slug: "xnk-panasonic", employerId: panasonic.id,
        description: "Thực hiện thủ tục hải quan, xuất nhập khẩu linh kiện và thành phẩm. Quản lý chứng từ thương mại quốc tế, phối hợp với forwarder và hải quan.",
        requirements: "- ĐH Ngoại thương, Kinh tế quốc tế\n- 1+ năm kinh nghiệm XNK\n- Hiểu biết thủ tục hải quan điện tử\n- Tiếng Nhật hoặc tiếng Anh",
        salaryMin: 10, salaryMax: 16, salaryDisplay: "10 - 16 triệu", industry: "Logistics", position: "Nhân viên", location: "Hưng Yên", workType: "Full-time", quantity: 1, skills: "XNK, Hải quan, Logistics, Tiếng Nhật", status: "APPROVED", publishedAt: pub(9), expiresAt: exp(21), viewCount: 78, applyCount: 3
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
      fullName: "Nguyễn Minh Khoa", phone: "0901234567", email: "khoa.nguyen@gmail.com",
      currentPosition: "Senior Frontend Developer", currentCompany: "FPT Software",
      industry: "IT / Phần mềm", yearsOfExp: 5, location: "TP.HCM",
      expectedSalary: 45, currentSalary: 35,
      level: "SENIOR" as CandidateSeniority, skills: ["React", "Next.js", "TypeScript", "GraphQL", "TailwindCSS"],
      status: "AVAILABLE" as CandidateStatus, source: "LINKEDIN" as CandidateSource, createdById,

    },
    {
      fullName: "Trần Thị Hương", phone: "0912345678", email: "huong.tran@outlook.com",
      currentPosition: "HR Business Partner", currentCompany: "Samsung Vietnam",
      industry: "Nhân sự", yearsOfExp: 8, location: "Hà Nội",
      expectedSalary: 55, currentSalary: 48,
      level: "MANAGER", skills: ["HR Business Partner", "Talent Acquisition", "C&B", "HRIS", "Luật Lao Động"],
      status: "EMPLOYED", source: "REFERRAL", createdById,
    },
    {
      fullName: "Lê Văn Đức", phone: "0987654321", email: "duc.le@gmail.com",
      currentPosition: "Java Backend Developer", currentCompany: "VNG Corporation",
      industry: "IT / Phần mềm", yearsOfExp: 3, location: "TP.HCM",
      expectedSalary: 30, currentSalary: 22,
      level: "MID_LEVEL" as CandidateSeniority, skills: ["Java", "Spring Boot", "Microservices", "Docker", "PostgreSQL"],
      status: "AVAILABLE" as CandidateStatus, source: "TOPCV" as CandidateSource, createdById,

    },
    {
      fullName: "Phạm Thị Lan Anh", phone: "0963123456", email: "lananh.pham@gmail.com",
      currentPosition: "Marketing Manager", currentCompany: "Nestlé Vietnam",
      industry: "Marketing / Truyền thông", yearsOfExp: 10, location: "TP.HCM",
      expectedSalary: 70, currentSalary: 65,
      level: "MANAGER" as CandidateSeniority, skills: ["Brand Management", "Digital Marketing", "P&L", "FMCG", "Content Strategy"],
      status: "INTERVIEWING" as CandidateStatus, source: "LINKEDIN" as CandidateSource, createdById,

    },
    {
      fullName: "Võ Quốc Hùng", phone: "0978456123", email: "hung.vo@gmail.com",
      currentPosition: "Supply Chain Lead", currentCompany: "Toyota Vietnam",
      industry: "Kỹ thuật / Sản xuất", yearsOfExp: 7, location: "Hà Nội",
      expectedSalary: 50, currentSalary: 42,
      level: "LEAD" as CandidateSeniority, skills: ["Supply Chain", "SAP MM", "Logistics", "Kaizen", "Lean"],
      status: "AVAILABLE" as CandidateStatus, source: "REFERRAL" as CandidateSource, createdById,

    },
    {
      fullName: "Đỗ Thanh Tùng", phone: "0934789012", email: "tung.do@gmail.com",
      currentPosition: "Junior Accountant", currentCompany: "Deloitte Vietnam",
      industry: "Tài chính / Ngân hàng", yearsOfExp: 1, location: "TP.HCM",
      expectedSalary: 15, currentSalary: 12,
      level: "JUNIOR" as CandidateSeniority, skills: ["Kế toán", "Excel", "SAP", "Thuế GTGT"],
      status: "AVAILABLE" as CandidateStatus, source: "TOPCV" as CandidateSource, createdById,

    },
    {
      fullName: "Nguyễn Thị Bích Ngọc", phone: "0945123789", email: "bicngoc.nguyen@gmail.com",
      currentPosition: "DevOps Engineer", currentCompany: "Intel Vietnam",
      industry: "IT / Phần mềm", yearsOfExp: 4, location: "TP.HCM",
      expectedSalary: 50, currentSalary: 40,
      level: "MID_LEVEL" as CandidateSeniority, skills: ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Python"],
      status: "AVAILABLE" as CandidateStatus, source: "LINKEDIN" as CandidateSource, createdById,

    },
    {
      fullName: "Bùi Văn Thắng", phone: "0921456789", email: "thang.bui@gmail.com",
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
        { companyName: "TMA Solutions", position: "Frontend Developer", startDate: new Date("2020-01-01"), endDate: new Date("2022-04-30"), notes: "Phát triển React dashboard cho khách hàng US." },
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
        { companyName: "Samsung Vietnam", position: "HR Business Partner", startDate: new Date("2021-06-01"), isCurrent: true, notes: "Phụ trách HRBP cho khối sản xuất và vận hành." },
        { companyName: "Unilever Vietnam", position: "Talent Acquisition Specialist", startDate: new Date("2018-03-01"), endDate: new Date("2021-05-31"), notes: "Tuyển mass và tuyển middle management." },
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
        { companyName: "VNG Corporation", position: "Java Backend Developer", startDate: new Date("2023-01-01"), isCurrent: true, notes: "Phát triển microservices và API cho hệ thống payment." },
        { companyName: "KMS Technology", position: "Software Engineer Intern", startDate: new Date("2022-05-01"), endDate: new Date("2022-12-31"), notes: "Tham gia đội platform và automation test." },
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
        { companyName: "Nestle Vietnam", position: "Marketing Manager", startDate: new Date("2020-08-01"), isCurrent: true, notes: "Quản lý brand FMCG và ngân sách truyền thông." },
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
        { companyName: "Toyota Vietnam", position: "Supply Chain Lead", startDate: new Date("2021-01-01"), isCurrent: true, notes: "Quản lý inbound logistics và vendor coordination." },
        { companyName: "Yazaki Vietnam", position: "Supply Chain Supervisor", startDate: new Date("2018-02-01"), endDate: new Date("2020-12-31"), notes: "Lập kế hoạch nguyên vật liệu và tối ưu tồn kho." },
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
        { companyName: "Deloitte Vietnam", position: "Junior Accountant", startDate: new Date("2025-01-01"), isCurrent: true, notes: "Hỗ trợ báo cáo tài chính và đối soát chứng từ." },
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
        { companyName: "NashTech", position: "Cloud Engineer", startDate: new Date("2020-06-01"), endDate: new Date("2022-08-31"), notes: "Triển khai hạ tầng AWS và observability." },
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
        { companyName: "Bosch Vietnam", position: "Intern Software Engineer", startDate: new Date("2025-06-01"), isCurrent: true, notes: "Hỗ trợ team backend và automation script." },
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
