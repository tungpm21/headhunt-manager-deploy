"use client";

import { useState } from "react";
import { createJobPostingAction } from "@/lib/employer-actions";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import Link from "next/link";

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
  "Nhân viên", "Chuyên viên", "Trưởng nhóm", "Trưởng phòng",
  "Phó giám đốc", "Giám đốc", "Quản lý", "Thực tập sinh",
];

const LOCATIONS = [
  "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Bắc Ninh",
  "Bắc Giang", "Bình Dương", "Đồng Nai", "Long An", "Hưng Yên",
  "Vĩnh Phúc", "Thái Nguyên", "Khác",
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

export default function NewJobPostingPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    try {
      const result = await createJobPostingAction(formData);
      if (result && !result.success) {
        setError(result.message);
      }
    } catch {
      // redirect on success throws
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/employer/job-postings"
          className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Đăng tin tuyển dụng</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Tin sẽ được gửi duyệt sau khi đăng</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        {/* === Card 1: Basic job info === */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
              Tiêu đề tin <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="VD: Kỹ sư cơ khí - Nhà máy Samsung Bắc Ninh"
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
              Mô tả công việc <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              required
              placeholder="Mô tả chi tiết về công việc, trách nhiệm, môi trường làm việc..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Requirements */}
          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1.5">
              Yêu cầu ứng viên
            </label>
            <textarea
              id="requirements"
              name="requirements"
              rows={3}
              placeholder="Bằng cấp, kinh nghiệm, kỹ năng cần thiết..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Benefits */}
          <div>
            <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-1.5">
              Phúc lợi
            </label>
            <textarea
              id="benefits"
              name="benefits"
              rows={2}
              placeholder="Lương tháng 13, bảo hiểm, xe đưa đón, ăn ca..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Salary */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Mức lương
              <span className="text-xs font-normal text-gray-400 ml-2">Hiển thị dải lương tăng ~40% lượt ứng tuyển</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="salaryMin" className="block text-xs text-gray-500 mb-1">Tối thiểu (triệu VND)</label>
                <input id="salaryMin" name="salaryMin" type="number" min="0" step="0.1" placeholder="VD: 15" className={inputClass} />
              </div>
              <div>
                <label htmlFor="salaryMax" className="block text-xs text-gray-500 mb-1">Tối đa (triệu VND)</label>
                <input id="salaryMax" name="salaryMax" type="number" min="0" step="0.1" placeholder="VD: 25" className={inputClass} />
              </div>
              <div>
                <label htmlFor="salaryDisplay" className="block text-xs text-gray-500 mb-1">Hiển thị</label>
                <input id="salaryDisplay" name="salaryDisplay" type="text" placeholder="VD: 15-25 triệu" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Industry / Position / Location / WorkType */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1.5">Ngành nghề</label>
              <select id="industry" name="industry" className={selectClass}>
                <option value="">Chọn ngành</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1.5">Cấp bậc</label>
              <select id="position" name="position" className={selectClass}>
                <option value="">Chọn cấp bậc</option>
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">Tỉnh / Thành phố</label>
              <select id="location" name="location" className={selectClass}>
                <option value="">Chọn khu vực</option>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="workType" className="block text-sm font-medium text-gray-700 mb-1.5">Hình thức làm việc</label>
              <select id="workType" name="workType" className={selectClass}>
                <option value="">Chọn hình thức</option>
                {WORK_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          {/* Quantity + Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1.5">Số lượng tuyển</label>
              <input id="quantity" name="quantity" type="number" min="1" defaultValue="1" className={inputClass} />
            </div>
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1.5">Kỹ năng (tags)</label>
              <input id="skills" name="skills" type="text" placeholder="VD: AutoCAD, SolidWorks (phân cách bằng dấu phẩy)" className={inputClass} />
            </div>
          </div>
        </div>

        {/* === Card 2: FDI-specific fields === */}
        <div className="bg-white rounded-xl border border-[#0077B6]/20 p-6 space-y-5">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <div className="h-1.5 w-5 rounded-full bg-[#0077B6]" />
            <p className="text-sm font-semibold text-[#023E8A]">Yêu cầu đặc thù FDI</p>
            <span className="text-xs text-gray-400">— không có trên VietnamWorks hay TopCV</span>
          </div>

          {/* Industrial zone + Shift type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="industrialZone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Khu công nghiệp
              </label>
              <select id="industrialZone" name="industrialZone" className={selectClass}>
                <option value="">Chọn khu công nghiệp</option>
                {INDUSTRIAL_ZONES.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.zones.map((zone) => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Ứng viên tìm việc theo KCN, không chỉ tỉnh thành.</p>
            </div>
            <div>
              <label htmlFor="shiftType" className="block text-sm font-medium text-gray-700 mb-1.5">
                Ca làm việc
              </label>
              <select id="shiftType" name="shiftType" className={selectClass}>
                <option value="">Không chỉ định</option>
                <option value="DAY">Ca ngày</option>
                <option value="NIGHT">Ca đêm</option>
                <option value="ROTATING">Xoay ca</option>
              </select>
            </div>
          </div>

          {/* Language + Proficiency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="requiredLanguage" className="block text-sm font-medium text-gray-700 mb-1.5">
                Ngôn ngữ yêu cầu
              </label>
              <select id="requiredLanguage" name="requiredLanguage" className={selectClass}>
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Ứng viên có kỹ năng ngôn ngữ phù hợp sẽ được ưu tiên hiển thị.</p>
            </div>
            <div>
              <label htmlFor="languageProficiency" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mức thành thạo
              </label>
              <select id="languageProficiency" name="languageProficiency" className={selectClass}>
                <option value="">Không chỉ định</option>
                {PROFICIENCY_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Visa support */}
          <div>
            <label htmlFor="visaSupport" className="block text-sm font-medium text-gray-700 mb-1.5">
              Hỗ trợ visa / giấy phép lao động
            </label>
            <select id="visaSupport" name="visaSupport" className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
              <option value="">Không chỉ định</option>
              <option value="YES">Có hỗ trợ</option>
              <option value="NO">Không hỗ trợ</option>
              <option value="NEGOTIABLE">Thương lượng</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Ứng viên nước ngoài sẽ lọc theo tiêu chí này.</p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-gray-400">Tin sẽ hiển thị sau khi admin duyệt (thường trong 24 giờ)</p>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-teal-200"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Đăng tin (Gửi duyệt)
          </button>
        </div>
      </form>
    </div>
  );
}
