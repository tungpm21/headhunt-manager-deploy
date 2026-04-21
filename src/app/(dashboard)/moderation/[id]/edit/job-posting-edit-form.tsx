"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Save,
} from "lucide-react";
import { updateAdminJobPosting } from "@/lib/admin-job-posting-actions";

type EditableJobPosting = {
  id: number;
  title: string;
  slug: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryDisplay: string | null;
  industry: string | null;
  position: string | null;
  location: string | null;
  workType: string | null;
  quantity: number;
  skills: string[];
  industrialZone: string | null;
  requiredLanguages: string[];
  languageProficiency: string | null;
  visaSupport: string | null;
  shiftType: string | null;
  status: string;
  rejectReason: string | null;
  viewCount: number;
  applyCount: number;
  jobOrderId: number | null;
  applicationsCount: number;
  employer: {
    id: number;
    slug: string;
    companyName: string;
    email: string;
  };
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

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp",
  PENDING: "Chờ duyệt",
  APPROVED: "Đang hiển thị",
  REJECTED: "Đã từ chối",
  EXPIRED: "Đã hết hạn",
  PAUSED: "Tạm ẩn",
};

export function JobPostingEditForm({ job }: { job: EditableJobPosting }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await updateAdminJobPosting(job.id, formData);

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
        text: "Đã có lỗi xảy ra khi cập nhật bài đăng.",
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
        <span className="font-medium text-foreground">Chỉnh sửa</span>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {STATUS_LABELS[job.status] ?? job.status}
            </span>
          </div>
          <p className="text-sm text-muted">
            Employer: <span className="font-medium text-foreground">{job.employer.companyName}</span>
            {" • "}
            {job.employer.email}
          </p>
          <p className="text-sm text-muted">
            URL hiện tại: <span className="font-mono text-foreground">/viec-lam/{job.slug}</span>
          </p>
          <p className="text-sm text-muted">
            {job.viewCount} lượt xem • {job.applyCount} lượt ứng tuyển • {job.applicationsCount} hồ sơ đang lưu
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/cong-ty/${job.employer.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
          >
            <ExternalLink className="h-4 w-4" />
            Trang công ty
          </Link>
          <Link
            href={`/viec-lam/${job.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/15"
          >
            <ExternalLink className="h-4 w-4" />
            Xem trên FDIWork
          </Link>
        </div>
      </div>

      {job.status === "REJECTED" && job.rejectReason ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Lý do từ chối hiện tại</p>
          <p className="mt-1">{job.rejectReason}</p>
        </div>
      ) : null}

      {job.jobOrderId ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Tin này đang đồng bộ với CRM Job Order</p>
          <p className="mt-1">
            Các thay đổi nội dung tại đây có thể bị ghi đè khi recruiter cập nhật Job Order liên kết.
          </p>
          <Link
            href={`/jobs/${job.jobOrderId}`}
            className="mt-3 inline-flex items-center gap-2 font-medium text-amber-900 underline-offset-2 hover:underline"
          >
            Mở Job Order #{job.jobOrderId}
          </Link>
        </div>
      ) : null}

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

      <form
        action={handleSubmit}
        className="space-y-6 rounded-2xl border border-border bg-surface p-6 sm:p-8"
      >
        <div className="grid gap-6 lg:grid-cols-[1.35fr,0.65fr]">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
                Tiêu đề bài đăng <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={job.title}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Mô tả công việc <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={8}
                required
                defaultValue={job.description}
                className={`${inputClassName} min-h-[220px] resize-y`}
              />
            </div>

            <div>
              <label
                htmlFor="requirements"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Yêu cầu ứng viên
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={5}
                defaultValue={job.requirements ?? ""}
                className={`${inputClassName} resize-y`}
              />
            </div>

            <div>
              <label
                htmlFor="benefits"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Phúc lợi
              </label>
              <textarea
                id="benefits"
                name="benefits"
                rows={4}
                defaultValue={job.benefits ?? ""}
                className={`${inputClassName} resize-y`}
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
                defaultValue={job.salaryDisplay ?? ""}
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
                  defaultValue={job.salaryMin ?? ""}
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
                  defaultValue={job.salaryMax ?? ""}
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
              <input
                id="industry"
                name="industry"
                type="text"
                defaultValue={job.industry ?? ""}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="position"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Cấp bậc
              </label>
              <input
                id="position"
                name="position"
                type="text"
                defaultValue={job.position ?? ""}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Khu vực
              </label>
              <input
                id="location"
                name="location"
                type="text"
                defaultValue={job.location ?? ""}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="workType"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Hình thức làm việc
              </label>
              <input
                id="workType"
                name="workType"
                type="text"
                defaultValue={job.workType ?? ""}
                className={inputClassName}
              />
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
                defaultValue={job.quantity}
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
                defaultValue={job.skills.join(", ")}
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
              <select
                id="industrialZone"
                name="industrialZone"
                defaultValue={job.industrialZone ?? ""}
                className={inputClassName}
              >
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
              <select
                id="shiftType"
                name="shiftType"
                defaultValue={job.shiftType ?? ""}
                className={inputClassName}
              >
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
                defaultValue={job.requiredLanguages?.[0] ?? "none"}
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
              <select
                id="languageProficiency"
                name="languageProficiency"
                defaultValue={job.languageProficiency ?? ""}
                className={inputClassName}
              >
                <option value="">Không chỉ định</option>
                {PROFICIENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="visaSupport"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Hỗ trợ visa / giấy phép lao động
            </label>
            <select
              id="visaSupport"
              name="visaSupport"
              defaultValue={job.visaSupport ?? ""}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition sm:w-72"
            >
              <option value="">Không chỉ định</option>
              <option value="YES">Có hỗ trợ</option>
              <option value="NO">Không hỗ trợ</option>
              <option value="NEGOTIABLE">Thương lượng</option>
            </select>
            <p className="mt-1 text-xs text-muted">
              Ứng viên nước ngoài sẽ lọc theo tiêu chí này.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Chỉnh sửa tại đây sẽ cập nhật nội dung hiển thị trên FDIWork và employer portal.
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
