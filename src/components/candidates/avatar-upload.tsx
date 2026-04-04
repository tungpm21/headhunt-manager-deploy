"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, X } from "lucide-react";

interface AvatarUploadProps {
  candidateId?: number;
  currentAvatarUrl?: string | null;
  disabled?: boolean;
}

export function AvatarUpload({
  candidateId,
  currentAvatarUrl,
  disabled = false,
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    currentAvatarUrl || null
  );
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File qua lon. Toi da 5MB.");
      return;
    }

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    if (candidateId) {
      formData.append("candidateId", String(candidateId));
    }

    try {
      const response = await fetch("/api/candidates/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Loi upload anh.");
      }

      setAvatarUrl(data.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "\u0110\u00e3 c\u00f3 l\u1ed7i x\u1ea3y ra."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setAvatarUrl(null);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <input type="hidden" name="avatarUrl" value={avatarUrl || ""} />

      <div className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-surface">
        {avatarUrl ? (
          <>
            <Image
              src={avatarUrl}
              alt="Avatar"
              fill
              className="object-cover"
              sizes="96px"
              unoptimized
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 text-white transition hover:text-primary"
                  title="Đổi ảnh"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-muted">
            <Camera className="mb-1 h-8 w-8 opacity-50" />
            <span className="text-[10px] font-medium uppercase">Avatar</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="text-center">
        {!disabled && (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs font-medium text-primary transition hover:text-primary-hover"
            >
              {avatarUrl ? "Đổi ảnh" : "Tải ảnh lên"}
            </button>
            {avatarUrl && (
              <>
                <span className="text-muted/30">|</span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center text-xs font-medium text-danger transition hover:text-danger/80"
                >
                  <X className="mr-0.5 h-3 w-3" />
                  Xoa
                </button>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {error && (
          <p className="mt-1.5 max-w-[200px] text-xs leading-tight text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
