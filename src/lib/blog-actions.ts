"use server";

import { cache } from "react";
import { revalidatePath, unstable_cache } from "next/cache";
import {
  contentBlocksToPlainText,
  normalizeContentBlocks,
} from "@/lib/content-blocks";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseBlogPostInput(formData: FormData) {
  const contentBlocks = normalizeContentBlocks(formData.get("contentBlocks")?.toString() ?? "[]");
  const blocksText = contentBlocksToPlainText(contentBlocks);
  const coverImage = formData.get("coverImage")?.toString().trim() || null;

  return {
    title: formData.get("title")?.toString().trim() || "",
    excerpt: formData.get("excerpt")?.toString().trim() || "",
    content: formData.get("content")?.toString().trim() || blocksText,
    contentBlocks,
    coverImage,
    coverAlt: coverImage ? formData.get("coverAlt")?.toString().trim() || null : null,
    category: formData.get("category")?.toString().trim() || "Chia sẻ",
    emoji: formData.get("emoji")?.toString().trim() || "📝",
    isPublished: formData.get("isPublished") === "true",
    sortOrder: Number.parseInt(formData.get("sortOrder")?.toString() || "0", 10) || 0,
  };
}

function validateBlogPostInput(input: ReturnType<typeof parseBlogPostInput>) {
  if (!input.title) return "Tiêu đề không được để trống.";
  if (!input.excerpt) return "Mô tả ngắn không được để trống.";
  if (!input.content && input.contentBlocks.length === 0) return "Nội dung không được để trống.";
  if (input.coverImage && !input.coverAlt) return "Vui lòng nhập alt text cho ảnh cover.";
  return null;
}

function toContentBlocksJson(blocks: ReturnType<typeof normalizeContentBlocks>) {
  return blocks.length ? JSON.parse(JSON.stringify(blocks)) : null;
}

function revalidateBlogSurfaces(slug?: string | null) {
  revalidatePath("/blog");
  revalidatePath("/chia-se");
  if (slug) revalidatePath(`/chia-se/${slug}`);
  revalidatePath("/");
}

export async function getBlogPosts(page = 1) {
  await requireAdmin();
  const take = 20;
  const skip = (page - 1) * take;

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: { sortOrder: "asc" },
      skip,
      take,
    }),
    prisma.blogPost.count(),
  ]);

  return { posts, total, page, totalPages: Math.ceil(total / take) };
}

export async function getBlogPostById(id: number) {
  await requireAdmin();
  return prisma.blogPost.findUnique({ where: { id } });
}

export async function createBlogPost(formData: FormData) {
  await requireAdmin();

  const input = parseBlogPostInput(formData);
  const error = validateBlogPostInput(input);
  if (error) return { error };

  let slug = formData.get("slug")?.toString().trim() || slugify(input.title);
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const post = await prisma.blogPost.create({
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      coverImage: input.coverImage,
      coverAlt: input.coverAlt,
      content: input.content,
      contentBlocks: toContentBlocksJson(input.contentBlocks),
      category: input.category,
      emoji: input.emoji,
      isPublished: input.isPublished,
      sortOrder: input.sortOrder,
    },
  });

  revalidateBlogSurfaces(slug);
  return { success: true, id: post.id };
}

export async function updateBlogPost(id: number, formData: FormData) {
  await requireAdmin();

  const input = parseBlogPostInput(formData);
  const error = validateBlogPostInput(input);
  if (error) return { error };

  let slug = formData.get("slug")?.toString().trim() || slugify(input.title);
  const [existing, oldPost] = await Promise.all([
    prisma.blogPost.findUnique({ where: { slug } }),
    prisma.blogPost.findUnique({ where: { id }, select: { slug: true } }),
  ]);
  if (existing && existing.id !== id) {
    slug = `${slug}-${Date.now()}`;
  }

  await prisma.blogPost.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      coverImage: input.coverImage,
      coverAlt: input.coverAlt,
      content: input.content,
      contentBlocks: toContentBlocksJson(input.contentBlocks),
      category: input.category,
      emoji: input.emoji,
      isPublished: input.isPublished,
      sortOrder: input.sortOrder,
    },
  });

  revalidateBlogSurfaces(slug);
  if (oldPost?.slug && oldPost.slug !== slug) {
    revalidatePath(`/chia-se/${oldPost.slug}`);
  }
  return { success: true };
}

export async function deleteBlogPost(id: number) {
  await requireAdmin();

  const post = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true } });
  await prisma.blogPost.delete({ where: { id } });
  revalidateBlogSurfaces(post?.slug);
  return { success: true };
}

export async function reorderBlogPosts(orderedIds: number[]) {
  await requireAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.blogPost.update({ where: { id }, data: { sortOrder: index } })
    )
  );

  revalidateBlogSurfaces();
  return { success: true };
}

export async function getPublishedBlogPosts() {
  return prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
}

const getCachedPublishedBlogPostBySlug = cache(async (slug: string) => {
  return prisma.blogPost.findFirst({
    where: { slug, isPublished: true },
  });
});

export async function getPublishedBlogPostBySlug(slug: string) {
  return getCachedPublishedBlogPostBySlug(slug);
}

const getCachedLatestBlogPosts = unstable_cache(
  async (take: number) =>
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take,
    }),
  ["latest-blog-posts"],
  { revalidate: 300 }
);

export async function getLatestBlogPosts(take = 3) {
  return getCachedLatestBlogPosts(take);
}
