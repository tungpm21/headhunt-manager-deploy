export type ContentBlockType =
  | "richText"
  | "image"
  | "gallery"
  | "quote"
  | "stats"
  | "benefits"
  | "video"
  | "html"
  | "cta";

export type ContentImage = {
  url: string;
  alt: string;
  caption?: string;
};

export type ContentStat = {
  label: string;
  value: string;
  description?: string;
};

export type ContentBenefit = {
  title: string;
  description?: string;
  icon?: string;
};

export type ContentBlock = {
  id: string;
  type: ContentBlockType;
  title?: string;
  enabled?: boolean;
  markdown?: string;
  html?: string;
  url?: string;
  alt?: string;
  caption?: string;
  quote?: string;
  attribution?: string;
  label?: string;
  href?: string;
  description?: string;
  images?: ContentImage[];
  stats?: ContentStat[];
  benefits?: ContentBenefit[];
};

export type CompanyProfileTheme = {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  surfaceColor: string;
};

export type CompanyProfileCapabilities = {
  theme: boolean;
  gallery: boolean;
  video: boolean;
  html: boolean;
  maxImages: number;
};

export type CompanyProfileSidebarVisibility = {
  industry: boolean;
  companySize: boolean;
  location: boolean;
  industrialZone: boolean;
  address: boolean;
  website: boolean;
  phone: boolean;
};

export const DEFAULT_COMPANY_THEME: CompanyProfileTheme = {
  primaryColor: "#0479A8",
  accentColor: "#D24B16",
  backgroundColor: "#F6F8FB",
  textColor: "#0F172A",
  borderColor: "#D8E2EC",
  surfaceColor: "#FFFFFF",
};

export const COMPANY_THEME_PRESETS: Array<{
  id: string;
  name: string;
  description: string;
  theme: CompanyProfileTheme;
}> = [
  {
    id: "fdi-clean-blue",
    name: "FDI Clean Blue",
    description: "Sạch, chuyên nghiệp, hợp với đa số doanh nghiệp sản xuất.",
    theme: DEFAULT_COMPANY_THEME,
  },
  {
    id: "executive-navy",
    name: "Executive Navy",
    description: "Trang công ty cao cấp với navy đậm và CTA màu amber.",
    theme: {
      primaryColor: "#123B5D",
      accentColor: "#B7791F",
      backgroundColor: "#F3F6F8",
      textColor: "#102033",
      borderColor: "#D5DEE8",
      surfaceColor: "#FFFFFF",
    },
  },
  {
    id: "industrial-green",
    name: "Industrial Green",
    description: "Tin cậy, ổn định, hợp với sản xuất và doanh nghiệp xanh.",
    theme: {
      primaryColor: "#116149",
      accentColor: "#0E8F6E",
      backgroundColor: "#F3FAF7",
      textColor: "#10241E",
      borderColor: "#C9E2D8",
      surfaceColor: "#FFFFFF",
    },
  },
  {
    id: "tech-slate",
    name: "Tech Slate",
    description: "Hiện đại, tương phản rõ, hợp với công nghệ và kỹ thuật.",
    theme: {
      primaryColor: "#1F3A5F",
      accentColor: "#0284C7",
      backgroundColor: "#F5F8FC",
      textColor: "#0B1220",
      borderColor: "#D6E0EA",
      surfaceColor: "#FFFFFF",
    },
  },
  {
    id: "warm-premium",
    name: "Warm Premium",
    description: "Nền ấm nhẹ, nút cam đỏ nổi bật cho hồ sơ premium.",
    theme: {
      primaryColor: "#7C2D12",
      accentColor: "#C2410C",
      backgroundColor: "#FFF7ED",
      textColor: "#1F130B",
      borderColor: "#FED7AA",
      surfaceColor: "#FFFFFF",
    },
  },
  {
    id: "minimal-ink",
    name: "Minimal Ink",
    description: "Tối giản, trung tính, giúp ảnh và nội dung nổi bật.",
    theme: {
      primaryColor: "#334155",
      accentColor: "#111827",
      backgroundColor: "#F8FAFC",
      textColor: "#111827",
      borderColor: "#CBD5E1",
      surfaceColor: "#FFFFFF",
    },
  },
];

