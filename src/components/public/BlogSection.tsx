import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLatestBlogPosts } from "@/lib/blog-actions";
import type { BlogPost } from "@prisma/client";

export async function BlogSection() {
    const blogPosts = await getLatestBlogPosts(3);

    if (blogPosts.length === 0) return null;

    return (
        <section className="py-16 bg-[var(--color-fdi-surface)]">
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
                    {blogPosts.map((post: BlogPost) => (
                        <Link
                            key={post.id}
                            href="/chia-se"
                            className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            <div className="aspect-[16/9] bg-gradient-to-br from-[var(--color-fdi-surface)] to-blue-50 flex items-center justify-center">
                                <span className="text-4xl">{post.emoji}</span>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[var(--color-fdi-surface)] text-[var(--color-fdi-primary)]">
                                        {post.category}
                                    </span>
                                    <span className="text-xs text-[var(--color-fdi-text-secondary)]">
                                        {post.createdAt.toLocaleDateString("vi-VN")}
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
