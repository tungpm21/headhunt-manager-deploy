/**
 * Seeds a complete public company profile for Samsung Electronics Vietnam.
 *
 * Run:
 *   npx tsx prisma/seed-samsung-company-profile.ts
 */

import { PrismaClient, type Prisma } from "@prisma/client";
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

const samsungSections = [
  {
    id: "samsung-overview",
    type: "richText",
    title: "Về Samsung Electronics Vietnam",
    markdown:
      "Samsung Electronics Vietnam là một trong những cứ điểm sản xuất và R&D quan trọng của Samsung tại khu vực Đông Nam Á. Tại Bắc Ninh, doanh nghiệp vận hành hệ sinh thái sản xuất điện tử quy mô lớn, kết nối các đội ngũ kỹ thuật, sản xuất, chất lượng, supply chain và nhân sự trong môi trường chuẩn toàn cầu.\n\nTrang tuyển dụng này được thiết kế cho ứng viên muốn hiểu nhanh ba điều quan trọng: Samsung đang cần những nhóm năng lực nào, môi trường làm việc có gì đáng tin cậy, và cơ hội phát triển nghề nghiệp nằm ở đâu.",
  },
  {
    id: "samsung-stats",
    type: "stats",
    title: "Những con số nổi bật",
    stats: [
      {
        value: "15+",
        label: "năm đầu tư tại Việt Nam",
        description: "Liên tục mở rộng sản xuất, chuỗi cung ứng và năng lực nhân sự.",
      },
      {
        value: "100.000+",
        label: "nhân sự trong hệ sinh thái",
        description: "Quy mô lớn, quy trình rõ ràng, nhiều cơ hội luân chuyển nội bộ.",
      },
      {
        value: "5",
        label: "vị trí đang tuyển trên FDIWork",
        description: "Tập trung vào sản xuất, chất lượng, nhân sự, IT và ngôn ngữ Hàn.",
      },
    ],
  },
  {
    id: "samsung-career",
    type: "benefits",
    title: "Lý do ứng viên chọn Samsung",
    benefits: [
      {
        title: "Lộ trình nghề nghiệp rõ ràng",
        description: "Ứng viên được tiếp cận hệ thống đào tạo, đánh giá năng lực và cơ hội thăng tiến theo từng nhóm chức danh.",
      },
      {
        title: "Môi trường sản xuất công nghệ cao",
        description: "Làm việc với dây chuyền, tiêu chuẩn chất lượng và quy trình quản trị của tập đoàn toàn cầu.",
      },
      {
        title: "Phúc lợi cạnh tranh",
        description: "Lương, thưởng, bảo hiểm, xe đưa đón, bữa ăn và các chương trình chăm sóc nhân viên được thiết kế cho quy mô nhà máy lớn.",
      },
      {
        title: "Kết nối đa ngôn ngữ",
        description: "Nhiều vai trò có cơ hội làm việc với chuyên gia Hàn Quốc và các team quốc tế.",
      },
    ],
  },
  {
    id: "samsung-workplace-gallery",
    type: "gallery",
    title: "Không gian và vận hành",
    images: [
      {
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&h=675&fit=crop&q=82",
        alt: "Dây chuyền điện tử công nghệ cao",
        caption: "Sản xuất điện tử và linh kiện chính xác",
      },
      {
        url: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=900&h=675&fit=crop&q=82",
        alt: "Kỹ sư làm việc trong nhà máy",
        caption: "Đội ngũ kỹ thuật và chất lượng",
      },
      {
        url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&h=675&fit=crop&q=82",
        alt: "Môi trường làm việc kỹ thuật",
        caption: "Vận hành theo tiêu chuẩn toàn cầu",
      },
    ],
  },
  {
    id: "samsung-culture",
    type: "richText",
    title: "Văn hóa làm việc",
    markdown:
      "Samsung ưu tiên tính kỷ luật trong vận hành, tốc độ trong cải tiến và sự minh bạch trong phối hợp giữa các bộ phận. Ứng viên phù hợp thường là người có tinh thần học nhanh, tôn trọng quy trình, sẵn sàng làm việc với dữ liệu và chủ động giải quyết vấn đề tại hiện trường.\n\nCác nhóm vị trí trên FDIWork phù hợp với ứng viên có nền tảng sản xuất điện tử, QA/QC, HR nhà máy, IT support, supply chain hoặc tiếng Hàn.",
  },
  {
    id: "samsung-quote",
    type: "quote",
    quote:
      "Chúng tôi tìm kiếm những ứng viên có khả năng làm việc trong môi trường tốc độ cao, tôn trọng tiêu chuẩn và mong muốn xây dựng sự nghiệp dài hạn trong ngành công nghệ sản xuất.",
    attribution: "Đại diện tuyển dụng Samsung Electronics Vietnam",
  },
  {
    id: "samsung-cta",
    type: "cta",
    title: "Sẵn sàng ứng tuyển vào Samsung?",
    description:
      "Khám phá các vị trí đang mở và chọn công việc phù hợp với kinh nghiệm, ngôn ngữ và mục tiêu nghề nghiệp của bạn.",
    label: "Xem tất cả việc làm",
    href: "/viec-lam?company=samsung-electronics-vietnam",
  },
] satisfies Prisma.InputJsonValue;

