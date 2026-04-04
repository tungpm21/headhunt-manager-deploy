"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Tag } from "@/types";
import { STATUS_OPTIONS } from "@/components/candidates/status-badge";

interface CandidateFiltersProps {
  allTags: Tag[];
  locations: string[];
  industries: string[];
  skills: string[];
}

const SENIORITY_OPTIONS = [
  { value: "INTERN", label: "Intern" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MID_LEVEL", label: "Mid-level" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
  { value: "MANAGER", label: "Manager" },
  { value: "DIRECTOR", label: "Director" },
];

const LANGUAGE_OPTIONS = [
  "Tiếng Anh",
  "Tiếng Nhật",
  "Tiếng Hàn",
  "Tiếng Trung",
  "Tiếng Đức",
  "Tiếng Pháp",
];

const FILTER_PARAM_KEYS = [
  "status",
  "level",
  "language",
  "skills",
  "location",
  "industry",
  "minSalary",
  "maxSalary",
  "tagId",
  "sortBy",
  "sortOrder",
] as const;

export function CandidateFiltersPanel({
  allTags,
  locations,
  industries,
  skills,
}: CandidateFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const skillsTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
          return;
        }

        params.set(key, value);
      });

      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  const update = (updates: Record<string, string | null>) => {
    router.push(`${pathname}?${createQueryString(updates)}`);
  };

  const hasActiveFilters = FILTER_PARAM_KEYS.some((key) => searchParams.has(key));

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    FILTER_PARAM_KEYS.forEach((key) => params.delete(key));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/50" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, email..."
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              clearTimeout(searchTimerRef.current);
              searchTimerRef.current = setTimeout(() => update({ search: value || null }), 300);
            }}
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground transition placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Sort */}
        <select
          value={`${searchParams.get("sortBy") ?? "createdAt"}_${searchParams.get("sortOrder") ?? "desc"}`}
          onChange={(event) => {
            const [sortBy, sortOrder] = event.target.value.split("_");
            update({ sortBy, sortOrder });
          }}
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="createdAt_desc">Mới nhất</option>
          <option value="createdAt_asc">Cũ nhất</option>
          <option value="fullName_asc">Tên A → Z</option>
          <option value="fullName_desc">Tên Z → A</option>
          <option value="expectedSalary_desc">Lương cao nhất</option>
          <option value="expectedSalary_asc">Lương thấp nhất</option>
        </select>

        <button
          type="button"
          onClick={() => setShowFilters((current) => !current)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${showFilters || hasActiveFilters
            ? "border-primary bg-primary/5 text-primary"
            : "border-border bg-background text-foreground hover:bg-surface"
            }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Bộ lọc
          {hasActiveFilters ? (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
              !
            </span>
          ) : null}
        </button>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2.5 text-sm text-danger transition hover:bg-danger/5"
          >
            <X className="h-4 w-4" />
            Xóa lọc
          </button>
        ) : null}
      </div>

      {showFilters ? (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Trạng thái</label>
            <select
              value={searchParams.get("status") ?? ""}
              onChange={(event) => update({ status: event.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Tất cả</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Khu vực</label>
            <select
              value={searchParams.get("location") ?? ""}
              onChange={(event) => update({ location: event.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Tất cả</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Cấp bậc</label>
            <select
              value={searchParams.get("level") ?? ""}
              onChange={(event) => update({ level: event.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Tất cả</option>
              {SENIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Ngôn ngữ</label>
            <select
              value={searchParams.get("language") ?? ""}
              onChange={(event) => update({ language: event.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Tất cả</option>
              {LANGUAGE_OPTIONS.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Ngành nghề</label>
            <select
              value={searchParams.get("industry") ?? ""}
              onChange={(event) => update({ industry: event.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Tất cả</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Kỹ năng</label>
            <input
              type="text"
              list="skills-options"
              placeholder="VD: React, Java..."
              defaultValue={searchParams.get("skills") ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                clearTimeout(skillsTimerRef.current);
                skillsTimerRef.current = setTimeout(() => update({ skills: value || null }), 400);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <datalist id="skills-options">
              {skills.map((skill) => (
                <option key={skill} value={skill} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Lương tối thiểu (tr)
            </label>
            <input
              type="number"
              min={0}
              placeholder="VD: 10"
              defaultValue={searchParams.get("minSalary") ?? ""}
              onChange={(event) => update({ minSalary: event.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Lương tối đa (tr)
            </label>
            <input
              type="number"
              min={0}
              placeholder="VD: 50"
              defaultValue={searchParams.get("maxSalary") ?? ""}
              onChange={(event) => update({ maxSalary: event.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {allTags.length > 0 ? (
            <div className="col-span-2 sm:col-span-3 lg:col-span-5">
              <label className="mb-2 block text-xs font-medium text-muted">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const active = searchParams.get("tagId") === String(tag.id);

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => update({ tagId: active ? null : String(tag.id) })}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${active
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                      style={
                        !active && tag.color
                          ? { borderColor: `${tag.color}40`, color: tag.color }
                          : undefined
                      }
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
