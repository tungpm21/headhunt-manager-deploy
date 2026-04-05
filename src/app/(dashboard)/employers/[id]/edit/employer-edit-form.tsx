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
  Save,
  X,
} from "lucide-react";
import { updateEmployerInfo } from "@/lib/moderation-actions";
import { CoverPositionEditor } from "@/components/CoverPositionEditor";

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
  website: string | null;
  phone: string | null;
  status: string;
  slug: string;
  updatedAt: string;
  coverPositionX: number;
  coverPositionY: number;
  coverZoom: number;
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

interface EmployerEditFormProps {
  employer: EmployerEditData;
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
    setPreviewUrl(initialUrl);
  }, [initialUrl]);

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

export function EmployerEditForm({ employer }: EmployerEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  const logo = useImageUpload(employer.logo, MAX_LOGO_BYTES);
  const cover = useImageUpload(employer.coverImage, MAX_COVER_BYTES);
  const [coverPos, setCoverPos] = useState({
    positionX: employer.coverPositionX ?? 50,
    positionY: employer.coverPositionY ?? 50,
    zoom: employer.coverZoom ?? 100,
  });

  const canPreviewPublicPage = employer.status === "ACTIVE";

  async function handleSubmit(formData: FormData) {
    if ((logo.error && logo.fileInputRef.current?.files?.length) ||
      (cover.error && cover.fileInputRef.current?.files?.length)) {
      setMessage({ type: "error", text: logo.error || cover.error || "Lỗi file ảnh." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const result = await updateEmployerInfo(employer.id, undefined, formData);

      if (!result.success) {
        setMessage({ type: "error", text: result.message || "Không thể lưu thay đổi." });
        return;
      }

      logo.handleReset();
      cover.handleReset();
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
                {logo.previewUrl ? (
                  <img src={logo.previewUrl} alt={employer.companyName} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-9 w-9 text-primary" />
                )}
              </div>

              <div className="w-full space-y-2">
                <input
                  ref={logo.fileInputRef}
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={logo.handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logo.fileInputRef.current?.click()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface"
                >
                  <ImagePlus className="h-4 w-4" />
                  {logo.previewUrl ? "Đổi logo" : "Tải logo lên"}
                </button>

                {logo.selectedName && (
                  <>
                    <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary truncate">
                      {logo.selectedName}
                    </div>
                    <button
                      type="button"
                      onClick={logo.handleReset}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted transition hover:bg-surface hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                      Bỏ logo mới
                    </button>
                  </>
                )}
                {logo.error && <p className="text-xs text-red-600">{logo.error}</p>}
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
              {cover.previewUrl ? (
                <img src={cover.previewUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[var(--color-fdi-dark)] via-[#005A9E] to-[var(--color-fdi-primary)] flex items-center justify-center">
                  <p className="text-white/60 text-xs">Chưa có ảnh bìa — sẽ dùng gradient mặc định</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input
                ref={cover.fileInputRef}
                id="coverImage"
                name="coverImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={cover.handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => cover.fileInputRef.current?.click()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface"
              >
                <ImagePlus className="h-4 w-4" />
                {cover.previewUrl ? "Đổi ảnh bìa" : "Tải ảnh bìa lên"}
              </button>

              {cover.selectedName && (
                <>
                  <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary truncate">
                    {cover.selectedName}
                  </div>
                  <button
                    type="button"
                    onClick={cover.handleReset}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted transition hover:bg-surface hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                    Bỏ ảnh bìa mới
                  </button>
                </>
              )}
              {cover.error && <p className="text-xs text-red-600">{cover.error}</p>}
            </div>

            {/* Cover position editor */}
            {cover.previewUrl && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Căn chỉnh vị trí hiển thị</p>
                <CoverPositionEditor
                  imageUrl={cover.previewUrl}
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
              <input
                id="industry"
                name="industry"
                type="text"
                defaultValue={employer.industry ?? ""}
                placeholder="Ví dụ: Sản xuất, IT, Logistics..."
                className={inputClassName}
              />
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
                {COMPANY_SIZES.map((size) => (
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