async function main() {
  const slug = "samsung-electronics-vietnam";

  const employer = await prisma.employer.update({
    where: { slug },
    data: {
      companyName: "Samsung Electronics Vietnam",
      logo: "/logos/samsung.png",
      coverImage:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=760&fit=crop&q=84",
      coverPositionX: 48,
      coverPositionY: 50,
      coverZoom: 100,
      industry: "Sản xuất - Điện tử công nghệ cao",
      companySize: "ENTERPRISE",
      location: "Bắc Ninh",
      industrialZone: "KCN Yên Phong, Bắc Ninh",
      address: "KCN Yên Phong, huyện Yên Phong, tỉnh Bắc Ninh",
      website: "https://www.samsung.com/vn",
      phone: "0222 369 6040",
      status: "ACTIVE",
      description:
        "Tổ hợp Samsung Electronics Vietnam tại Bắc Ninh là một trong những trung tâm sản xuất điện tử quy mô lớn của Samsung, mở ra cơ hội nghề nghiệp cho ứng viên trong sản xuất, chất lượng, nhân sự, IT và ngôn ngữ Hàn.",
      profileConfig: {
        upsert: {
          create: {
            theme: {
              primaryColor: "#063B5D",
              accentColor: "#D94B16",
              backgroundColor: "#F3F7FA",
              textColor: "#102033",
              borderColor: "#CFE0EA",
              surfaceColor: "#FFFFFF",
              media: {
                coverAspectRatio: "5 / 2",
                logoAspectRatio: "3 / 2",
                logoFit: "contain",
                logoZoom: 92,
                bannerImageUrl:
                  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&h=515&fit=crop&q=84",
                bannerPositionX: 48,
                bannerPositionY: 50,
                bannerZoom: 100,
              },
            },
            capabilities: {
              theme: true,
              gallery: true,
              video: true,
              html: false,
              maxImages: 8,
            },
            sections: samsungSections,
            primaryVideoUrl: null,
          },
          update: {
            theme: {
              primaryColor: "#063B5D",
              accentColor: "#D94B16",
              backgroundColor: "#F3F7FA",
              textColor: "#102033",
              borderColor: "#CFE0EA",
              surfaceColor: "#FFFFFF",
              media: {
                coverAspectRatio: "5 / 2",
                logoAspectRatio: "3 / 2",
                logoFit: "contain",
                logoZoom: 92,
                bannerImageUrl:
                  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&h=515&fit=crop&q=84",
                bannerPositionX: 48,
                bannerPositionY: 50,
                bannerZoom: 100,
              },
            },
            capabilities: {
              theme: true,
              gallery: true,
              video: true,
              html: false,
              maxImages: 8,
            },
            sections: samsungSections,
            primaryVideoUrl: null,
          },
        },
      },
    },
    select: {
      companyName: true,
      slug: true,
      profileConfig: { select: { sections: true } },
    },
  });

  console.log(`Seeded public company profile for ${employer.companyName}`);
  console.log(`URL: /cong-ty/${employer.slug}`);
  console.log(`Sections: ${Array.isArray(employer.profileConfig?.sections) ? employer.profileConfig.sections.length : 0}`);
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
