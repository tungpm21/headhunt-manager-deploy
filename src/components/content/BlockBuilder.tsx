"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Image as ImageIcon,
  Images,
  Link as LinkIcon,
  MessageSquareQuote,
  Plus,
  Sparkles,
  Trash2,
  Type,
  Video,
} from "lucide-react";
import {
  countBlockImages,
  createContentBlockId,
  normalizeContentBlocks,
  type CompanyProfileTheme,
  type ContentBenefit,
  type ContentBlock,
  type ContentBlockType,
  type ContentImage,
  type ContentStat,
} from "@/lib/content-blocks";
import { ContentBlocksRenderer } from "./ContentBlocksRenderer";
import { MarkdownEditor } from "./MarkdownEditor";
import { MediaUploadButton } from "./MediaUploadButton";

type BlockBuilderProps = {
  name: string;
  initialBlocks?: unknown;
  context: "blog" | "company";
  title: string;
  description?: string;
  maxImages?: number;
  allowHtml?: boolean;
  allowGallery?: boolean;
  allowVideo?: boolean;
  previewTheme?: CompanyProfileTheme;
};

const typeLabels: Record<ContentBlockType, string> = {
  richText: "Rich text",
  image: "Ảnh",
  gallery: "Gallery",
  quote: "Quote",
  stats: "Chỉ số",
  benefits: "Phúc lợi",
  video: "Video",
  html: "HTML",
  cta: "CTA",
};

const typeIcons: Record<ContentBlockType, ComponentType<{ className?: string }>> = {
  richText: Type,
  image: ImageIcon,
  gallery: Images,
  quote: MessageSquareQuote,
  stats: BarChart3,
  benefits: Sparkles,
  video: Video,
  html: Type,
  cta: LinkIcon,
};

const inputClass =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";
const smallButtonClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-white px-3 text-xs font-semibold text-foreground transition hover:bg-surface";

function countMarkdownImages(value: string) {
  return value.match(/!\[[^\]]*]\([^)]+\)/g)?.length ?? 0;
}

function createDefaultBlock(type: ContentBlockType): ContentBlock {
  const id = createContentBlockId(type);

  if (type === "stats") {
    return {
      id,
      type,
      title: "Những con số nổi bật",
      stats: [
        { value: "10+", label: "năm phát triển" },
        { value: "1.000+", label: "nhân sự" },
        { value: "20+", label: "vị trí đang tuyển" },
      ],
    };
  }

  if (type === "benefits") {
    return {
      id,
      type,
      title: "Môi trường & phúc lợi",
      benefits: [
        { icon: "✓", title: "Đào tạo chuyên môn", description: "Lộ trình phát triển rõ ràng." },
      ],
    };
  }

  if (type === "quote") return { id, type, quote: "Một câu nói nổi bật về văn hóa công ty." };
  if (type === "cta") return { id, type, title: "Sẵn sàng ứng tuyển?", label: "Xem vị trí đang tuyển", href: "#jobs" };
  if (type === "image") return { id, type, alt: "", url: "", caption: "" };
  if (type === "gallery") return { id, type, title: "Hình ảnh công ty", images: [] };
  if (type === "video") return { id, type, title: "Video giới thiệu", url: "" };
  if (type === "html") return { id, type, title: "Nội dung tùy chỉnh", html: "<p>Nhập HTML an toàn tại đây.</p>" };
  return { id, type, title: "Nội dung", markdown: "## Tiêu đề\n\nViết nội dung bằng Markdown tại đây." };
}

