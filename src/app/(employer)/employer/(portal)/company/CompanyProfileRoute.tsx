"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { CoverPositionEditor } from "@/components/CoverPositionEditor";
import { BlockBuilder } from "@/components/content/BlockBuilder";
import {
  updateCompanyProfileAction,
  getCompanyProfile,
  getCompanyProfileDraftStatus,
  getCompanyProfileOptions,
} from "@/lib/employer-actions";
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
  MEDIA_IMAGE_ACCEPT,
  type MediaUploadKind,
  validateMediaImageFile,
} from "@/lib/media-validation";
import {
  COVER_ASPECT_RATIO_OPTIONS,
  HOMEPAGE_BANNER_ASPECT_RATIO,
  LOGO_ASPECT_RATIO_OPTIONS,
  normalizeCompanyMediaSettings,
  type CompanyLogoFit,
  type CompanyMediaSettings,
} from "@/lib/company-media-settings";
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

type OptionChoice = { value: string; label: string };
type EmployerProfile = NonNullable<Awaited<ReturnType<typeof getCompanyProfile>>>;
type CompanyProfileOptions = Awaited<ReturnType<typeof getCompanyProfileOptions>>;
type CompanyProfileDraftStatus = Awaited<ReturnType<typeof getCompanyProfileDraftStatus>>;

type MessageState =
  | { type: "success"; text: string }
  | { type: "error"; text: string }
  | null;

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25 disabled:cursor-not-allowed disabled:opacity-60";

const THEME_FIELDS: Array<{
  key: keyof CompanyProfileTheme;
  label: string;
  note: string;
}> = [
  {
    key: "primaryColor",
    label: "Màu thương hiệu",
    note: "Dùng cho cover mặc định và các điểm nhận diện chính.",
  },
  {
    key: "accentColor",
    label: "Màu CTA",
    note: "Dùng cho nút ứng tuyển và các điểm chuyển đổi.",
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
    note: "Màu nền của các section nội dung.",
  },
];

const SIDEBAR_FIELD_OPTIONS: Array<{ key: keyof CompanyProfileSidebarVisibility; label: string }> = [
  { key: "industry", label: "Ngành nghề" },
  { key: "companySize", label: "Quy mô" },
  { key: "location", label: "Khu vực" },
  { key: "industrialZone", label: "Khu công nghiệp" },
  { key: "address", label: "Địa chỉ" },
  { key: "website", label: "Website" },
  { key: "phone", label: "Số điện thoại" },
];

function useImageUpload(initialUrl: string | null, kind: MediaUploadKind) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [selectedName, setSelectedName] = useState("");
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

    const validationError = validateMediaImageFile(file, kind);
    if (validationError) {
      clearObjectUrl();
      setPreviewUrl(initialUrl);
      setSelectedName("");
      setError(validationError);
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

export default function CompanyProfilePage() {
  const [employer, setEmployer] = useState<EmployerProfile | null>(null);
  const [options, setOptions] = useState<CompanyProfileOptions | null>(null);
  const [draftStatus, setDraftStatus] = useState<CompanyProfileDraftStatus>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCompanyProfile(),
      getCompanyProfileOptions(),
      getCompanyProfileDraftStatus(),
    ]).then(([profile, formOptions, draft]) => {
      setEmployer(profile);
      setOptions(formOptions);
      setDraftStatus(draft);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-200 border-t-teal-600" />
      </div>
    );
  }

  if (!employer || !options) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Không tìm thấy hồ sơ công ty.
      </div>
    );
  }

  return (
    <CompanyProfileForm
      key={String(employer.updatedAt)}
      employer={employer}
      options={options}
      draftStatus={draftStatus}
      onSaved={(updatedEmployer) => setEmployer(updatedEmployer)}
      onDraftStatusChange={setDraftStatus}
    />
  );
}

