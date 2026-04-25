"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Search,
  Briefcase,
  Building2,
  UserPlus,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { LogoImage } from "@/components/public/LogoImage";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const search = useSearchSuggestions();

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.query.trim()) {
      search.navigateTo("keyword", search.query.trim());
    }
  }

  // Suggestion data
  const suggestions = search.suggestions;
  const hasEmployers = (suggestions?.employers.length ?? 0) > 0;
  const hasJobs = (suggestions?.jobs.length ?? 0) > 0;
  const hasKeywords = (suggestions?.popularKeywords.length ?? 0) > 0;
  const hasResults = hasEmployers || hasJobs;
  const noResultsForQuery = search.query.trim().length > 0 && !hasResults && !search.isLoading;
  const employerOffset = 0;
  const jobOffset = (suggestions?.employers.length ?? 0);
  const keywordOffset = jobOffset + (suggestions?.jobs.length ?? 0);
  const showDropdown = search.isOpen && (search.isLoading || hasKeywords || hasResults || noResultsForQuery);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" aria-label="FDIWork - Trang chủ" className="flex items-center gap-2 shrink-0 cursor-pointer">
          <div className="h-9 w-9 rounded-lg bg-[var(--color-fdi-primary)] flex items-center justify-center" aria-hidden="true">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[var(--color-fdi-text)] hidden sm:inline" style={{ fontFamily: "var(--font-heading)" }}>
            FDI<span className="text-[var(--color-fdi-primary)]">Work</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5" ref={dropdownRef} aria-label="Menu điều hướng chính">
          {navLinks.map((link) => (
            <div key={link.href} className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === link.href ? null : link.href)}
                aria-expanded={link.sub ? openDropdown === link.href : undefined}
                aria-haspopup={link.sub ? "true" : undefined}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] hover:bg-[var(--color-fdi-surface)] transition-colors cursor-pointer"
              >
                <link.icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
                {link.sub && (
                  <ChevronDown className={`h-3 w-3 transition-transform ${openDropdown === link.href ? "rotate-180" : ""}`} aria-hidden="true" />
                )}
              </button>
              {link.sub && openDropdown === link.href && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50" role="menu">
                  {link.sub.map((subLink) => (
                    <Link key={subLink.href} href={subLink.href} onClick={() => setOpenDropdown(null)}
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] hover:bg-[var(--color-fdi-surface)] transition-colors cursor-pointer">
                      {subLink.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Header search with inline dropdown */}
        <div ref={search.containerRef} className="hidden lg:flex flex-1 max-w-md mx-auto relative">
          <form onSubmit={handleSearch} className="w-full" role="search" aria-label="Tìm kiếm việc làm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                role="combobox"
                aria-label="Tìm kiếm việc làm hoặc công ty"
                aria-autocomplete="list"
                aria-expanded={showDropdown}
                aria-controls="header-search-listbox"
                aria-activedescendant={search.activeIndex >= 0 ? `header-option-${search.activeIndex}` : undefined}
                value={search.query}
                onChange={(e) => search.setQuery(e.target.value)}
                onFocus={search.handleFocus}
                onKeyDown={search.handleKeyDown}
                placeholder="Tìm việc làm, công ty…"
                className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-200 text-sm bg-gray-50 text-[var(--color-fdi-text)] placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/50 focus-visible:border-[var(--color-fdi-accent-orange)] transition-all"
                autoComplete="off"
              />
            </div>
          </form>

          {/* Header search dropdown — 2-column */}
          {showDropdown && (
            <div
              id="header-search-listbox"
              role="listbox"
              aria-label="Gợi ý tìm kiếm"
              className="absolute top-full left-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-2xl z-50 overflow-hidden"
              style={{ width: "max(100%, 580px)", maxWidth: "calc(100vw - 2rem)" }}
            >
              {search.isLoading && !suggestions && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400" aria-live="polite">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Đang tìm kiếm…
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-5 max-h-[380px]">
                {/* Left — Keywords + Employers */}
                <div className="sm:col-span-2 sm:border-r border-gray-100 p-3 overflow-y-auto max-h-[380px]">
                  {hasEmployers && (
                    <div className="mb-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1" aria-hidden="true">Có phải bạn đang tìm</p>
                      {suggestions!.employers.map((emp, i) => {
                        const idx = employerOffset + i;
                        return (
                          <button key={emp.id} id={`header-option-${idx}`} role="option" aria-selected={search.activeIndex === idx} type="button"
                            onClick={() => search.navigateTo("employer", emp.slug)}
                            onMouseEnter={() => search.setActiveIndex(idx)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-left ${search.activeIndex === idx ? "bg-[var(--color-fdi-surface)]" : "hover:bg-gray-50"}`}>
                            <div className="h-6 w-6 rounded bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0" aria-hidden="true">
                              <LogoImage src={emp.logo} alt="" className="h-full w-full object-contain p-0.5" iconSize="h-3 w-3" />
                            </div>
                            <p className="text-sm text-gray-700 truncate flex-1">{emp.companyName}</p>
                            <span className="text-[9px] text-gray-400 bg-gray-50 px-1 py-0.5 rounded shrink-0" aria-hidden="true">Công ty</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {hasKeywords && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1" aria-hidden="true">Từ khóa phổ biến</p>
                      {suggestions!.popularKeywords.map((kw, i) => {
                        const idx = keywordOffset + i;
                        return (
                          <button key={kw} id={`header-option-${idx}`} role="option" aria-selected={search.activeIndex === idx} type="button"
                            onClick={() => search.navigateTo("keyword", kw)}
                            onMouseEnter={() => search.setActiveIndex(idx)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors text-left ${search.activeIndex === idx ? "bg-[var(--color-fdi-surface)] text-[var(--color-fdi-primary)]" : "text-gray-600 hover:bg-gray-50"}`}>
                            <Search className="h-3 w-3 shrink-0 opacity-40" aria-hidden="true" />
                            {kw}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* Right — Jobs */}
                <div className="sm:col-span-3 p-3 border-t sm:border-t-0 border-gray-100 overflow-y-auto max-h-[380px]">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1" aria-hidden="true">
                    {search.query.trim() ? "Việc làm bạn sẽ thích" : "Việc làm có thể bạn quan tâm"}
                  </p>
                  {hasJobs ? suggestions!.jobs.map((job, i) => {
                    const idx = jobOffset + i;
                    return (
                      <button key={job.id} id={`header-option-${idx}`} role="option" aria-selected={search.activeIndex === idx} type="button"
                        onClick={() => search.navigateTo("job", job.slug)}
                        onMouseEnter={() => search.setActiveIndex(idx)}
                        className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-left ${search.activeIndex === idx ? "bg-[var(--color-fdi-surface)]" : "hover:bg-gray-50"}`}>
                        <div className="h-8 w-8 rounded bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0" aria-hidden="true">
                          <LogoImage src={job.employer.logo} alt="" className="h-full w-full object-contain p-0.5" iconSize="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{job.title}</p>
                          <p className="text-[11px] text-gray-400 truncate">{job.employer.companyName}</p>
                        </div>
                        {job.salaryDisplay && <span className="text-xs font-bold text-[var(--color-fdi-accent-orange)] shrink-0">{job.salaryDisplay}</span>}
                      </button>
                    );
                  }) : noResultsForQuery ? (
                    <div className="flex items-center gap-2 py-3 text-sm text-gray-400" aria-live="polite">
                      <Search className="h-4 w-4" aria-hidden="true" />
                      Không tìm thấy kết quả cho &ldquo;{search.query}&rdquo;
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link href="/employer/login" className="text-sm font-medium text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] transition-colors cursor-pointer">
            Đăng nhập NTD
          </Link>
          <Link href="/employer/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--color-fdi-accent-orange)] text-white text-sm font-semibold hover:bg-[#E65C00] transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Đăng tin tuyển dụng
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ml-auto"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu điều hướng"}
          aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="h-5 w-5 text-[var(--color-fdi-text)]" aria-hidden="true" /> : <Menu className="h-5 w-5 text-[var(--color-fdi-text)]" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <form onSubmit={handleSearch} className="px-4 pt-3" role="search" aria-label="Tìm kiếm cơ bản">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <input type="text" value={search.query}
                onChange={(e) => search.setQuery(e.target.value)}
                aria-label="Tìm kiếm việc làm hoặc công ty"
                placeholder="Tìm việc làm, công ty…"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-[var(--color-fdi-text)] placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/50"
                autoComplete="off"
              />
            </div>
          </form>
          <nav className="px-4 py-3 space-y-1" aria-label="Menu điều hướng mobile">
            {navLinks.map((link) => (
              <div key={link.href}>
                <Link href={link.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-fdi-text)] hover:bg-[var(--color-fdi-surface)] transition-colors cursor-pointer">
                  <link.icon className="h-4 w-4 text-[var(--color-fdi-primary)]" aria-hidden="true" />
                  {link.label}
                </Link>
                {link.sub && (
                  <div className="ml-9 space-y-0.5">
                    {link.sub.map((subLink) => (
                      <Link key={subLink.href} href={subLink.href} onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] cursor-pointer">
                        {subLink.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <Link href="/employer/login" onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] cursor-pointer">
                Đăng nhập NTD
              </Link>
              <Link href="/employer/register" onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-semibold text-[var(--color-fdi-accent-orange)] cursor-pointer">
                Đăng tin tuyển dụng
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
