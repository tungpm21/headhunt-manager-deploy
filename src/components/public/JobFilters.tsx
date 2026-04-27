"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Filter, X } from "lucide-react";

type JobFiltersProps = {
  industries: string[];
  locations: string[];
  workTypes: string[];
  languages: string[];
  industrialZones: string[];
};

const LANGUAGE_LABELS: Record<string, string> = {
  Japanese: "Tiếng Nhật",
  Korean: "Tiếng Hàn",
  English: "Tiếng Anh",
  Chinese: "Tiếng Trung",
  German: "Tiếng Đức",
  French: "Tiếng Pháp",
};

const SHIFT_LABELS: Record<string, string> = {
  DAY: "Ca ngày",
  NIGHT: "Ca đêm",
  ROTATING: "Xoay ca",
};

export function JobFilters({ industries, locations, workTypes, languages, industrialZones }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentIndustry = searchParams.get("industry") || "";
  const currentLocation = searchParams.get("location") || "";
  const currentWorkType = searchParams.get("workType") || "";
  const currentLanguage = searchParams.get("language") || "";
  const currentIndustrialZone = searchParams.get("industrialZone") || "";
  const currentShiftType = searchParams.get("shiftType") || "";
  const currentSort = searchParams.get("sort") || "newest";

  const hasFilters = currentIndustry || currentLocation || currentWorkType ||
    currentLanguage || currentIndustrialZone || currentShiftType;

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/viec-lam?${params.toString()}`);
    },
    [router, searchParams]
  );

  function clearAllFilters() {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.push(`/viec-lam?${params.toString()}`);
  }

  return (
    <aside className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-fdi-text)]" style={{ fontFamily: "var(--font-heading)" }}>
          <Filter className="h-4 w-4 text-[var(--color-fdi-primary)]" aria-hidden="true" />
          Bộ lọc
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="flex min-h-9 items-center gap-1 text-xs text-[var(--color-fdi-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 cursor-pointer"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Xóa lọc
          </button>
        )}
      </div>

      {/* FDI-specific filters — shown first as they're the differentiator */}
      {languages.length > 0 && (
        <FilterGroup
          name="language"
          label="Ngôn ngữ yêu cầu"
          value={currentLanguage}
          options={languages.map((l) => ({ value: l, label: LANGUAGE_LABELS[l] ?? l }))}
          onChange={(v) => updateFilter("language", v)}
        />
      )}

      {industrialZones.length > 0 && (
        <FilterGroup
          name="industrialZone"
          label="Khu công nghiệp"
          value={currentIndustrialZone}
          options={industrialZones.map((z) => ({ value: z, label: z }))}
          onChange={(v) => updateFilter("industrialZone", v)}
        />
      )}

      <FilterGroup
        name="shiftType"
        label="Ca làm việc"
        value={currentShiftType}
        options={Object.entries(SHIFT_LABELS).map(([v, l]) => ({ value: v, label: l }))}
        onChange={(v) => updateFilter("shiftType", v)}
      />

      {/* General filters */}
      <FilterGroup
        name="industry"
        label="Ngành nghề"
        value={currentIndustry}
        options={industries.map((i) => ({ value: i, label: i }))}
        onChange={(v) => updateFilter("industry", v)}
      />

      <FilterGroup
        name="location"
        label="Khu vực"
        value={currentLocation}
        options={locations.map((l) => ({ value: l, label: l }))}
        onChange={(v) => updateFilter("location", v)}
      />

      <FilterGroup
        name="workType"
        label="Hình thức"
        value={currentWorkType}
        options={workTypes.map((w) => ({ value: w, label: w }))}
        onChange={(v) => updateFilter("workType", v)}
      />

      {/* Sort */}
      <div>
        <label htmlFor="public-job-sort" className="block text-xs font-medium text-[var(--color-fdi-text-secondary)] mb-1.5">
          Sắp xếp
        </label>
        <select
          id="public-job-sort"
          name="sort"
          value={currentSort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[var(--color-fdi-text)] transition-colors focus:border-[var(--color-fdi-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/60 cursor-pointer"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="salary_high">Lương cao → thấp</option>
          <option value="salary_low">Lương thấp → cao</option>
        </select>
      </div>
    </aside>
  );
}

function FilterGroup({
  name,
  label,
  value,
  options,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  if (options.length === 0) return null;
  const id = `public-job-filter-${name}`;

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-[var(--color-fdi-text-secondary)] mb-1.5">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[var(--color-fdi-text)] transition-colors focus:border-[var(--color-fdi-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/20 cursor-pointer"
      >
        <option value="">Tất cả</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
