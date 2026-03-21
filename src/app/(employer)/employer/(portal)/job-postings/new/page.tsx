"use client";

import { useState } from "react";
import { createJobPostingAction } from "@/lib/employer-actions";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import Link from "next/link";

const INDUSTRIES = [
  "Sản xuất", "Điện tử", "Cơ khí", "CNTT / Phần mềm", "Logistics",
  "Dệt may", "Thực phẩm", "Ô tô", "Xây dựng", "Khác",
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

      <form action={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
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
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
            rows={6}
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
            rows={4}
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
            rows={3}
            placeholder="Lương tháng 13, bảo hiểm, xe đưa đón, ăn ca..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <hr className="border-gray-100" />

        {/* Salary */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Mức lương</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                placeholder="VD: 15"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                placeholder="VD: 25"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                placeholder="VD: 15-25 triệu"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Industry, Position, Location, WorkType */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1.5">Ngành nghề</label>
            <select id="industry" name="industry" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
              <option value="">Chọn ngành</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1.5">Cấp bậc</label>
            <select id="position" name="position" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
              <option value="">Chọn cấp bậc</option>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">Khu vực</label>
            <select id="location" name="location" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
              <option value="">Chọn khu vực</option>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="workType" className="block text-sm font-medium text-gray-700 mb-1.5">Hình thức</label>
            <select id="workType" name="workType" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
              <option value="">Chọn hình thức</option>
              {WORK_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>

        {/* Quantity + Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1.5">Số lượng tuyển</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              defaultValue="1"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1.5">Kỹ năng (tags)</label>
            <input
              id="skills"
              name="skills"
              type="text"
              placeholder="VD: AutoCAD, SolidWorks, Tiếng Nhật"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
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
