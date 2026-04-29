import Link from "next/link";
import { FileText, Plus, Pencil } from "lucide-react";
import { getBlogPosts } from "@/lib/blog-actions";
import { requireAdmin } from "@/lib/authz";
import { DeleteBlogButton } from "./delete-button";
import type { BlogPost } from "@prisma/client";

export default async function BlogListPage() {
    await requireAdmin();
    const { posts, total } = await getBlogPosts();

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Quản lý bài viết</h1>
                        <p className="text-sm text-muted">{total} bài viết tổng cộng</p>
                    </div>
                </div>

                <Link
                    href="/blog/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Tạo bài viết
                </Link>
            </div>

            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                {posts.length === 0 ? (
                    <div className="p-12 text-center text-muted">
                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
                                <th className="px-5 py-3 w-8">#</th>
                                <th className="px-5 py-3">Bài viết</th>
                                <th className="px-5 py-3 w-24">Danh mục</th>
                                <th className="px-5 py-3 w-28">Trạng thái</th>
                                <th className="px-5 py-3 w-28 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post: BlogPost) => (
                                <tr key={post.id} className="border-b border-border/50 hover:bg-surface/60 transition">
                                    <td className="px-5 py-4 text-muted">{post.sortOrder}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{post.emoji}</span>
                                            <div>
                                                <p className="font-medium text-foreground line-clamp-1">{post.title}</p>
                                                <p className="text-xs text-muted line-clamp-1 mt-0.5">{post.excerpt}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        {post.isPublished ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                Đã xuất bản
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                Nháp
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/blog/${post.id}/edit`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-surface transition"
                                                title="Sửa"
                                            >
                                                <Pencil className="h-3.5 w-3.5 text-muted" />
                                            </Link>
                                            <DeleteBlogButton postId={post.id} postTitle={post.title} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
