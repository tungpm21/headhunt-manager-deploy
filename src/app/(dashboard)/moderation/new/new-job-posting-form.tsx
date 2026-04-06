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
import { createAdminJobPosting } from "@/lib/admin-job-posting-actions";

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

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

export function NewJobPostingForm({ employers }: { employers: EmployerOption[] }) {
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
                <textarea
                  id="description"
                  name="description"
                  rows={8}
                  required
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
                <input id="location" name="location" type="text" className={inputClassName} />
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
