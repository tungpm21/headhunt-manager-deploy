"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown, Loader2 } from "lucide-react";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { LogoImage } from "@/components/public/LogoImage";

/** Strip Vietnamese diacritics for accent-insensitive search */
function removeTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function HeroSection() {
  const router = useRouter();
  const search = useSearchSuggestions();
  const [location, setLocation] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
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
        setSearchPanelOpen(false);
        search.setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [search]);

  const filteredLocations = locations.filter((l) =>
    removeTones(l).includes(removeTones(locationQuery))
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.query.trim()) params.set("q", search.query.trim());
    if (location.trim()) params.set("location", location.trim());
    const queryString = params.toString();
    router.push(queryString ? `/viec-lam?${queryString}` : "/viec-lam");
    search.setQuery("");
    setSearchPanelOpen(false);
    search.setIsOpen(false);
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
  const showDropdown = searchPanelOpen && (search.isLoading || hasKeywords || hasResults || noResultsForQuery || !suggestions);

  return (
    <section className="relative overflow-visible">
      <h1 className="sr-only">
        Tìm việc làm FDI tại Việt Nam - Kết nối ứng viên với doanh nghiệp nước ngoài
      </h1>
      <div className="relative mx-auto max-w-7xl px-4 pb-3 pt-14 sm:px-6 lg:px-8 lg:pt-16">
        <div
          ref={searchContainerRef}
          className="relative z-30 mx-auto max-w-5xl"
        >
          <form
            onSubmit={handleSearch}
            className="flex flex-col items-stretch gap-1 rounded-xl border border-[#D7E4E8] bg-[var(--color-fdi-paper)] p-1.5 shadow-[0_18px_46px_-34px_rgba(7,26,47,0.45),inset_0_1px_1px_rgba(255,255,255,0.95)] transition-[border-color,box-shadow] duration-300 ease-[var(--ease-fdi)] focus-within:border-[var(--color-fdi-accent-orange)]/80 focus-within:shadow-[0_22px_54px_-36px_rgba(7,26,47,0.5),inset_0_1px_1px_rgba(255,255,255,0.95)] sm:min-h-[56px] sm:flex-row sm:items-center"
          >
            {/* Keyword input */}
            <div className="flex min-h-11 flex-1 items-center gap-2 px-3 sm:px-4">
              <Search className="h-5 w-5 shrink-0 text-[#6F8092]" aria-hidden="true" />
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
                onChange={(e) => {
                  setSearchPanelOpen(true);
                  search.setQuery(e.target.value);
                }}
                onClick={() => {
                  setSearchPanelOpen(true);
                  search.handleFocus();
                  setLocationOpen(false);
                }}
                onFocus={() => {
                  setSearchPanelOpen(true);
                  search.handleFocus();
                  setLocationOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchPanelOpen(false);
                  search.handleKeyDown(e);
                }}
                placeholder="Tìm kiếm việc làm, công ty, kỹ năng"
                style={{ outline: "none" }}
                className="min-h-11 flex-1 bg-transparent text-sm text-[var(--color-fdi-text)] outline-none placeholder:text-[#8A98A8] focus:outline-none focus:ring-0 focus-visible:outline-none sm:text-base"
                autoComplete="off"
              />
            </div>

            {/* Divider */}
            <div className="hidden h-8 w-px shrink-0 bg-[#E2E8EC] sm:block" />

            {/* Location + Button group — shrink-0 to prevent overlap */}
            <div className="flex shrink-0 items-center gap-2 px-1 sm:px-0">
              {/* Location input */}
              <div ref={locationRef} className="relative">
                <button
                  type="button"
                  aria-label={`${locationOpen ? "Đóng" : "Mở"} danh sách địa điểm: ${location || "Tất cả địa điểm"}`}
                  aria-expanded={locationOpen}
                  aria-controls="hero-location-listbox"
                  onClick={() => {
                    loadLocations();
                    setLocationQuery("");
                    setLocationOpen(!locationOpen);
                    setSearchPanelOpen(false);
                    search.setIsOpen(false);
                  }}
                  className="inline-flex min-h-11 max-w-[156px] items-center gap-2 rounded-lg bg-[#F2F4F6] px-3 text-sm font-semibold text-[var(--color-fdi-text)] transition-colors hover:bg-[#E9EEF1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/35 sm:max-w-[190px]"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-[#7A8794]" aria-hidden="true" />
                  <span className="truncate">{location || "Tất cả địa điểm"}</span>
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${locationOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>

                {locationOpen && (
                  <div
                    id="hero-location-listbox"
                    className="absolute right-0 top-full z-50 mt-3 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#E2EAEC] bg-white p-4 text-[var(--color-fdi-text)] shadow-[0_30px_80px_-50px_rgba(7,26,47,0.7)]"
                  >
                    <p className="text-base font-black text-[var(--color-fdi-ink)]">Địa điểm</p>
                    <div className="mt-4 flex min-h-11 items-center gap-2 rounded-xl border border-[#D7E4E8] bg-[#F6FAFB] px-3 focus-within:border-[#1B75BC] focus-within:ring-2 focus-within:ring-[#1B75BC]/12">
                      <Search className="h-4 w-4 shrink-0 text-[#8A98A8]" aria-hidden="true" />
                      <input
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        aria-label="Tìm kiếm tỉnh/thành phố"
                        placeholder="Tìm kiếm"
                        className="min-h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9AA6B2]"
                      />
                    </div>
                    <div className="mt-3 max-h-72 overflow-y-auto pr-1">
                      <button
                        type="button"
                        onClick={() => {
                          setLocation("");
                          setLocationQuery("");
                          setLocationOpen(false);
                        }}
                        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm font-medium text-[var(--color-fdi-text)] transition-colors hover:bg-[#F3F8FA]"
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${location ? "border-[#9CA8B3]" : "border-[var(--color-fdi-primary)] bg-[var(--color-fdi-primary)]"}`}>
                          {!location && <span className="h-2 w-2 rounded-sm bg-white" />}
                        </span>
                        Tất cả địa điểm
                      </button>
                      {filteredLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setLocation(loc);
                          setLocationQuery("");
                          setLocationOpen(false);
                        }}
                        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm font-medium text-[var(--color-fdi-text)] transition-colors hover:bg-[#F3F8FA]"
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${location === loc ? "border-[var(--color-fdi-primary)] bg-[var(--color-fdi-primary)]" : "border-[#9CA8B3]"}`}>
                          {location === loc && <span className="h-2 w-2 rounded-sm bg-white" />}
                        </span>
                        {loc}
                      </button>
                      ))}
                      {filteredLocations.length === 0 && (
                        <p className="px-2 py-4 text-sm text-[#7A8794]">Không tìm thấy địa điểm phù hợp.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Search button */}
              <button
                type="submit"
                aria-label="Tìm kiếm việc làm"
                style={{ touchAction: "manipulation" }}
                className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-[#A83007] bg-[var(--color-fdi-accent-orange)] py-1 pl-4 pr-1 text-sm font-bold text-white shadow-[0_14px_30px_-20px_rgba(194,65,12,0.95)] transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#7C2504] hover:bg-[#9F3108] hover:shadow-[0_18px_34px_-20px_rgba(194,65,12,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/45 cursor-pointer sm:mr-1"
              >
                Tìm kiếm
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/18 transition-transform duration-300 ease-[var(--ease-fdi)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <Search className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
            </div>
          </form>

          {showDropdown && (
            <div
              id="hero-search-listbox"
              role="listbox"
              aria-label="Gợi ý tìm kiếm"
              className="absolute left-0 right-0 top-full z-40 mt-3 overflow-hidden rounded-xl border border-[#E2EAEC] bg-white text-[var(--color-fdi-text)] shadow-[0_34px_90px_-56px_rgba(7,26,47,0.76)]"
            >
              {search.isLoading && !suggestions ? (
                <div className="flex items-center gap-2 px-6 py-5 text-sm text-[#7A8794]" aria-live="polite">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Đang tải gợi ý tìm kiếm...
                </div>
              ) : (
                <div className="grid max-h-[min(560px,calc(100vh-190px))] grid-cols-1 overflow-y-auto lg:grid-cols-[0.9fr_1.2fr]">
                  <div className="border-b border-[#E9EEF1] p-5 lg:border-b-0 lg:border-r lg:p-6">
                    <div>
                      <p className="text-base font-black text-[var(--color-fdi-ink)]">Không có tìm kiếm gần đây</p>
                      <p className="mt-2 text-sm text-[#7A8794]">Lịch sử từ khoá tìm kiếm của bạn sẽ được hiển thị ở đây.</p>
                    </div>

                    {hasKeywords && (
                      <div className="mt-8">
                        <p className="text-base font-black text-[var(--color-fdi-ink)]">Từ khoá phổ biến</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {suggestions!.popularKeywords.slice(0, 8).map((kw, i) => {
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
                                className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition-colors ${search.activeIndex === idx
                                  ? "border-[var(--color-fdi-primary)] bg-[#EEF8FA] text-[var(--color-fdi-primary)]"
                                  : "border-[#DDE6EA] bg-white text-[var(--color-fdi-text)] hover:border-[#B9D4DC] hover:bg-[#F6FAFB]"
                                  }`}
                              >
                                {kw}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {hasEmployers && (
                      <div className="mt-8">
                        <p className="text-base font-black text-[var(--color-fdi-ink)]">Công ty nổi bật</p>
                        <div className="mt-3 space-y-2">
                          {suggestions!.employers.slice(0, 4).map((emp, i) => {
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
                                className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors ${search.activeIndex === idx ? "bg-[#EEF8FA]" : "hover:bg-[#F6FAFB]"}`}
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2EAEC] bg-white">
                                  <LogoImage src={emp.logo} alt="" className="max-h-7 max-w-8 object-contain" iconSize="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-[var(--color-fdi-ink)]">{emp.companyName}</p>
                                  {emp.industry && <p className="truncate text-xs text-[#7A8794]">{emp.industry}</p>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5 lg:p-6">
                    <p className="text-base font-black text-[var(--color-fdi-ink)]">
                      {search.query.trim() ? "Việc làm phù hợp" : "Việc làm bạn sẽ thích"}
                    </p>

                    {hasJobs ? (
                      <div className="mt-3 space-y-2">
                        {suggestions!.jobs.slice(0, 6).map((job, i) => {
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
                              className={`grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${search.activeIndex === idx ? "bg-[#EEF8FA]" : "hover:bg-[#F6FAFB]"}`}
                            >
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2EAEC] bg-white">
                                <LogoImage src={job.employer.logo} alt="" className="max-h-8 max-w-9 object-contain" iconSize="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-[var(--color-fdi-ink)] sm:text-base">{job.title}</p>
                                <p className="mt-0.5 truncate text-xs text-[#7A8794]">
                                  {job.employer.companyName}{job.location ? ` · ${job.location}` : ""}
                                </p>
                              </div>
                              <span className="hidden text-sm font-semibold text-[var(--color-fdi-accent-orange)] sm:block">
                                {job.salaryDisplay || "Thương lượng"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : noResultsForQuery ? (
                      <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#F6FAFB] px-4 py-5 text-sm text-[#7A8794]" aria-live="polite">
                        <Search className="h-4 w-4" aria-hidden="true" />
                        Không tìm thấy kết quả cho &ldquo;{search.query}&rdquo;
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-[#7A8794]">Nhập từ khoá để xem việc làm phù hợp hơn.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
