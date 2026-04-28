"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Code2,
  Eye,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  PencilLine,
  Quote,
} from "lucide-react";
import { MediaUploadButton } from "./MediaUploadButton";
import { SafeRichContent } from "./SafeRichContent";

type MarkdownEditorProps = {
  name?: string;
  label?: string;
  value?: string;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  required?: boolean;
  rows?: number;
  uploadContext?: "blog" | "company" | "job";
  maxImages?: number;
  usedImages?: number;
};

type EditorMode = "edit" | "preview";
type ToolbarCommand =
  | "heading2"
  | "heading3"
  | "bold"
  | "italic"
  | "bullet"
  | "numbered"
  | "quote"
  | "link"
  | "code"
  | "divider";

const toolbarButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted transition hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25";

const tabButtonClass =
  "inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/25";

function countMarkdownImages(value: string) {
  return value.match(/!\[[^\]]*]\([^)]+\)/g)?.length ?? 0;
}

const toolbarItems: Array<{
  label: string;
  icon: typeof Heading2;
  command: ToolbarCommand;
}> = [
  { label: "Heading 2", icon: Heading2, command: "heading2" },
  { label: "Heading 3", icon: Heading3, command: "heading3" },
  { label: "In đậm", icon: Bold, command: "bold" },
  { label: "In nghiêng", icon: Italic, command: "italic" },
  { label: "Danh sách", icon: List, command: "bullet" },
  { label: "Danh sách số", icon: ListOrdered, command: "numbered" },
  { label: "Trích dẫn", icon: Quote, command: "quote" },
  { label: "Liên kết", icon: LinkIcon, command: "link" },
  { label: "Code", icon: Code2, command: "code" },
  { label: "Đường kẻ", icon: Minus, command: "divider" },
];

