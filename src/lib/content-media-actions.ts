"use server";

import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/authz";
import { uploadFile } from "@/lib/storage";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const CONTEXT_FOLDERS: Record<string, string> = {
  blog: "content/blog",
  company: "content/company",
  job: "content/job",
};

type UploadResult =
  | { success: true; url: string; alt: string }
  | { success: false; error: string };

export async function uploadContentImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  const context = formData.get("context")?.toString() ?? "";
  const kind = formData.get("kind")?.toString() === "cover" ? "cover" : "inline";
  const alt = formData.get("alt")?.toString().trim() ?? "";

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Vui long chon file anh." };
  }
  if (!alt) {
    return { success: false, error: "Vui long nhap alt text cho anh." };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: "Chi chap nhan JPG, PNG hoac WebP." };
  }

  const maxBytes = kind === "cover" ? 5 * 1024 * 1024 : 3 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      success: false,
      error: `File qua lon. Toi da ${Math.round(maxBytes / 1024 / 1024)}MB.`,
    };
  }

  const folder = CONTEXT_FOLDERS[context] ?? "content/misc";
  const extension = EXTENSION_MAP[file.type] ?? "tmp";
  const fileName = `${kind}-${Date.now()}-${randomUUID()}.${extension}`;
  const result = await uploadFile(folder, fileName, file);

  return { success: true, url: result.url, alt };
}
