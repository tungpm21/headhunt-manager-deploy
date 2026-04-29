"use server";

import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { requireEmployerSession } from "@/lib/employer-auth";
import {
  getMediaFileExtension,
  type MediaUploadKind,
  validateMediaImageFile,
} from "@/lib/media-validation";
import { uploadFile } from "@/lib/storage";

const CONTEXT_FOLDERS: Record<string, string> = {
  blog: "content/blog",
  company: "content/company",
  job: "content/job",
};

function getContentUploadKind(context: string, kind: "cover" | "inline"): MediaUploadKind {
  if (kind === "inline") return "contentInline";
  return context === "job" ? "jobCover" : "contentCover";
}

type UploadResult =
  | { success: true; url: string; alt: string }
  | { success: false; error: string };

async function requireContentUploadPermission() {
  const session = await auth();

  if (session?.user?.role === "ADMIN") {
    return;
  }

  await requireEmployerSession();
}

export async function uploadContentImage(formData: FormData): Promise<UploadResult> {
  await requireContentUploadPermission();

  const file = formData.get("file");
  const context = formData.get("context")?.toString() ?? "";
  const kind = formData.get("kind")?.toString() === "cover" ? "cover" : "inline";
  const alt = formData.get("alt")?.toString().trim() ?? "";

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Vui lòng chọn file ảnh." };
  }
  if (!alt) {
    return { success: false, error: "Vui lòng nhập alt text cho ảnh." };
  }
  const validationError = validateMediaImageFile(file, getContentUploadKind(context, kind));
  if (validationError) {
    return { success: false, error: validationError };
  }

  const folder = CONTEXT_FOLDERS[context] ?? "content/misc";
  const extension = getMediaFileExtension(file.type);
  const fileName = `${kind}-${Date.now()}-${randomUUID()}.${extension}`;
  const result = await uploadFile(folder, fileName, file);

  return { success: true, url: result.url, alt };
}
