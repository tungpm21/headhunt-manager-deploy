"use client";

import { Building2, Briefcase, Search, Loader2 } from "lucide-react";
import { LogoImage } from "@/components/public/LogoImage";
import type { SearchSuggestions } from "@/hooks/useSearchSuggestions";

type Props = {
  suggestions: SearchSuggestions | null;
  isLoading: boolean;
  query: string;
  activeIndex: number;
  onSelectEmployer: (slug: string) => void;
  onSelectJob: (slug: string) => void;
  onSelectKeyword: (keyword: string) => void;
  onHoverIndex: (index: number) => void;
};

export function SearchAutocompleteDropdown({
  suggestions,
  isLoading,
  query,
  activeIndex,
  onSelectEmployer,
  onSelectJob,
  onSelectKeyword,
  onHoverIndex,
}: Props) {
  if (!suggestions && !isLoading) return null;

  // Flat index offsets
  const employerCount = suggestions?.employers.length ?? 0;
  const jobCount = suggestions?.jobs.length ?? 0;
  const employerOffset = 0;
  const jobOffset = employerCount;
  const keywordOffset = employerCount + jobCount;

  const hasEmployers = employerCount > 0;
  const hasJobs = jobCount > 0;
  const hasKeywords = (suggestions?.popularKeywords.length ?? 0) > 0;
  const hasResults = hasEmployers || hasJobs;
  const noResultsForQuery = query.trim().length > 0 && !hasResults && !isLoading;

  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-100 shadow-xl z-50 max-h-[70vh] overflow-y-auto">
      {/* Loading */}
      {isLoading && !suggestions && (
        <div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tìm kiếm...
        </div>
      )}

      {/* Employer suggestions */}
      {hasEmployers && (
        <div className="px-3 pt-3 pb-1">
          <p className="px-1 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Có phải bạn đang tìm
          </p>
          {suggestions!.employers.map((emp, i) => {
            const idx = employerOffset + i;
            return (
              <button
                key={emp.id}
                type="button"
                onClick={() => onSelectEmployer(emp.slug)}
                onMouseEnter={() => onHoverIndex(idx)}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                  activeIndex === idx ? "bg-[var(--color-fdi-surface)]" : "hover:bg-gray-50"
                }`}
              >
                <div className="h-9 w-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  <LogoImage
                    src={emp.logo}
                    alt={emp.companyName}
                    className="h-full w-full object-contain p-1"
                    iconSize="h-4 w-4"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-[var(--color-fdi-text)] truncate">
                    {emp.companyName}
                  </p>
                  {emp.industry && (
                    <p className="text-xs text-gray-400 truncate">{emp.industry}</p>
                  )}
                </div>
                <span className="shrink-0 text-[10px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                  Công ty
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Job suggestions */}
      {hasJobs && (
        <div className={`px-3 pb-1 ${hasEmployers ? "pt-1 border-t border-gray-50" : "pt-3"}`}>
          <p className="px-1 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Việc làm bạn sẽ thích
          </p>
          {suggestions!.jobs.map((job, i) => {
            const idx = jobOffset + i;
            return (
              <button
                key={job.id}
                type="button"
                onClick={() => onSelectJob(job.slug)}
                onMouseEnter={() => onHoverIndex(idx)}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                  activeIndex === idx ? "bg-[var(--color-fdi-surface)]" : "hover:bg-gray-50"
                }`}
              >
                <div className="h-9 w-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  <LogoImage
                    src={job.employer.logo}
                    alt={job.employer.companyName}
                    className="h-full w-full object-contain p-1"
                    iconSize="h-4 w-4"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-[var(--color-fdi-text)] truncate">
                    {job.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 truncate">
                    <span className="truncate">{job.employer.companyName}</span>
                    {job.salaryDisplay && (
                      <span className="text-red-500 font-medium shrink-0">
                        {job.salaryDisplay}
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                  Việc làm
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {noResultsForQuery && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
          <Search className="h-4 w-4" />
          Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
        </div>
      )}

      {/* Popular keywords */}
      {hasKeywords && (
        <div className={`px-3 py-3 ${hasResults || noResultsForQuery ? "border-t border-gray-100" : ""}`}>
          <p className="px-1 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Từ khóa phổ biến
          </p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {suggestions!.popularKeywords.map((kw, i) => {
              const idx = keywordOffset + i;
              return (
                <button
                  key={kw}
                  type="button"
                  onClick={() => onSelectKeyword(kw)}
                  onMouseEnter={() => onHoverIndex(idx)}
                  className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                    activeIndex === idx
                      ? "bg-[var(--color-fdi-primary)] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-[var(--color-fdi-primary)]/10 hover:text-[var(--color-fdi-primary)]"
                  }`}
                >
                  {kw}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
