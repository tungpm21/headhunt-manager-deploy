"use client";

import { useState, useEffect } from "react";
import { updateCompanyProfileAction, getCompanyProfile } from "@/lib/employer-actions";
import { Building2, Save, AlertCircle, CheckCircle2 } from "lucide-react";

const INDUSTRIES = [
  "Sản xuất",
  "Điện tử",
  "Cơ khí",
  "CNTT / Phần mềm",
  "Logistics",
  "Dệt may",
  "Thực phẩm",
  "Ô tô",
  "Xây dựng",
  "Khác",
];

const COMPANY_SIZES = [
  { value: "SMALL", label: "Nhỏ (< 50 nhân viên)" },
  { value: "MEDIUM", label: "Vừa (50 - 200 nhân viên)" },
  { value: "LARGE", label: "Lớn (200 - 1000 nhân viên)" },
  { value: "ENTERPRISE", label: "Tập đoàn (> 1000 nhân viên)" },
];

export default function CompanyProfilePage() {
  const [employer, setEmployer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getCompanyProfile().then((data) => {
      setEmployer(data);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    setSaving(true);
    try {
      const result = await updateCompanyProfileAction(formData);
      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });
      if (result.success) {
        const updated = await getCompanyProfile();
        setEmployer(updated);
      }
    } catch {
      setMessage({ type: "error", text: "Đã có lỗi xảy ra." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Building2 className="h-7 w-7 text-teal-600" />
          Hồ sơ công ty
        </h1>
        <p className="text-gray-500 mt-1">Cập nhật thông tin công ty hiển thị trên FDIWork</p>
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 rounded-lg p-4 border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          )}
          <p className={`text-sm ${message.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
            {message.text}
          </p>
        </div>
      )}

      <form action={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        {/* Cover image preview */}
        {employer?.coverImage && (
          <div className="pb-5 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Preview ảnh bìa</p>
            <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100">
              <img src={employer.coverImage} alt="Cover" className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Logo preview */}
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
          <div className="h-16 w-16 rounded-xl bg-teal-50 flex items-center justify-center overflow-hidden border border-teal-100">
            {employer?.logo ? (
              <img src={employer.logo} alt="Logo" className="h-16 w-16 object-cover" />
            ) : (
              <span className="text-2xl font-bold text-teal-600">
                {employer?.companyName?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{employer?.companyName}</p>
            <p className="text-sm text-gray-400">{employer?.email}</p>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Tên công ty <span className="text-red-500">*</span>
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            required
            defaultValue={employer?.companyName}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Cover Image URL */}
        <div>
          <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1.5">
            Ảnh bìa công ty (URL)
          </label>
          <input
            id="coverImage"
            name="coverImage"
            type="url"
            defaultValue={employer?.coverImage ?? ""}
            placeholder="https://example.com/banner.jpg"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-400 mt-1">
            Hiển thị trên trang profile công ty và banner trang chủ (nếu gói có showBanner). Khuyến nghị: 1200×400px.
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
            Giới thiệu công ty
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={employer?.description ?? ""}
            placeholder="Mô tả ngắn gọn về công ty, lĩnh vực hoạt động, văn hóa..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Industry */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1.5">
              Ngành nghề
            </label>
            <select
              id="industry"
              name="industry"
              defaultValue={employer?.industry ?? ""}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="">Chọn ngành nghề</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Company Size */}
          <div>
            <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1.5">
              Quy mô công ty
            </label>
            <select
              id="companySize"
              name="companySize"
              defaultValue={employer?.companySize ?? ""}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="">Chọn quy mô</option>
              {COMPANY_SIZES.map((size) => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
            Địa chỉ
          </label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={employer?.address ?? ""}
            placeholder="VD: KCN Yên Phong, Bắc Ninh"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1.5">
              Website
            </label>
            <input
              id="website"
              name="website"
              type="url"
              defaultValue={employer?.website ?? ""}
              placeholder="https://company.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              Số điện thoại
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={employer?.phone ?? ""}
              placeholder="0123 456 789"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-teal-200"
          >
            {saving ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
