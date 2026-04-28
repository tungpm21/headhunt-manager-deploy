"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  Loader2,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import { updateEmployerInfo } from "@/lib/moderation-actions";
import { CoverPositionEditor } from "@/components/CoverPositionEditor";
import { BlockBuilder } from "@/components/content/BlockBuilder";
import {
  COMPANY_THEME_PRESETS,
  DEFAULT_COMPANY_CAPABILITIES,
  DEFAULT_COMPANY_THEME,
  normalizeCompanyCapabilities,
  normalizeCompanyTheme,
  type CompanyProfileCapabilities,
  type CompanyProfileTheme,
  type ContentBlock,
} from "@/lib/content-blocks";
import type { OptionChoice } from "@/lib/config-options";

type EmployerEditData = {
  id: number;
  email: string;
  companyName: string;
  logo: string | null;
  coverImage: string | null;
  description: string | null;
  industry: string | null;
  companySize: string | null;
  address: string | null;
  location: string | null;
  industrialZone: string | null;
  website: string | null;
  phone: string | null;
  status: string;
  slug: string;
  updatedAt: string;
  coverPositionX: number;
  coverPositionY: number;
  coverZoom: number;
  profileConfig: {
    theme: CompanyProfileTheme;
    capabilities: CompanyProfileCapabilities;
    sections: ContentBlock[];
    primaryVideoUrl: string | null;
  } | null;
};

type MessageState =
  | { type: "success"; text: string }
  | { type: "error"; text: string }
  | null;

