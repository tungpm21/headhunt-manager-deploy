import Link from "next/link";
import { CheckCircle, ArrowRight, Home } from "lucide-react";

export const metadata = {
  title: "Ứng tuyển thành công",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ApplySuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const jobTitle = typeof params.job === "string" ? params.job : "vị trí này";
  const companyName = typeof params.company === "string" ? params.company : "";

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mx-auto h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>

        <h1
          className="text-2xl font-bold text-[var(--color-fdi-text)] mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Ứng tuyển thành công!
        </h1>
        <p className="text-sm text-[var(--color-fdi-text-secondary)] mb-6 leading-relaxed">
          Hồ sơ của bạn đã được gửi tới{" "}
          {companyName && <strong>{companyName}</strong>} cho vị trí{" "}
          <strong>{jobTitle}</strong>. Nhà tuyển dụng sẽ xem xét và liên hệ
          bạn sớm nhất.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/viec-lam"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-fdi-primary)] text-white text-sm font-semibold hover:bg-[var(--color-fdi-primary-hover)] transition-all cursor-pointer"
          >
            Tìm thêm việc làm
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[var(--color-fdi-text)] hover:bg-gray-50 transition-all cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
