"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Eye,
  Heading2,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { SafeRichContent } from "./SafeRichContent";
import { MediaUploadButton } from "./MediaUploadButton";

type MarkdownEditorProps = {
  name: string;
  label: string;
  defaultValue?: string | null;
  required?: boolean;
  rows?: number;
  uploadContext?: "blog" | "company" | "job";
  maxImages?: number;
};

const toolbarButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted transition hover:bg-surface hover:text-foreground";

export function MarkdownEditor({
  name,
  label,
  defaultValue = "",
  required = false,
  rows = 10,
  uploadContext = "blog",
  maxImages = 3,
}: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [showPreview, setShowPreview] = useState(true);
  const [imageAlt, setImageAlt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const imageCount = value.match(/!\[[^\]]*]\([^)]+\)/g)?.length ?? 0;
  const canUploadImage = imageCount < maxImages;

  function insertMarkdown(before: string, after = "", placeholder = "") {
    const textarea = textareaRef.current;
    if (!textarea) {
      setValue((current) => `${current}${before}${placeholder}${after}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const nextValue = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    setValue(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border pb-3 lg:flex-row lg:items-center lg:justify-between">
        {label ? (
          <label htmlFor={name} className="text-sm font-semibold text-foreground">
            {label} {required ? <span className="text-red-500">*</span> : null}
          </label>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={toolbarButtonClass} onClick={() => insertMarkdown("## ", "", "Tiêu đề")}>
            <Heading2 className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => insertMarkdown("**", "**", "in đậm")}>
            <Bold className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => insertMarkdown("_", "_", "nghiêng")}>
            <Italic className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => insertMarkdown("- ", "", "gạch đầu dòng")}>
            <List className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => insertMarkdown("1. ", "", "mục")}>
            <ListOrdered className="h-4 w-4" />
          </button>
          <button type="button" className={toolbarButtonClass} onClick={() => insertMarkdown("> ", "", "trích dẫn")}>
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => insertMarkdown("[", "](https://)", "liên kết")}
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-muted transition hover:bg-surface hover:text-foreground ${showPreview ? "bg-surface text-foreground" : ""}`}
            onClick={() => setShowPreview((current) => !current)}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>
      </div>

      <div className="grid gap-4 pt-4 lg:grid-cols-[minmax(0,1fr),minmax(280px,0.8fr)]">
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            id={name}
            name={name}
            rows={rows}
            required={required}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="min-h-[220px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Viết bằng Markdown: ## tiêu đề, - bullet, **in đậm**, ![alt](url)..."
          />

          <div className="rounded-xl border border-dashed border-border bg-surface/60 p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                value={imageAlt}
                onChange={(event) => setImageAlt(event.target.value)}
                placeholder="Alt text bắt buộc trước khi upload ảnh"
                className="min-h-10 rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
              <MediaUploadButton
                context={uploadContext}
                alt={imageAlt}
                disabled={!canUploadImage}
                onUploaded={(image) => {
                  insertMarkdown(`![${image.alt}](${image.url})`);
                  setImageAlt("");
                }}
                label="Chèn ảnh"
              />
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted">
              <ImagePlus className="h-3.5 w-3.5" />
              Đã dùng {imageCount}/{maxImages} ảnh inline.
            </p>
          </div>
        </div>

        {showPreview ? (
          <div className="min-h-[220px] rounded-xl border border-border bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Live preview</p>
            {value.trim() ? (
              <SafeRichContent content={value} className="text-sm text-[var(--color-fdi-text-secondary)]" />
            ) : (
              <p className="text-sm text-muted">Nội dung preview sẽ hiển thị tại đây.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
