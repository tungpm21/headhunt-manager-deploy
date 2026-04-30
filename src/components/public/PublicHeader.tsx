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

  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    isOpen,
    activeIndex,
    setActiveIndex,
    handleFocus,
    handleKeyDown,
    navigateTo,
    containerRef: searchContainerRef,
  } = useSearchSuggestions();

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
    if (query.trim()) {
      navigateTo("keyword", query.trim());
    }
  }

  // Suggestion data
  const hasEmployers = (suggestions?.employers.length ?? 0) > 0;
  const hasJobs = (suggestions?.jobs.length ?? 0) > 0;
  const hasKeywords = (suggestions?.popularKeywords.length ?? 0) > 0;
  const hasResults = hasEmployers || hasJobs;
  const noResultsForQuery = query.trim().length > 0 && !hasResults && !isLoading;
  const employerOffset = 0;
  const jobOffset = (suggestions?.employers.length ?? 0);
  const keywordOffset = jobOffset + (suggestions?.jobs.length ?? 0);
  const showDropdown = isOpen && (isLoading || hasKeywords || hasResults || noResultsForQuery);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[rgba(15,78,120,0.08)] bg-white/[0.92] shadow-[0_14px_34px_-30px_rgba(7,26,47,0.56)] backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-2 px-4 text-[var(--color-fdi-text)] sm:px-6 lg:gap-3 lg:px-8">
        {/* Logo */}
        <Link href="/" aria-label="FDIWork - Trang chủ" className="flex min-h-11 shrink-0 items-center gap-2 cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-fdi-primary)] shadow-[0_12px_24px_-18px_rgba(10,111,157,0.8)]" aria-hidden="true">
            <Briefcase className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="inline text-[22px] font-black text-[var(--color-fdi-text)]" style={{ fontFamily: "var(--font-heading)" }}>
            FDI<span className="text-[var(--color-fdi-primary)]">Work</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5" ref={dropdownRef} aria-label="Menu điều hướng chính">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const navItemClass = "flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--color-fdi-text-secondary)] transition-[background-color,color,border-color] duration-300 ease-[var(--ease-fdi)] hover:bg-[#F1F7FA] hover:text-[var(--color-fdi-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/40 cursor-pointer";

            return (
              <div key={link.href} className="relative">
                {link.sub ? (
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === link.href ? null : link.href)}
                    aria-expanded={openDropdown === link.href}
                    aria-haspopup="true"
                    className={navItemClass}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {link.label}
                    <ChevronDown className={`h-3 w-3 transition-transform ${openDropdown === link.href ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className={navItemClass}
                    onClick={() => setOpenDropdown(null)}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {link.label}
                  </Link>
                )}
                {link.sub && openDropdown === link.href && (
                  <div className="absolute top-full left-0 mt-2 w-56 rounded-xl border border-[#DDE8EE] bg-white p-1.5 shadow-[0_26px_66px_-46px_rgba(7,26,47,0.65)] z-50" role="menu">
                    {link.sub.map((subLink) => (
                      <Link key={subLink.href} href={subLink.href} onClick={() => setOpenDropdown(null)}
                        role="menuitem"
                        className="flex min-h-11 items-center rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--color-fdi-text-secondary)] transition-colors hover:bg-[var(--color-fdi-surface)] hover:text-[var(--color-fdi-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/40 cursor-pointer">
                        {subLink.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Header search with inline dropdown */}
        <div ref={searchContainerRef} className="relative mx-auto hidden min-w-[220px] max-w-sm flex-1 lg:flex xl:max-w-md">
          <form onSubmit={handleSearch} className="w-full" role="search" aria-label="Tìm kiếm việc làm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                name="q"
                role="combobox"
                aria-label="Tìm kiếm việc làm hoặc công ty"
                aria-autocomplete="list"
                aria-expanded={showDropdown}
                aria-controls="header-search-listbox"
                aria-activedescendant={activeIndex >= 0 ? `header-option-${activeIndex}` : undefined}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder="Tìm việc làm, công ty…"
                className="min-h-10 w-full rounded-lg border border-[#D9E4EA] bg-[#F8FBFC] py-2 pl-9 pr-3 text-sm text-[var(--color-fdi-text)] placeholder-gray-400 transition-[border-color,box-shadow,background-color] duration-300 ease-[var(--ease-fdi)] focus:outline-none focus-visible:border-[var(--color-fdi-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/18"
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
              className="absolute top-full left-0 mt-2 overflow-hidden rounded-xl border border-[#DDE8EE] bg-white shadow-[0_28px_72px_-48px_rgba(7,26,47,0.7)] z-50"
              style={{ width: "max(100%, 580px)", maxWidth: "calc(100vw - 2rem)" }}
            >
              {isLoading && !suggestions && (
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
                          <button key={emp.id} id={`header-option-${idx}`} role="option" aria-selected={activeIndex === idx} type="button"
                            onClick={() => navigateTo("employer", emp.slug)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-left ${activeIndex === idx ? "bg-[var(--color-fdi-surface)]" : "hover:bg-gray-50"}`}>
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
                          <button key={kw} id={`header-option-${idx}`} role="option" aria-selected={activeIndex === idx} type="button"
                            onClick={() => navigateTo("keyword", kw)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors text-left ${activeIndex === idx ? "bg-[var(--color-fdi-surface)] text-[var(--color-fdi-primary)]" : "text-gray-600 hover:bg-gray-50"}`}>
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
                    {query.trim() ? "Việc làm bạn sẽ thích" : "Việc làm có thể bạn quan tâm"}
                  </p>
                  {hasJobs ? suggestions!.jobs.map((job, i) => {
                    const idx = jobOffset + i;
                    return (
                      <button key={job.id} id={`header-option-${idx}`} role="option" aria-selected={activeIndex === idx} type="button"
                        onClick={() => navigateTo("job", job.slug)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-left ${activeIndex === idx ? "bg-[var(--color-fdi-surface)]" : "hover:bg-gray-50"}`}>
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
                      Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop CTAs */}
        <div className="ml-auto hidden md:flex items-center gap-2 shrink-0">
          <Link href="/company/login"
            className="group inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#A83007] bg-[var(--color-fdi-accent-orange)] py-1.5 pl-3.5 pr-1.5 text-sm font-bold text-white shadow-[0_16px_34px_-20px_rgba(194,65,12,0.92)] transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#7C2504] hover:bg-[#9F3108] hover:shadow-[0_20px_42px_-20px_rgba(194,65,12,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/40 cursor-pointer whitespace-nowrap">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden xl:inline">Đăng tin tuyển dụng</span>
              <span className="xl:hidden">Đăng tin</span>
          </Link>
        </div>

        <Link
          href="/viec-lam"
          className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-[var(--color-fdi-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/40 md:hidden"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Tìm việc
        </Link>

        {/* Mobile Hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/40 cursor-pointer md:hidden"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu điều hướng"}
          aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="h-5 w-5 text-[var(--color-fdi-text)]" aria-hidden="true" /> : <Menu className="h-5 w-5 text-[var(--color-fdi-text)]" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-7xl rounded-xl border border-[#D9E4EA] bg-white/[0.98] shadow-[0_28px_72px_-48px_rgba(7,26,47,0.72)] backdrop-blur-xl md:hidden">
          <form onSubmit={handleSearch} className="px-4 pt-3" role="search" aria-label="Tìm kiếm cơ bản">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <input type="text" value={query}
                name="q"
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Tìm kiếm việc làm hoặc công ty"
                placeholder="Tìm việc làm, công ty…"
                className="min-h-11 w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-[var(--color-fdi-text)] placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/50"
                autoComplete="off"
              />
            </div>
          </form>
          <nav className="px-4 py-3 space-y-1" aria-label="Menu điều hướng mobile">
            {navLinks.map((link) => (
              <div key={link.href}>
                <Link href={link.href} onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-fdi-text)] transition-colors hover:bg-[var(--color-fdi-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/40 cursor-pointer">
                  <link.icon className="h-4 w-4 text-[var(--color-fdi-primary)]" aria-hidden="true" />
                  {link.label}
                </Link>
                {link.sub && (
                  <div className="ml-9 space-y-0.5">
                    {link.sub.map((subLink) => (
                      <Link key={subLink.href} href={subLink.href} onClick={() => setMobileOpen(false)}
                        className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/40 cursor-pointer">
                        {subLink.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <Link href="/company/login" onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--color-fdi-accent-orange)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/40 cursor-pointer">
                Đăng tin tuyển dụng
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
