"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Eye, EyeOff } from "lucide-react";
import { createBlogPost, updateBlogPost } from "@/lib/blog-actions";

const CATEGORIES = ["Xu hướng", "Chia sẻ", "Hướng dẫn", "Báo cáo"];
const EMOJIS = ["📈", "💡", "📋", "💰", "🇯🇵", "🚗", "📝", "🎯", "🔥", "⭐"];

const inputClassName =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

type BlogPostData = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    emoji: string;
    isPublished: boolean;
    sortOrder: number;
};

export function BlogPostForm({ post }: { post?: BlogPostData }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isPublished, setIsPublished] = useState(post?.isPublished ?? false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsSaving(true);
        setMessage(null);

        formData.set("isPublished", isPublished.toString());

        try {
            const result = post
                ? await updateBlogPost(post.id, formData)
                : await createBlogPost(formData);

            if ("error" in result) {
                setMessage({ type: "error", text: result.error ?? "Đã có lỗi xảy ra." });
                return;
            }

            setMessage({ type: "success", text: post ? "Đã cập nhật bài viết." : "Đã tạo bài viết mới." });

            if (!post && "id" in result) {
                setTimeout(() => router.push("/blog"), 600);
            }
        } catch {
            setMessage({ type: "error", text: "Đã có lỗi xảy ra." });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 transition hover:bg-surface hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Danh sách bài viết
                </Link>
                <span>/</span>
                <span className="font-medium text-foreground">
                    {post ? "Chỉnh sửa" : "Tạo mới"}
                </span>
            </div>

            {message && (
                <div
                    className={`flex items-center gap-3 rounded-xl border p-4 ${message.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                        }`}
                >
                    <p className="text-sm">{message.text}</p>
                </div>
            )}

            <form action={handleSubmit} className="bg-surface rounded-2xl border border-border p-6 sm:p-8 space-y-6">
                <h2 className="text-lg font-semibold text-foreground">
                    {post ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
                </h2>

                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
                        Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        defaultValue={post?.title ?? ""}
                        placeholder="Xu hướng tuyển dụng FDI năm 2025"
                        className={inputClassName}
                    />
                </div>

                {/* Slug */}
                <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1.5">
                        Slug (URL)
                    </label>
                    <input
                        id="slug"
                        name="slug"
                        type="text"
                        defaultValue={post?.slug ?? ""}
                        placeholder="Tự sinh nếu để trống"
                        className={inputClassName}
                    />
                    <p className="text-xs text-muted mt-1">Để trống sẽ tự tạo từ tiêu đề</p>
                </div>

                {/* Category + Emoji + Sort row */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1.5">
                            Danh mục
                        </label>
                        <select
                            id="category"
                            name="category"
                            defaultValue={post?.category ?? "Chia sẻ"}
                            className={inputClassName}
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="emoji" className="block text-sm font-medium text-foreground mb-1.5">
                            Emoji
                        </label>
                        <select
                            id="emoji"
                            name="emoji"
                            defaultValue={post?.emoji ?? "📝"}
                            className={inputClassName}
                        >
                            {EMOJIS.map((e) => (
                                <option key={e} value={e}>
                                    {e}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="sortOrder" className="block text-sm font-medium text-foreground mb-1.5">
                            Thứ tự hiển thị
                        </label>
                        <input
                            id="sortOrder"
                            name="sortOrder"
                            type="number"
                            min={0}
                            defaultValue={post?.sortOrder ?? 0}
                            className={inputClassName}
                        />
                    </div>
                </div>

                {/* Excerpt */}
                <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-foreground mb-1.5">
                        Mô tả ngắn <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="excerpt"
                        name="excerpt"
                        rows={3}
                        required
                        defaultValue={post?.excerpt ?? ""}
                        placeholder="Mô tả ngắn gọn nội dung bài viết..."
                        className={`${inputClassName} resize-y`}
                    />
                </div>

                {/* Content */}
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-foreground mb-1.5">
                        Nội dung bài viết <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        rows={12}
                        required
                        defaultValue={post?.content ?? ""}
                        placeholder="Nội dung đầy đủ bài viết (hỗ trợ HTML)..."
                        className={`${inputClassName} resize-y min-h-[200px] font-mono text-xs`}
                    />
                </div>

                {/* Publish toggle + Submit */}
                <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={() => setIsPublished(!isPublished)}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border transition cursor-pointer ${isPublished
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-border text-muted hover:bg-surface"
                            }`}
                    >
                        {isPublished ? (
                            <>
                                <Eye className="h-4 w-4" />
                                Đã xuất bản
                            </>
                        ) : (
                            <>
                                <EyeOff className="h-4 w-4" />
                                Nháp (chưa xuất bản)
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/blog"
                            className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-surface"
                        >
                            Hủy
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    {post ? "Lưu thay đổi" : "Tạo bài viết"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