export function MarkdownEditor({
  name,
  label,
  value,
  defaultValue = "",
  onChange,
  required = false,
  rows = 10,
  uploadContext = "blog",
  maxImages = 3,
  usedImages = 0,
}: MarkdownEditorProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [mode, setMode] = useState<EditorMode>("edit");
  const [imageAlt, setImageAlt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isControlled = value !== undefined;
  const editorValue = isControlled ? value : internalValue;

  const inlineImageCount = countMarkdownImages(editorValue);
  const totalImageCount = usedImages + inlineImageCount;
  const canUploadImage = totalImageCount < maxImages;

  function setEditorValue(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  }

  function focusEditor(start: number, end = start) {
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start, end);
    });
  }

  function replaceRange(start: number, end: number, replacement: string, selectionStart = start, selectionEnd = start + replacement.length) {
    const nextValue = `${editorValue.slice(0, start)}${replacement}${editorValue.slice(end)}`;
    setEditorValue(nextValue);
    focusEditor(selectionStart, selectionEnd);
  }

  function insertMarkdown(before: string, after = "", placeholder = "") {
    const textarea = textareaRef.current;

    if (!textarea) {
      setEditorValue(`${editorValue}${before}${placeholder}${after}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = editorValue.slice(start, end) || placeholder;
    replaceRange(start, end, `${before}${selected}${after}`, start + before.length, start + before.length + selected.length);
  }

  function stripBlockSyntax(line: string) {
    let nextLine = line.trimStart();
    let previousLine = "";

    while (nextLine !== previousLine) {
      previousLine = nextLine;
      nextLine = nextLine
        .replace(/^#{1,6}\s+/, "")
        .replace(/^>\s?/, "")
        .replace(/^[-*+]\s+/, "")
        .replace(/^\d+[.)]\s+/, "");
    }

    return nextLine.trimStart();
  }

  function insertStandaloneBlock(markdown: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      const prefix = editorValue.trim() ? "\n\n" : "";
      setEditorValue(`${editorValue}${prefix}${markdown}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeSelection = editorValue.slice(0, start);
    const afterSelection = editorValue.slice(end);
    const prefix = beforeSelection.trim() && !beforeSelection.endsWith("\n\n") ? (beforeSelection.endsWith("\n") ? "\n" : "\n\n") : "";
    const suffix = afterSelection && !afterSelection.startsWith("\n") ? "\n\n" : "";
    const replacement = `${prefix}${markdown}${suffix}`;

    replaceRange(start, end, replacement, start + prefix.length, start + prefix.length + markdown.length);
  }

  function formatSelectedLines(command: Extract<ToolbarCommand, "heading2" | "heading3" | "bullet" | "numbered" | "quote">) {
    const textarea = textareaRef.current;

    if (!textarea || textarea.selectionStart === textarea.selectionEnd) {
      const fallbackByCommand = {
        heading2: "## Tiêu đề",
        heading3: "### Tiêu đề nhỏ",
        bullet: "- Gạch đầu dòng",
        numbered: "1. Mục đầu tiên",
        quote: "> Trích dẫn nổi bật",
      };

      insertStandaloneBlock(fallbackByCommand[command]);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const rangeStart = editorValue.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const adjustedEnd = end > start && editorValue[end - 1] === "\n" ? end - 1 : end;
    const nextLineBreak = editorValue.indexOf("\n", adjustedEnd);
    const rangeEnd = nextLineBreak === -1 ? editorValue.length : nextLineBreak;
    const selectedLines = editorValue.slice(rangeStart, rangeEnd).split("\n");
    let numberIndex = 1;

    const replacement = selectedLines
      .map((line) => {
        if (!line.trim()) return "";

        const text = stripBlockSyntax(line);
        if (!text) return "";

        if (command === "heading2") return `## ${text}`;
        if (command === "heading3") return `### ${text}`;
        if (command === "bullet") return `- ${text}`;
        if (command === "numbered") return `${numberIndex++}. ${text}`;
        return `> ${text}`;
      })
      .join("\n");

    replaceRange(rangeStart, rangeEnd, replacement, rangeStart, rangeStart + replacement.length);
  }

  function runToolbarCommand(command: ToolbarCommand) {
    if (command === "heading2") formatSelectedLines("heading2");
    if (command === "heading3") formatSelectedLines("heading3");
    if (command === "bold") insertMarkdown("**", "**", "in đậm");
    if (command === "italic") insertMarkdown("_", "_", "nghiêng");
    if (command === "bullet") formatSelectedLines("bullet");
    if (command === "numbered") formatSelectedLines("numbered");
    if (command === "quote") formatSelectedLines("quote");
    if (command === "link") insertMarkdown("[", "](https://)", "liên kết");
    if (command === "code") insertMarkdown("`", "`", "code");
    if (command === "divider") insertStandaloneBlock("---");
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      {name && mode === "preview" ? <input type="hidden" name={name} value={editorValue} /> : null}

      <div className="border-b border-border bg-white p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {label ? (
            <label htmlFor={name} className="text-sm font-semibold text-foreground">
              {label} {required ? <span className="text-red-500">*</span> : null}
            </label>
          ) : (
            <p className="text-sm font-semibold text-foreground">Markdown</p>
          )}

          <div className="inline-flex w-fit rounded-xl bg-surface p-1">
            <button
              type="button"
              className={`${tabButtonClass} ${
                mode === "edit" ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
              }`}
              onClick={() => setMode("edit")}
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              className={`${tabButtonClass} ${
                mode === "preview" ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
              }`}
              onClick={() => setMode("preview")}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
          </div>
        </div>

        {mode === "edit" ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {toolbarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  className={toolbarButtonClass}
                  onClick={() => runToolbarCommand(item.command)}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}

            <span className="mx-1 hidden h-7 w-px bg-border sm:block" aria-hidden="true" />

            <div className="flex min-w-[220px] flex-1 flex-wrap items-center gap-2">
              <input
                value={imageAlt}
                onChange={(event) => setImageAlt(event.target.value)}
                placeholder="Alt text ảnh"
                className="min-h-9 min-w-[180px] flex-1 rounded-lg border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                aria-label="Alt text ảnh"
              />
              <MediaUploadButton
                context={uploadContext}
                alt={imageAlt}
                disabled={!canUploadImage}
                onUploaded={(image) => {
                  insertMarkdown(`![${image.alt}](${image.url})`);
                  setImageAlt("");
                }}
                label="Ảnh"
              />
              <span className="text-xs text-muted">
                {totalImageCount}/{maxImages} ảnh
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {mode === "edit" ? (
        <textarea
          ref={textareaRef}
          id={name}
          name={name}
          rows={rows}
          required={required}
          value={editorValue}
          onChange={(event) => setEditorValue(event.target.value)}
          className="min-h-[260px] w-full resize-y border-0 bg-background px-4 py-4 font-mono text-sm leading-7 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/30"
          placeholder="Viết bằng Markdown: ## tiêu đề, - bullet, **in đậm**, ![alt](url)..."
        />
      ) : (
        <div className="min-h-[260px] bg-background px-5 py-4">
          {editorValue.trim() ? (
            <SafeRichContent content={editorValue} className="text-sm text-[var(--color-fdi-text-secondary)]" />
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
              Nội dung preview sẽ hiển thị tại đây.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
