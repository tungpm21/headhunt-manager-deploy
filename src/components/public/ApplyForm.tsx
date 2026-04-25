"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import {
  submitApplication,
  type SubmitApplicationInput,
} from "@/lib/public-apply-actions";

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
      let cvFileUrl: string | undefined;
      let cvFileName: string | undefined;

      // Upload CV file if selected
      if (cvFile) {
        const fd = new FormData();
        fd.append("cv", cvFile);
        const uploadRes = await fetch("/api/public/apply-cv", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadData.error || "Upload CV thất bại");
          return;
        }
        cvFileUrl = uploadData.url;
        cvFileName = uploadData.fileName;
      }

      const input: SubmitApplicationInput = {
        jobPostingId: jobId,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        cvFileUrl,
        cvFileName,
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
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" aria-live="polite">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
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
          name="fullName"
          type="text"
          required
          autoComplete="name"
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          placeholder="Nguyễn Văn A"
          className="min-h-11 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[var(--color-fdi-text)] placeholder:text-gray-400 transition-colors focus:border-[var(--color-fdi-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/20"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--color-fdi-text)] mb-1.5">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          spellCheck={false}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="email@example.com"
          className="min-h-11 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[var(--color-fdi-text)] placeholder:text-gray-400 transition-colors focus:border-[var(--color-fdi-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/20"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-[var(--color-fdi-text)] mb-1.5">
          Số điện thoại
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="0912 345 678"
          className="min-h-11 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-[var(--color-fdi-text)] placeholder:text-gray-400 transition-colors focus:border-[var(--color-fdi-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/20"
        />
      </div>

      {/* CV Upload */}
      <div>
        <label htmlFor="cvFile" className="block text-sm font-medium text-[var(--color-fdi-text)] mb-1.5">
          CV / Hồ sơ
        </label>
        {cvFile ? (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-fdi-surface)] rounded-lg border border-dashed border-[var(--color-fdi-primary)]/30">
            <Upload className="h-4 w-4 text-[var(--color-fdi-primary)] shrink-0" aria-hidden="true" />
            <span className="text-sm text-[var(--color-fdi-text)] truncate flex-1">{cvFile.name}</span>
            <button
              type="button"
              onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              aria-label="Xóa file CV đã chọn"
              className="flex h-9 w-9 items-center justify-center rounded hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/30 cursor-pointer"
            >
              <X className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-24 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-6 transition-colors hover:border-[var(--color-fdi-primary)]/40 hover:bg-[var(--color-fdi-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 cursor-pointer"
          >
            <Upload className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <span className="text-sm text-gray-500">
              Tải lên CV (PDF, DOC, DOCX — tối đa 5MB)
            </span>
          </button>
        )}
        <input
          ref={fileInputRef}
          id="cvFile"
          name="cvFile"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-fdi-primary)] px-6 py-3 text-sm font-semibold text-white transition-[background-color,opacity,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-fdi-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/40 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Đang gửi…
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
