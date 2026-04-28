import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { ContentBlocksRenderer } from "@/components/content/ContentBlocksRenderer";
import { SafeRichContent } from "@/components/content/SafeRichContent";
import { getLatestBlogPosts, getPublishedBlogPostBySlug } from "@/lib/blog-actions";
import { normalizeContentBlocks, stripMarkdown } from "@/lib/content-blocks";

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

function extractHeadings(blocks: unknown, fallback: string) {
  const markdown = normalizeContentBlocks(blocks)
    .map((block) => block.markdown ?? "")
    .join("\n\n") || fallback;

  return Array.from(markdown.matchAll(/^#{2,3}\s+(.+)$/gm))
    .map((match) => {
      const title = stripMarkdown(match[1] ?? "");
      return { title, id: createHeadingAnchor(title) };
    })
    .filter((heading) => heading.title && heading.id)
    .slice(0, 6);
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
  const headings = extractHeadings(post.contentBlocks, post.content);
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
              {headings.length > 0 ? (
                <ol className="mt-3 space-y-2 text-[var(--color-fdi-text-secondary)]">
                  {headings.map((heading, index) => (
                    <li key={`${heading.id}-${index}`}>
                      <a
                        href={`#${heading.id}`}
                        className="line-clamp-2 rounded-md transition hover:text-[var(--color-fdi-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]"
                      >
                        {heading.title}
                      </a>
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
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.55)] sm:p-8">
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
