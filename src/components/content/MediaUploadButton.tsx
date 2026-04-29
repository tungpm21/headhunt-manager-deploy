"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadContentImage } from "@/lib/content-media-actions";
import { MEDIA_IMAGE_ACCEPT } from "@/lib/media-validation";

type MediaUploadButtonProps = {
  context: "blog" | "company" | "job";
  kind?: "cover" | "inline";
  alt: string;
  onUploaded: (image: { url: string; alt: string }) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
};

export function MediaUploadButton({
  context,
  kind = "inline",
  alt,
  onUploaded,
  disabled = false,
  label = "Tải ảnh",
  className = "",
}: MediaUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("context", context);
      formData.set("kind", kind);
      formData.set("alt", alt);

      const result = await uploadContentImage(formData);
      if (!result.success) {
        setError(result.error);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      onUploaded({ url: result.url, alt: result.alt });
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  const isDisabled = disabled || isPending || !alt.trim();

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        accept={MEDIA_IMAGE_ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => inputRef.current?.click()}
        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        title={!alt.trim() ? "Nhập alt text trước khi upload ảnh" : undefined}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {isPending ? "Đang tải..." : label}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
