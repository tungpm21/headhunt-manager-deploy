import { notFound } from "next/navigation";
import { getBlogPostById } from "@/lib/blog-actions";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { normalizeContentBlocks } from "@/lib/content-blocks";
import { requireAdmin } from "@/lib/authz";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function EditBlogPostPage({ params }: PageProps) {
    await requireAdmin();
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (Number.isNaN(postId)) notFound();

    const post = await getBlogPostById(postId);
    if (!post) notFound();

    return (
        <BlogPostForm
            post={{
                id: post.id,
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                coverImage: post.coverImage,
                coverAlt: post.coverAlt,
                content: post.content,
                contentBlocks: normalizeContentBlocks(post.contentBlocks),
                category: post.category,
                emoji: post.emoji,
                isPublished: post.isPublished,
                sortOrder: post.sortOrder,
            }}
        />
    );
}
