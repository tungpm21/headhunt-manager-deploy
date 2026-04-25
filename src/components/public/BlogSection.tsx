import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { getLatestBlogPosts } from "@/lib/blog-actions";
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

export async function BlogSection() {
  let blogPosts: BlogPost[];

  try {
    blogPosts = await getLatestBlogPosts(3);
  } catch (error) {
    console.error("BlogSection load failed:", error);
    return null;
  }

  if (blogPosts.length === 0) return null;

  return (
    <section className="bg-[#FAF6EF] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2
              className="text-2xl font-bold text-[var(--color-fdi-text)] sm:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Thông tin chia sẻ
            </h2>
            <p className="mt-1 text-[var(--color-fdi-text-secondary)]">
              Bài viết hữu ích cho ứng viên và nhà tuyển dụng
            </p>
          </div>
          <Link
            href="/chia-se"
            className="hidden min-h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-[var(--color-fdi-primary)] transition-colors hover:text-[var(--color-fdi-primary-hover)] sm:flex cursor-pointer"
          >
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post: BlogPost) => {
            const PostIcon = getPostIcon(post.category);

            return (
              <Link
                key={post.id}
                href={`/chia-se/${post.slug}`}
                className="group overflow-hidden rounded-2xl border border-[#E4DCD0] bg-[#FFFEFA] shadow-[0_18px_42px_-34px_rgba(17,24,39,0.45)] transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#D3C7B7] hover:bg-white hover:shadow-[0_26px_54px_-36px_rgba(17,24,39,0.55)] cursor-pointer"
              >
                <div className="relative flex aspect-[16/8.5] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#F5FAFB_0%,#EEF7FA_54%,#FFF1E7_100%)]">
                  <div className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/[0.82] px-3 py-1 text-[11px] font-semibold uppercase text-[var(--color-fdi-primary)] shadow-sm">
                    {post.category}
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 bg-white shadow-[0_18px_36px_-24px_rgba(17,24,39,0.65)]">
                    <PostIcon className="h-7 w-7 text-[var(--color-fdi-primary)]" aria-hidden="true" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-[#E8F5F7] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--color-fdi-primary)]">
                      {post.category}
                    </span>
                    <span className="text-xs text-[var(--color-fdi-text-secondary)]">
                      {dateFormatter.format(new Date(post.createdAt))}
                    </span>
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-base font-semibold text-[var(--color-fdi-text)] transition-colors group-hover:text-[var(--color-fdi-primary)]">
                    {post.title}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-[var(--color-fdi-text-secondary)]">
                    {post.excerpt}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-fdi-primary)]">
                    Đọc thêm
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/chia-se"
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-[var(--color-fdi-primary)] cursor-pointer"
          >
            Xem tất cả bài viết <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
