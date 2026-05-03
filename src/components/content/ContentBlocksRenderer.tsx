import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, CheckCircle2, Quote } from "lucide-react";
import {
  getSafeVideoEmbedUrl,
  normalizeCompanyTheme,
  normalizeContentSectionLayout,
  normalizeContentBlocks,
  type CompanyProfileTheme,
  type ContentBlock,
} from "@/lib/content-blocks";
import { GalleryLightbox } from "./GalleryLightbox";
import { SafeRichContent } from "./SafeRichContent";

type ContentBlocksRendererProps = {
  blocks?: unknown;
  fallbackMarkdown?: string | null;
  theme?: CompanyProfileTheme;
  layout?: unknown;
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
  layout,
  className = "",
}: ContentBlocksRendererProps) {
  const enabledBlocks = getEnabledBlocks(blocks);

  if (enabledBlocks.length === 0 && !fallbackMarkdown?.trim()) {
    return null;
  }

  const normalizedTheme = normalizeCompanyTheme(theme);
  if (theme) {
    return (
      <CompanyContentBlocks
        blocks={enabledBlocks}
        fallbackMarkdown={fallbackMarkdown}
        theme={normalizedTheme}
        layout={layout}
        className={className}
      />
    );
  }

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
        <section className="rounded-lg border p-6 shadow-sm sm:p-8" style={sectionStyle}>
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
              className="scroll-mt-28 rounded-lg border p-6 shadow-sm sm:p-8"
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
              className="scroll-mt-28 rounded-lg border p-6 shadow-sm sm:p-8"
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
              className="scroll-mt-28 overflow-hidden rounded-lg border shadow-sm"
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
              className="scroll-mt-28 rounded-lg border p-5 shadow-sm sm:p-6"
              style={sectionStyle}
            >
              {block.title ? <SectionTitle title={block.title} accentColor={accentColor} /> : null}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {block.images.map((image) => (
                  <figure key={`${block.id}-${image.url}`} className="overflow-hidden rounded-md" style={softPanelStyle}>
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
              className="scroll-mt-28 rounded-lg border-l-4 p-6 text-lg font-medium leading-relaxed shadow-sm"
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
              className="scroll-mt-28 rounded-lg border p-5 shadow-sm sm:p-6"
              style={sectionStyle}
            >
              {block.title ? <SectionTitle title={block.title} accentColor={accentColor} /> : null}
              <div className="grid gap-3 sm:grid-cols-3">
                {block.stats.map((stat) => (
                  <div key={`${block.id}-${stat.label}`} className="rounded-md border p-4" style={softPanelStyle}>
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
              className="scroll-mt-28 rounded-lg border p-5 shadow-sm sm:p-6"
              style={sectionStyle}
            >
              {block.title ? <SectionTitle title={block.title} accentColor={accentColor} /> : null}
              <div className="grid gap-3 sm:grid-cols-2">
                {block.benefits.map((benefit) => (
                  <div key={`${block.id}-${benefit.title}`} className="rounded-md border p-4" style={softPanelStyle}>
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
              className="scroll-mt-28 rounded-lg border p-5 shadow-sm sm:p-6"
              style={sectionStyle}
            >
              {block.title ? <SectionTitle title={block.title} accentColor={accentColor} /> : null}
              <div className="overflow-hidden rounded-md bg-[#0E1A27]">
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
              className="scroll-mt-28 rounded-lg p-6 text-white shadow-sm"
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

function CompanyContentBlocks({
  blocks,
  fallbackMarkdown,
  theme,
  layout,
  className,
}: {
  blocks: ContentBlock[];
  fallbackMarkdown?: string | null;
  theme: CompanyProfileTheme;
  layout?: unknown;
  className?: string;
}) {
  const sectionLayout = normalizeContentSectionLayout(layout, blocks);
  const blocksById = new Map(blocks.map((block) => [block.id, block]));

  return (
    <div className={`space-y-8 ${className ?? ""}`}>
      {blocks.length === 0 && fallbackMarkdown ? (
        <CompanySection title="Giới thiệu công ty" theme={theme}>
          <div className="max-w-[56ch]">
            <SafeRichContent content={fallbackMarkdown} />
          </div>
        </CompanySection>
      ) : null}

      {sectionLayout.map((item, index) => {
        if (item.type === "standalone") {
          const block = blocksById.get(item.blockId);
          if (!block) return null;
          return <CompanyStandaloneBlock key={item.id} block={block} index={index} theme={theme} />;
        }

        const groupBlocks = item.blockIds
          .map((blockId) => blocksById.get(blockId))
          .filter((block): block is ContentBlock => Boolean(block));

        if (groupBlocks.length === 0) return null;

        return (
          <CompanySection key={item.id} id={`content-${item.id}`} title={item.title} theme={theme}>
            <div className="space-y-8">
              {groupBlocks.map((block, blockIndex) => (
                <CompanyInlineBlock
                  key={block.id}
                  block={block}
                  index={blockIndex}
                  theme={theme}
                  withDivider={blockIndex > 0}
                />
              ))}
            </div>
          </CompanySection>
        );
      })}
    </div>
  );
}

function CompanyInlineTitle({
  title,
  theme,
  sequence,
}: {
  title?: string;
  theme: CompanyProfileTheme;
  sequence: number;
}) {
  if (!title) return null;

  return (
    <div className="mb-5 flex items-start gap-4">
      <span
        className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#F0C8AF] bg-[#FFF6EF] text-xs font-extrabold tabular-nums"
        style={{ color: theme.accentColor }}
        aria-hidden="true"
      >
        {String(sequence + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <h2 className="text-xl font-extrabold leading-tight text-[#102033]">{title}</h2>
        <span className="mt-2 block h-0.5 w-12 rounded-full" style={{ backgroundColor: theme.accentColor }} />
      </div>
    </div>
  );
}

function CompanyInlineBlock({
  block,
  index,
  theme,
  withDivider = false,
}: {
  block: ContentBlock;
  index: number;
  theme: CompanyProfileTheme;
  withDivider?: boolean;
}) {
  const blockAnchorId = createBlockAnchorId(block, index);
  const wrapperClass = withDivider ? "border-t border-[#E4EEF3] pt-8" : "";

  if (block.type === "richText" && block.markdown?.trim()) {
    return (
      <section id={blockAnchorId} className={wrapperClass}>
        <CompanyInlineTitle title={block.title} theme={theme} sequence={index} />
          <div className="max-w-[54ch] text-[15px] leading-7 text-[#26384A] sm:text-base">
          <SafeRichContent content={block.markdown} headingIdPrefix={blockAnchorId} />
        </div>
      </section>
    );
  }

  if (block.type === "html" && block.html?.trim()) {
    return (
      <section id={blockAnchorId} className={wrapperClass}>
        <CompanyInlineTitle title={block.title} theme={theme} sequence={index} />
        <div className="max-w-[54ch] text-[15px] leading-7 text-[#26384A] sm:text-base">
          <SafeRichContent content={block.html} allowHtml headingIdPrefix={blockAnchorId} />
        </div>
      </section>
    );
  }

  if (block.type === "stats" && block.stats?.length) {
    return (
      <section id={blockAnchorId} className={wrapperClass}>
        <CompanyInlineTitle title={block.title} theme={theme} sequence={index} />
        <div className="grid overflow-hidden border-y border-[#D7E4EB] sm:grid-cols-3 sm:divide-x sm:divide-[#D7E4EB]">
          {block.stats.map((stat) => (
            <div key={`${block.id}-${stat.label}`} className="py-5 sm:px-5 sm:first:pl-0 sm:last:pr-0">
              <p className="text-3xl font-extrabold tracking-tight text-[#102033]">{stat.value}</p>
              <p className="mt-1 text-sm font-bold leading-5 text-[#102033]">{stat.label}</p>
              {stat.description ? <p className="mt-2 text-sm leading-6 text-[#526173]">{stat.description}</p> : null}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "benefits" && block.benefits?.length) {
    return (
      <section id={blockAnchorId} className={wrapperClass}>
        <CompanyInlineTitle title={block.title} theme={theme} sequence={index} />
        <div className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
          {block.benefits.map((benefit) => (
            <div key={`${block.id}-${benefit.title}`} className="flex gap-3 border-t border-[#E4EEF3] py-4">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFF3E8]" aria-hidden="true">
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: theme.accentColor }} />
              </span>
              <div>
                <p className="font-bold text-[#102033]">{benefit.title}</p>
                {benefit.description ? <p className="mt-1 text-sm leading-6 text-[#526173]">{benefit.description}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block.type === "gallery" && block.images?.length) {
    return (
      <section id={blockAnchorId} className={wrapperClass}>
        <CompanyInlineTitle title={block.title} theme={theme} sequence={index} />
        <GalleryLightbox images={block.images} />
      </section>
    );
  }

  if (block.type === "image" && block.url && block.alt) {
    return (
      <section id={blockAnchorId} className={wrapperClass}>
        <CompanyInlineTitle title={block.title} theme={theme} sequence={index} />
        <figure className="overflow-hidden rounded-md border border-[#D7E4EB] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.url} alt={block.alt} loading="lazy" className="h-auto w-full object-cover" />
          {block.caption ? (
            <figcaption className="space-y-1 px-5 py-4">
              <p className="text-sm text-[#526173]">{block.caption}</p>
            </figcaption>
          ) : null}
        </figure>
      </section>
    );
  }

  if (block.type === "quote" && block.quote?.trim()) {
    return (
      <blockquote
        id={blockAnchorId}
        className={`${wrapperClass} border-l-4 bg-[#FAFCFD] py-5 pl-5 pr-6`}
        style={{ borderLeftColor: theme.accentColor }}
      >
        <Quote className="mb-4 h-7 w-7" style={{ color: theme.accentColor }} aria-hidden="true" />
        <p className="max-w-[56ch] text-lg font-semibold leading-8 text-[#102033]">{block.quote}</p>
        {block.attribution ? <footer className="mt-4 text-sm font-bold text-[#526173]">{block.attribution}</footer> : null}
      </blockquote>
    );
  }

  if (block.type === "video") {
    const embedUrl = getSafeVideoEmbedUrl(block.url);
    if (!embedUrl) return null;

    return (
      <section id={blockAnchorId} className={wrapperClass}>
        <CompanyInlineTitle title={block.title} theme={theme} sequence={index} />
        <div className="overflow-hidden rounded-md bg-[#0E1A27]">
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

  return null;
}

function CompanyStandaloneBlock({ block, index, theme }: { block: ContentBlock; index: number; theme: CompanyProfileTheme }) {
  const blockAnchorId = createBlockAnchorId(block, index);

  if (block.type === "cta" && block.label && block.href) {
    return (
      <section id={blockAnchorId} className="rounded-lg bg-[#073B59] p-6 text-white shadow-[0_18px_48px_-44px_rgba(15,35,55,0.5)] sm:p-8">
        {block.title ? <h2 className="text-2xl font-extrabold">{block.title}</h2> : null}
        {block.description ? <p className="mt-2 max-w-[54ch] text-sm leading-6 text-white/80">{block.description}</p> : null}
        <a href={block.href} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-bold text-[#073B59] transition hover:-translate-y-0.5">
          {block.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </section>
    );
  }

  return (
    <CompanySection id={blockAnchorId} title={block.title} theme={theme}>
      <CompanyInlineBlock block={block} index={index} theme={theme} />
    </CompanySection>
  );
}

function CompanySection({
  id,
  title,
  theme,
  children,
}: {
  id?: string;
  title?: string;
  theme: CompanyProfileTheme;
  children: ReactNode;
}) {
  return (
    <section id={id} className="rounded-md border border-[#D7E4EB] bg-[#FEFFFF] px-6 py-7 shadow-[0_14px_40px_-38px_rgba(15,35,55,0.38)] sm:px-8 sm:py-9">
      {title ? (
        <div className="mb-5 flex items-center gap-3">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.accentColor }} />
          <h2 className="text-xl font-extrabold text-[#102033]">{title}</h2>
        </div>
      ) : null}
      <div className="text-[#233447]">{children}</div>
    </section>
  );
}
