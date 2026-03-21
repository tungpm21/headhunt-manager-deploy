import Link from "next/link";
import { Briefcase, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  candidate: [
    { href: "/viec-lam", label: "Tìm việc làm" },
    { href: "/cong-ty", label: "Danh sách công ty" },
  ],
  employer: [
    { href: "/employer/register", label: "Đăng tin tuyển dụng" },
    { href: "/employer/login", label: "Đăng nhập NTD" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="bg-[var(--color-fdi-dark)] text-teal-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {/* About */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 cursor-pointer">
              <div className="h-8 w-8 rounded-lg bg-[var(--color-fdi-primary)] flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <span
                className="text-lg font-bold text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                FDI<span className="text-[var(--color-fdi-primary)]">Work</span>
              </span>
            </Link>
            <p className="text-sm text-teal-200/70 leading-relaxed mb-4">
              Nền tảng tuyển dụng hàng đầu cho doanh nghiệp FDI tại Việt Nam.
              Kết nối nhà tuyển dụng với ứng viên chất lượng cao.
            </p>
            <div className="space-y-2 text-sm text-teal-200/60">
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
                    className="text-sm text-teal-200/70 hover:text-white transition-colors cursor-pointer"
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
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-teal-200/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-teal-800/50">
          <p className="text-center text-xs text-teal-200/40">
            © {new Date().getFullYear()} FDIWork. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
