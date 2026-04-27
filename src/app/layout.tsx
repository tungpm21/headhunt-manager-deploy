import type { Metadata } from "next";
import { Be_Vietnam_Pro, Inter, Open_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const poppins = Be_Vietnam_Pro({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-opensans",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Headhunt Manager",
  description:
    "Hệ thống quản lý hồ sơ ứng viên và quy trình headhunt cho team nhỏ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} ${openSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
