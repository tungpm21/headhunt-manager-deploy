import Link from "next/link";
import { ArrowRight } from "lucide-react";

const blogPosts = [
    {
        id: 1,
        title: "Xu hướng tuyển dụng FDI tại Việt Nam năm 2025",
        excerpt:
            "Các doanh nghiệp FDI đang tìm kiếm nhân sự chất lượng cao với kỹ năng quản lý nhà máy, kỹ thuật tự động hóa và khả năng giao tiếp đa ngôn ngữ.",
        image: "/blog/trend-2025.jpg",
        date: "20/03/2025",
        category: "Xu hướng",
    },
    {
        id: 2,
        title: "5 kỹ năng cần thiết khi làm việc tại công ty FDI",
        excerpt:
            "Ngoài chuyên môn, các nhà tuyển dụng FDI đánh giá cao kỹ năng làm việc nhóm đa văn hóa, tư duy phản biện và khả năng thích ứng nhanh.",
        image: "/blog/skills-fdi.jpg",
        date: "15/03/2025",
        category: "Chia sẻ",
    },
    {
        id: 3,
        title: "Cách chuẩn bị CV ấn tượng cho doanh nghiệp nước ngoài",
        excerpt:
            "CV xin việc tại các công ty FDI cần tuân thủ format quốc tế, nhấn mạnh thành tích bằng con số và có cover letter chuyên nghiệp.",
        image: "/blog/cv-tips.jpg",
        date: "10/03/2025",
        category: "Hướng dẫn",
    },
];

export function BlogSection() {
    return (
        <section className="py-16 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2
                            className="text-2xl sm:text-3xl font-bold text-[var(--color-fdi-text)]"
                            style={{ fontFamily: "var(--font-heading)" }}
                        >
                            Thông tin chia sẻ
                        </h2>
                        <p className="text-[var(--color-fdi-text-secondary)] mt-1">
                            Bài viết hữu ích cho ứng viên và nhà tuyển dụng
                        </p>
                    </div>
                    <Link
                        href="/chia-se"
                        className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--color-fdi-primary)] hover:underline cursor-pointer"
                    >
                        Xem tất cả <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map((post) => (
                        <Link
                            key={post.id}
                            href="/chia-se"
                            className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            {/* Image placeholder */}
                            <div className="aspect-[16/9] bg-gradient-to-br from-[var(--color-fdi-surface)] to-blue-50 flex items-center justify-center">
                                <span className="text-4xl">
                                    {post.category === "Xu hướng"
                                        ? "📈"
                                        : post.category === "Chia sẻ"
                                            ? "💡"
                                            : "📋"}
                                </span>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[var(--color-fdi-surface)] text-[var(--color-fdi-primary)]">
                                        {post.category}
                                    </span>
                                    <span className="text-xs text-[var(--color-fdi-text-secondary)]">
                                        {post.date}
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold text-[var(--color-fdi-text)] group-hover:text-[var(--color-fdi-primary)] transition-colors line-clamp-2 mb-2">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-[var(--color-fdi-text-secondary)] line-clamp-3 leading-relaxed">
                                    {post.excerpt}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="sm:hidden mt-6 text-center">
                    <Link
                        href="/chia-se"
                        className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-fdi-primary)] hover:underline cursor-pointer"
                    >
                        Xem tất cả bài viết <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
