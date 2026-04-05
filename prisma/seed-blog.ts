import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL || "";
const pool = new pg.Pool({ connectionString }) as any;
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const blogPosts = [
    {
        title: "Xu hướng tuyển dụng FDI tại Việt Nam năm 2025",
        slug: "xu-huong-tuyen-dung-fdi-2025",
        excerpt: "Các doanh nghiệp FDI đang tìm kiếm nhân sự chất lượng cao với kỹ năng quản lý nhà máy, kỹ thuật tự động hóa và khả năng giao tiếp đa ngôn ngữ. Bài viết phân tích chi tiết các xu hướng và cơ hội trong thị trường lao động FDI.",
        content: "Các doanh nghiệp FDI đang tìm kiếm nhân sự chất lượng cao với kỹ năng quản lý nhà máy, kỹ thuật tự động hóa và khả năng giao tiếp đa ngôn ngữ.",
        category: "Xu hướng",
        emoji: "📈",
        isPublished: true,
        sortOrder: 0,
    },
    {
        title: "5 kỹ năng cần thiết khi làm việc tại công ty FDI",
        slug: "5-ky-nang-can-thiet-cong-ty-fdi",
        excerpt: "Ngoài chuyên môn, các nhà tuyển dụng FDI đánh giá cao kỹ năng làm việc nhóm đa văn hóa, tư duy phản biện và khả năng thích ứng nhanh.",
        content: "Ngoài chuyên môn, các nhà tuyển dụng FDI đánh giá cao kỹ năng làm việc nhóm đa văn hóa, tư duy phản biện và khả năng thích ứng nhanh.",
        category: "Chia sẻ",
        emoji: "💡",
        isPublished: true,
        sortOrder: 1,
    },
    {
        title: "Cách chuẩn bị CV ấn tượng cho doanh nghiệp nước ngoài",
        slug: "cach-chuan-bi-cv-doanh-nghiep-nuoc-ngoai",
        excerpt: "CV xin việc tại các công ty FDI cần tuân thủ format quốc tế, nhấn mạnh thành tích bằng con số và có cover letter chuyên nghiệp.",
        content: "CV xin việc tại các công ty FDI cần tuân thủ format quốc tế, nhấn mạnh thành tích bằng con số và có cover letter chuyên nghiệp.",
        category: "Hướng dẫn",
        emoji: "📋",
        isPublished: true,
        sortOrder: 2,
    },
    {
        title: "Mức lương trung bình tại doanh nghiệp FDI theo ngành",
        slug: "muc-luong-trung-binh-doanh-nghiep-fdi",
        excerpt: "Khảo sát mức lương tại các doanh nghiệp FDI lớn nhất Việt Nam cho thấy sự chênh lệch đáng kể giữa các ngành.",
        content: "Khảo sát mức lương tại các doanh nghiệp FDI lớn nhất Việt Nam cho thấy sự chênh lệch đáng kể giữa các ngành.",
        category: "Báo cáo",
        emoji: "💰",
        isPublished: true,
        sortOrder: 3,
    },
    {
        title: "Phỏng vấn tại công ty Nhật Bản: Những điều cần biết",
        slug: "phong-van-cong-ty-nhat-ban",
        excerpt: "Văn hóa phỏng vấn tại các doanh nghiệp Nhật Bản rất khác biệt so với công ty Việt Nam. Tìm hiểu cách gây ấn tượng với nhà tuyển dụng Nhật.",
        content: "Văn hóa phỏng vấn tại các doanh nghiệp Nhật Bản rất khác biệt so với công ty Việt Nam.",
        category: "Hướng dẫn",
        emoji: "🇯🇵",
        isPublished: true,
        sortOrder: 4,
    },
    {
        title: "Cơ hội nghề nghiệp trong ngành ô tô tại Việt Nam",
        slug: "co-hoi-nghe-nghiep-nganh-o-to",
        excerpt: "Với sự mở rộng của Toyota, Honda và nhiều hãng xe khác, ngành ô tô tại Việt Nam đang tạo ra hàng nghìn cơ hội việc làm mới mỗi năm.",
        content: "Với sự mở rộng của Toyota, Honda và nhiều hãng xe khác, ngành ô tô tại Việt Nam đang tạo ra hàng nghìn cơ hội việc làm mới mỗi năm.",
        category: "Xu hướng",
        emoji: "🚗",
        isPublished: true,
        sortOrder: 5,
    },
];

async function main() {
    console.log("Seeding blog posts...");

    for (const post of blogPosts) {
        await prisma.blogPost.upsert({
            where: { slug: post.slug },
            update: post,
            create: post,
        });
        console.log(`  ✓ ${post.title}`);
    }

    console.log("Done! Seeded", blogPosts.length, "blog posts.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
