"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { BlockBuilder } from "@/components/content/BlockBuilder";
import { MediaUploadButton } from "@/components/content/MediaUploadButton";
import { createBlogPost, updateBlogPost } from "@/lib/blog-actions";
import type { ContentBlock } from "@/lib/content-blocks";

const CATEGORIES = ["Xu hướng", "Chia sẻ", "Hướng dẫn", "Báo cáo"];
const EMOJIS = ["📈", "💡", "📋", "💰", "🇯🇵", "🚗", "📝", "🎯", "🔥", "⭐"];

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

type BlogPostData = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  coverAlt: string | null;
  content: string;
  contentBlocks: ContentBlock[] | null;
  category: string;
  emoji: string;
  isPublished: boolean;
  sortOrder: number;
};

export function BlogPostForm({ post }: { post?: BlogPostData }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? false);
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [coverAlt, setCoverAlt] = useState(post?.coverAlt ?? "");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const initialBlocks = post?.contentBlocks?.length
    ? post.contentBlocks
    : post?.content
      ? [{ id: "legacy-content", type: "richText" as const, title: "Nội dung bài viết", markdown: post.content }]
      : [];

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setMessage(null);
    formData.set("isPublished", isPublished.toString());

    try {
      const result = post ? await updateBlogPost(post.id, formData) : await createBlogPost(formData);

      if ("error" in result) {
        setMessage({ type: "error", text: result.error ?? "Đã có lỗi xảy ra." });
        return;
      }

      setMessage({
        type: "success",
        text: post ? "Đã cập nhật bài viết." : "Đã tạo bài viết mới.",
      });

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
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 transition hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Danh sách bài viết
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{post ? "Chỉnh sửa" : "Tạo mới"}</span>
      </div>

      {message ? (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
      ) : null}

      <form action={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <input type="hidden" name="coverImage" value={coverImage} />
        <input type="hidden" name="coverAlt" value={coverAlt} />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {post ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Dùng block builder để tạo bài chia sẻ có cover, ảnh, gallery, video và nội dung Markdown.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublished(!isPublished)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
              isPublished
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-border text-muted hover:bg-background"
            }`}
          >
            {isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {isPublished ? "Đã xuất bản" : "Nháp"}
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
          <div className="space-y-5">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
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

            <div>
              <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-foreground">
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
              <p className="mt-1 text-xs text-muted">Để trống sẽ tự tạo từ tiêu đề.</p>
            </div>

            <div>
              <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium text-foreground">
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
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div>
                <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-foreground">
                  Danh mục
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue={post?.category ?? "Chia sẻ"}
                  className={inputClassName}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="emoji" className="mb-1.5 block text-sm font-medium text-foreground">
                  Emoji
                </label>
                <select id="emoji" name="emoji" defaultValue={post?.emoji ?? "📝"} className={inputClassName}>
                  {EMOJIS.map((emoji) => (
                    <option key={emoji} value={emoji}>
                      {emoji}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sortOrder" className="mb-1.5 block text-sm font-medium text-foreground">
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
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Ảnh cover bài viết</p>
              <p className="mt-1 text-xs text-muted">JPG, PNG, WebP. Tối đa 5MB. Alt text là bắt buộc.</p>
            </div>
            <MediaUploadButton
              context="blog"
              kind="cover"
              alt={coverAlt}
              onUploaded={(image) => {
                setCoverImage(image.url);
                setCoverAlt(image.alt);
              }}
              label="Upload cover"
            />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="space-y-3">
              <input
                value={coverAlt}
                onChange={(event) => setCoverAlt(event.target.value)}
                placeholder="Alt text mô tả ảnh cover"
                className={inputClassName}
              />
              <input
                value={coverImage}
                onChange={(event) => setCoverImage(event.target.value)}
                placeholder="URL ảnh cover hoặc upload từ nút bên trên"
                className={inputClassName}
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              {coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage} alt={coverAlt || "Blog cover"} className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center text-xs text-muted">
                  Preview cover
                </div>
              )}
            </div>
          </div>
        </div>

        <BlockBuilder
          name="contentBlocks"
          context="blog"
          title="Nội dung bài viết"
          description="Xây bài viết bằng block: Markdown, ảnh, gallery, quote, video, CTA và HTML an toàn."
          initialBlocks={initialBlocks}
          maxImages={12}
          allowHtml
        />

        <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-background"
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
      </form>
    </div>
  );
}