export const DEFAULT_COMPANY_CAPABILITIES: CompanyProfileCapabilities = {
  theme: true,
  gallery: true,
  video: true,
  html: false,
  maxImages: 8,
};

export const DEFAULT_COMPANY_SIDEBAR_VISIBILITY: CompanyProfileSidebarVisibility = {
  industry: true,
  companySize: true,
  location: true,
  industrialZone: true,
  address: true,
  website: true,
  phone: false,
};

const CONTENT_BLOCK_TYPES = new Set<ContentBlockType>([
  "richText",
  "image",
  "gallery",
  "quote",
  "stats",
  "benefits",
  "video",
  "html",
  "cta",
]);

const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

export function createContentBlockId(prefix = "block") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function optionalString(value: unknown) {
  const normalized = stringValue(value).trim();
  return normalized || undefined;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function numberValue(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeImages(value: unknown): ContentImage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((image) => ({
      url: stringValue(image.url).trim(),
      alt: stringValue(image.alt).trim(),
      caption: optionalString(image.caption),
    }))
    .filter((image) => image.url && image.alt);
}

function normalizeStats(value: unknown): ContentStat[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((stat) => ({
      label: stringValue(stat.label).trim(),
      value: stringValue(stat.value).trim(),
      description: optionalString(stat.description),
    }))
    .filter((stat) => stat.label && stat.value);
}

function normalizeBenefits(value: unknown): ContentBenefit[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((benefit) => ({
      title: stringValue(benefit.title).trim(),
      description: optionalString(benefit.description),
      icon: optionalString(benefit.icon),
    }))
    .filter((benefit) => benefit.title);
}

export function normalizeContentBlocks(value: unknown): ContentBlock[] {
  const source = typeof value === "string" ? parseJson(value) : value;
  if (!Array.isArray(source)) return [];

  const blocks: ContentBlock[] = [];

  for (const block of source) {
    if (!isRecord(block)) continue;

    const type = stringValue(block.type) as ContentBlockType;
    if (!CONTENT_BLOCK_TYPES.has(type)) continue;

    blocks.push({
      id: optionalString(block.id) ?? createContentBlockId(type),
      type,
      title: optionalString(block.title),
      enabled: booleanValue(block.enabled, true),
      markdown: stringValue(block.markdown),
      html: stringValue(block.html),
      url: stringValue(block.url).trim(),
      alt: stringValue(block.alt).trim(),
      caption: optionalString(block.caption),
      quote: stringValue(block.quote),
      attribution: optionalString(block.attribution),
      label: optionalString(block.label),
      href: stringValue(block.href).trim(),
      description: optionalString(block.description),
      images: normalizeImages(block.images),
      stats: normalizeStats(block.stats),
      benefits: normalizeBenefits(block.benefits),
    });
  }

  return blocks;
}

export function normalizeCompanyTheme(value: unknown): CompanyProfileTheme {
  const source = isRecord(value) ? value : {};

  return {
    primaryColor: HEX_COLOR_RE.test(stringValue(source.primaryColor))
      ? stringValue(source.primaryColor)
      : DEFAULT_COMPANY_THEME.primaryColor,
    accentColor: HEX_COLOR_RE.test(stringValue(source.accentColor))
      ? stringValue(source.accentColor)
      : DEFAULT_COMPANY_THEME.accentColor,
    backgroundColor: HEX_COLOR_RE.test(stringValue(source.backgroundColor))
      ? stringValue(source.backgroundColor)
      : DEFAULT_COMPANY_THEME.backgroundColor,
    textColor: HEX_COLOR_RE.test(stringValue(source.textColor))
      ? stringValue(source.textColor)
      : DEFAULT_COMPANY_THEME.textColor,
    borderColor: HEX_COLOR_RE.test(stringValue(source.borderColor))
      ? stringValue(source.borderColor)
      : DEFAULT_COMPANY_THEME.borderColor,
    surfaceColor: HEX_COLOR_RE.test(stringValue(source.surfaceColor))
      ? stringValue(source.surfaceColor)
      : DEFAULT_COMPANY_THEME.surfaceColor,
  };
}

export function normalizeCompanyCapabilities(value: unknown): CompanyProfileCapabilities {
  const source = isRecord(value) ? value : {};
  const maxImages = Math.max(0, Math.min(12, Math.floor(numberValue(source.maxImages, 8))));

  return {
    theme: booleanValue(source.theme, DEFAULT_COMPANY_CAPABILITIES.theme),
    gallery: booleanValue(source.gallery, DEFAULT_COMPANY_CAPABILITIES.gallery),
    video: booleanValue(source.video, DEFAULT_COMPANY_CAPABILITIES.video),
    html: booleanValue(source.html, DEFAULT_COMPANY_CAPABILITIES.html),
    maxImages: maxImages || DEFAULT_COMPANY_CAPABILITIES.maxImages,
  };
}

export function normalizeCompanySidebarVisibility(value: unknown): CompanyProfileSidebarVisibility {
  const source = isRecord(value) ? value : {};
  const nestedSource = isRecord(source.sidebarVisibility) ? source.sidebarVisibility : source;

  return {
    industry: booleanValue(nestedSource.industry, DEFAULT_COMPANY_SIDEBAR_VISIBILITY.industry),
    companySize: booleanValue(nestedSource.companySize, DEFAULT_COMPANY_SIDEBAR_VISIBILITY.companySize),
    location: booleanValue(nestedSource.location, DEFAULT_COMPANY_SIDEBAR_VISIBILITY.location),
    industrialZone: booleanValue(nestedSource.industrialZone, DEFAULT_COMPANY_SIDEBAR_VISIBILITY.industrialZone),
    address: booleanValue(nestedSource.address, DEFAULT_COMPANY_SIDEBAR_VISIBILITY.address),
    website: booleanValue(nestedSource.website, DEFAULT_COMPANY_SIDEBAR_VISIBILITY.website),
    phone: booleanValue(nestedSource.phone, DEFAULT_COMPANY_SIDEBAR_VISIBILITY.phone),
  };
}

export function parseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function countBlockImages(blocks: ContentBlock[]) {
  return blocks.reduce((count, block) => {
    if (block.type === "image" && block.url) return count + 1;
    if (block.type === "gallery") return count + (block.images?.length ?? 0);
    if (block.markdown) {
      return count + (block.markdown.match(/!\[[^\]]*]\([^)]+\)/g)?.length ?? 0);
    }
    return count;
  }, 0);
}

