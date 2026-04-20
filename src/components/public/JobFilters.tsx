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

const VISA_LABELS: Record<string, string> = {
  YES: "Có hỗ trợ",
  NO: "Không hỗ trợ",
  NEGOTIABLE: "Thương lượng",
};

export function JobFilters({ industries, locations, workTypes, languages, industrialZones }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentIndustry = searchParams.get("industry") || "";
  const currentLocation = searchParams.get("location") || "";
  const currentWorkType = searchParams.get("workType") || "";
  const currentLanguage = searchParams.get("language") || "";
  const currentIndustrialZone = searchParams.get("industrialZone") || "";
  const currentVisaSupport = searchParams.get("visaSupport") || "";
  const currentShiftType = searchParams.get("shiftType") || "";
  const currentSort = searchParams.get("sort") || "newest";

  const hasFilters = currentIndustry || currentLocation || currentWorkType ||
    currentLanguage || currentIndustrialZone || currentVisaSupport || currentShiftType;

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

      {/* FDI-specific filters — shown first as they're the differentiator */}
      {languages.length > 0 && (
        <FilterGroup
          label="Ngôn ngữ yêu cầu"
          value={currentLanguage}
          options={languages.map((l) => ({ value: l, label: LANGUAGE_LABELS[l] ?? l }))}
          onChange={(v) => updateFilter("language", v)}
        />
      )}

      {industrialZones.length > 0 && (
        <FilterGroup
          label="Khu công nghiệp"
          value={currentIndustrialZone}
          options={industrialZones.map((z) => ({ value: z, label: z }))}
          onChange={(v) => updateFilter("industrialZone", v)}
        />
      )}

      <FilterGroup
        label="Hỗ trợ visa"
        value={currentVisaSupport}
        options={Object.entries(VISA_LABELS).map(([v, l]) => ({ value: v, label: l }))}
        onChange={(v) => updateFilter("visaSupport", v)}
      />

      <FilterGroup
        label="Ca làm việc"
        value={currentShiftType}
        options={Object.entries(SHIFT_LABELS).map(([v, l]) => ({ value: v, label: l }))}
        onChange={(v) => updateFilter("shiftType", v)}
      />

      {/* General filters */}
      <FilterGroup
        label="Ngành nghề"
        value={currentIndustry}
        options={industries.map((i) => ({ value: i, label: i }))}
        onChange={(v) => updateFilter("industry", v)}
      />

      <FilterGroup
        label="Khu vực"
        value={currentLocation}
        options={locations.map((l) => ({ value: l, label: l }))}
        onChange={(v) => updateFilter("location", v)}
      />

      <FilterGroup
        label="Hình thức"
        value={currentWorkType}
        options={workTypes.map((w) => ({ value: w, label: w }))}
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
  options: { value: string; label: string }[];
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
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
