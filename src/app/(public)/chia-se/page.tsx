import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/blog-actions";
import type { BlogPost } from "@prisma/client";

// Revalidate every 60 seconds — blog posts change rarely,
// no searchParams dependency so ISR is safe here.
export const revalidate = 60;

export const metadata: Metadata = {
    title: "Thông tin chia sẻ",
    description:
        "Bài viết hữu ích về tuyển dụng, kỹ năng làm việc và xu hướng nghề nghiệp tại các doanh nghiệp FDI.",
};

export default async function ChiaSePage() {
    const blogPosts = await getPublishedBlogPosts();

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
                {blogPosts.length === 0 ? (
                    <p className="text-center text-sm text-[var(--color-fdi-text-secondary)] py-12">
                        Chưa có bài viết nào. Hãy quay lại sau nhé!
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogPosts.map((post: BlogPost) => (
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
                                            {post.createdAt.toLocaleDateString("vi-VN")}
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
                )}

                <p className="text-center text-sm text-[var(--color-fdi-text-secondary)] mt-10">
                    Đang cập nhật thêm nhiều bài viết hay. Hãy quay lại thường xuyên nhé!
                </p>
            </div>
        </div>
    );
}