export function contentBlocksToPlainText(blocks: ContentBlock[], fallback = "") {
  const text = blocks
    .map((block) => {
      if (block.enabled === false) return "";
      if (block.markdown) return block.markdown;
      if (block.quote) return block.quote;
      if (block.description) return block.description;
      if (block.title) return block.title;
      if (block.benefits?.length) return block.benefits.map((item) => item.title).join(" ");
      if (block.stats?.length) return block.stats.map((item) => `${item.value} ${item.label}`).join(" ");
      return "";
    })
    .join(" ");

  return stripMarkdown(text || fallback);
}

export function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getSafeVideoEmbedUrl(value: string | undefined | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");

    if ((hostname === "youtube.com" || hostname === "m.youtube.com") && url.pathname.startsWith("/embed/")) {
      return url.toString();
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
    }

    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
    }

    if (hostname === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${encodeURIComponent(id)}` : null;
    }

    if (hostname === "player.vimeo.com" && url.pathname.startsWith("/video/")) {
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizeSafeHtmlEmbeds(value: string) {
  return value.replace(
    /<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/iframe>/gi,
    (_match, src: string) => {
      const embedUrl = getSafeVideoEmbedUrl(src);
      if (!embedUrl) return "";

      return `<iframe src="${embedUrl}" title="Video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    }
  );
}
