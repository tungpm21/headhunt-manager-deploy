"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

// ─── Admin: List all blog posts ───
export async function getBlogPosts(page = 1) {
    await getCurrentUserId();
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

// ─── Admin: Get single post ───
export async function getBlogPostById(id: number) {
    await getCurrentUserId();
    return prisma.blogPost.findUnique({ where: { id } });
}

// ─── Admin: Create post ───
export async function createBlogPost(formData: FormData) {
    await getCurrentUserId();

    const title = formData.get("title")?.toString().trim() || "";
    const excerpt = formData.get("excerpt")?.toString().trim() || "";
    const content = formData.get("content")?.toString().trim() || "";
    const category = formData.get("category")?.toString().trim() || "Chia sẻ";
    const emoji = formData.get("emoji")?.toString().trim() || "📝";
    const isPublished = formData.get("isPublished") === "true";
    const sortOrder = parseInt(formData.get("sortOrder")?.toString() || "0") || 0;

    if (!title) return { error: "Tiêu đề không được để trống." };
    if (!excerpt) return { error: "Mô tả ngắn không được để trống." };
    if (!content) return { error: "Nội dung không được để trống." };

    let slug = formData.get("slug")?.toString().trim() || slugify(title);
    // Ensure unique slug
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
        slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.blogPost.create({
        data: { title, slug, excerpt, content, category, emoji, isPublished, sortOrder },
    });

    revalidatePath("/blog");
    revalidatePath("/chia-se");
    revalidatePath("/");
    return { success: true, id: post.id };
}

// ─── Admin: Update post ───
export async function updateBlogPost(id: number, formData: FormData) {
    await getCurrentUserId();

    const title = formData.get("title")?.toString().trim() || "";
    const excerpt = formData.get("excerpt")?.toString().trim() || "";
    const content = formData.get("content")?.toString().trim() || "";
    const category = formData.get("category")?.toString().trim() || "Chia sẻ";
    const emoji = formData.get("emoji")?.toString().trim() || "📝";
    const isPublished = formData.get("isPublished") === "true";
    const sortOrder = parseInt(formData.get("sortOrder")?.toString() || "0") || 0;

    if (!title) return { error: "Tiêu đề không được để trống." };
    if (!excerpt) return { error: "Mô tả ngắn không được để trống." };
    if (!content) return { error: "Nội dung không được để trống." };

    let slug = formData.get("slug")?.toString().trim() || slugify(title);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
        slug = `${slug}-${Date.now()}`;
    }

    await prisma.blogPost.update({
        where: { id },
        data: { title, slug, excerpt, content, category, emoji, isPublished, sortOrder },
    });

    revalidatePath("/blog");
    revalidatePath("/chia-se");
    revalidatePath("/");
    return { success: true };
}

// ─── Admin: Delete post ───
export async function deleteBlogPost(id: number) {
    await getCurrentUserId();

    await prisma.blogPost.delete({ where: { id } });

    revalidatePath("/blog");
    revalidatePath("/chia-se");
    revalidatePath("/");
    return { success: true };
}

// ─── Admin: Reorder posts ───
export async function reorderBlogPosts(orderedIds: number[]) {
    await getCurrentUserId();

    await prisma.$transaction(
        orderedIds.map((id, index) =>
            prisma.blogPost.update({ where: { id }, data: { sortOrder: index } })
        )
    );

    revalidatePath("/blog");
    revalidatePath("/chia-se");
    revalidatePath("/");
    return { success: true };
}

// ─── Public: Published posts ───
export async function getPublishedBlogPosts() {
    return prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
    });
}

// ─── Public: Latest N posts for homepage ───
export async function getLatestBlogPosts(take = 3) {
    return prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take,
    });
}
