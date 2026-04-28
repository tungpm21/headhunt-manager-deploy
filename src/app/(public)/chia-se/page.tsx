import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Briefcase, TrendingUp } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/blog-actions";
import type { BlogPost } from "@prisma/client";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});

function getPostIcon(category: string) {
    const normalized = category.toLowerCase();
    if (normalized.includes("báo cáo") || normalized.includes("lương")) return BarChart3;
    if (normalized.includes("xu hướng")) return TrendingUp;
    if (normalized.includes("hướng dẫn")) return BookOpen;
    return Briefcase;
}

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
    <div id="main-content" className="min-h-screen bg-[var(--color-fdi-mist)]">
            {/* Header banner */}
            <div className="border-b border-[var(--color-fdi-mist)] bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <h1
                        className="text-3xl font-bold text-[var(--color-fdi-text)]"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        Thông tin chia sẻ
                    </h1>
                    <p className="mt-2 max-w-2xl text-[var(--color-fdi-text-secondary)]">
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
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {blogPosts.map((post: BlogPost) => {
                            const PostIcon = getPostIcon(post.category);

                            return (
                            <Link
                                key={post.id}
                                href={`/chia-se/${post.slug}`}
                                aria-label={post.title}
                                className="group overflow-hidden rounded-xl border border-[var(--color-fdi-mist)] bg-white shadow-[0_16px_36px_-30px_rgba(15,23,42,0.5)] transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--color-fdi-primary)]/25 hover:shadow-[0_24px_46px_-34px_rgba(15,23,42,0.65)]"
                            >
                                <div className="relative flex aspect-[16/8.5] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#F8FBFF_0%,#EDF6FF_52%,#FFF7ED_100%)]">
                                    {post.coverImage ? (
                                        <Image
                                            src={post.coverImage}
                                            alt={post.coverAlt ?? post.title}
                                            fill
                                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                            className="object-cover transition duration-300 group-hover:scale-[1.03]"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 bg-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.7)]">
                                            <PostIcon className="h-7 w-7 text-[var(--color-fdi-primary)]" aria-hidden="true" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[var(--color-fdi-surface)] text-[var(--color-fdi-primary)]">
                                            {post.category}
                                        </span>
                                        <span className="text-xs text-[var(--color-fdi-text-secondary)]">
                                            {dateFormatter.format(post.createdAt)}
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
                                    <span className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[var(--color-fdi-primary)]">
                                        Đọc thêm <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </span>
                                </div>
                            </Link>
                        );
                        })}
                    </div>
                )}

                <p className="text-center text-sm text-[var(--color-fdi-text-secondary)] mt-10">
                    Đang cập nhật thêm nhiều bài viết hay. Hãy quay lại thường xuyên nhé!
                </p>
            </div>
        </div>
    );
}
