"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Loader2,
  Plus,
} from "lucide-react";
import { MarkdownEditor } from "@/components/content/MarkdownEditor";
import { MediaUploadButton } from "@/components/content/MediaUploadButton";
import { createAdminJobPosting } from "@/lib/admin-job-posting-actions";
import type { OptionChoice } from "@/lib/config-options";

type EmployerOption = {
  id: number;
  companyName: string;
  email: string;
  slug: string;
  subscription: {
    tier: string;
    jobQuota: number;
    jobsUsed: number;
    jobDuration: number;
    endDate: Date;
  } | null;
};

const INDUSTRIAL_ZONES = [
  {
    group: "Miền Bắc",
    zones: [
      "KCN Yên Phong, Bắc Ninh",
      "KCN Quế Võ, Bắc Ninh",
      "KCN VSIP Bắc Ninh",
      "KCN Thăng Long, Hà Nội",
      "KCN Quang Minh, Vĩnh Phúc",
      "KCN Đình Vũ, Hải Phòng",
      "KCN Tràng Duệ, Hải Phòng",
      "KCN Samsung, Thái Nguyên",
      "KCN Đại Đồng, Bắc Giang",
    ],
  },
  {
    group: "Miền Trung",
    zones: [
      "KCN Hòa Khánh, Đà Nẵng",
      "KCN Điện Nam - Điện Ngọc, Quảng Nam",
    ],
  },
  {
    group: "Miền Nam",
    zones: [
      "KCN Amata, Đồng Nai",
      "KCN Long Thành, Đồng Nai",
      "KCN VSIP, Bình Dương",
      "KCN Mỹ Phước, Bình Dương",
      "KCN Long Hậu, Long An",
      "Quận 7 / Tân Phú, TP.HCM",
    ],
  },
];

const LANGUAGES = [
  { value: "none", label: "Không yêu cầu" },
  { value: "Japanese", label: "Tiếng Nhật" },
  { value: "Korean", label: "Tiếng Hàn" },
  { value: "English", label: "Tiếng Anh" },
  { value: "Chinese", label: "Tiếng Trung" },
  { value: "German", label: "Tiếng Đức" },
  { value: "French", label: "Tiếng Pháp" },
];

const PROFICIENCY_LEVELS = [
  "Cơ bản (N4 / TOPIK 1)",
  "Trung cấp (N3 / TOPIK 2)",
  "Khá (N2 / TOPIK 3)",
  "Thành thạo (N1 / TOPIK 4+)",
];

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

