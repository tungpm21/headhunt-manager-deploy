"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  Search,
  Briefcase,
  Building2,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import { SearchOverlay } from "@/components/public/SearchOverlay";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Briefcase;
  sub?: { href: string; label: string }[];
};

const navLinks: NavItem[] = [
  {
    href: "/viec-lam",
    label: "Việc làm",
    icon: Briefcase,
    sub: [
      { href: "/viec-lam", label: "Tất cả việc làm" },
      { href: "/viec-lam?sort=newest", label: "Việc làm mới nhất" },
    ],
  },
  {
    href: "/cong-ty",
    label: "Doanh nghiệp",
    icon: Building2,
    sub: [
      { href: "/cong-ty", label: "Tất cả doanh nghiệp" },
    ],
  },
  {
    href: "/chia-se",
    label: "Chia sẻ",
    icon: Briefcase,
  },
];

export function PublicHeader() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close nav dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <div className="h-9 w-9 rounded-lg bg-[var(--color-fdi-primary)] flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span
              className="text-xl font-bold text-[var(--color-fdi-text)] hidden sm:inline"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              FDI<span className="text-[var(--color-fdi-primary)]">Work</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-0.5"
            ref={dropdownRef}
          >
            {navLinks.map((link) => (
              <div key={link.href} className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === link.href ? null : link.href)
                  }
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] hover:bg-[var(--color-fdi-surface)] transition-colors cursor-pointer"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                  {link.sub && (
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${openDropdown === link.href ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {/* Dropdown menu */}
                {link.sub && openDropdown === link.href && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
                    {link.sub.map((subLink) => (
                      <Link
                        key={subLink.href}
                        href={subLink.href}
                        onClick={() => setOpenDropdown(null)}
                        className="block px-4 py-2.5 text-sm text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] hover:bg-[var(--color-fdi-surface)] transition-colors cursor-pointer"
                      >
                        {subLink.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Search trigger (desktop) — opens overlay */}
          <div className="hidden lg:flex flex-1 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setSearchOverlayOpen(true)}
              className="w-full flex items-center gap-2 pl-4 pr-3 py-2 rounded-full border border-gray-200 text-sm bg-gray-50 text-gray-400 hover:border-[var(--color-fdi-primary)]/40 hover:text-gray-500 transition-all cursor-pointer"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Tìm việc làm, công ty...</span>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-300 bg-gray-100 border border-gray-200">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              href="/employer/login"
              className="text-sm font-medium text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] transition-colors cursor-pointer"
            >
              Đăng nhập NTD
            </Link>
            <Link
              href="/employer/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--color-fdi-accent-orange)] text-white text-sm font-semibold hover:bg-[#E65C00] transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              Đăng tin tuyển dụng
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ml-auto"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-[var(--color-fdi-text)]" />
            ) : (
              <Menu className="h-5 w-5 text-[var(--color-fdi-text)]" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            {/* Mobile search — opens overlay too */}
            <div className="px-4 pt-3">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOverlayOpen(true);
                }}
                className="w-full flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-pointer"
              >
                <Search className="h-4 w-4" />
                Tìm việc làm, công ty...
              </button>
            </div>

            <nav className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-fdi-text)] hover:bg-[var(--color-fdi-surface)] transition-colors cursor-pointer"
                  >
                    <link.icon className="h-4 w-4 text-[var(--color-fdi-primary)]" />
                    {link.label}
                  </Link>
                  {link.sub && (
                    <div className="ml-9 space-y-0.5">
                      {link.sub.map((subLink) => (
                        <Link
                          key={subLink.href}
                          href={subLink.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-sm text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] cursor-pointer"
                        >
                          {subLink.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 space-y-1">
                <Link
                  href="/employer/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] cursor-pointer"
                >
                  Đăng nhập NTD
                </Link>
                <Link
                  href="/employer/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-semibold text-[var(--color-fdi-accent-orange)] cursor-pointer"
                >
                  Đăng tin tuyển dụng
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Search Overlay */}
      <SearchOverlay
        isVisible={searchOverlayOpen}
        onClose={() => setSearchOverlayOpen(false)}
      />
    </>
  );
}
