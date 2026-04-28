import type { CSSProperties } from "react";
import {
  getSafeVideoEmbedUrl,
  normalizeCompanyTheme,
  normalizeContentBlocks,
  type CompanyProfileTheme,
  type ContentBlock,
} from "@/lib/content-blocks";
import { SafeRichContent } from "./SafeRichContent";

type ContentBlocksRendererProps = {
  blocks?: unknown;
  fallbackMarkdown?: string | null;
  theme?: CompanyProfileTheme;
  className?: string;
};

function createBlockAnchorId(block: ContentBlock, index: number) {
  const slug = (block.id || `${block.type}-${index + 1}`)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `content-${slug || index + 1}`;
}

function getEnabledBlocks(blocks: unknown): ContentBlock[] {
  return normalizeContentBlocks(blocks).filter((block) => block.enabled !== false);
}

export function ContentBlocksRenderer({
  blocks,
  fallbackMarkdown,
  theme,
  className = "",
}: ContentBlocksRendererProps) {
  const enabledBlocks = getEnabledBlocks(blocks);

  if (enabledBlocks.length === 0 && !fallbackMarkdown?.trim()) {
    return null;
  }

  const normalizedTheme = normalizeCompanyTheme(theme);
  const accentColor = normalizedTheme.accentColor;
  const primaryColor = normalizedTheme.primaryColor;
  const textColor = normalizedTheme.textColor;
  const mutedTextColor = `${textColor}B3`;
  const sectionStyle: CSSProperties = {
    backgroundColor: normalizedTheme.surfaceColor,
    borderColor: normalizedTheme.borderColor,
    color: textColor,
  };
  const softPanelStyle: CSSProperties = {
    backgroundColor: normalizedTheme.backgroundColor,
    borderColor: normalizedTheme.borderColor,
    color: textColor,
  };
  const mutedTextStyle: CSSProperties = { color: mutedTextColor };

  return (
    <div className={`space-y-6 ${className}`}>
      {enabledBlocks.length === 0 && fallbackMarkdown ? (
        <section className="rounded-2xl border p-6 shadow-sm sm:p-8" style={sectionStyle}>
          <SafeRichContent content={fallbackMarkdown} />
        </section>
      ) : null}

      {enabledBlocks.map((block, index) => {
        const blockAnchorId = createBlockAnchorId(block, index);

        if (block.type === "richText" && block.markdown?.trim()) {
          return (
            <section
              key={block.id}
              id={blockAnchorId}
              className="scroll-mt-28 rounded-2xl border p-6 shadow-sm sm:p-8"
              style={sectionStyle}
            >
              {block.title ? <SectionTitle title={block.title} accentColor={accentColor} /> : null}
              <SafeRichContent content={block.markdown} headingIdPrefix={blockAnchorId} />
            </section>
          );
        }

        if (block.type === "html" && block.html?.trim()) {
          return (
            <section
              key={block.id}
              id={blockAnchorId}
              className="scroll-mt-28 rounded-2xl border p-6 shadow-sm sm:p-8"
              style={sectionStyle}
            >
              {block.title ? <SectionTitle title={block.title} accentColor={accentColor} /> : null}
              <SafeRichContent content={block.html} allowHtml headingIdPrefix={blockAnchorId} />
            </section>
          );
        }

        if (block.type === "image" && block.url && block.alt) {
          return (
            <figure
              key={block.id}
              id={blockAnchorId}
              className="scroll-mt-28 overflow-hidden rounded-2xl border shadow-sm"
              style={sectionStyle}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.url} alt={block.alt} loading="lazy" className="h-auto w-full object-cover" />
              {(block.title || block.caption) && (
                <figcaption className="space-y-1 px-5 py-4 text-sm" style={mutedTextStyle}>
                  {block.title ? <p className="font-semibold" style={{ color: textColor }}>{block.title}</p> : null}
                  {block.caption ? <p>{block.caption}</p> : null}
                </figcaption>
              )}
            </figure>
          );
        }

        if (block.type === "gallery" && block.images?.length) {
          return (
            <section
              key={block.id}
              id={blockAnchorId}
              className="scroll-mt-28 rounded-2xl border p-5 shadow-sm sm:p-6"
              style={sectionStyle}
            >
              {block.title ? <SectionTitle title={block.title} accentColor={accentColor} /> : null}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {block.images.map((image) => (
                  <figure key={`${block.id}-${image.url}`} className="overflow-hidden rounded-xl" style={softPanelStyle}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.alt}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    {image.caption ? (
                      <figcaption className="px-3 py-2 text-xs" style={mutedTextStyle}>
                        {image.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "quote" && block.quote?.trim()) {
          return (
            <blockquote
              key={block.id}
              id={blockAnchorId}
              className="scroll-mt-28 rounded-2xl border-l-4 p-6 text-lg font-medium leading-relaxed shadow-sm"
              style={{ ...sectionStyle, borderLeftColor: accentColor }}
            >
              <p>{block.quote}</p>
              {block.attribution ? (
                <footer className="mt-3 text-sm font-normal" style={mutedTextStyle}>
                  {block.attribution}
                </footer>
              ) : null}
            </blockquote>
          );
        }

        if (block.type === "stats" && block.stats?.length) {
          return (
            <section
              key={block.id}
              id={blockAnchorId}
              className="scroll-mt-28 rounded-2xl border p-5 shadow-sm sm:p-6"
              style={sectionStyle}
            >
              {block.title ? <SectionTitle title={block.title} accentColor={accentColor} /> : null}
              <div className="grid gap-3 sm:grid-cols-3">
                {block.stats.map((stat) => (
                  <div key={`${block.id}-${stat.label}`} className="rounded-xl border p-4" style={softPanelStyle}>
                    <p className="text-2xl font-bold" style={{ color: textColor }}>{stat.value}</p>
                    <p className="mt-1 text-sm font-semibold" style={{ color: textColor }}>{stat.label}</p>
                    {stat.description ? (
                      <p className="mt-1 text-xs" style={mutedTextStyle}>{stat.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "benefits" && block.benefits?.length) {
          return (
            <section
              key={block.id}
              id={blockAnchorId}
              className="scroll-mt-28 rounded-2xl border p-5 shadow-sm sm:p-6"
              style={sectionStyle}
            >
              {block.title ? <SectionTitle title={block.title} accentColor={accentColor} /> : null}
              <div className="grid gap-3 sm:grid-cols-2">
                {block.benefits.map((benefit) => (
                  <div key={`${block.id}-${benefit.title}`} className="rounded-xl border p-4" style={softPanelStyle}>
                    <p className="text-sm font-semibold" style={{ color: textColor }}>
                      {benefit.icon ? `${benefit.icon} ` : null}
                      {benefit.title}
                    </p>
                    {benefit.description ? (
                      <p className="mt-1 text-sm" style={mutedTextStyle}>{benefit.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "video") {
          const embedUrl = getSafeVideoEmbedUrl(block.url);
          if (!embedUrl) return null;

          return (
            <section
              key={block.id}
              id={blockAnchorId}
              className="scroll-mt-28 rounded-2xl border p-5 shadow-sm sm:p-6"
              style={sectionStyle}
            >
              {block.title ? <SectionTitle title={block.title} accentColor={accentColor} /> : null}
              <div className="overflow-hidden rounded-2xl bg-black">
                <iframe
                  src={embedUrl}
                  title={block.title ?? "Video"}
                  className="aspect-video w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </section>
          );
        }

        if (block.type === "cta" && block.label && block.href) {
          return (
            <section
              key={block.id}
              id={blockAnchorId}
              className="scroll-mt-28 rounded-2xl p-6 text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
              }}
            >
              {block.title ? <h2 className="text-xl font-bold">{block.title}</h2> : null}
              {block.description ? <p className="mt-2 max-w-2xl text-sm text-white/85">{block.description}</p> : null}
              <a
                href={block.href}
                className="mt-4 inline-flex min-h-11 items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-[var(--color-fdi-text)] transition hover:bg-white/90"
              >
                {block.label}
              </a>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}

function SectionTitle({ title, accentColor }: { title: string; accentColor: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );
}
