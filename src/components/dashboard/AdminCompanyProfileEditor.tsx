"use client";

import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ExternalLink, ImagePlus, Loader2, Save } from "lucide-react";
import { CoverPositionEditor } from "@/components/CoverPositionEditor";
import { BlockBuilder } from "@/components/content/BlockBuilder";
import { updateAdminCompanyProfileAction } from "@/lib/workspace-actions";
import {
  COMPANY_THEME_PRESETS,
  DEFAULT_COMPANY_CAPABILITIES,
  DEFAULT_COMPANY_THEME,
  normalizeCompanyCapabilities,
  normalizeCompanySidebarVisibility,
  normalizeCompanyTheme,
  type CompanyProfileSidebarVisibility,
  type CompanyProfileTheme,
} from "@/lib/content-blocks";
import {
  COVER_ASPECT_RATIO_OPTIONS,
  HOMEPAGE_BANNER_ASPECT_RATIO,
  LOGO_ASPECT_RATIO_OPTIONS,
  normalizeCompanyMediaSettings,
  type CompanyMediaSettings,
  type CompanyLogoFit,
} from "@/lib/company-media-settings";
import type { OptionChoice } from "@/lib/config-options";

type AdminEmployerProfile = {
  id: number;
  companyName: string;
  slug: string;
  email: string;
  logo: string | null;
  coverImage: string | null;
  coverPositionX: number;
  coverPositionY: number;
  coverZoom: number;
  description: string | null;
  industry: string | null;
  companySize: string | null;
  address: string | null;
  location: string | null;
  industrialZone: string | null;
  website: string | null;
  phone: string | null;
  profileConfig: {
    theme: unknown;
    capabilities: unknown;
    sections: unknown;
    primaryVideoUrl: string | null;
  } | null;
};

type ProfileOptions = {
  industryOptions: OptionChoice[];
  companySizeOptions: OptionChoice[];
  locationOptions: OptionChoice[];
  industrialZoneOptions: OptionChoice[];
};

type MessageState = { type: "success" | "error"; text: string } | null;

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60";

const THEME_FIELDS: Array<{ key: keyof CompanyProfileTheme; label: string }> = [
  { key: "primaryColor", label: "Màu thương hiệu" },
  { key: "accentColor", label: "Màu CTA" },
  { key: "backgroundColor", label: "Màu nền" },
  { key: "textColor", label: "Màu chữ" },
  { key: "borderColor", label: "Màu khung" },
  { key: "surfaceColor", label: "Màu ô nội dung" },
];

const SIDEBAR_FIELD_OPTIONS: Array<{ key: keyof CompanyProfileSidebarVisibility; label: string }> = [
  { key: "industry", label: "Ngành nghề" },
  { key: "companySize", label: "Quy mô" },
  { key: "location", label: "Khu vực" },
  { key: "industrialZone", label: "Khu công nghiệp" },
  { key: "address", label: "Địa chỉ" },
  { key: "website", label: "Website" },
  { key: "phone", label: "Điện thoại" },
];

