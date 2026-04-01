import path from "path";
import { writeFile, mkdir, unlink } from "fs/promises";

const HAS_BLOB_TOKEN = !!process.env.BLOB_READ_WRITE_TOKEN;

type UploadResult = { url: string };

/**
 * Upload a file to Vercel Blob (production) or local filesystem (dev).
 * Auto-detects based on BLOB_READ_WRITE_TOKEN presence.
 */
export async function uploadFile(
  folder: string,
  fileName: string,
  file: File | Blob
): Promise<UploadResult> {
  if (HAS_BLOB_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${folder}/${fileName}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return { url: blob.url };
  }

  // Local fallback: save to public/uploads/
  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(uploadsDir, fileName);
  await writeFile(filePath, buffer);

  return { url: `/uploads/${folder}/${fileName}` };
}

/**
 * Delete a previously uploaded file.
 */
export async function deleteFile(url: string): Promise<void> {
  if (!url) return;

  if (url.includes("vercel-storage.com")) {
    try {
      const { del } = await import("@vercel/blob");
      await del(url);
    } catch (e) {
      console.error("Could not delete blob:", e);
    }
    return;
  }

  // Local file: /uploads/cvs/filename.pdf → public/uploads/cvs/filename.pdf
  if (url.startsWith("/uploads/")) {
    try {
      const filePath = path.join(process.cwd(), "public", url);
      await unlink(filePath);
    } catch (e) {
      console.error("Could not delete local file:", e);
    }
  }
}