const COMPANY_SIZES = [
  { value: "SMALL", label: "Nhỏ (< 50 nhân viên)" },
  { value: "MEDIUM", label: "Vừa (50 - 200 nhân viên)" },
  { value: "LARGE", label: "Lớn (200 - 1000 nhân viên)" },
  { value: "ENTERPRISE", label: "Tập đoàn (> 1000 nhân viên)" },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const MAX_COVER_BYTES = 5 * 1024 * 1024;

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

const THEME_FIELDS: Array<{
  key: keyof CompanyProfileTheme;
  label: string;
  note: string;
}> = [
  {
    key: "primaryColor",
    label: "Màu thương hiệu",
    note: "Dùng cho cover mặc định và một số điểm nhấn nhỏ, không phủ lên ảnh cover.",
  },
  {
    key: "accentColor",
    label: "Màu nhấn / button",
    note: "Dùng cho CTA, nút chính và các điểm chuyển đổi.",
  },
  {
    key: "backgroundColor",
    label: "Màu nền trang",
    note: "Nền tổng thể phía sau nội dung công ty.",
  },
  {
    key: "textColor",
    label: "Màu chữ",
    note: "Màu tiêu đề và nội dung chính trên trang public.",
  },
  {
    key: "borderColor",
    label: "Màu khung",
    note: "Màu viền cho card, gallery và khối thông tin.",
  },
  {
    key: "surfaceColor",
    label: "Màu ô nội dung",
    note: "Màu nền của card/section chứa nội dung.",
  },
];

interface EmployerEditFormProps {
  employer: EmployerEditData;
  industryOptions: OptionChoice[];
  companySizeOptions: OptionChoice[];
  locationOptions: OptionChoice[];
  industrialZoneOptions: OptionChoice[];
}

function useImageUpload(initialUrl: string | null, maxBytes: number) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [selectedName, setSelectedName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  function clearObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  useEffect(() => {
    return () => clearObjectUrl();
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      clearObjectUrl();
      setPreviewUrl(initialUrl);
      setSelectedName("");
      setError("Chỉ chấp nhận file JPG, PNG hoặc WebP.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > maxBytes) {
      clearObjectUrl();
      setPreviewUrl(initialUrl);
      setSelectedName("");
      setError(`File quá lớn. Tối đa ${Math.round(maxBytes / 1024 / 1024)}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    clearObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    setSelectedName(file.name);
    setError(null);
  }

  function handleReset() {
    clearObjectUrl();
    setPreviewUrl(initialUrl);
    setSelectedName("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return { previewUrl, selectedName, error, fileInputRef, handleFileChange, handleReset };
}

export function EmployerEditForm({
  employer,
  industryOptions,
  companySizeOptions,
  locationOptions,
  industrialZoneOptions,
}: EmployerEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  const {
    previewUrl: logoPreviewUrl,
    selectedName: logoSelectedName,
    error: logoError,
    fileInputRef: logoFileInputRef,
    handleFileChange: handleLogoFileChange,
    handleReset: handleLogoReset,
  } = useImageUpload(employer.logo, MAX_LOGO_BYTES);
  const {
    previewUrl: coverPreviewUrl,
    selectedName: coverSelectedName,
    error: coverError,
    fileInputRef: coverFileInputRef,
    handleFileChange: handleCoverFileChange,
    handleReset: handleCoverReset,
  } = useImageUpload(employer.coverImage, MAX_COVER_BYTES);
  const initialTheme = normalizeCompanyTheme(employer.profileConfig?.theme ?? DEFAULT_COMPANY_THEME);
  const initialCapabilities = normalizeCompanyCapabilities(
    employer.profileConfig?.capabilities ?? DEFAULT_COMPANY_CAPABILITIES
  );
  const [theme, setTheme] = useState(initialTheme);
  const [capabilities, setCapabilities] = useState(initialCapabilities);
  const [primaryVideoUrl, setPrimaryVideoUrl] = useState(employer.profileConfig?.primaryVideoUrl ?? "");
  const effectiveCompanySizeOptions = companySizeOptions.length > 0 ? companySizeOptions : COMPANY_SIZES;
  const updateThemeValue = (key: keyof CompanyProfileTheme, value: string) => {
    setTheme((current) => ({ ...current, [key]: value }));
  };
  const applyThemePreset = (nextTheme: CompanyProfileTheme) => {
    setTheme(normalizeCompanyTheme(nextTheme));
  };
  const [coverPos, setCoverPos] = useState({
    positionX: employer.coverPositionX ?? 50,
    positionY: employer.coverPositionY ?? 50,
    zoom: employer.coverZoom ?? 100,
  });

  const canPreviewPublicPage = employer.status === "ACTIVE";

  async function handleSubmit(formData: FormData) {
    if ((logoError && logoFileInputRef.current?.files?.length) ||
      (coverError && coverFileInputRef.current?.files?.length)) {
      setMessage({ type: "error", text: logoError || coverError || "Lỗi file ảnh." });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    formData.set("profileTheme", JSON.stringify(theme));
    formData.set("profileCapabilities", JSON.stringify(capabilities));
    formData.set("primaryVideoUrl", primaryVideoUrl);

    try {
      const result = await updateEmployerInfo(employer.id, undefined, formData);

      if (!result.success) {
        setMessage({ type: "error", text: result.message || "Không thể lưu thay đổi." });
        return;
      }

      handleLogoReset();
      handleCoverReset();
      setMessage({ type: "success", text: result.message || "Đã lưu thay đổi." });
    } catch (error) {
      console.error("EmployerEditForm submit error:", error);
      setMessage({ type: "error", text: "Đã có lỗi xảy ra khi lưu thông tin." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Thông tin hiển thị trên FDIWork</h2>
          <p className="text-sm text-muted mt-1">
            Lưu thay đổi để cập nhật trang công ty public và thông tin employer liên quan.
          </p>
        </div>

        {canPreviewPublicPage ? (
          <Link
            href={`/cong-ty/${employer.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15"
          >
            <ExternalLink className="h-4 w-4" />
            Preview trang public
          </Link>
        ) : (
          <span
            className="inline-flex items-center rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted"
            title="Preview public page chỉ khả dụng khi employer đang ACTIVE"
          >
            Preview chỉ mở khi employer đang ACTIVE
          </span>
        )}
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${message.type === "success"
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
            }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          )}
          <p
            className={`text-sm ${message.type === "success" ? "text-emerald-700" : "text-red-700"
              }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <form
        key={employer.updatedAt}
        action={handleSubmit}
        className="space-y-6"
      >
        {/* Images row: logo + cover */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr]">
          {/* Logo upload */}
          <div className="rounded-2xl border border-border bg-background p-5 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Ảnh đại diện (Logo)</p>
              <p className="text-xs text-muted">JPG, PNG, WebP. Tối đa 2MB.</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="h-24 w-24 rounded-2xl border border-border bg-surface overflow-hidden flex items-center justify-center">
                {logoPreviewUrl ? (
                  <img src={logoPreviewUrl} alt={employer.companyName} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-9 w-9 text-primary" />
                )}
              </div>

              <div className="w-full space-y-2">
                <input
                  ref={logoFileInputRef}
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface"
                >
                  <ImagePlus className="h-4 w-4" />
                  {logoPreviewUrl ? "Đổi logo" : "Tải logo lên"}
                </button>

                {logoSelectedName && (
                  <>
                    <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary truncate">
                      {logoSelectedName}
                    </div>
                    <button
                      type="button"
                      onClick={handleLogoReset}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted transition hover:bg-surface hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                      Bỏ logo mới
                    </button>
                  </>
                )}
                {logoError && <p className="text-xs text-red-600">{logoError}</p>}
              </div>
            </div>
          </div>

          {/* Cover image upload */}
          <div className="rounded-2xl border border-border bg-background p-5 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Ảnh bìa (Cover)</p>
              <p className="text-xs text-muted">JPG, PNG, WebP. Tối đa 5MB. Khuyến nghị 1200×400px.</p>
            </div>

            {/* Cover preview */}
            <div className="w-full h-32 rounded-xl border border-border bg-surface overflow-hidden flex items-center justify-center">
              {coverPreviewUrl ? (
                <img src={coverPreviewUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[var(--color-fdi-dark)] via-[#005A9E] to-[var(--color-fdi-primary)] flex items-center justify-center">
                  <p className="text-white/60 text-xs">Chưa có ảnh bìa — sẽ dùng gradient mặc định</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input
                ref={coverFileInputRef}
                id="coverImage"
                name="coverImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface"
              >
                <ImagePlus className="h-4 w-4" />
                {coverPreviewUrl ? "Đổi ảnh bìa" : "Tải ảnh bìa lên"}
              </button>

              {coverSelectedName && (
                <>
                  <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary truncate">
                    {coverSelectedName}
                  </div>
                  <button
                    type="button"
                    onClick={handleCoverReset}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted transition hover:bg-surface hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                    Bỏ ảnh bìa mới
                  </button>
                </>
              )}
              {coverError && <p className="text-xs text-red-600">{coverError}</p>}
            </div>

            {/* Cover position editor */}
            {coverPreviewUrl && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Căn chỉnh vị trí hiển thị</p>
                <CoverPositionEditor
                  imageUrl={coverPreviewUrl}
                  positionX={coverPos.positionX}
                  positionY={coverPos.positionY}
                  zoom={coverPos.zoom}
                  onChange={setCoverPos}
                />
              </div>
            )}
            <input type="hidden" name="coverPositionX" value={coverPos.positionX} />
            <input type="hidden" name="coverPositionY" value={coverPos.positionY} />
            <input type="hidden" name="coverZoom" value={coverPos.zoom} />
          </div>
        </div>

        {/* Text fields */}
        <div className="space-y-5">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-1.5">
              Tên công ty <span className="text-red-500">*</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              defaultValue={employer.companyName}
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1.5">
                Khu vực
              </label>
              <select
                id="location"
                name="location"
                defaultValue={employer.location ?? ""}
                className={inputClassName}
              >
                <option value="">Chọn khu vực</option>
                {locationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="industrialZone" className="block text-sm font-medium text-foreground mb-1.5">
                Khu công nghiệp
              </label>
              <select
                id="industrialZone"
                name="industrialZone"
                defaultValue={employer.industrialZone ?? ""}
                className={inputClassName}
              >
                <option value="">Chọn KCN</option>
                {industrialZoneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted">
                Dùng để sync với filter công ty và việc làm; địa chỉ chi tiết vẫn nhập bên dưới.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
              Mô tả công ty
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={employer.description ?? ""}
              placeholder="Mô tả ngắn gọn về doanh nghiệp, văn hóa, môi trường làm việc..."
              className={`${inputClassName} resize-y min-h-[140px]`}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-foreground mb-1.5">
                Ngành nghề
              </label>
              <select
                id="industry"
                name="industry"
                defaultValue={employer.industry ?? ""}
                data-placeholder="industry-example"
                className={inputClassName}
              >
                <option value="">Chọn ngành nghề</option>
                {industryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted">
                Danh sách này lấy từ Cấu hình dữ liệu. Muốn thêm ngành mới, thêm tại Settings trước.
              </p>
            </div>

            <div>
              <label htmlFor="companySize" className="block text-sm font-medium text-foreground mb-1.5">
                Quy mô công ty
              </label>
              <select
                id="companySize"
                name="companySize"
                defaultValue={employer.companySize ?? ""}
                className={inputClassName}
              >
                <option value="">Chọn quy mô</option>
                {effectiveCompanySizeOptions.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1.5">
              Địa chỉ
            </label>
            <input
              id="address"
              name="address"
              type="text"
              defaultValue={employer.address ?? ""}
              placeholder="Ví dụ: KCN Yên Phong, Bắc Ninh"
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-foreground mb-1.5">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="text"
                defaultValue={employer.website ?? ""}
                placeholder="company.com hoặc https://company.com"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={employer.phone ?? ""}
                placeholder="0123 456 789"
                className={inputClassName}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Builder trang giới thiệu công ty</h3>
              <p className="mt-1 text-sm text-muted">
                Admin quyết định theme, quyền hiển thị và các section nổi bật cho từng công ty.
              </p>
            </div>
            {canPreviewPublicPage ? (
              <Link
                href={`/cong-ty/${employer.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15"
              >
                <ExternalLink className="h-4 w-4" />
                Preview public
              </Link>
            ) : null}
          </div>

          <div className="mt-5 space-y-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.85fr)]">
              <div className="rounded-2xl border border-border bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Theme public profile</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Cover image luôn hiển thị rõ. Màu nhấn dùng cho button, màu nền dùng cho background,
                      màu khung và màu ô nội dung dùng cho card/section.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!capabilities.theme}
                    onClick={() => applyThemePreset(DEFAULT_COMPANY_THEME)}
                    className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset mặc định
                  </button>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {COMPANY_THEME_PRESETS.map((preset) => {
                    const isCurrent = THEME_FIELDS.every(
                      ({ key }) => theme[key].toLowerCase() === preset.theme[key].toLowerCase()
                    );
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        disabled={!capabilities.theme}
                        onClick={() => applyThemePreset(preset.theme)}
                        className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                          isCurrent ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-background"
                        }`}
                      >
                        <div
                          className="h-12 rounded-xl border border-white shadow-inner"
                          style={{
                            background: `linear-gradient(135deg, ${preset.theme.backgroundColor} 0%, ${preset.theme.surfaceColor} 48%, ${preset.theme.accentColor} 100%)`,
                          }}
                        />
                        <div className="mt-3 flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{preset.name}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted">{preset.description}</p>
                          </div>
                          <span className="flex shrink-0 gap-1">
                            {[
                              preset.theme.accentColor,
                              preset.theme.backgroundColor,
                              preset.theme.surfaceColor,
                            ].map((color) => (
                              <span
                                key={color}
                                className="h-3.5 w-3.5 rounded-full border border-white shadow"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {THEME_FIELDS.map(({ key, label, note }) => (
                    <label key={key} className="rounded-2xl border border-border bg-background p-3 text-sm">
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-foreground">{label}</span>
                        <span className="text-xs font-medium uppercase tracking-wide text-muted">{theme[key]}</span>
                      </span>
                      <span className="mt-2 flex items-center gap-2">
                        <input
                          type="color"
                          value={theme[key]}
                          disabled={!capabilities.theme}
                          onChange={(event) => updateThemeValue(key, event.target.value)}
                          className="h-11 w-12 shrink-0 rounded-lg border border-border bg-white disabled:opacity-50"
                        />
                        <input
                          value={theme[key]}
                          disabled={!capabilities.theme}
                          onChange={(event) => updateThemeValue(key, event.target.value)}
                          className={`${inputClassName} disabled:opacity-50`}
                        />
                      </span>
                      <span className="mt-2 block text-xs leading-5 text-muted">{note}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-border bg-white p-4">
                  <p className="text-sm font-semibold text-foreground">Quyền tùy biến</p>
                  <div className="mt-3 space-y-3">
                    {([
                      ["theme", "Cho đổi theme"],
                      ["gallery", "Cho gallery"],
                      ["video", "Cho video"],
                      ["html", "Cho HTML an toàn"],
                    ] as const).map(([key, label]) => (
                      <label key={key} className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2 text-sm">
                        <span className="font-medium text-foreground">{label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(capabilities[key])}
                          onChange={(event) =>
                            setCapabilities((current) => ({ ...current, [key]: event.target.checked }))
                          }
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                        />
                      </label>
                    ))}
                    <label className="block space-y-1 text-sm">
                      <span className="font-medium text-foreground">Số ảnh tối đa</span>
                      <input
                        type="number"
                        min={0}
                        max={12}
                        value={capabilities.maxImages}
                        onChange={(event) =>
                          setCapabilities((current) => ({
                            ...current,
                            maxImages: Number.parseInt(event.target.value, 10) || 0,
                          }))
                        }
                        className={inputClassName}
                      />
                    </label>
                  </div>
                </div>

                <label className="block space-y-1 rounded-2xl border border-border bg-white p-4 text-sm">
                  <span className="font-semibold text-foreground">Video giới thiệu chính</span>
                  <input
                    value={primaryVideoUrl}
                    disabled={!capabilities.video}
                    onChange={(event) => setPrimaryVideoUrl(event.target.value)}
                    placeholder="YouTube hoặc Vimeo URL"
                    className={`${inputClassName} disabled:opacity-50`}
                  />
                </label>
              </div>
            </div>

            <BlockBuilder
              name="profileSections"
              context="company"
              title="Section template công ty"
              description="Dùng rich text, chỉ số, phúc lợi, gallery, video, quote, CTA và HTML an toàn."
              initialBlocks={employer.profileConfig?.sections ?? []}
              maxImages={capabilities.maxImages}
              allowHtml={capabilities.html}
              previewTheme={theme}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            Khi lưu, trang công ty public và các trang liên quan sẽ được revalidate tự động.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/employers/${employer.id}`}
              className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-surface"
            >
              Quay lại chi tiết
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
