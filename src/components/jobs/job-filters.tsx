"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { JobCandidateStage } from "@/types/job";

const STAGE_OPTIONS: { value: JobCandidateStage; label: string }[] = [
  { value: "SOURCED", label: "Đã tiếp cận" },
  { value: "CONTACTED", label: "Đã liên hệ" },
  { value: "INTERVIEW", label: "Phỏng vấn" },
  { value: "OFFER", label: "Đề nghị" },
  { value: "PLACED", label: "Nhận việc" },
  { value: "REJECTED", label: "Từ chối" },
];

export function JobFiltersPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentStage = searchParams.get("stage") || "";

  const [search, setSearch] = useState(currentSearch);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  const applySearch = () => {
    startTransition(() => {
      if (search.trim()) {
        router.push(`${pathname}?${createQueryString("search", search.trim())}`);
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.delete("search");
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-muted" />
        </div>
        <input
          type="text"
          placeholder="Tìm vị trí tuyển dụng, khách hàng..."
          className="block w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm sm:leading-6"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              applySearch();
            }
          }}
        />
      </div>

      <div className="sm:w-48">
        <select
          value={currentStatus}
          onChange={(event) => {
            startTransition(() => {
              if (event.target.value) {
                router.push(`${pathname}?${createQueryString("status", event.target.value)}`);
                return;
              }

              const params = new URLSearchParams(searchParams.toString());
              params.delete("status");
              params.delete("page");
              router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
            });
          }}
          className="block w-full rounded-lg border border-border bg-background py-2 pl-3 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm sm:leading-6"
        >
          <option value="">Trạng thái (Tất cả)</option>
          <option value="OPEN">Đang tuyển (OPEN)</option>
          <option value="PAUSED">Tạm dừng (PAUSED)</option>
          <option value="FILLED">Đã tuyển (FILLED)</option>
          <option value="CANCELLED">Đã hủy (CANCELLED)</option>
        </select>
      </div>

      <div className="sm:w-48">
        <select
          value={currentStage}
          onChange={(event) => {
            startTransition(() => {
              if (event.target.value) {
                router.push(`${pathname}?${createQueryString("stage", event.target.value)}`);
                return;
              }

              const params = new URLSearchParams(searchParams.toString());
              params.delete("stage");
              params.delete("page");
              router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
            });
          }}
          className="block w-full rounded-lg border border-border bg-background py-2 pl-3 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm sm:leading-6"
        >
          <option value="">Giai đoạn (Tất cả)</option>
          {STAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