export function BlockBuilder({
  name,
  initialBlocks,
  context,
  title,
  description,
  maxImages = 8,
  allowHtml = false,
  allowGallery = true,
  allowVideo = true,
  previewTheme,
}: BlockBuilderProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => normalizeContentBlocks(initialBlocks));
  const [selectedId, setSelectedId] = useState<string | null>(() => blocks[0]?.id ?? null);
  const imageCount = countBlockImages(blocks);
  const selectedBlock = blocks.find((block) => block.id === selectedId) ?? blocks[0] ?? null;
  const serializedBlocks = useMemo(() => JSON.stringify(blocks), [blocks]);

  const mediaTypes: ContentBlockType[] = [
    "image",
    ...(allowGallery ? ["gallery" as const] : []),
    ...(allowVideo ? ["video" as const] : []),
  ];
  const availableTypes: ContentBlockType[] = context === "company"
    ? ["richText", "stats", "benefits", ...mediaTypes, "quote", "cta", ...(allowHtml ? ["html" as const] : [])]
    : ["richText", ...mediaTypes, "quote", "cta", ...(allowHtml ? ["html" as const] : [])];

  function addBlock(type: ContentBlockType) {
    const block = createDefaultBlock(type);
    setBlocks((current) => [...current, block]);
    setSelectedId(block.id);
  }

  function updateBlock(id: string, patch: Partial<ContentBlock>) {
    setBlocks((current) => current.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  }

  function removeBlock(id: string) {
    setBlocks((current) => {
      const next = current.filter((block) => block.id !== id);
      setSelectedId(next[0]?.id ?? null);
      return next;
    });
  }

  function moveBlock(id: string, direction: -1 | 1) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;

      const next = current.slice();
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm">
      <input type="hidden" name={name} value={serializedBlocks} />

      <div className="border-b border-border p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          <p className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
            {imageCount}/{maxImages} ảnh
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {availableTypes.map((type) => {
            const Icon = typeIcons[type];
            return (
              <button
                key={type}
                type="button"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-surface"
                onClick={() => addBlock(type)}
              >
                <Icon className="h-4 w-4 text-primary" />
                {typeLabels[type]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid min-h-[520px] xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="border-b border-border p-4 xl:border-b-0 xl:border-r">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Sections</p>
          {blocks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
              Thêm block đầu tiên để bắt đầu.
            </div>
          ) : (
            <div className="space-y-2">
              {blocks.map((block, index) => {
                const Icon = typeIcons[block.type];
                const isSelected = selectedBlock?.id === block.id;
                return (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => setSelectedId(block.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-white text-foreground hover:bg-surface"
                    }`}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {block.title || typeLabels[block.type]}
                      </span>
                      <span className="text-xs text-muted">#{index + 1} · {typeLabels[block.type]}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-b border-border p-5 xl:border-b-0">
          {selectedBlock ? (
            <BlockEditor
              block={selectedBlock}
              context={context}
              maxImages={maxImages}
              imageCount={imageCount}
              updateBlock={updateBlock}
              removeBlock={removeBlock}
              moveBlock={moveBlock}
            />
          ) : (
            <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted">
              Chưa có block nào.
            </div>
          )}
        </div>

        <div className="border-t border-border bg-surface/50 p-5 xl:col-span-2">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Live preview</p>
            <p className="text-xs text-muted">Preview full-width, scroll riêng để xem layout public rõ hơn.</p>
          </div>
          <div className="max-h-[760px] min-h-[360px] overflow-auto rounded-2xl border border-border bg-surface p-5">
            <ContentBlocksRenderer blocks={blocks} theme={previewTheme} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockEditor({
  block,
  context,
  maxImages,
  imageCount,
  updateBlock,
  removeBlock,
  moveBlock,
}: {
  block: ContentBlock;
  context: "blog" | "company";
  maxImages: number;
  imageCount: number;
  updateBlock: (id: string, patch: Partial<ContentBlock>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, direction: -1 | 1) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{typeLabels[block.type]}</p>
          <h4 className="mt-1 text-lg font-bold text-foreground">{block.title || "Block chưa đặt tên"}</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={smallButtonClass} onClick={() => moveBlock(block.id, -1)}>
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" className={smallButtonClass} onClick={() => moveBlock(block.id, 1)}>
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            onClick={() => removeBlock(block.id)}
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <label className="space-y-1">
          <span className="text-sm font-semibold text-foreground">Tiêu đề section</span>
          <input
            value={block.title ?? ""}
            onChange={(event) => updateBlock(block.id, { title: event.target.value })}
            className={inputClass}
          />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-foreground">
          <input
            type="checkbox"
            checked={block.enabled !== false}
            onChange={(event) => updateBlock(block.id, { enabled: event.target.checked })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
          />
          Hiển thị
        </label>
      </div>

      {block.type === "richText" ? (
        <MarkdownEditor
          label="Markdown"
          value={block.markdown ?? ""}
          onChange={(markdown) => updateBlock(block.id, { markdown })}
          rows={12}
          uploadContext={context}
          maxImages={maxImages}
          usedImages={Math.max(0, imageCount - countMarkdownImages(block.markdown ?? ""))}
        />
      ) : null}

      {block.type === "html" ? (
        <label className="space-y-1">
          <span className="text-sm font-semibold text-foreground">HTML an toàn</span>
          <textarea
            value={block.html ?? ""}
            onChange={(event) => updateBlock(block.id, { html: event.target.value })}
            rows={12}
            className={`${inputClass} min-h-[260px] font-mono`}
          />
          <span className="text-xs text-muted">Script, style inline và URL không an toàn sẽ bị chặn khi render.</span>
        </label>
      ) : null}

      {block.type === "image" ? (
        <ImageFields
          context={context}
          imageCount={imageCount}
          maxImages={maxImages}
          image={{ url: block.url ?? "", alt: block.alt ?? "", caption: block.caption }}
          onChange={(image) => updateBlock(block.id, { url: image.url, alt: image.alt, caption: image.caption })}
        />
      ) : null}

      {block.type === "gallery" ? (
        <GalleryFields
          block={block}
          context={context}
          imageCount={imageCount}
          maxImages={maxImages}
          updateBlock={updateBlock}
        />
      ) : null}

      {block.type === "quote" ? (
        <div className="space-y-4">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-foreground">Nội dung quote</span>
            <textarea
              value={block.quote ?? ""}
              onChange={(event) => updateBlock(block.id, { quote: event.target.value })}
              rows={4}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-foreground">Nguồn</span>
            <input
              value={block.attribution ?? ""}
              onChange={(event) => updateBlock(block.id, { attribution: event.target.value })}
              className={inputClass}
            />
          </label>
        </div>
      ) : null}

      {block.type === "stats" ? (
        <StatsFields block={block} updateBlock={updateBlock} />
      ) : null}

      {block.type === "benefits" ? (
        <BenefitFields block={block} updateBlock={updateBlock} />
      ) : null}

      {block.type === "video" ? (
        <label className="space-y-1">
          <span className="text-sm font-semibold text-foreground">YouTube/Vimeo URL</span>
          <input
            value={block.url ?? ""}
            onChange={(event) => updateBlock(block.id, { url: event.target.value })}
            className={inputClass}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </label>
      ) : null}

      {block.type === "cta" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-foreground">Nhãn nút</span>
            <input
              value={block.label ?? ""}
              onChange={(event) => updateBlock(block.id, { label: event.target.value })}
              className={inputClass}
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-semibold text-foreground">Link</span>
            <input
              value={block.href ?? ""}
              onChange={(event) => updateBlock(block.id, { href: event.target.value })}
              className={inputClass}
            />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-semibold text-foreground">Mô tả</span>
            <textarea
              value={block.description ?? ""}
              onChange={(event) => updateBlock(block.id, { description: event.target.value })}
              rows={3}
              className={inputClass}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function ImageFields({
  context,
  image,
  imageCount,
  maxImages,
  onChange,
}: {
  context: "blog" | "company";
  image: ContentImage;
  imageCount: number;
  maxImages: number;
  onChange: (image: ContentImage) => void;
}) {
  return (
    <div className="space-y-4">
      <label className="space-y-1">
        <span className="text-sm font-semibold text-foreground">Alt text</span>
        <input value={image.alt} onChange={(event) => onChange({ ...image, alt: event.target.value })} className={inputClass} />
      </label>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="space-y-1">
          <span className="text-sm font-semibold text-foreground">Image URL</span>
          <input value={image.url} onChange={(event) => onChange({ ...image, url: event.target.value })} className={inputClass} />
        </label>
        <div className="flex items-end">
          <MediaUploadButton
            context={context}
            alt={image.alt}
            disabled={imageCount >= maxImages && !image.url}
            onUploaded={(uploaded) => onChange({ ...image, url: uploaded.url, alt: uploaded.alt })}
            label="Upload"
          />
        </div>
      </div>
      <label className="space-y-1">
        <span className="text-sm font-semibold text-foreground">Caption</span>
        <input value={image.caption ?? ""} onChange={(event) => onChange({ ...image, caption: event.target.value })} className={inputClass} />
      </label>
    </div>
  );
}

function GalleryFields({
  block,
  context,
  imageCount,
  maxImages,
  updateBlock,
}: {
  block: ContentBlock;
  context: "blog" | "company";
  imageCount: number;
  maxImages: number;
  updateBlock: (id: string, patch: Partial<ContentBlock>) => void;
}) {
  const images = block.images ?? [];

  function updateImage(index: number, image: ContentImage) {
    updateBlock(block.id, { images: images.map((item, itemIndex) => (itemIndex === index ? image : item)) });
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className={smallButtonClass}
        disabled={imageCount >= maxImages}
        onClick={() => updateBlock(block.id, { images: [...images, { url: "", alt: "", caption: "" }] })}
      >
        <Plus className="h-4 w-4" />
        Thêm ảnh
      </button>

      {images.map((image, index) => (
        <div key={`${block.id}-${index}`} className="rounded-xl border border-border bg-surface/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Ảnh #{index + 1}</p>
            <button
              type="button"
              className="text-xs font-semibold text-red-600"
              onClick={() => updateBlock(block.id, { images: images.filter((_, imageIndex) => imageIndex !== index) })}
            >
              Xóa
            </button>
          </div>
          <ImageFields
            context={context}
            imageCount={imageCount}
            maxImages={maxImages}
            image={image}
            onChange={(nextImage) => updateImage(index, nextImage)}
          />
        </div>
      ))}
    </div>
  );
}

function StatsFields({
  block,
  updateBlock,
}: {
  block: ContentBlock;
  updateBlock: (id: string, patch: Partial<ContentBlock>) => void;
}) {
  const stats = block.stats ?? [];

  function updateStat(index: number, stat: ContentStat) {
    updateBlock(block.id, { stats: stats.map((item, itemIndex) => (itemIndex === index ? stat : item)) });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        className={smallButtonClass}
        onClick={() => updateBlock(block.id, { stats: [...stats, { value: "", label: "" }] })}
      >
        <Plus className="h-4 w-4" />
        Thêm chỉ số
      </button>
      {stats.map((stat, index) => (
        <div key={`${block.id}-stat-${index}`} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-3">
          <input value={stat.value} onChange={(event) => updateStat(index, { ...stat, value: event.target.value })} className={inputClass} placeholder="1000+" />
          <input value={stat.label} onChange={(event) => updateStat(index, { ...stat, label: event.target.value })} className={inputClass} placeholder="Nhân sự" />
          <input value={stat.description ?? ""} onChange={(event) => updateStat(index, { ...stat, description: event.target.value })} className={inputClass} placeholder="Mô tả ngắn" />
        </div>
      ))}
    </div>
  );
}

function BenefitFields({
  block,
  updateBlock,
}: {
  block: ContentBlock;
  updateBlock: (id: string, patch: Partial<ContentBlock>) => void;
}) {
  const benefits = block.benefits ?? [];

  function updateBenefit(index: number, benefit: ContentBenefit) {
    updateBlock(block.id, { benefits: benefits.map((item, itemIndex) => (itemIndex === index ? benefit : item)) });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        className={smallButtonClass}
        onClick={() => updateBlock(block.id, { benefits: [...benefits, { title: "", description: "", icon: "✓" }] })}
      >
        <Plus className="h-4 w-4" />
        Thêm phúc lợi
      </button>
      {benefits.map((benefit, index) => (
        <div key={`${block.id}-benefit-${index}`} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[72px_1fr]">
          <input value={benefit.icon ?? ""} onChange={(event) => updateBenefit(index, { ...benefit, icon: event.target.value })} className={inputClass} placeholder="✓" />
          <div className="space-y-3">
            <input value={benefit.title} onChange={(event) => updateBenefit(index, { ...benefit, title: event.target.value })} className={inputClass} placeholder="Tên phúc lợi" />
            <textarea value={benefit.description ?? ""} onChange={(event) => updateBenefit(index, { ...benefit, description: event.target.value })} rows={2} className={inputClass} placeholder="Mô tả ngắn" />
          </div>
        </div>
      ))}
    </div>
  );
}
