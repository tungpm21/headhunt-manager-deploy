import { notFound } from "next/navigation";
import { getBlogPostById } from "@/lib/blog-actions";
import { BlogPostForm } from "@/components/blog/BlogPostForm";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function EditBlogPostPage({ params }: PageProps) {
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
                content: post.content,
                category: post.category,
                emoji: post.emoji,
                isPublished: post.isPublished,
                sortOrder: post.sortOrder,
            }}
        />
    );
}
