"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  disabled?: boolean;
}

export function AvatarUpload({ currentAvatarUrl, disabled = false }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File quá lớn. Tối đa 5MB.");
      return;
    }

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/candidates/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Lỗi upload ảnh.");
      }

      setAvatarUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setAvatarUrl(null);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Hidden Input field for Server Action Context */}
      <input type="hidden" name="avatarUrl" value={avatarUrl || ""} />
      
      {/* Avatar Display */}
      <div className="relative h-24 w-24 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-surface overflow-hidden group">
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
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-white hover:text-primary transition p-1"
                  title="Đổi ảnh"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-muted">
            <Camera className="h-8 w-8 mb-1 opacity-50" />
            <span className="text-[10px] uppercase font-medium">Avatar</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Constraints & Errors */}
      <div className="text-center">
        {!disabled && (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs font-medium text-primary hover:text-primary-hover transition"
            >
              {avatarUrl ? "Đổi ảnh" : "Tải ảnh lên"}
            </button>
            {avatarUrl && (
              <>
                <span className="text-muted/30">|</span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs font-medium text-danger hover:text-danger/80 transition flex items-center"
                >
                  <X className="h-3 w-3 mr-0.5" /> Xóa
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
        {error && <p className="text-xs text-danger mt-1.5 max-w-[200px] leading-tight">{error}</p>}
      </div>
    </div>
  );
}
