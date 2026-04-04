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
    <footer className="bg-[var(--color-fdi-dark)] text-sky-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* About */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 cursor-pointer">
              <div className="h-8 w-8 rounded-lg bg-[var(--color-fdi-primary)] flex items-center justify-center">
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
                    className="text-sm text-sky-200/70 hover:text-white transition-colors cursor-pointer"
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
                    className="text-sm text-sky-200/70 hover:text-white transition-colors cursor-pointer"
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
                    className="text-sm text-sky-200/70 hover:text-white transition-colors cursor-pointer"
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
                    className="text-sm text-sky-200/70 hover:text-white transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-blue-900/50">
          <p className="text-center text-xs text-sky-200/40">
            © {new Date().getFullYear()} FDIWork. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
