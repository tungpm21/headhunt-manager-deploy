import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { requireAdmin } from "@/lib/authz";

export default async function NewBlogPostPage() {
    await requireAdmin();
    return <BlogPostForm />;
}
