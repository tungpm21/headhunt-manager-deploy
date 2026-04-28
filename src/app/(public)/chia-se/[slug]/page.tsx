import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { ContentBlocksRenderer } from "@/components/content/ContentBlocksRenderer";
import { SafeRichContent } from "@/components/content/SafeRichContent";
import { getLatestBlogPosts, getPublishedBlogPostBySlug } from "@/lib/blog-actions";
import { normalizeContentBlocks, stripMarkdown, type ContentBlock } from "@/lib/content-blocks";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function getReadingMinutes(value: string) {
  const words = stripMarkdown(value).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 240));
}

function createHeadingAnchor(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug ? `section-${slug}` : "";
}

function createBlockAnchorId(block: ContentBlock, index: number) {
  const slug = (block.id || `${block.type}-${index + 1}`)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `content-${slug || index + 1}`;
}

function createNestedHeadingAnchor(blockAnchorId: string, value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug ? `${blockAnchorId}-${slug}` : "";
}

const blockTypeLabels: Record<ContentBlock["type"], string> = {
  richText: "Nội dung",
  image: "Ảnh",
  gallery: "Gallery",
  quote: "Trích dẫn",
  stats: "Chỉ số",
  benefits: "Phúc lợi",
  video: "Video",
  html: "HTML",
  cta: "CTA",
};

function getBlockTitle(block: ContentBlock, index: number) {
  if (block.title) return block.title;
  if (block.type === "image") return block.caption || block.alt || `Hình ảnh ${index + 1}`;
  if (block.type === "gallery") return `Gallery ${index + 1}`;
  if (block.type === "quote") return stripMarkdown(block.quote || "").slice(0, 72) || "Trích dẫn";
  if (block.type === "video") return "Video";
  if (block.type === "stats") return "Những con số nổi bật";
  if (block.type === "benefits") return "Điểm nổi bật";
  if (block.type === "cta") return block.label || "Liên kết";
  if (block.type === "html") return "Nội dung tuỳ chỉnh";
  return `Nội dung ${index + 1}`;
}

function extractMarkdownHeadings(markdown: string, prefix?: string) {
  return Array.from(markdown.matchAll(/^#{2,3}\s+(.+)$/gm))
    .map((match) => {
      const title = stripMarkdown(match[1] ?? "");
      const id = prefix ? createNestedHeadingAnchor(prefix, title) : createHeadingAnchor(title);
      return { title, id };
    })
    .filter((heading) => heading.title && heading.id);
}

function extractHeadings(blocks: unknown, fallback: string) {
  const enabledBlocks = normalizeContentBlocks(blocks).filter((block) => block.enabled !== false);

  if (enabledBlocks.length === 0) {
    return fallback.trim()
      ? [
          {
            id: "article-content",
            title: "Nội dung bài viết",
            label: "Markdown",
            children: extractMarkdownHeadings(fallback).slice(0, 6),
          },
        ]
      : [];
  }

  return enabledBlocks
    .map((block, index) => {
      const blockAnchorId = createBlockAnchorId(block, index);
      const markdown = block.markdown || block.html || "";

      return {
        id: blockAnchorId,
        title: getBlockTitle(block, index),
        label: blockTypeLabels[block.type],
        children: extractMarkdownHeadings(markdown, blockAnchorId).slice(0, 4),
      };
    })
    .filter((section) => section.title && section.id);
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
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: post.coverImage
        ? [{ url: post.coverImage, alt: post.coverAlt ?? post.title }]
        : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) notFound();

  const relatedPosts = (await getLatestBlogPosts(4)).filter((item) => item.id !== post.id).slice(0, 3);
  const tableOfContents = extractHeadings(post.contentBlocks, post.content);
  const readingMinutes = getReadingMinutes(post.content);

  return (
    <div id="main-content" className="min-h-screen bg-[#F6F8FB]">
      <article>
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
              href="/chia-se"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--color-fdi-primary)] transition-colors hover:text-[var(--color-fdi-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Quay lại chia sẻ
            </Link>

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.8fr)] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-fdi-text-secondary)]">
                  <span className="rounded-full bg-[var(--color-fdi-surface)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-fdi-primary)]">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    {dateFormatter.format(post.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {readingMinutes} phút đọc
                  </span>
                </div>

                <h1
                  className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[var(--color-fdi-text)] sm:text-5xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {post.title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-fdi-text-secondary)]">
                  {post.excerpt}
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-[var(--color-fdi-surface)] shadow-[0_24px_70px_-46px_rgba(15,23,42,0.8)]">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.coverAlt ?? post.title}
                    width={900}
                    height={560}
                    priority
                    className="aspect-[16/10] h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-sky-50 via-white to-orange-50">
                    <span className="text-6xl" aria-hidden="true">
                      {post.emoji}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm">
              <p className="font-semibold text-[var(--color-fdi-text)]">Nội dung chính</p>
              {tableOfContents.length > 0 ? (
                <ol className="mt-3 space-y-3 text-[var(--color-fdi-text-secondary)]">
                  {tableOfContents.map((section, index) => (
                    <li key={`${section.id}-${index}`}>
                      <a
                        href={`#${section.id}`}
                        className="group flex gap-2 rounded-lg p-2 transition hover:bg-[var(--color-fdi-surface)] hover:text-[var(--color-fdi-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-fdi-surface)] text-[11px] font-bold text-[var(--color-fdi-primary)] group-hover:bg-white">
                          {index + 1}
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 font-semibold text-[var(--color-fdi-text)] group-hover:text-[var(--color-fdi-primary)]">
                            {section.title}
                          </span>
                          <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-[var(--color-fdi-text-secondary)]">
                            {section.label}
                          </span>
                        </span>
                      </a>
                      {section.children.length > 0 ? (
                        <ol className="ml-9 mt-1 space-y-1 border-l border-gray-200 pl-3">
                          {section.children.map((heading) => (
                            <li key={heading.id}>
                              <a
                                href={`#${heading.id}`}
                                className="line-clamp-2 rounded-md py-1 text-xs transition hover:text-[var(--color-fdi-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]"
                              >
                                {heading.title}
                              </a>
                            </li>
                          ))}
                        </ol>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-[var(--color-fdi-text-secondary)]">Bài viết ngắn</p>
              )}
            </div>
          </aside>

          <main className="min-w-0">
            {normalizeContentBlocks(post.contentBlocks).length > 0 ? (
              <ContentBlocksRenderer blocks={post.contentBlocks} fallbackMarkdown={post.content} />
            ) : (
              <section
                id="article-content"
                className="scroll-mt-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.55)] sm:p-8"
              >
                <SafeRichContent content={post.content} allowHtml className="text-[var(--color-fdi-text)]" />
              </section>
            )}
          </main>
        </div>
      </article>

      {relatedPosts.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-xl font-bold text-[var(--color-fdi-text)]">Bài viết liên quan</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedPosts.map((item) => (
              <Link
                key={item.id}
                href={`/chia-se/${item.slug}`}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="rounded-full bg-[var(--color-fdi-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--color-fdi-primary)]">
                  {item.category}
                </span>
                <h3 className="mt-3 line-clamp-2 text-base font-bold text-[var(--color-fdi-text)]">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--color-fdi-text-secondary)]">{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
