"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Tag } from "@prisma/client";
import { STATUS_OPTIONS } from "@/components/candidates/status-badge";

interface CandidateFiltersProps {
  allTags: Tag[];
}

const LOCATIONS = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Khác"];
const INDUSTRIES = [
  "IT / Phần mềm", "Tài chính / Ngân hàng", "Marketing / Truyền thông",
  "Kỹ thuật / Sản xuất", "Kinh doanh / Sales", "Nhân sự", "Hành chính", "Khác",
];

const SENIORITY_OPTIONS = [
  { value: "INTERN",    label: "Intern" },
  { value: "JUNIOR",   label: "Junior" },
  { value: "MID_LEVEL",label: "Mid-level" },
  { value: "SENIOR",   label: "Senior" },
  { value: "LEAD",     label: "Lead" },
  { value: "MANAGER",  label: "Manager" },
  { value: "DIRECTOR", label: "Director" },
];

export function CandidateFiltersPanel({ allTags }: CandidateFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === "") params.delete(key);
        else params.set(key, val);
      });
      params.delete("page"); // reset page on filter change
      return params.toString();
    },
    [searchParams]
  );

  const update = (updates: Record<string, string | null>) => {
    router.push(`${pathname}?${createQueryString(updates)}`);
  };

  const hasActiveFilters =
    searchParams.has("status") ||
    searchParams.has("level") ||
    searchParams.has("skills") ||
    searchParams.has("location") ||
    searchParams.has("industry") ||
    searchParams.has("minSalary") ||
    searchParams.has("maxSalary") ||
    searchParams.has("tagId");

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["status", "level", "skills", "location", "industry", "minSalary", "maxSalary", "tagId"].forEach(
      (k) => params.delete(k)
    );
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      {/* Search + Filter toggle row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/50" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, email..."
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => {
              const q = e.target.value;
              setTimeout(() => update({ search: q || null }), 300); // debounce
            }}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
            showFilters || hasActiveFilters
              ? "border-primary bg-primary/5 text-primary"
              : "border-border bg-background text-foreground hover:bg-surface"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Bộ lọc
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs">
              !
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-2.5 text-sm text-danger hover:bg-danger/5 transition"
          >
            <X className="h-4 w-4" />
            Xoá lọc
          </button>
        )}
      </div>

      {/* Expanded filter panel */}
      {showFilters && (
        <div className="rounded-xl border border-border bg-surface p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Status */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Trạng thái</label>
            <select
              value={searchParams.get("status") ?? ""}
              onChange={(e) => update({ status: e.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Tất cả</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Khu vực</label>
            <select
              value={searchParams.get("location") ?? ""}
              onChange={(e) => update({ location: e.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Tất cả</option>
              {LOCATIONS.map((l) => (<option key={l} value={l}>{l}</option>))}
            </select>
          </div>

          {/* Level / Seniority */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Cấp bậc</label>
            <select
              value={searchParams.get("level") ?? ""}
              onChange={(e) => update({ level: e.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Tất cả</option>
              {SENIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Industry */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Ngành nghề</label>
            <select
              value={searchParams.get("industry") ?? ""}
              onChange={(e) => update({ industry: e.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Tất cả</option>
              {INDUSTRIES.map((i) => (<option key={i} value={i}>{i}</option>))}
            </select>
          </div>

          {/* Skills search */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Kỹ năng</label>
            <input
              type="text"
              placeholder="VD: React, Java..."
              defaultValue={searchParams.get("skills") ?? ""}
              onChange={(e) => {
                const q = e.target.value;
                setTimeout(() => update({ skills: q || null }), 400);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Salary */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Lương tối thiểu (tr)</label>
            <input
              type="number"
              min={0}
              placeholder="VD: 10"
              defaultValue={searchParams.get("minSalary") ?? ""}
              onChange={(e) => update({ minSalary: e.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Lương tối đa (tr)</label>
            <input
              type="number"
              min={0}
              placeholder="VD: 50"
              defaultValue={searchParams.get("maxSalary") ?? ""}
              onChange={(e) => update({ maxSalary: e.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="col-span-2 sm:col-span-3 lg:col-span-5">
              <label className="mb-2 block text-xs font-medium text-muted">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const active = searchParams.get("tagId") === String(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() =>
                        update({ tagId: active ? null : String(tag.id) })
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                        active
                          ? "bg-primary text-white border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/50"
                      }`}
                      style={
                        !active && tag.color
                          ? { borderColor: tag.color + "40", color: tag.color }
                          : undefined
                      }
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
