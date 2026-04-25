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
    <section className="relative overflow-visible bg-gradient-to-br from-[var(--color-fdi-dark)] via-[#005A9E] to-[var(--color-fdi-primary)]">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-[var(--color-fdi-accent)] blur-3xl motion-safe:animate-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[var(--color-fdi-primary)] blur-3xl motion-safe:animate-none" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Tìm việc làm
            <span className="text-[var(--color-fdi-accent)]"> chất lượng cao</span>
            <br className="hidden sm:block" />
            tại doanh nghiệp FDI
          </h1>
          <p
            className="mt-4 text-base sm:text-lg text-sky-100/80 max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Kết nối hàng ngàn ứng viên với các doanh nghiệp đầu tư nước ngoài hàng đầu tại Việt Nam
          </p>
        </div>

        {/* Search Bar — with inline dropdowns */}
        <div className="mx-auto max-w-4xl relative z-20">
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-xl shadow-2xl p-1.5 sm:p-2 flex flex-col sm:flex-row gap-0 items-center"
          >
            {/* Keyword input */}
            <div ref={searchContainerRef} className="relative flex-1">
              <div className="flex items-center gap-2 px-3 py-2.5 sm:py-3">
                <Search className="h-5 w-5 text-gray-400 shrink-0" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="text"
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
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
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
            <div className="hidden sm:block w-px bg-gray-200 my-2 shrink-0" />

            {/* Location + Button group — shrink-0 to prevent overlap */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Location input */}
              <div ref={locationRef} className="relative flex items-center gap-1.5 px-3 py-2.5 sm:py-3 w-44">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0" aria-hidden="true" />
                <input
                  type="text"
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
                  className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  style={{ fontFamily: "var(--font-body)" }}
                />
                <ChevronDown
                  className={`h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform cursor-pointer ${locationOpen ? "rotate-180" : ""}`}
                  onClick={() => { loadLocations(); setLocationOpen(!locationOpen); search.setIsOpen(false); }}
                  aria-hidden="true"
                />

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
                className="px-6 sm:px-8 py-3 rounded-xl bg-[var(--color-fdi-accent-orange)] text-white font-semibold text-sm hover:bg-[#E65C00] transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg cursor-pointer shrink-0"
              >
                <Search className="h-4 w-4 inline mr-1.5 -mt-0.5" aria-hidden="true" />
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>

        {/* Trending Tags */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Từ khóa xu hướng">
          <TrendingUp className="h-4 w-4 text-sky-300/60" aria-hidden="true" />
          <span className="text-xs text-sky-300/60 mr-1" aria-hidden="true">Xu hướng:</span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              style={{ touchAction: "manipulation" }}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-sky-100 hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-10 flex items-center justify-center gap-8 sm:gap-16">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              {totalJobs.toLocaleString("vi-VN")}+
            </p>
            <p className="text-xs sm:text-sm text-sky-200/60 mt-1">Việc làm mới</p>
          </div>
          <div className="w-px h-10 bg-blue-700/30" />
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              {totalEmployers.toLocaleString("vi-VN")}+
            </p>
            <p className="text-xs sm:text-sm text-sky-200/60 mt-1">Doanh nghiệp</p>
          </div>
          <div className="w-px h-10 bg-blue-700/30" />
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              100%
            </p>
            <p className="text-xs sm:text-sm text-sky-200/60 mt-1">Miễn phí</p>
          </div>
        </div>
      </div>
    </section>
  );
}