function CompanyProfileForm({
  employer,
  options,
  draftStatus,
  onSaved,
  onDraftStatusChange,
}: {
  employer: EmployerProfile;
  options: CompanyProfileOptions;
  draftStatus: CompanyProfileDraftStatus;
  onSaved: (employer: EmployerProfile) => void;
  onDraftStatusChange: (draftStatus: CompanyProfileDraftStatus) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);
  const messageRef = useRef<HTMLDivElement>(null);
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
  const [coverPos, setCoverPos] = useState({
    positionX: employer.coverPositionX ?? 50,
    positionY: employer.coverPositionY ?? 50,
    zoom: employer.coverZoom ?? 100,
  });
  const {
    previewUrl: logoPreviewUrl,
    selectedName: logoSelectedName,
    error: logoError,
    fileInputRef: logoFileInputRef,
    handleFileChange: handleLogoFileChange,
    handleReset: handleLogoReset,
  } = useImageUpload(employer.logo, "profileLogo");
  const {
    previewUrl: coverPreviewUrl,
    selectedName: coverSelectedName,
    error: coverError,
    fileInputRef: coverFileInputRef,
    handleFileChange: handleCoverFileChange,
    handleReset: handleCoverReset,
  } = useImageUpload(employer.coverImage, "profileCover");
  const {
    previewUrl: bannerPreviewUrl,
    selectedName: bannerSelectedName,
    error: bannerError,
    fileInputRef: bannerFileInputRef,
    handleFileChange: handleBannerFileChange,
    handleReset: handleBannerReset,
  } = useImageUpload(mediaSettings.bannerImageUrl, "profileCover");
  const effectiveBannerImageUrl = bannerSelectedName
    ? bannerPreviewUrl
    : mediaSettings.bannerImageUrl || coverPreviewUrl;

  const updateThemeValue = (key: keyof CompanyProfileTheme, value: string) => {
    setTheme((current) => ({ ...current, [key]: value }));
  };

  function updateMediaSettings(next: Partial<CompanyMediaSettings>) {
    setMediaSettings((current) => ({ ...current, ...next }));
  }

  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => {
      messageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      messageRef.current?.focus({ preventScroll: true });
    }, 50);

    return () => window.clearTimeout(timeout);
  }, [message]);

  async function handleSubmit(formData: FormData) {
    if ((logoError && logoFileInputRef.current?.files?.length) ||
      (coverError && coverFileInputRef.current?.files?.length) ||
      (bannerError && bannerFileInputRef.current?.files?.length)) {
      setMessage({ type: "error", text: logoError || coverError || "Lỗi file ảnh." });
      return;
    }

    setSaving(true);
    setMessage(null);
    formData.set("profileTheme", JSON.stringify(theme));
    formData.set("profileMediaSettings", JSON.stringify(mediaSettings));
    formData.set("profileSidebarVisibility", JSON.stringify(sidebarVisibility));
    formData.set("primaryVideoUrl", primaryVideoUrl);

    try {
      const result = await updateCompanyProfileAction(formData);
      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        handleLogoReset();
        handleCoverReset();
        handleBannerReset();
        const [updated, draft] = await Promise.all([
          getCompanyProfile(),
          getCompanyProfileDraftStatus(),
        ]);
        if (updated) onSaved(updated);
        onDraftStatusChange(draft);
      }
    } catch (error) {
      console.error("CompanyProfilePage submit error:", error);
      setMessage({ type: "error", text: "Đã có lỗi xảy ra." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-800">
            <Building2 className="h-7 w-7 text-teal-600" />
            Hồ sơ công ty
          </h1>
          <p className="mt-1 text-gray-500">
            Tùy chỉnh trang công ty public, media, màu sắc và các section nội dung.
          </p>
        </div>

        <Link
          href={`/cong-ty/${employer.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
        >
          <ExternalLink className="h-4 w-4" />
          Preview public
        </Link>
      </div>

      {message && (
        <div
          ref={messageRef}
          tabIndex={-1}
          role={message.type === "success" ? "status" : "alert"}
          aria-live="polite"
          className={`flex items-start gap-3 rounded-lg border p-4 ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          )}
          <p className={`text-sm ${message.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
            {message.text}
          </p>
        </div>
      )}

      {draftStatus && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            draftStatus.status === "REJECTED"
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          <p className="font-semibold">
            {draftStatus.status === "REJECTED"
              ? "Bản nháp gần nhất đã bị từ chối"
              : "Bản nháp đang chờ admin duyệt"}
          </p>
          <p className="mt-1">
            {draftStatus.status === "REJECTED"
              ? draftStatus.rejectReason || "Admin chưa nhập lý do cụ thể."
              : "Thay đổi mới sẽ không xuất hiện trên trang public cho tới khi admin duyệt."}
          </p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        <section className="rounded-lg border border-gray-100 bg-white p-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-800">Logo công ty</p>
              <p className="mt-1 text-xs text-gray-500">JPG, PNG, WebP. Tối đa 2MB.</p>
              <div className="mt-4 flex flex-col items-center gap-3">
                <div
                  className="flex min-h-24 items-center justify-center overflow-hidden rounded-2xl border border-teal-100 bg-white"
                  style={{
                    aspectRatio: mediaSettings.logoAspectRatio === "auto" ? "1 / 1" : mediaSettings.logoAspectRatio,
                    width: mediaSettings.logoAspectRatio === "auto" ? "6rem" : undefined,
                    maxWidth: "11rem",
                  }}
                >
                  {logoPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreviewUrl}
                      alt={employer.companyName}
                      className="h-full w-full p-2"
                      style={{
                        objectFit: mediaSettings.logoFit,
                        transform: `scale(${mediaSettings.logoZoom / 100})`,
                      }}
                    />
                  ) : (
                    <Building2 className="h-9 w-9 text-teal-600" />
                  )}
                </div>
                <div className="w-full space-y-3 rounded-xl border border-gray-200 bg-white p-3">
                  <ControlLabel>Tỷ lệ logo</ControlLabel>
                  <RatioButtonGroup
                    options={LOGO_ASPECT_RATIO_OPTIONS}
                    value={mediaSettings.logoAspectRatio}
                    onChange={(value) => updateMediaSettings({ logoAspectRatio: value })}
                  />
                  <div className="grid gap-3">
                    <label className="block text-xs font-medium text-gray-500">
                      Kiểu hiển thị
                      <select
                        value={mediaSettings.logoFit}
                        onChange={(event) => updateMediaSettings({ logoFit: event.target.value as CompanyLogoFit })}
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"
                      >
                        <option value="contain">Vừa khung</option>
                        <option value="cover">Crop đầy khung</option>
                      </select>
                    </label>
                    <label className="block text-xs font-medium text-gray-500">
                      Zoom {mediaSettings.logoZoom}%
                      <input
                        type="range"
                        min={60}
                        max={200}
                        step={5}
                        value={mediaSettings.logoZoom}
                        onChange={(event) => updateMediaSettings({ logoZoom: Number(event.target.value) })}
                        className="mt-3 w-full accent-teal-600"
                      />
                    </label>
                  </div>
                </div>
                <input
                  ref={logoFileInputRef}
                  id="logo"
                  name="logo"
                  type="file"
                  accept={MEDIA_IMAGE_ACCEPT}
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <ImagePlus className="h-4 w-4" />
                  {logoPreviewUrl ? "Đổi logo" : "Tải logo lên"}
                </button>
                {logoSelectedName ? (
                  <>
                    <p className="w-full truncate rounded-lg bg-teal-50 px-3 py-1.5 text-xs text-teal-700">
                      {logoSelectedName}
                    </p>
                    <button
                      type="button"
                      onClick={handleLogoReset}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
                    >
                      <X className="h-3.5 w-3.5" />
                      Bỏ logo mới
                    </button>
                  </>
                ) : null}
                {logoError ? <p className="text-xs text-red-600">{logoError}</p> : null}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-800">Ảnh bìa công ty</p>
              <p className="mt-1 text-xs text-gray-500">JPG, PNG, WebP. Tối đa 5MB. Khuyến nghị 1200x400px.</p>
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
                <ControlLabel>Tỷ lệ ảnh bìa public</ControlLabel>
                <RatioButtonGroup
                  options={COVER_ASPECT_RATIO_OPTIONS}
                  value={mediaSettings.coverAspectRatio}
                  onChange={(value) => updateMediaSettings({ coverAspectRatio: value })}
                />
              </div>
              <div className="mt-4 space-y-3">
                {coverPreviewUrl ? (
                  <CoverPositionEditor
                    key={`${coverPreviewUrl}-${mediaSettings.coverAspectRatio}`}
                    imageUrl={coverPreviewUrl}
                    positionX={coverPos.positionX}
                    positionY={coverPos.positionY}
                    zoom={coverPos.zoom}
                    aspectRatio={mediaSettings.coverAspectRatio}
                    onChange={setCoverPos}
                  />
                ) : (
                  <div
                    className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-white/80"
                    style={{
                      aspectRatio: mediaSettings.coverAspectRatio,
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                    }}
                  >
                    Chưa có ảnh bìa - sẽ dùng màu theme.
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <input
                    ref={coverFileInputRef}
                    id="coverImage"
                    name="coverImage"
                    type="file"
                    accept={MEDIA_IMAGE_ACCEPT}
                    onChange={handleCoverFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <ImagePlus className="h-4 w-4" />
                    {coverPreviewUrl ? "Đổi ảnh bìa" : "Tải ảnh bìa lên"}
                  </button>
                  {coverSelectedName ? (
                    <button
                      type="button"
                      onClick={handleCoverReset}
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
                    >
                      <X className="h-4 w-4" />
                      Bỏ ảnh mới
                    </button>
                  ) : null}
                </div>
                {coverSelectedName ? (
                  <p className="truncate rounded-lg bg-teal-50 px-3 py-1.5 text-xs text-teal-700">
                    {coverSelectedName}
                  </p>
                ) : null}
                {coverError ? <p className="text-xs text-red-600">{coverError}</p> : null}
              </div>
            </div>
          </div>

          <input type="hidden" name="coverPositionX" value={coverPos.positionX} />
          <input type="hidden" name="coverPositionY" value={coverPos.positionY} />
          <input type="hidden" name="coverZoom" value={coverPos.zoom} />
        </section>

        <section className="rounded-lg border border-gray-100 bg-white p-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Banner homepage</p>
              <p className="mt-1 text-xs text-gray-500">
                Dành cho gói có quyền hiển thị banner. Bỏ trống sẽ dùng ảnh bìa public.
              </p>
            </div>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
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
                className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-white/80"
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
              }}
              placeholder="Banner URL riêng (bỏ trống để dùng ảnh bìa)"
              className={inputClassName}
            />
            <input
              ref={bannerFileInputRef}
              name="bannerImage"
              type="file"
              accept={MEDIA_IMAGE_ACCEPT}
              onChange={handleBannerFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => bannerFileInputRef.current?.click()}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <ImagePlus className="h-4 w-4" />
              {effectiveBannerImageUrl ? "Đổi banner" : "Tải banner lên"}
            </button>
            <button
              type="button"
              onClick={() => {
                updateMediaSettings({
                  bannerImageUrl: null,
                  bannerPositionX: 50,
                  bannerPositionY: 50,
                  bannerZoom: 100,
                });
                handleBannerReset();
              }}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
            >
              Dùng ảnh bìa
            </button>
          </div>
          {bannerSelectedName ? (
            <p className="mt-3 truncate rounded-lg bg-teal-50 px-3 py-1.5 text-xs text-teal-700">
              {bannerSelectedName}
            </p>
          ) : null}
          {bannerError ? <p className="mt-2 text-xs text-red-600">{bannerError}</p> : null}
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <div className="rounded-lg border border-gray-100 bg-white p-6 space-y-5">
            <h2 className="text-base font-bold text-gray-800">Thông tin cơ bản</h2>

            <div>
              <label htmlFor="companyName" className="mb-1.5 block text-sm font-medium text-gray-700">
                Tên công ty <span className="text-red-500">*</span>
              </label>
              <input id="companyName" name="companyName" required defaultValue={employer.companyName} className={inputClassName} />
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700">
                Giới thiệu công ty
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                defaultValue={employer.description ?? ""}
                placeholder="Mô tả ngắn gọn về công ty, văn hóa, môi trường làm việc..."
                className={`${inputClassName} min-h-[150px] resize-y`}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField id="industry" label="Ngành nghề" value={employer.industry} options={options.industryOptions} />
              <SelectField id="companySize" label="Quy mô công ty" value={employer.companySize} options={options.companySizeOptions} />
              <SelectField id="location" label="Khu vực" value={employer.location} options={options.locationOptions} />
              <SelectField id="industrialZone" label="Khu công nghiệp" value={employer.industrialZone} options={options.industrialZoneOptions} />
            </div>

            <div>
              <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-gray-700">
                Địa chỉ
              </label>
              <input id="address" name="address" defaultValue={employer.address ?? ""} placeholder="VD: KCN Yên Phong, Bắc Ninh" className={inputClassName} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="website" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input id="website" name="website" defaultValue={employer.website ?? ""} placeholder="company.com hoặc https://company.com" className={inputClassName} />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input id="phone" name="phone" type="tel" defaultValue={employer.phone ?? ""} placeholder="0123 456 789" className={inputClassName} />
              </div>
            </div>
            <FieldVisibilityControls
              value={sidebarVisibility}
              onChange={(key, checked) => {
                setSidebarVisibility((current) => ({ ...current, [key]: checked }));
              }}
            />
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-800">Theme public</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {capabilities.theme
                    ? "Chọn preset hoặc chỉnh màu thủ công."
                    : "Admin chưa mở quyền chỉnh theme cho tài khoản này."}
                </p>
              </div>
              <button
                type="button"
                disabled={!capabilities.theme}
                onClick={() => setTheme(normalizeCompanyTheme(DEFAULT_COMPANY_THEME))}
                className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {COMPANY_THEME_PRESETS.map((preset) => {
                const isCurrent = THEME_FIELDS.every(
                  ({ key }) => theme[key].toLowerCase() === preset.theme[key].toLowerCase()
                );
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={!capabilities.theme}
                    onClick={() => setTheme(normalizeCompanyTheme(preset.theme))}
                    className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                      isCurrent ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div
                      className="h-10 rounded-lg border border-white shadow-inner"
                      style={{
                        background: `linear-gradient(135deg, ${preset.theme.backgroundColor} 0%, ${preset.theme.surfaceColor} 48%, ${preset.theme.accentColor} 100%)`,
                      }}
                    />
                    <p className="mt-2 text-sm font-semibold text-gray-800">{preset.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{preset.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3">
              {THEME_FIELDS.map(({ key, label, note }) => (
                <label key={key} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-gray-800">{label}</span>
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{theme[key]}</span>
                  </span>
                  <span className="mt-2 flex items-center gap-2">
                    <input
                      type="color"
                      value={theme[key]}
                      disabled={!capabilities.theme}
                      onChange={(event) => updateThemeValue(key, event.target.value)}
                      className="h-11 w-12 shrink-0 rounded-lg border border-gray-200 bg-white disabled:opacity-50"
                    />
                    <input
                      value={theme[key]}
                      disabled={!capabilities.theme}
                      onChange={(event) => updateThemeValue(key, event.target.value)}
                      className={`${inputClassName} disabled:opacity-50`}
                    />
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-gray-500">{note}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-100 bg-white p-6 space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-800">Builder trang giới thiệu công ty</h2>
              <p className="mt-1 text-sm text-gray-500">
                Tạo rich text, chỉ số, phúc lợi, ảnh, gallery, video, quote và CTA cho trang public.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
              Quyền: {capabilities.maxImages} ảnh
              {capabilities.gallery ? " / gallery" : ""}
              {capabilities.video ? " / video" : ""}
              {capabilities.html ? " / HTML" : ""}
            </div>
          </div>

          <label className="block space-y-1 text-sm">
            <span className="font-semibold text-gray-800">Video giới thiệu chính</span>
            <input
              value={primaryVideoUrl}
              disabled={!capabilities.video}
              onChange={(event) => setPrimaryVideoUrl(event.target.value)}
              placeholder="YouTube hoặc Vimeo URL"
              className={`${inputClassName} disabled:opacity-50`}
            />
          </label>

          <BlockBuilder
            name="profileSections"
            layoutName="profileSectionLayout"
            context="company"
            title="Section template công ty"
            description="Dùng các block để tạo trang giới thiệu công ty chi tiết hơn phần mô tả ngắn."
            initialBlocks={employer.profileConfig?.sections ?? []}
            initialLayout={employer.profileConfig?.theme}
            maxImages={capabilities.maxImages}
            allowGallery={capabilities.gallery}
            allowVideo={capabilities.video}
            allowHtml={capabilities.html}
            previewTheme={theme}
          />
        </section>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-400">
            Khi gửi duyệt, trang public chưa thay đổi cho tới khi admin phê duyệt.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Đang gửi..." : "Gửi duyệt"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ControlLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs font-semibold uppercase text-gray-500">{children}</p>;
}

function FieldVisibilityControls({
  value,
  onChange,
}: {
  value: CompanyProfileSidebarVisibility;
  onChange: (key: keyof CompanyProfileSidebarVisibility, checked: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-bold text-gray-800">Hiển thị thông tin trên profile</p>
      <p className="mt-1 text-xs leading-5 text-gray-500">
        Chọn các trường được hiển thị trong khối thông tin công ty ở trang public.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {SIDEBAR_FIELD_OPTIONS.map((option) => (
          <label
            key={option.key}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700"
          >
            <span>{option.label}</span>
            <input
              type="checkbox"
              checked={value[option.key]}
              onChange={(event) => onChange(option.key, event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-teal-600"
            />
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500">Mặc định ẩn số điện thoại để tránh công khai thông tin liên hệ không cần thiết.</p>
    </div>
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
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-gray-200 bg-white text-gray-500 hover:border-teal-300 hover:text-gray-800"
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
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
