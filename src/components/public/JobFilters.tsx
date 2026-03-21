"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Filter, X } from "lucide-react";

type JobFiltersProps = {
  industries: string[];
  locations: string[];
  workTypes: string[];
};

export function JobFilters({ industries, locations, workTypes }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentIndustry = searchParams.get("industry") || "";
  const currentLocation = searchParams.get("location") || "";
  const currentWorkType = searchParams.get("workType") || "";
  const currentSort = searchParams.get("sort") || "newest";

  const hasFilters = currentIndustry || currentLocation || currentWorkType;

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
          <Filter className="h-4 w-4 text-[var(--color-fdi-primary)]" />
          Bộ lọc
        </div>
        {hasFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-[var(--color-fdi-primary)] hover:underline cursor-pointer"
          >
            <X className="h-3 w-3" />
            Xóa lọc
          </button>
        )}
      </div>

      {/* Industry Filter */}
      <FilterGroup
        label="Ngành nghề"
        value={currentIndustry}
        options={industries}
        onChange={(v) => updateFilter("industry", v)}
      />

      {/* Location Filter */}
      <FilterGroup
        label="Khu vực"
        value={currentLocation}
        options={locations}
        onChange={(v) => updateFilter("location", v)}
      />

      {/* Work Type Filter */}
      <FilterGroup
        label="Hình thức"
        value={currentWorkType}
        options={workTypes}
        onChange={(v) => updateFilter("workType", v)}
      />

      {/* Sort */}
      <div>
        <label className="block text-xs font-medium text-[var(--color-fdi-text-secondary)] mb-1.5">
          Sắp xếp
        </label>
        <select
          value={currentSort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-[var(--color-fdi-text)] focus:border-[var(--color-fdi-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-fdi-primary)]/20 cursor-pointer transition-colors"
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
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--color-fdi-text-secondary)] mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-[var(--color-fdi-text)] focus:border-[var(--color-fdi-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-fdi-primary)]/20 cursor-pointer transition-colors"
      >
        <option value="">Tất cả</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
