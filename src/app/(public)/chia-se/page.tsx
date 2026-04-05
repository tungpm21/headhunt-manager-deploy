import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "Thông tin chia sẻ",
    description:
        "Bài viết hữu ích về tuyển dụng, kỹ năng làm việc và xu hướng nghề nghiệp tại các doanh nghiệp FDI.",
};

const blogPosts = [
    {
        id: 1,
        title: "Xu hướng tuyển dụng FDI tại Việt Nam năm 2025",
        excerpt:
            "Các doanh nghiệp FDI đang tìm kiếm nhân sự chất lượng cao với kỹ năng quản lý nhà máy, kỹ thuật tự động hóa và khả năng giao tiếp đa ngôn ngữ. Bài viết phân tích chi tiết các xu hướng và cơ hội trong thị trường lao động FDI.",
        date: "20/03/2025",
        category: "Xu hướng",
        emoji: "📈",
    },
    {
        id: 2,
        title: "5 kỹ năng cần thiết khi làm việc tại công ty FDI",
        excerpt:
            "Ngoài chuyên môn, các nhà tuyển dụng FDI đánh giá cao kỹ năng làm việc nhóm đa văn hóa, tư duy phản biện và khả năng thích ứng nhanh. Hãy cùng tìm hiểu 5 kỹ năng quan trọng nhất.",
        date: "15/03/2025",
        category: "Chia sẻ",
        emoji: "💡",
    },
    {
        id: 3,
        title: "Cách chuẩn bị CV ấn tượng cho doanh nghiệp nước ngoài",
        excerpt:
            "CV xin việc tại các công ty FDI cần tuân thủ format quốc tế, nhấn mạnh thành tích bằng con số và có cover letter chuyên nghiệp. Tham khảo ngay mẫu CV phổ biến.",
        date: "10/03/2025",
        category: "Hướng dẫn",
        emoji: "📋",
    },
    {
        id: 4,
        title: "Mức lương trung bình tại doanh nghiệp FDI theo ngành",
        excerpt:
            "Khảo sát mức lương tại các doanh nghiệp FDI lớn nhất Việt Nam cho thấy sự chênh lệch đáng kể giữa các ngành. Ngành sản xuất điện tử dẫn đầu với mức lương cạnh tranh nhất.",
        date: "05/03/2025",
        category: "Báo cáo",
        emoji: "💰",
    },
    {
        id: 5,
        title: "Phỏng vấn tại công ty Nhật Bản: Những điều cần biết",
        excerpt:
            "Văn hóa phỏng vấn tại các doanh nghiệp Nhật Bản rất khác biệt so với công ty Việt Nam. Tìm hiểu cách gây ấn tượng với nhà tuyển dụng Nhật.",
        date: "01/03/2025",
        category: "Hướng dẫn",
        emoji: "🇯🇵",
    },
    {
        id: 6,
        title: "Cơ hội nghề nghiệp trong ngành ô tô tại Việt Nam",
        excerpt:
            "Với sự mở rộng của Toyota, Honda và nhiều hãng xe khác, ngành ô tô tại Việt Nam đang tạo ra hàng nghìn cơ hội việc làm mới mỗi năm.",
        date: "25/02/2025",
        category: "Xu hướng",
        emoji: "🚗",
    },
];

export default function ChiaSePage() {
    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header banner */}
            <div className="bg-[var(--color-fdi-primary)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <h1
                        className="text-3xl font-bold text-white"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        Thông tin chia sẻ
                    </h1>
                    <p className="text-blue-100 mt-2">
                        Bài viết hữu ích về tuyển dụng, kỹ năng và xu hướng nghề nghiệp FDI
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="aspect-[16/9] bg-gradient-to-br from-[var(--color-fdi-surface)] to-blue-50 flex items-center justify-center">
                                <span className="text-5xl">{post.emoji}</span>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[var(--color-fdi-surface)] text-[var(--color-fdi-primary)]">
                                        {post.category}
                                    </span>
                                    <span className="text-xs text-[var(--color-fdi-text-secondary)]">
                                        {post.date}
                                    </span>
                                </div>
                                <h2
                                    className="text-lg font-semibold text-[var(--color-fdi-text)] line-clamp-2 mb-2"
                                    style={{ fontFamily: "var(--font-heading)" }}
                                >
                                    {post.title}
                                </h2>
                                <p className="text-sm text-[var(--color-fdi-text-secondary)] line-clamp-3 leading-relaxed mb-4">
                                    {post.excerpt}
                                </p>
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-fdi-primary)]">
                                    Đọc thêm <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-center text-sm text-[var(--color-fdi-text-secondary)] mt-10">
                    Đang cập nhật thêm nhiều bài viết hay. Hãy quay lại thường xuyên nhé!
                </p>
            </div>
        </div>
    );
}
