"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, TrendingUp, ChevronDown, Loader2 } from "lucide-react";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { LogoImage } from "@/components/public/LogoImage";

const trendingTags = [
  "Kỹ sư cơ khí",
  "IT / Phần mềm",
  "Kế toán",
  "Nhân sự",
  "Sản xuất",
  "QC / QA",
];

/** Strip Vietnamese diacritics for accent-insensitive search */
function removeTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

type HeroSectionProps = {
  totalJobs: number;
  totalEmployers: number;
};

export function HeroSection({ totalJobs, totalEmployers }: HeroSectionProps) {
  const router = useRouter();
  const search = useSearchSuggestions();
  const [location, setLocation] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const locationsLoadedRef = useRef(false);

  function loadLocations() {
    if (locationsLoadedRef.current) return;
    locationsLoadedRef.current = true;
    fetch("/api/public/locations")
      .then((r) => r.json())
      .then((data) => setLocations(data.locations ?? []))
      .catch(() => {
        locationsLoadedRef.current = false;
      });
  }

  // Close location dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        search.setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [search]);

  const filteredLocations = locations.filter((l) =>
    removeTones(l).includes(removeTones(location))
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.query.trim()) params.set("q", search.query.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/viec-lam?${params.toString()}`);
    search.setQuery("");
    search.setIsOpen(false);
  }

  function handleTagClick(tag: string) {
    router.push(`/viec-lam?q=${encodeURIComponent(tag)}`);
  }

  // Data from suggestions
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
    <section className="relative overflow-visible">
      <div className="relative mx-auto max-w-7xl px-4 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-4 lg:px-8 lg:pb-5">
        <div className="sr-only">
          <div>
            <p className="sr-only">
              FDIWork Job Search
            </p>
            <h1
              className="text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Tìm việc FDI tại Việt Nam
            </h1>
            <p
              className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-sky-100/85"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {totalJobs.toLocaleString("vi-VN")} việc làm từ {totalEmployers.toLocaleString("vi-VN")} doanh nghiệp FDI, lọc nhanh theo vị trí, công ty và địa điểm.
            </p>
          </div>
          <div className="hidden">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold tabular-nums text-[var(--color-fdi-text)]" style={{ fontFamily: "var(--font-heading)" }}>
                  {totalJobs.toLocaleString("vi-VN")}+
                </p>
                <p className="mt-1 text-xs text-[var(--color-fdi-text-secondary)]">Việc mới</p>
              </div>
              <div className="border-x border-gray-100">
                <p className="text-2xl font-bold tabular-nums text-[var(--color-fdi-text)]" style={{ fontFamily: "var(--font-heading)" }}>
                  {totalEmployers.toLocaleString("vi-VN")}+
                </p>
                <p className="mt-1 text-xs text-[var(--color-fdi-text-secondary)]">Doanh nghiệp</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-[var(--color-fdi-text)]" style={{ fontFamily: "var(--font-heading)" }}>
                  1 bước
                </p>
                <p className="mt-1 text-xs text-[var(--color-fdi-text-secondary)]">Ứng tuyển</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar — with inline dropdowns */}
        <div className="relative z-20 mx-auto max-w-[920px]">
          <form
            onSubmit={handleSearch}
            className="flex flex-col items-stretch gap-1 rounded-2xl border border-white/45 bg-[#FFFFFB] p-1.5 shadow-[0_24px_60px_-42px_rgba(0,0,0,0.9)] transition-[border-color,box-shadow] focus-within:border-[var(--color-fdi-accent-orange)]/75 focus-within:shadow-[0_28px_68px_-42px_rgba(0,0,0,0.95)] focus-within:ring-2 focus-within:ring-[var(--color-fdi-accent-orange)]/20 sm:flex-row sm:items-center"
          >
            {/* Keyword input */}
            <div ref={searchContainerRef} className="relative flex-1">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <Search className="h-5 w-5 text-[#8A98A8] shrink-0" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="text"
                  name="q"
                  role="combobox"
                  aria-label="Tìm kiếm vị trí tuyển dụng hoặc tên công ty"
                  aria-autocomplete="list"
                  aria-expanded={showDropdown}
                  aria-controls="hero-search-listbox"
                  aria-activedescendant={search.activeIndex >= 0 ? `hero-option-${search.activeIndex}` : undefined}
                  value={search.query}
                  onChange={(e) => search.setQuery(e.target.value)}
                  onFocus={() => {
                    search.handleFocus();
                    setLocationOpen(false);
                  }}
                  onKeyDown={search.handleKeyDown}
                  placeholder="Vị trí tuyển dụng, tên công ty…"
                  className="min-h-11 flex-1 bg-transparent text-sm text-[var(--color-fdi-text)] placeholder:text-[#8A98A8] focus:outline-none"
                  style={{ fontFamily: "var(--font-body)" }}
                  autoComplete="off"
                />
              </div>

              {/* ═══════ KEYWORD DROPDOWN ═══════ */}
              {showDropdown && (
                <div
                  id="hero-search-listbox"
                  role="listbox"
                  aria-label="Gợi ý tìm kiếm"
                  className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-2xl z-50 overflow-hidden"
                  style={{ width: "max(100%, 680px)", maxWidth: "calc(100vw - 2rem)" }}
                >
                  {/* Loading */}
                  {search.isLoading && !suggestions && (
                    <div className="flex items-center gap-2 px-5 py-4 text-sm text-gray-400" aria-live="polite">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Đang tìm kiếm…
                    </div>
                  )}

                  {/* 2-column layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 max-h-[420px]">
                    {/* Left — Keywords + Employers */}
                    <div className="sm:col-span-2 sm:border-r border-gray-100 p-3 sm:p-4 overflow-y-auto max-h-[420px]">
                      {/* Employers */}
                      {hasEmployers && (
                        <div className="mb-3">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-1" aria-hidden="true">
                            Có phải bạn đang tìm
                          </p>
                          {suggestions!.employers.map((emp, i) => {
                            const idx = employerOffset + i;
                            return (
                              <button
                                key={emp.id}
                                id={`hero-option-${idx}`}
                                role="option"
                                aria-selected={search.activeIndex === idx}
                                type="button"
                                onClick={() => search.navigateTo("employer", emp.slug)}
                                onMouseEnter={() => search.setActiveIndex(idx)}
                                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-left ${search.activeIndex === idx ? "bg-[var(--color-fdi-surface)]" : "hover:bg-gray-50"
                                  }`}
                              >
                                <div className="h-7 w-7 rounded bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0" aria-hidden="true">
                                  <LogoImage src={emp.logo} alt="" className="h-full w-full object-contain p-0.5" iconSize="h-3 w-3" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">{emp.companyName}</p>
                                  {emp.industry && <p className="text-[11px] text-gray-400 truncate">{emp.industry}</p>}
                                </div>
                                <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded shrink-0" aria-hidden="true">Công ty</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Popular keywords */}
                      {hasKeywords && (
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-1" aria-hidden="true">
                            Từ khóa phổ biến
                          </p>
                          {suggestions!.popularKeywords.map((kw, i) => {
                            const idx = keywordOffset + i;
                            return (
                              <button
                                key={kw}
                                id={`hero-option-${idx}`}
                                role="option"
                                aria-selected={search.activeIndex === idx}
                                type="button"
                                onClick={() => search.navigateTo("keyword", kw)}
                                onMouseEnter={() => search.setActiveIndex(idx)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors text-left ${search.activeIndex === idx
                                  ? "bg-[var(--color-fdi-surface)] text-[var(--color-fdi-primary)]"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-[var(--color-fdi-primary)]"
                                  }`}
                              >
                                <Search className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden="true" />
                                {kw}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right — Jobs */}
                    <div className="sm:col-span-3 p-3 sm:p-4 border-t sm:border-t-0 border-gray-100 overflow-y-auto max-h-[420px]">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-1" aria-hidden="true">
                        {search.query.trim() ? "Việc làm bạn sẽ thích" : "Việc làm có thể bạn quan tâm"}
                      </p>

                      {hasJobs ? (
                        suggestions!.jobs.map((job, i) => {
                          const idx = jobOffset + i;
                          return (
                            <button
                              key={job.id}
                              id={`hero-option-${idx}`}
                              role="option"
                              aria-selected={search.activeIndex === idx}
                              type="button"
                              onClick={() => search.navigateTo("job", job.slug)}
                              onMouseEnter={() => search.setActiveIndex(idx)}
                              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors text-left ${search.activeIndex === idx ? "bg-[var(--color-fdi-surface)]" : "hover:bg-gray-50"
                                }`}
                            >
                              <div className="h-9 w-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0" aria-hidden="true">
                                <LogoImage src={job.employer.logo} alt="" className="h-full w-full object-contain p-1" iconSize="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{job.title}</p>
                                <p className="text-xs text-gray-400 truncate">{job.employer.companyName}</p>
                              </div>
                              {job.salaryDisplay && (
                                <span className="text-xs font-bold text-[var(--color-fdi-accent-orange)] shrink-0">
                                  {job.salaryDisplay}
                                </span>
                              )}
                            </button>
                          );
                        })
                      ) : noResultsForQuery ? (
                        <div className="flex items-center gap-2 py-3 text-sm text-gray-400" aria-live="polite">
                          <Search className="h-4 w-4" aria-hidden="true" />
                          Không tìm thấy kết quả cho &ldquo;{search.query}&rdquo;
                        </div>
                      ) : !search.isLoading ? (
                        <p className="text-sm text-gray-400 py-2 px-1">Nhập từ khóa để tìm việc làm phù hợp</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px bg-[#E2E8EC] my-2 shrink-0" />

            {/* Location + Button group — shrink-0 to prevent overlap */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Location input */}
              <div ref={locationRef} className="relative flex items-center gap-1.5 px-2 py-1.5 w-36">
                <MapPin className="h-4 w-4 text-[#8A98A8] shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  name="location"
                  role="combobox"
                  aria-label="Chọn địa điểm tìm việc"
                  aria-autocomplete="list"
                  aria-expanded={locationOpen}
                  aria-controls="hero-location-listbox"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setLocationOpen(true); }}
                  onFocus={() => {
                    loadLocations();
                    setLocationOpen(true);
                    search.setIsOpen(false);
                  }}
                  placeholder="Địa điểm"
                  className="min-h-11 flex-1 min-w-0 bg-transparent text-sm text-[var(--color-fdi-text)] placeholder:text-[#8A98A8] focus:outline-none"
                  style={{ fontFamily: "var(--font-body)" }}
                  autoComplete="off"
                />
                <button
                  type="button"
                  aria-label={locationOpen ? "Đóng danh sách địa điểm" : "Mở danh sách địa điểm"}
                  onClick={() => { loadLocations(); setLocationOpen(!locationOpen); search.setIsOpen(false); }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[#8A98A8] hover:bg-[#F2F5F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/35"
                >
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${locationOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {/* ═══════ LOCATION DROPDOWN ═══════ */}
                {locationOpen && filteredLocations.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-2xl z-50 max-h-60 overflow-y-auto py-1 min-w-48">
                    {filteredLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => { setLocation(loc); setLocationOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[var(--color-fdi-surface)] hover:text-[var(--color-fdi-primary)] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <MapPin className="h-3 w-3 inline mr-2 text-gray-400" />
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search button */}
              <button
                type="submit"
                aria-label="Tìm kiếm việc làm"
                style={{ touchAction: "manipulation" }}
                className="min-h-11 shrink-0 rounded-[14px] bg-[var(--color-fdi-accent-orange)] px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_rgba(242,92,36,0.9)] transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#D94F1D] hover:shadow-[0_18px_36px_-18px_rgba(242,92,36,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/45 cursor-pointer"
              >
                <Search className="h-4 w-4 inline mr-1.5 -mt-0.5" aria-hidden="true" />
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>

        {/* Trending Tags */}
        <div className="mx-auto mt-4 flex max-w-[920px] flex-wrap items-center justify-center gap-1.5" role="group" aria-label="Từ khóa xu hướng">
          <TrendingUp className="h-4 w-4 text-[var(--color-fdi-accent-orange)]" aria-hidden="true" />
          <span className="mr-1 text-xs font-semibold text-sky-100/[0.82]" aria-hidden="true">Xu hướng:</span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              style={{ touchAction: "manipulation" }}
              className="min-h-9 rounded-full border border-white/16 bg-white/[0.09] px-3 py-1 text-xs font-semibold text-white/88 shadow-sm transition-[background-color,border-color,color] hover:border-white/36 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/50 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mx-auto mt-5 flex max-w-lg items-center justify-center gap-5 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-sm sm:gap-8 lg:hidden">
          <div className="text-center">
            <p className="text-xl font-bold tabular-nums text-white" style={{ fontFamily: "var(--font-heading)" }}>
              {totalJobs.toLocaleString("vi-VN")}+
            </p>
            <p className="mt-1 text-xs text-sky-100/80">Việc mới</p>
          </div>
          <div className="h-10 w-px bg-white/15" />
          <div className="text-center">
            <p className="text-xl font-bold tabular-nums text-white" style={{ fontFamily: "var(--font-heading)" }}>
              {totalEmployers.toLocaleString("vi-VN")}+
            </p>
            <p className="mt-1 text-xs text-sky-100/80">Doanh nghiệp</p>
          </div>
          <div className="h-10 w-px bg-white/15" />
          <div className="text-center">
            <p className="text-xl font-bold tabular-nums text-white" style={{ fontFamily: "var(--font-heading)" }}>
              1 bước
            </p>
            <p className="mt-1 text-xs text-sky-100/80">Ứng tuyển</p>
          </div>
        </div>
      </div>
    </section>
  );
}
