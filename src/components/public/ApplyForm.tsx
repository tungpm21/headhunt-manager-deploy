"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import { submitApplication, type SubmitApplicationInput } from "@/lib/public-actions";

type ApplyFormProps = {
  jobId: number;
  jobTitle: string;
  companyName: string;
};

export function ApplyForm({ jobId, jobTitle, companyName }: ApplyFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Chỉ chấp nhận file PDF, DOC, DOCX");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File không được vượt quá 5MB");
      return;
    }
    setError("");
    setCvFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // For MVP, we store file name and skip actual upload
      // TODO: Integrate Vercel Blob upload in production
      const input: SubmitApplicationInput = {
        jobPostingId: jobId,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        coverLetter: form.coverLetter || undefined,
        cvFileName: cvFile?.name,
      };

      const result = await submitApplication(input);

      if (!result.success) {
        setError(result.error || "Có lỗi xảy ra");
        return;
      }

      // Redirect to success page
      router.push(`/ung-tuyen/thanh-cong?job=${encodeURIComponent(jobTitle)}&company=${encodeURIComponent(companyName)}`);
    } catch {
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-[var(--color-fdi-text)] mb-1.5">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          placeholder="Nguyễn Văn A"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[var(--color-fdi-text)] placeholder:text-gray-400 focus:border-[var(--color-fdi-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-fdi-primary)]/20 transition-colors"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--color-fdi-text)] mb-1.5">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="email@example.com"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[var(--color-fdi-text)] placeholder:text-gray-400 focus:border-[var(--color-fdi-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-fdi-primary)]/20 transition-colors"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-[var(--color-fdi-text)] mb-1.5">
          Số điện thoại
        </label>
        <input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="0912 345 678"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[var(--color-fdi-text)] placeholder:text-gray-400 focus:border-[var(--color-fdi-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-fdi-primary)]/20 transition-colors"
        />
      </div>

      {/* CV Upload */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-fdi-text)] mb-1.5">
          CV / Hồ sơ
        </label>
        {cvFile ? (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-fdi-surface)] rounded-lg border border-dashed border-[var(--color-fdi-primary)]/30">
            <Upload className="h-4 w-4 text-[var(--color-fdi-primary)] shrink-0" />
            <span className="text-sm text-[var(--color-fdi-text)] truncate flex-1">{cvFile.name}</span>
            <button
              type="button"
              onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              className="p-1 hover:bg-gray-200 rounded cursor-pointer"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-6 rounded-lg border-2 border-dashed border-gray-200 hover:border-[var(--color-fdi-primary)]/40 hover:bg-[var(--color-fdi-surface)] transition-colors cursor-pointer"
          >
            <Upload className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              Tải lên CV (PDF, DOC, DOCX — tối đa 5MB)
            </span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Cover Letter */}
      <div>
        <label htmlFor="coverLetter" className="block text-sm font-medium text-[var(--color-fdi-text)] mb-1.5">
          Thư xin việc
        </label>
        <textarea
          id="coverLetter"
          rows={4}
          value={form.coverLetter}
          onChange={(e) => setForm((f) => ({ ...f, coverLetter: e.target.value }))}
          placeholder="Giới thiệu ngắn gọn về bản thân và lý do ứng tuyển..."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[var(--color-fdi-text)] placeholder:text-gray-400 focus:border-[var(--color-fdi-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-fdi-primary)]/20 transition-colors resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-fdi-primary)] text-white font-semibold text-sm hover:bg-[var(--color-fdi-primary-hover)] transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang gửi...
          </>
        ) : (
          "Nộp hồ sơ ứng tuyển"
        )}
      </button>

      <p className="text-xs text-center text-gray-400">
        Bằng việc nộp hồ sơ, bạn đồng ý với điều khoản sử dụng của FDIWork
      </p>
    </form>
  );
}
