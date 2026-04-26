import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000")
  ),
  title: {
    default: "FDIWork - Việc làm FDI tại Việt Nam",
    template: "%s | FDIWork",
  },
  description:
    "Nền tảng tuyển dụng hàng đầu cho doanh nghiệp FDI tại Việt Nam. Tìm việc làm chất lượng cao, kết nối nhà tuyển dụng với ứng viên.",
  openGraph: {
    siteName: "FDIWork",
    type: "website",
    locale: "vi_VN",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "FDIWork - Việc làm FDI tại Việt Nam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@fdiwork",
  },
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
      <main className="flex-1 pt-20">{children}</main>
      <PublicFooter />
    </div>
  );
}