export function NewJobPostingForm({
  employers,
  locationOptions,
}: {
  employers: EmployerOption[];
  locationOptions: OptionChoice[];
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [coverAlt, setCoverAlt] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setMessage(null);
    formData.set("coverImage", coverImage);
    formData.set("coverAlt", coverAlt);

    try {
      const result = await createAdminJobPosting(formData);

      if (!result.success) {
        setMessage({
          type: "error",
          text: result.message,
        });
        return;
      }

      setMessage({
        type: "success",
        text: result.message,
      });

      setTimeout(() => {
        router.push("/moderation");
        router.refresh();
      }, 500);
    } catch {
      setMessage({
        type: "error",
        text: "Đã có lỗi xảy ra khi tạo bài đăng.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link
          href="/moderation"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 transition hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quản lý bài đăng
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Thêm mới</span>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Thêm mới bài đăng FDIWork</h1>
            <p className="text-sm text-muted">
              Tin tạo từ admin sẽ được duyệt sẵn và hiển thị ngay trên FDIWork nếu employer còn quota.
            </p>
          </div>
        </div>
      </div>

      {message ? (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{message.text}</p>
        </div>
      ) : null}

      {employers.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          Chưa có employer nào đang hoạt động và còn gói dịch vụ hợp lệ để tạo bài đăng mới.
        </div>
      ) : (
        <form
          action={handleSubmit}
          className="space-y-6 rounded-2xl border border-border bg-surface p-6 sm:p-8"
        >
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Ảnh cover tin tuyển dụng</p>
                <p className="mt-1 text-xs text-muted">Tùy chọn. Nếu để trống sẽ dùng nhận diện của công ty.</p>
              </div>
              <MediaUploadButton
                context="job"
                kind="cover"
                alt={coverAlt}
                onUploaded={(image) => {
                  setCoverImage(image.url);
                  setCoverAlt(image.alt);
                }}
                label="Upload cover"
              />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
              <div className="space-y-3">
                <input
                  value={coverAlt}
                  onChange={(event) => setCoverAlt(event.target.value)}
                  placeholder="Alt text mô tả ảnh cover"
                  className={inputClassName}
                />
                <input
                  value={coverImage}
                  onChange={(event) => setCoverImage(event.target.value)}
                  placeholder="URL ảnh cover hoặc upload từ nút bên trên"
                  className={inputClassName}
                />
              </div>
              <div className="overflow-hidden rounded-xl border border-border bg-white">
                {coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt={coverAlt || "Job cover"} className="aspect-[16/10] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center text-xs text-muted">
                    Dùng logo/cover công ty
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr,0.65fr]">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="employerId"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Nhà tuyển dụng <span className="text-red-500">*</span>
                </label>
                <select
                  id="employerId"
                  name="employerId"
                  required
                  defaultValue=""
                  className={inputClassName}
                >
                  <option value="" disabled>
                    Chọn employer để đăng tin
                  </option>
                  {employers.map((employer) => {
                    const quotaText = employer.subscription
                      ? `${employer.subscription.jobsUsed}/${employer.subscription.jobQuota}`
                      : "0/0";

                    return (
                      <option key={employer.id} value={employer.id}>
                        {employer.companyName} - {employer.email} - quota {quotaText}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
                  Tiêu đề bài đăng <span className="text-red-500">*</span>
                </label>
                <input id="title" name="title" type="text" required className={inputClassName} />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Mô tả công việc <span className="text-red-500">*</span>
                </label>
                <MarkdownEditor
                  name="description"
                  label=""
                  required
                  rows={10}
                  uploadContext="job"
                  maxImages={3}
                />
              </div>

              <div>
                <label
                  htmlFor="requirements"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Yêu cầu ứng viên
                </label>
                <MarkdownEditor
                  name="requirements"
                  label=""
                  rows={7}
                  uploadContext="job"
                  maxImages={3}
                />
              </div>

              <div>
                <label
                  htmlFor="benefits"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Phúc lợi
                </label>
                <MarkdownEditor
                  name="benefits"
                  label=""
                  rows={6}
                  uploadContext="job"
                  maxImages={3}
                />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="salaryDisplay"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Hiển thị lương
                </label>
                <input
                  id="salaryDisplay"
                  name="salaryDisplay"
                  type="text"
                  placeholder="VD: 20 - 30 triệu"
                  className={inputClassName}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="salaryMin"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Lương tối thiểu
                  </label>
                  <input
                    id="salaryMin"
                    name="salaryMin"
                    type="number"
                    min="0"
                    step="0.1"
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label
                    htmlFor="salaryMax"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Lương tối đa
                  </label>
                  <input
                    id="salaryMax"
                    name="salaryMax"
                    type="number"
                    min="0"
                    step="0.1"
                    className={inputClassName}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="industry"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Ngành nghề
                </label>
                <input id="industry" name="industry" type="text" className={inputClassName} />
              </div>

              <div>
                <label
                  htmlFor="position"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Cấp bậc
                </label>
                <input id="position" name="position" type="text" className={inputClassName} />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Khu vực
                </label>
                <select id="location" name="location" defaultValue="" className={inputClassName}>
                  <option value="">Chọn khu vực</option>
                  {locationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="workType"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Hình thức làm việc
                </label>
                <input id="workType" name="workType" type="text" className={inputClassName} />
              </div>

              <div>
                <label
                  htmlFor="quantity"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Số lượng tuyển
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue={1}
                  className={inputClassName}
                />
              </div>

              <div>
                <label
                  htmlFor="skills"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Kỹ năng
                </label>
                <input
                  id="skills"
                  name="skills"
                  type="text"
                  placeholder="VD: React, TypeScript, SQL"
                  className={inputClassName}
                />
                <p className="mt-1 text-xs text-muted">Nhập nhiều kỹ năng, ngăn cách bằng dấu phẩy.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border/70 pb-4">
              <div className="h-1.5 w-5 rounded-full bg-primary" />
              <p className="text-sm font-semibold text-foreground">Yêu cầu đặc thù FDI</p>
              <span className="text-xs text-muted">không có trên VietnamWorks hay TopCV</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="industrialZone"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Khu công nghiệp
                </label>
                <select id="industrialZone" name="industrialZone" className={inputClassName}>
                  <option value="">Chọn khu công nghiệp</option>
                  {INDUSTRIAL_ZONES.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.zones.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted">
                  Ứng viên tìm việc theo KCN, không chỉ tỉnh thành.
                </p>
              </div>

              <div>
                <label
                  htmlFor="shiftType"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Ca làm việc
                </label>
                <select id="shiftType" name="shiftType" className={inputClassName}>
                  <option value="">Không chỉ định</option>
                  <option value="DAY">Ca ngày</option>
                  <option value="NIGHT">Ca đêm</option>
                  <option value="ROTATING">Xoay ca</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="requiredLanguage"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Ngôn ngữ yêu cầu
                </label>
                <select
                  id="requiredLanguage"
                  name="requiredLanguage"
                  defaultValue="none"
                  className={inputClassName}
                >
                  {LANGUAGES.map((language) => (
                    <option key={language.value} value={language.value}>
                      {language.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted">
                  Ứng viên có kỹ năng ngôn ngữ phù hợp sẽ được ưu tiên hiển thị.
                </p>
              </div>

              <div>
                <label
                  htmlFor="languageProficiency"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Mức thành thạo
                </label>
                <select id="languageProficiency" name="languageProficiency" className={inputClassName}>
                  <option value="">Không chỉ định</option>
                  {PROFICIENCY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Tin mới sẽ được publish ngay và tự tính hạn theo gói của employer đã chọn.
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="/moderation"
                className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:bg-background"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Tạo bài đăng
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
