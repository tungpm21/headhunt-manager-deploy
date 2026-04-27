"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, Home } from "lucide-react";

type ApplySuccessClientProps = {
  jobTitle: string;
  companyName: string;
};

export function ApplySuccessClient({ jobTitle, companyName }: ApplySuccessClientProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div id="main-content" className="min-h-screen bg-[var(--color-fdi-mist)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-[color-mix(in_srgb,var(--color-success)_12%,white)] flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-[var(--color-success)]" aria-hidden="true" />
        </div>

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-[var(--color-fdi-text)] mb-2 outline-none"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Ứng tuyển thành công!
        </h1>
        <p className="text-sm text-[var(--color-fdi-text-secondary)] mb-6 leading-relaxed">
          {companyName
            ? <>Hồ sơ của bạn đã được gửi tới <strong>{companyName}</strong> cho vị trí</>
            : "Hồ sơ của bạn đã được gửi cho vị trí"}{" "}
          <strong>{jobTitle}</strong>. Nhà tuyển dụng sẽ xem xét và liên hệ
          bạn sớm nhất.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/viec-lam"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-fdi-primary)] text-white text-sm font-semibold hover:bg-[var(--color-fdi-primary-hover)] transition-all cursor-pointer"
          >
            Tìm thêm việc làm
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[var(--color-fdi-text)] hover:bg-gray-50 transition-all cursor-pointer"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
