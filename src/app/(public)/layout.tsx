import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: {
    default: "FDIWork - Việc làm FDI tại Việt Nam",
    template: "%s | FDIWork",
  },
  description:
    "Nền tảng tuyển dụng hàng đầu cho doanh nghiệp FDI tại Việt Nam. Tìm việc làm chất lượng cao, kết nối nhà tuyển dụng với ứng viên.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col bg-white text-[var(--color-fdi-text)]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <PublicHeader />
      <main className="flex-1 pt-16">{children}</main>
      <PublicFooter />
    </div>
  );
}