export function AdminCompanyProfileEditor({
  workspaceId,
  employer,
  options,
}: {
  workspaceId: number;
  employer: AdminEmployerProfile;
  options: ProfileOptions;
}) {
  const capabilities = normalizeCompanyCapabilities(
    employer.profileConfig?.capabilities ?? DEFAULT_COMPANY_CAPABILITIES
  );
  const [theme, setTheme] = useState(
    normalizeCompanyTheme(employer.profileConfig?.theme ?? DEFAULT_COMPANY_THEME)
  );
  const [mediaSettings, setMediaSettings] = useState(
    normalizeCompanyMediaSettings(employer.profileConfig?.theme)
  );
  const [sidebarVisibility, setSidebarVisibility] = useState(
    normalizeCompanySidebarVisibility(employer.profileConfig?.theme)
  );
  const [primaryVideoUrl, setPrimaryVideoUrl] = useState(
    employer.profileConfig?.primaryVideoUrl ?? ""
  );
  const [logoUrl, setLogoUrl] = useState(employer.logo ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(employer.coverImage ?? "");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(employer.logo ?? "");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(employer.coverImage ?? "");
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState(mediaSettings.bannerImageUrl ?? "");
  const [coverPos, setCoverPos] = useState({
    positionX: employer.coverPositionX ?? 50,
    positionY: employer.coverPositionY ?? 50,
    zoom: employer.coverZoom ?? 100,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const effectiveLogoUrl = logoPreviewUrl || logoUrl;
  const effectiveCoverImageUrl = coverPreviewUrl || coverImageUrl;
  const effectiveBannerImageUrl = bannerPreviewUrl || mediaSettings.bannerImageUrl || effectiveCoverImageUrl;

  function updateThemeValue(key: keyof CompanyProfileTheme, value: string) {
    setTheme((current) => ({ ...current, [key]: value }));
  }

  function updateMediaSettings(next: Partial<CompanyMediaSettings>) {
    setMediaSettings((current) => ({ ...current, ...next }));
  }

  function handlePreviewFile(event: ChangeEvent<HTMLInputElement>, setter: (value: string) => void) {
    const file = event.target.files?.[0];
    if (!file) return;
    setter(URL.createObjectURL(file));
  }

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setMessage(null);
    formData.set("profileTheme", JSON.stringify(theme));
    formData.set("profileMediaSettings", JSON.stringify(mediaSettings));
    formData.set("profileSidebarVisibility", JSON.stringify(sidebarVisibility));
    formData.set("primaryVideoUrl", primaryVideoUrl);
    formData.set("logoUrl", logoUrl);
    formData.set("coverImageUrl", coverImageUrl);

    const result = await updateAdminCompanyProfileAction(workspaceId, formData);
    setMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    });
    setSaving(false);
    requestAnimationFrame(() => {
      messageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Chỉnh sửa profile công ty</h2>
          <p className="mt-1 text-sm text-muted">
            Admin lưu trực tiếp vào profile public, không tạo draft chờ duyệt.
          </p>
        </div>
        <Link
          href={`/cong-ty/${employer.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 text-sm font-semibold text-primary transition hover:bg-primary/15"
        >
          <ExternalLink className="h-4 w-4" />
          Preview public
        </Link>
      </div>

      {message ? (
        <div
          ref={messageRef}
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm font-semibold text-foreground">Logo</p>
          <div
            className="mt-4 flex h-28 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background"
            style={{
              aspectRatio: mediaSettings.logoAspectRatio === "auto" ? "1 / 1" : mediaSettings.logoAspectRatio,
              width: mediaSettings.logoAspectRatio === "auto" ? "7rem" : undefined,
              maxWidth: "11rem",
            }}
          >
            {effectiveLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={effectiveLogoUrl}
                alt={employer.companyName}
                className="h-full w-full p-2"
                style={{
                  objectFit: mediaSettings.logoFit,
                  transform: `scale(${mediaSettings.logoZoom / 100})`,
                }}
              />
            ) : (
              <span className="text-xs text-muted">No logo</span>
            )}
          </div>
          <div className="mt-4 space-y-3 rounded-xl border border-border bg-background p-3">
            <ControlLabel>Tỷ lệ logo</ControlLabel>
            <RatioButtonGroup
              options={LOGO_ASPECT_RATIO_OPTIONS}
              value={mediaSettings.logoAspectRatio}
              onChange={(value) => updateMediaSettings({ logoAspectRatio: value })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium text-muted">
                Kiểu hiển thị
                <select
                  value={mediaSettings.logoFit}
                  onChange={(event) => updateMediaSettings({ logoFit: event.target.value as CompanyLogoFit })}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
                >
                  <option value="contain">Vừa khung</option>
                  <option value="cover">Crop đầy khung</option>
                </select>
              </label>
              <label className="block text-xs font-medium text-muted">
                Zoom {mediaSettings.logoZoom}%
                <input
                  type="range"
                  min={60}
                  max={200}
                  step={5}
                  value={mediaSettings.logoZoom}
                  onChange={(event) => updateMediaSettings({ logoZoom: Number(event.target.value) })}
                  className="mt-3 w-full accent-primary"
                />
              </label>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <input
              name="logoUrl"
              value={logoUrl}
              onChange={(event) => {
                setLogoUrl(event.target.value);
                setLogoPreviewUrl(event.target.value);
              }}
              placeholder="Logo URL"
              className={inputClassName}
            />
            <input
              ref={logoInputRef}
              name="logo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => handlePreviewFile(event, setLogoPreviewUrl)}
            />
            <UploadButton onClick={() => logoInputRef.current?.click()}>Chọn ảnh logo</UploadButton>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm font-semibold text-foreground">Ảnh bìa</p>
          <p className="mt-1 text-xs text-muted">Có thể nhập URL hoặc upload file mới.</p>
          <div className="mt-4 rounded-xl border border-border bg-background p-3">
            <ControlLabel>Tỷ lệ ảnh bìa public</ControlLabel>
            <RatioButtonGroup
              options={COVER_ASPECT_RATIO_OPTIONS}
              value={mediaSettings.coverAspectRatio}
              onChange={(value) => updateMediaSettings({ coverAspectRatio: value })}
            />
          </div>
          <div className="mt-4">
            {effectiveCoverImageUrl ? (
              <CoverPositionEditor
                key={`${effectiveCoverImageUrl}-${mediaSettings.coverAspectRatio}`}
                imageUrl={effectiveCoverImageUrl}
                positionX={coverPos.positionX}
                positionY={coverPos.positionY}
                zoom={coverPos.zoom}
                aspectRatio={mediaSettings.coverAspectRatio}
                onChange={setCoverPos}
              />
            ) : (
              <div
                className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-border text-sm text-white/80"
                style={{
                  aspectRatio: mediaSettings.coverAspectRatio,
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                }}
              >
                Chưa có ảnh bìa - dùng màu theme.
              </div>
            )}
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px]">
            <input
              name="coverImageUrl"
              value={coverImageUrl}
              onChange={(event) => {
                setCoverImageUrl(event.target.value);
                setCoverPreviewUrl(event.target.value);
              }}
              placeholder="Cover URL"
              className={inputClassName}
            />
            <input
              ref={coverInputRef}
              name="coverImage"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => handlePreviewFile(event, setCoverPreviewUrl)}
            />
            <UploadButton onClick={() => coverInputRef.current?.click()}>Chọn ảnh bìa</UploadButton>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Banner homepage</p>
            <p className="mt-1 text-xs text-muted">
              Dùng cho công ty có quyền hiển thị banner. Để trống sẽ lấy ảnh bìa public.
            </p>
          </div>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted">
            Tỷ lệ {HOMEPAGE_BANNER_ASPECT_RATIO.replace(" / ", ":")}
          </span>
        </div>
        <div className="mt-4">
          {effectiveBannerImageUrl ? (
            <CoverPositionEditor
              key={`${effectiveBannerImageUrl}-${HOMEPAGE_BANNER_ASPECT_RATIO}`}
              imageUrl={effectiveBannerImageUrl}
              positionX={mediaSettings.bannerPositionX}
              positionY={mediaSettings.bannerPositionY}
              zoom={mediaSettings.bannerZoom}
              aspectRatio={HOMEPAGE_BANNER_ASPECT_RATIO}
              onChange={(position) =>
                updateMediaSettings({
                  bannerPositionX: position.positionX,
                  bannerPositionY: position.positionY,
                  bannerZoom: position.zoom,
                })
              }
            />
          ) : (
            <div
              className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-border text-sm text-white/80"
              style={{
                aspectRatio: HOMEPAGE_BANNER_ASPECT_RATIO,
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
              }}
            >
              Chưa có ảnh banner - sẽ dùng màu theme.
            </div>
          )}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <input
            value={mediaSettings.bannerImageUrl ?? ""}
            onChange={(event) => {
              const value = event.target.value.trim();
              updateMediaSettings({ bannerImageUrl: value || null });
              setBannerPreviewUrl(value);
            }}
            placeholder="Banner URL riêng (bỏ trống để dùng ảnh bìa)"
            className={inputClassName}
          />
          <input
            ref={bannerInputRef}
            name="bannerImage"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => handlePreviewFile(event, setBannerPreviewUrl)}
          />
          <UploadButton onClick={() => bannerInputRef.current?.click()}>Chọn ảnh banner</UploadButton>
          <button
            type="button"
            onClick={() => {
              setBannerPreviewUrl("");
              updateMediaSettings({
                bannerImageUrl: null,
                bannerPositionX: 50,
                bannerPositionY: 50,
                bannerZoom: 100,
              });
            }}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-muted transition hover:text-foreground"
          >
            Dùng ảnh bìa
          </button>
        </div>
      </section>

      <input type="hidden" name="coverPositionX" value={coverPos.positionX} />
      <input type="hidden" name="coverPositionY" value={coverPos.positionY} />
      <input type="hidden" name="coverZoom" value={coverPos.zoom} />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="space-y-5 rounded-lg border border-border bg-surface p-6">
          <h3 className="text-base font-bold text-foreground">Thông tin cơ bản</h3>
          <div>
            <label htmlFor="companyName" className="mb-1.5 block text-sm font-medium text-foreground">
              Tên công ty <span className="text-red-500">*</span>
            </label>
            <input id="companyName" name="companyName" required defaultValue={employer.companyName} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
              Giới thiệu công ty
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={employer.description ?? ""}
              className={`${inputClassName} min-h-[150px] resize-y`}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField id="industry" label="Ngành nghề" value={employer.industry} options={options.industryOptions} />
            <SelectField id="companySize" label="Quy mô" value={employer.companySize} options={options.companySizeOptions} />
            <SelectField id="location" label="Khu vực" value={employer.location} options={options.locationOptions} />
            <SelectField id="industrialZone" label="Khu công nghiệp" value={employer.industrialZone} options={options.industrialZoneOptions} />
          </div>
          <div>
            <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-foreground">
              Địa chỉ
            </label>
            <input id="address" name="address" defaultValue={employer.address ?? ""} className={inputClassName} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="website" className="mb-1.5 block text-sm font-medium text-foreground">
                Website
              </label>
              <input id="website" name="website" defaultValue={employer.website ?? ""} className={inputClassName} />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
                Điện thoại
              </label>
              <input id="phone" name="phone" defaultValue={employer.phone ?? ""} className={inputClassName} />
            </div>
          </div>
          <FieldVisibilityControls
            value={sidebarVisibility}
            onChange={(key, checked) => {
              setSidebarVisibility((current) => ({ ...current, [key]: checked }));
            }}
          />
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <h3 className="text-base font-bold text-foreground">Theme public</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {COMPANY_THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setTheme(normalizeCompanyTheme(preset.theme))}
                className="rounded-xl border border-border bg-background p-3 text-left transition hover:border-primary/40"
              >
                <div
                  className="h-9 rounded-lg border border-white"
                  style={{
                    background: `linear-gradient(135deg, ${preset.theme.backgroundColor}, ${preset.theme.surfaceColor}, ${preset.theme.accentColor})`,
                  }}
                />
                <p className="mt-2 text-xs font-semibold text-foreground">{preset.name}</p>
              </button>
            ))}
          </div>
          <div className="grid gap-3">
            {THEME_FIELDS.map(({ key, label }) => (
              <label key={key} className="grid gap-2 rounded-xl border border-border bg-background p-3 text-sm">
                <span className="font-semibold text-foreground">{label}</span>
                <span className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(event) => updateThemeValue(key, event.target.value)}
                    className="h-10 w-12 rounded-lg border border-border bg-surface"
                  />
                  <input
                    value={theme[key]}
                    onChange={(event) => updateThemeValue(key, event.target.value)}
                    className={inputClassName}
                  />
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-lg border border-border bg-surface p-6">
        <div>
          <h3 className="text-base font-bold text-foreground">Builder trang giới thiệu</h3>
          <p className="mt-1 text-sm text-muted">
            Chỉnh rich text, chỉ số, phúc lợi, gallery, video, quote và CTA của trang công ty public.
          </p>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="font-semibold text-foreground">Video giới thiệu chính</span>
          <input
            value={primaryVideoUrl}
            onChange={(event) => setPrimaryVideoUrl(event.target.value)}
            placeholder="YouTube hoặc Vimeo URL"
            className={inputClassName}
          />
        </label>
        <BlockBuilder
          name="profileSections"
          layoutName="profileSectionLayout"
          context="company"
          title="Section profile công ty"
          description="Admin chỉnh trực tiếp các block đang hiển thị trên public."
          initialBlocks={employer.profileConfig?.sections ?? []}
          initialLayout={employer.profileConfig?.theme}
          maxImages={capabilities.maxImages}
          allowGallery={capabilities.gallery}
          allowVideo={capabilities.video}
          allowHtml={capabilities.html}
          previewTheme={theme}
        />
      </section>

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          Lưu ở đây sẽ cập nhật public ngay và revalidate trang công ty / việc làm liên quan.
          {saving ? <span className="ml-2 font-semibold text-primary">Đang lưu, vui lòng chờ...</span> : null}
        </p>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Đang lưu..." : "Lưu profile"}
        </button>
      </div>
    </form>
  );
}

function FieldVisibilityControls({
  value,
  onChange,
}: {
  value: CompanyProfileSidebarVisibility;
  onChange: (key: keyof CompanyProfileSidebarVisibility, checked: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">Hiển thị thông tin trên profile</p>
          <p className="text-xs leading-5 text-muted">
            Bật hoặc tắt từng trường trong khối thông tin công ty ở trang public.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {SIDEBAR_FIELD_OPTIONS.map((option) => (
          <label
            key={option.key}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground"
          >
            <span>{option.label}</span>
            <input
              type="checkbox"
              checked={value[option.key]}
              onChange={(event) => onChange(option.key, event.target.checked)}
              className="h-4 w-4 rounded border-border text-primary accent-primary"
            />
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Mặc định trường điện thoại được tắt để tránh lộ thông tin liên hệ không cần thiết.</p>
    </div>
  );
}

function ControlLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs font-semibold uppercase text-muted">{children}</p>;
}

function UploadButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:border-primary/35 hover:bg-surface hover:text-primary"
    >
      <ImagePlus className="h-4 w-4" />
      {children}
    </button>
  );
}

function RatioButtonGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-muted hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
}: {
  id: string;
  label: string;
  value: string | null;
  options: OptionChoice[];
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <select id={id} name={id} defaultValue={value ?? ""} className={inputClassName}>
        <option value="">Chọn {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
