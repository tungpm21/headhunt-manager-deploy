export type CompanyCoverAspectRatio = "2 / 1" | "21 / 9" | "5 / 2" | "3 / 1" | "16 / 5";
export type CompanyLogoAspectRatio = "auto" | "1 / 1" | "3 / 2" | "4 / 3" | "5 / 4";
export type CompanyLogoFit = "contain" | "cover";

export type CompanyMediaSettings = {
  coverAspectRatio: CompanyCoverAspectRatio;
  logoAspectRatio: CompanyLogoAspectRatio;
  logoFit: CompanyLogoFit;
  logoZoom: number;
  bannerImageUrl: string | null;
  bannerPositionX: number;
  bannerPositionY: number;
  bannerZoom: number;
};

export const COVER_ASPECT_RATIO_OPTIONS: Array<{
  value: CompanyCoverAspectRatio;
  label: string;
}> = [
  { value: "2 / 1", label: "2:1 - cao tối đa" },
  { value: "21 / 9", label: "21:9" },
  { value: "5 / 2", label: "5:2" },
  { value: "3 / 1", label: "3:1" },
  { value: "16 / 5", label: "16:5" },
];

export const LOGO_ASPECT_RATIO_OPTIONS: Array<{
  value: CompanyLogoAspectRatio;
  label: string;
}> = [
  { value: "auto", label: "Theo ảnh" },
  { value: "1 / 1", label: "1:1" },
  { value: "3 / 2", label: "3:2" },
  { value: "4 / 3", label: "4:3" },
  { value: "5 / 4", label: "5:4" },
];

export const DEFAULT_COMPANY_MEDIA_SETTINGS: CompanyMediaSettings = {
  coverAspectRatio: "2 / 1",
  logoAspectRatio: "1 / 1",
  logoFit: "contain",
  logoZoom: 100,
  bannerImageUrl: null,
  bannerPositionX: 50,
  bannerPositionY: 50,
  bannerZoom: 100,
};

export const HOMEPAGE_BANNER_ASPECT_RATIO = "2.72 / 1";

const coverRatios = new Set<CompanyCoverAspectRatio>(
  COVER_ASPECT_RATIO_OPTIONS.map((option) => option.value)
);
const legacyTallCoverRatioMap: Record<string, CompanyCoverAspectRatio> = {
  "16 / 9": "2 / 1",
  "5 / 3": "2 / 1",
  "3 / 2": "2 / 1",
  "4 / 3": "2 / 1",
  "5 / 4": "2 / 1",
};
const logoRatios = new Set<CompanyLogoAspectRatio>(
  LOGO_ASPECT_RATIO_OPTIONS.map((option) => option.value)
);
const logoFits = new Set<CompanyLogoFit>(["contain", "cover"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getSource(value: unknown) {
  if (!isRecord(value)) return {};
  return isRecord(value.media) ? value.media : value;
}

function boundedNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function stringOrNull(value: unknown) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || null;
}

export function normalizeCompanyMediaSettings(value: unknown): CompanyMediaSettings {
  const source = getSource(value);
  const coverAspectRatio = String(source.coverAspectRatio || "");
  const logoAspectRatio = String(source.logoAspectRatio || "");
  const logoFit = String(source.logoFit || "");

  return {
    coverAspectRatio: coverRatios.has(coverAspectRatio as CompanyCoverAspectRatio)
      ? (coverAspectRatio as CompanyCoverAspectRatio)
      : legacyTallCoverRatioMap[coverAspectRatio] ?? DEFAULT_COMPANY_MEDIA_SETTINGS.coverAspectRatio,
    logoAspectRatio: logoRatios.has(logoAspectRatio as CompanyLogoAspectRatio)
      ? (logoAspectRatio as CompanyLogoAspectRatio)
      : DEFAULT_COMPANY_MEDIA_SETTINGS.logoAspectRatio,
    logoFit: logoFits.has(logoFit as CompanyLogoFit)
      ? (logoFit as CompanyLogoFit)
      : DEFAULT_COMPANY_MEDIA_SETTINGS.logoFit,
    logoZoom: boundedNumber(
      source.logoZoom,
      DEFAULT_COMPANY_MEDIA_SETTINGS.logoZoom,
      60,
      200
    ),
    bannerImageUrl: stringOrNull(source.bannerImageUrl),
    bannerPositionX: boundedNumber(
      source.bannerPositionX,
      DEFAULT_COMPANY_MEDIA_SETTINGS.bannerPositionX,
      0,
      100
    ),
    bannerPositionY: boundedNumber(
      source.bannerPositionY,
      DEFAULT_COMPANY_MEDIA_SETTINGS.bannerPositionY,
      0,
      100
    ),
    bannerZoom: boundedNumber(
      source.bannerZoom,
      DEFAULT_COMPANY_MEDIA_SETTINGS.bannerZoom,
      100,
      200
    ),
  };
}
