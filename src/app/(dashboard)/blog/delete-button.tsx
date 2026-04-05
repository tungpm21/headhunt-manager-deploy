"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteBlogPost } from "@/lib/blog-actions";
import { useRouter } from "next/navigation";

export function DeleteBlogButton({ postId, postTitle }: { postId: number; postTitle: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!confirm(`Xóa bài viết "${postTitle}"?`)) return;
        setIsDeleting(true);
        try {
            await deleteBlogPost(postId);
            router.refresh();
        } catch {
            alert("Không thể xóa bài viết.");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
            title="Xóa"
        >
            {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 text-red-500 animate-spin" />
            ) : (
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
            )}
        </button>
    );
}
