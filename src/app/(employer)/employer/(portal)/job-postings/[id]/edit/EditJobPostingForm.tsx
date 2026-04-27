"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, AlertTriangle, Save } from "lucide-react";
import {
  getJobPostingFormOptions,
  updateJobPostingAction,
} from "@/lib/employer-actions";
import { JOB_POSITIONS } from "@/lib/job-taxonomy";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";

const selectClass =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";

type EditableJobPosting = {
  id: number;
  status: string;
  title: string;
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
  shiftType: string | null;
};

type OptionChoice = { value: string; label: string };
type JobPostingFormOptions = Awaited<ReturnType<typeof getJobPostingFormOptions>>;

export function EditJobPostingForm({ job }: { job: EditableJobPosting }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formOptions, setFormOptions] = useState<JobPostingFormOptions | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    getJobPostingFormOptions({
      industry: job.industry,
      location: job.location,
      workType: job.workType,
      industrialZone: job.industrialZone,
      requiredLanguage: job.requiredLanguages?.[0] ?? null,
      languageProficiency: job.languageProficiency,
      shiftType: job.shiftType,
    }).then(setFormOptions);
  }, [job]);

  async function handleSubmit(formData: FormData) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError("");
    setLoading(true);

    try {
      const result = await updateJobPostingAction(job.id, formData);

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.push(`/employer/job-postings/${job.id}`);
      router.refresh();
    } catch {
      setError("Không thể cập nhật tin tuyển dụng. Vui lòng thử lại.");
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
    <>
      {job.status === "REJECTED" && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold">Tin này đang ở trạng thái bị từ chối.</p>
            <p className="mt-1">
              Khi lưu thay đổi, hệ thống sẽ đưa tin quay lại trạng thái chờ duyệt.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
              Tiêu đề tin <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={job.title}
              placeholder="VD: Kỹ sư cơ khí - Nhà máy Samsung Bắc Ninh"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
              Mô tả công việc <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              required
              defaultValue={job.description}
              placeholder="Mô tả chi tiết về công việc, trách nhiệm, môi trường làm việc..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1.5">
              Yêu cầu ứng viên
            </label>
            <textarea
              id="requirements"
              name="requirements"
              rows={3}
              defaultValue={job.requirements ?? ""}
              placeholder="Bằng cấp, kinh nghiệm, kỹ năng cần thiết..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div>
            <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-1.5">
              Phúc lợi
            </label>
            <textarea
              id="benefits"
              name="benefits"
              rows={2}
              defaultValue={job.benefits ?? ""}
              placeholder="Lương tháng 13, bảo hiểm, xe đưa đón, ăn ca..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Mức lương
              <span className="text-xs font-normal text-gray-400 ml-2">
                Hiển thị dải lương tăng ~40% lượt ứng tuyển
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="salaryMin" className="block text-xs text-gray-500 mb-1">
                  Tối thiểu (triệu VND)
                </label>
                <input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  min="0"
                  step="0.1"
                  defaultValue={job.salaryMin ?? ""}
                  placeholder="VD: 15"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="salaryMax" className="block text-xs text-gray-500 mb-1">
                  Tối đa (triệu VND)
                </label>
                <input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  min="0"
                  step="0.1"
                  defaultValue={job.salaryMax ?? ""}
                  placeholder="VD: 25"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="salaryDisplay" className="block text-xs text-gray-500 mb-1">
                  Hiển thị
                </label>
                <input
                  id="salaryDisplay"
                  name="salaryDisplay"
                  type="text"
                  defaultValue={job.salaryDisplay ?? ""}
                  placeholder="VD: 15-25 triệu"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1.5">
                Ngành nghề
              </label>
              <select
                id="industry"
                name="industry"
                defaultValue={job.industry ?? ""}
                className={selectClass}
              >
                <option value="">Chọn ngành</option>
                {formOptions.industryOptions.map((industry: OptionChoice) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1.5">
                Cấp bậc
              </label>
              <select
                id="position"
                name="position"
                defaultValue={job.position ?? ""}
                className={selectClass}
              >
                <option value="">Chọn cấp bậc</option>
                {JOB_POSITIONS.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
                Tỉnh / Thành phố
              </label>
              <select
                id="location"
                name="location"
                defaultValue={job.location ?? ""}
                className={selectClass}
              >
                <option value="">Chọn khu vực</option>
                {formOptions.locationOptions.map((location: OptionChoice) => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="workType" className="block text-sm font-medium text-gray-700 mb-1.5">
                Hình thức làm việc
              </label>
              <select
                id="workType"
                name="workType"
                defaultValue={job.workType ?? ""}
                className={selectClass}
              >
                <option value="">Chọn hình thức</option>
                {formOptions.workTypeOptions.map((workType: OptionChoice) => (
                  <option key={workType.value} value={workType.value}>
                    {workType.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1.5">
                Số lượng tuyển
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                defaultValue={job.quantity}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1.5">
                Kỹ năng (tags)
              </label>
              <input
                id="skills"
                name="skills"
                type="text"
                defaultValue={job.skills.join(", ")}
                placeholder="VD: AutoCAD, SolidWorks (phân cách bằng dấu phẩy)"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#0077B6]/20 p-6 space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <div className="h-1.5 w-5 rounded-full bg-[#0077B6]" />
            <p className="text-sm font-semibold text-[#023E8A]">Yêu cầu đặc thù FDI</p>
            <span className="text-xs text-gray-400">— không có trên VietnamWorks hay TopCV</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="industrialZone"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Khu công nghiệp
              </label>
              <select
                id="industrialZone"
                name="industrialZone"
                defaultValue={job.industrialZone ?? ""}
                className={selectClass}
              >
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
              <p className="text-xs text-gray-400 mt-1">
                Ứng viên tìm việc theo KCN, không chỉ tỉnh thành.
              </p>
            </div>
            <div>
              <label htmlFor="shiftType" className="block text-sm font-medium text-gray-700 mb-1.5">
                Ca làm việc
              </label>
              <select
                id="shiftType"
                name="shiftType"
                defaultValue={job.shiftType ?? ""}
                className={selectClass}
              >
                <option value="">Không chỉ định</option>
                {formOptions.shiftTypeOptions.map((option: OptionChoice) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="requiredLanguage"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Ngôn ngữ yêu cầu
              </label>
              <select
                id="requiredLanguage"
                name="requiredLanguage"
                defaultValue={job.requiredLanguages?.[0] ?? "none"}
                className={selectClass}
              >
                {formOptions.requiredLanguageOptions.map((language: OptionChoice) => (
                  <option key={language.value} value={language.value}>
                    {language.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Ứng viên có kỹ năng ngôn ngữ phù hợp sẽ được ưu tiên hiển thị.
              </p>
            </div>
            <div>
              <label
                htmlFor="languageProficiency"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Mức thành thạo
              </label>
              <select
                id="languageProficiency"
                name="languageProficiency"
                defaultValue={job.languageProficiency ?? ""}
                className={selectClass}
              >
                <option value="">Không chỉ định</option>
                {formOptions.languageProficiencyOptions.map((level: OptionChoice) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-between py-2">
          <Link
            href={`/employer/job-postings/${job.id}`}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Hủy và quay lại chi tiết tin
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-teal-200"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {job.status === "REJECTED" ? "Cập nhật và gửi duyệt lại" : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </>
  );
}
