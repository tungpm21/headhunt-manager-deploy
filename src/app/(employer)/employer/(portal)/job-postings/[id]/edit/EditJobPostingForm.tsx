"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, AlertTriangle, Save } from "lucide-react";
import { updateJobPostingAction } from "@/lib/employer-actions";

const INDUSTRIES = [
  "Điện tử / Bán dẫn",
  "Cơ khí / Gia công",
  "Dệt may",
  "Ô tô / Linh kiện",
  "Thực phẩm / Đồ uống",
  "Logistics / Kho vận",
  "Hóa chất / Nhựa",
  "CNTT / Phần mềm",
  "Xây dựng",
  "Khác",
];

const POSITIONS = [
  "Nhân viên",
  "Chuyên viên",
  "Trưởng nhóm",
  "Trưởng phòng",
  "Phó giám đốc",
  "Giám đốc",
  "Quản lý",
  "Thực tập sinh",
];

const LOCATIONS = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Bắc Ninh",
  "Bắc Giang",
  "Bình Dương",
  "Đồng Nai",
  "Long An",
  "Hưng Yên",
  "Vĩnh Phúc",
  "Thái Nguyên",
  "Khác",
];

const WORK_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Hybrid"];

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
  visaSupport: string | null;
  shiftType: string | null;
};

export function EditJobPostingForm({ job }: { job: EditableJobPosting }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
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
      setLoading(false);
    }
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
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
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
                {POSITIONS.map((position) => (
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
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
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
                {WORK_TYPES.map((workType) => (
                  <option key={workType} value={workType}>
                    {workType}
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
                <option value="DAY">Ca ngày</option>
                <option value="NIGHT">Ca đêm</option>
                <option value="ROTATING">Xoay ca</option>
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
                {LANGUAGES.map((language) => (
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
                {PROFICIENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="visaSupport" className="block text-sm font-medium text-gray-700 mb-1.5">
              Hỗ trợ visa / giấy phép lao động
            </label>
            <select
              id="visaSupport"
              name="visaSupport"
              defaultValue={job.visaSupport ?? ""}
              className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="">Không chỉ định</option>
              <option value="YES">Có hỗ trợ</option>
              <option value="NO">Không hỗ trợ</option>
              <option value="NEGOTIABLE">Thương lượng</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Ứng viên nước ngoài sẽ lọc theo tiêu chí này.
            </p>
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
