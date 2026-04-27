import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { getPublishedBlogPostBySlug } from "@/lib/blog-actions";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatBlogContent(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return "";

  if (!/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
      .join("");
  }

  return DOMPurify.sanitize(trimmed);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Bài viết không tồn tại",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <div id="main-content" className="min-h-screen bg-[#F6F8FB]">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/chia-se"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--color-fdi-primary)] transition-colors hover:text-[var(--color-fdi-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Quay lại chia sẻ
          </Link>

          <div className="mt-7">
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-fdi-text-secondary)]">
              <span className="rounded-full bg-[var(--color-fdi-surface)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-fdi-primary)]">
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {dateFormatter.format(post.createdAt)}
              </span>
            </div>

            <h1
              className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[var(--color-fdi-text)] sm:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {post.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-fdi-text-secondary)]">
              {post.excerpt}
            </p>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl border border-gray-200 bg-white p-6 text-[15px] leading-7 text-[var(--color-fdi-text)] shadow-[0_18px_44px_-34px_rgba(15,23,42,0.55)] sm:p-8 [&_a]:font-semibold [&_a]:text-[var(--color-fdi-primary)] [&_blockquote]:my-6 [&_blockquote]:border-0 [&_blockquote]:bg-[var(--color-fdi-surface)] [&_blockquote]:rounded-lg [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:italic [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--color-fdi-text)] [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[var(--color-fdi-text)] [&_li]:mb-2 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-5 [&_strong]:text-[var(--color-fdi-text)] [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: formatBlogContent(post.content) }}
        />
      </article>
    </div>
  );
}
