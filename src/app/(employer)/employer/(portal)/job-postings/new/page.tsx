"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  createJobPostingAction,
  getJobPostingFormOptions,
} from "@/lib/employer-actions";
import { MarkdownEditor } from "@/components/content/MarkdownEditor";
import { MediaUploadButton } from "@/components/content/MediaUploadButton";
import { ArrowLeft, Send, AlertCircle, Loader2 } from "lucide-react";
import { JOB_POSITIONS } from "@/lib/job-taxonomy";

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25";

type OptionChoice = { value: string; label: string };
type JobPostingFormOptions = Awaited<ReturnType<typeof getJobPostingFormOptions>>;

export default function NewJobPostingPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [coverAlt, setCoverAlt] = useState("");
  const [formOptions, setFormOptions] = useState<JobPostingFormOptions | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    getJobPostingFormOptions().then(setFormOptions);
  }, []);

  async function handleSubmit(formData: FormData) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError("");
    setLoading(true);
    formData.set("coverImage", coverImage);
    formData.set("coverAlt", coverAlt);

    try {
      const result = await createJobPostingAction(formData);
      if (result && !result.success) {
        setError(result.message);
      }
    } catch {
      // redirect on success throws
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  if (!formOptions) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-200 border-t-teal-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/employer/job-postings"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đăng tin tuyển dụng</h1>
          <p className="mt-0.5 text-sm text-gray-500">Tin sẽ được gửi duyệt sau khi đăng</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Ảnh cover tin tuyển dụng</p>
              <p className="mt-1 text-xs text-gray-500">
                Tùy chọn. Nếu để trống sẽ dùng nhận diện của công ty.
              </p>
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
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
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
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {coverImage ? (
                <img src={coverImage} alt={coverAlt || "Job cover"} className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center text-xs text-gray-400">
                  Dùng logo/cover công ty
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-5">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Tiêu đề tin <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="VD: Kỹ sư cơ khí - Nhà máy Samsung Bắc Ninh"
                  className={inputClassName}
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700">
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
                <label htmlFor="requirements" className="mb-1.5 block text-sm font-medium text-gray-700">
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
                <label htmlFor="benefits" className="mb-1.5 block text-sm font-medium text-gray-700">
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
          </div>

          <aside className="space-y-5">
            <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-4">
              <div>
                <label htmlFor="salaryDisplay" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Hiển thị lương
                </label>
                <input id="salaryDisplay" name="salaryDisplay" placeholder="VD: 15-25 triệu" className={inputClassName} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="salaryMin" className="mb-1 block text-xs text-gray-500">
                    Tối thiểu (triệu VND)
                  </label>
                  <input id="salaryMin" name="salaryMin" type="number" min="0" step="0.1" placeholder="15" className={inputClassName} />
                </div>
                <div>
                  <label htmlFor="salaryMax" className="mb-1 block text-xs text-gray-500">
                    Tối đa (triệu VND)
                  </label>
                  <input id="salaryMax" name="salaryMax" type="number" min="0" step="0.1" placeholder="25" className={inputClassName} />
                </div>
              </div>

              <SelectField id="industry" label="Ngành nghề" options={formOptions.industryOptions} placeholder="Chọn ngành" />
              <SelectField id="position" label="Cấp bậc" options={JOB_POSITIONS.map((value) => ({ value, label: value }))} placeholder="Chọn cấp bậc" />
              <SelectField id="location" label="Tỉnh / Thành phố" options={formOptions.locationOptions} placeholder="Chọn khu vực" />
              <SelectField id="workType" label="Hình thức làm việc" options={formOptions.workTypeOptions} placeholder="Chọn hình thức" />

              <div>
                <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Số lượng tuyển
                </label>
                <input id="quantity" name="quantity" type="number" min="1" defaultValue="1" className={inputClassName} />
              </div>

              <div>
                <label htmlFor="skills" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Kỹ năng (tags)
                </label>
                <input id="skills" name="skills" placeholder="VD: AutoCAD, SolidWorks" className={inputClassName} />
                <p className="mt-1 text-xs text-gray-400">Nhập nhiều kỹ năng, ngăn cách bằng dấu phẩy.</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="rounded-xl border border-[#0077B6]/20 bg-white p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <div className="h-1.5 w-5 rounded-full bg-[#0077B6]" />
            <p className="text-sm font-semibold text-[#023E8A]">Yêu cầu đặc thù FDI</p>
            <span className="text-xs text-gray-400">không có trên VietnamWorks hay TopCV</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="industrialZone" className="mb-1.5 block text-sm font-medium text-gray-700">
                Khu công nghiệp
              </label>
              <select id="industrialZone" name="industrialZone" className={inputClassName}>
                <option value="">Chọn khu công nghiệp</option>
                {formOptions.industrialZoneGroups.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.zones.map((zone) => (
                      <option key={zone.value} value={zone.value}>
                        {zone.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">Ứng viên tìm việc theo KCN, không chỉ tỉnh thành.</p>
            </div>

            <SelectField id="shiftType" label="Ca làm việc" options={formOptions.shiftTypeOptions} placeholder="Không chỉ định" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <SelectField
                id="requiredLanguage"
                label="Ngôn ngữ yêu cầu"
                options={formOptions.requiredLanguageOptions}
                placeholder="Không yêu cầu"
                defaultValue="none"
              />
              <p className="mt-1 text-xs text-gray-400">
                Ứng viên có kỹ năng ngôn ngữ phù hợp sẽ được ưu tiên hiển thị.
              </p>
            </div>
            <SelectField id="languageProficiency" label="Mức thành thạo" options={formOptions.languageProficiencyOptions} placeholder="Không chỉ định" />
          </div>
        </div>

        <div className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-400">Tin sẽ hiển thị sau khi admin duyệt (thường trong 24 giờ)</p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? "Đang gửi..." : "Đăng tin (Gửi duyệt)"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SelectField({
  id,
  label,
  options,
  placeholder,
  defaultValue = "",
}: {
  id: string;
  label: string;
  options: OptionChoice[];
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select id={id} name={id} defaultValue={defaultValue} className={inputClassName}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
