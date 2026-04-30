import Link from "next/link";
import { Briefcase, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  candidate: [
    { href: "/viec-lam", label: "Tìm việc làm" },
    { href: "/cong-ty", label: "Danh sách công ty" },
  ],
  employer: [
    { href: "/company/login", label: "Đăng tin tuyển dụng" },
    { href: "/lien-he", label: "Liên hệ tư vấn" },
  ],
  blog: [
    { href: "/chia-se", label: "Tất cả bài viết" },
  ],
  byLocation: [
    { href: "/viec-lam?location=H%C3%A0+N%E1%BB%99i", label: "Việc làm Hà Nội" },
    { href: "/viec-lam?location=TP.+H%E1%BB%93+Ch%C3%AD+Minh", label: "Việc làm TP. HCM" },
    { href: "/viec-lam?location=B%C3%ACnh+D%C6%B0%C6%A1ng", label: "Việc làm Bình Dương" },
    { href: "/viec-lam?location=%C4%90%E1%BB%93ng+Nai", label: "Việc làm Đồng Nai" },
    { href: "/viec-lam?location=H%E1%BA%A3i+Ph%C3%B2ng", label: "Việc làm Hải Phòng" },
  ],
  byIndustry: [
    { href: "/viec-lam?industry=K%E1%BB%B9+thu%E1%BA%ADt+c%C6%A1+kh%C3%AD", label: "Kỹ thuật cơ khí" },
    { href: "/viec-lam?industry=IT+%2F+Ph%E1%BA%A7n+m%E1%BB%81m", label: "IT / Phần mềm" },
    { href: "/viec-lam?industry=K%E1%BA%BF+to%C3%A1n", label: "Kế toán" },
    { href: "/viec-lam?industry=S%E1%BA%A3n+xu%E1%BA%A5t", label: "Sản xuất / Vận hành" },
    { href: "/viec-lam?industry=Nh%C3%A2n+s%E1%BB%B1", label: "Nhân sự / HR" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(180deg,#052A4D_0%,#031D38_100%)] text-sky-100">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:92px_92px] opacity-35" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_34px_90px_-60px_rgba(0,0,0,0.95)] sm:p-7 lg:p-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-8">
          {/* About */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex min-h-[44px] items-center gap-2 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-fdi-primary)]">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <span
                className="text-lg font-bold text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                FDI<span className="text-[var(--color-fdi-accent)]">Work</span>
              </span>
            </Link>
            <p className="text-sm text-sky-200/70 leading-relaxed mb-4">
              Nền tảng tuyển dụng hàng đầu cho doanh nghiệp FDI tại Việt Nam.
              Kết nối nhà tuyển dụng với ứng viên chất lượng cao.
            </p>
            <div className="space-y-2 text-sm text-sky-200/60">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>contact@fdiwork.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>0901 234 567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>
            {/* Zalo */}
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://zalo.me/"
                target="_blank"
                rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-[background-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:bg-white/16 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 48 48" fill="currentColor">
                  <path d="M24 2C11.8 2 2 11.8 2 24s9.8 22 22 22 22-9.8 22-22S36.2 2 24 2zm0 40c-9.9 0-18-8.1-18-18S14.1 6 24 6s18 8.1 18 18-8.1 18-18 18z" />
                  <path d="M24 10c-7.7 0-14 6.3-14 14 0 3.7 1.5 7.1 3.9 9.6L12 38l4.7-1.5c2.3 1.2 4.7 1.8 7.3 1.8 7.7 0 14-6.3 14-14S31.7 10 24 10z" />
                </svg>
                Zalo
              </a>
            </div>
          </div>

          {/* Candidate Links */}
          <div>
            <h3
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ứng viên
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.candidate.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-[44px] items-center text-sm text-sky-200/70 transition-colors hover:text-white cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Employer Links */}
          <div>
            <h3
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Nhà tuyển dụng
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.employer.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="flex min-h-[44px] items-center text-sm text-sky-200/70 transition-colors hover:text-white cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Blog Links */}
          <div>
            <h3
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Thông tin chia sẻ
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.blog.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-[44px] items-center text-sm text-sky-200/70 transition-colors hover:text-white cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* By Location */}
          <div>
            <h3
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Theo khu vực
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.byLocation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-[44px] items-center text-sm text-sky-200/70 transition-colors hover:text-white cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* By Industry */}
          <div>
            <h3
              className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Theo ngành nghề
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.byIndustry.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-[44px] items-center text-sm text-sky-200/70 transition-colors hover:text-white cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-sky-200/40">
            © {new Date().getFullYear()} FDIWork. All rights reserved.
          </p>
        </div>
        </div>
      </div>
    </footer>
  );
}
