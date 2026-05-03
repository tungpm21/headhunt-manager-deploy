import type { Metadata } from "next";
import type { CSSProperties } from "react";
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
      style={
        {
          fontFamily: "var(--font-poppins), var(--font-opensans), system-ui, sans-serif",
          "--color-primary": "var(--color-fdi-primary)",
        } as CSSProperties
      }
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-[var(--color-fdi-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
      >
        Chuyển đến nội dung chính
      </a>
      <PublicHeader />
      <main className="flex-1 pt-[68px]">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
