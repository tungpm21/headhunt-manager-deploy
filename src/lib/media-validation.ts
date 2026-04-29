export const MEDIA_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MEDIA_IMAGE_ACCEPT = MEDIA_IMAGE_MIME_TYPES.join(",");

export type MediaImageMimeType = (typeof MEDIA_IMAGE_MIME_TYPES)[number];

export type MediaUploadKind =
  | "profileLogo"
  | "profileCover"
  | "contentInline"
  | "contentCover"
  | "jobCover";

export const MEDIA_UPLOAD_LIMITS: Record<MediaUploadKind, number> = {
  profileLogo: 2 * 1024 * 1024,
  profileCover: 5 * 1024 * 1024,
  contentInline: 3 * 1024 * 1024,
  contentCover: 5 * 1024 * 1024,
  jobCover: 5 * 1024 * 1024,
};

const MEDIA_IMAGE_EXTENSIONS: Record<MediaImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MEDIA_KIND_LABELS: Record<MediaUploadKind, string> = {
  profileLogo: "logo",
  profileCover: "ảnh bìa công ty",
  contentInline: "ảnh nội dung",
  contentCover: "ảnh cover",
  jobCover: "ảnh cover tin tuyển dụng",
};

function isSupportedImageType(type: string): type is MediaImageMimeType {
  return MEDIA_IMAGE_MIME_TYPES.includes(type as MediaImageMimeType);
}

export function getMediaUploadLimit(kind: MediaUploadKind) {
  return MEDIA_UPLOAD_LIMITS[kind];
}

export function formatMediaUploadLimit(kind: MediaUploadKind) {
  return `${Math.round(getMediaUploadLimit(kind) / 1024 / 1024)}MB`;
}

export function getMediaFileExtension(type: string) {
  return isSupportedImageType(type) ? MEDIA_IMAGE_EXTENSIONS[type] : "tmp";
}

export function validateMediaImageFile(
  file: Pick<File, "type" | "size">,
  kind: MediaUploadKind
): string | null {
  if (!isSupportedImageType(file.type)) {
    return "Chỉ chấp nhận file JPG, PNG hoặc WebP.";
  }

  const maxBytes = getMediaUploadLimit(kind);
  if (file.size > maxBytes) {
    return `${MEDIA_KIND_LABELS[kind]} quá lớn. Tối đa ${formatMediaUploadLimit(kind)}.`;
  }

  return null;
}
