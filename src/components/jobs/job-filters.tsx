"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { JobStatus } from "@/types/job";

export function JobFiltersPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "";

  const [search, setSearch] = useState(currentSearch);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      params.delete("page"); // reset page on filter
      return params.toString();
    },
    [searchParams]
  );

  const applySearch = () => {
    startTransition(() => {
      if (search) {
        router.push(pathname + "?" + createQueryString("search", search));
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("search");
        router.push(pathname + "?" + params.toString());
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-white p-4 rounded-xl border shadow-sm">
      {/* Search text */}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm vị trí tuyển dụng, khách hàng..."
          className="block w-full rounded-lg border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applySearch();
          }}
        />
      </div>

      {/* Select Status */}
      <div className="sm:w-48">
        <select
          value={currentStatus}
          onChange={(e) => {
            startTransition(() => {
              if (e.target.value) {
                router.push(pathname + "?" + createQueryString("status", e.target.value));
              } else {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("status");
                params.delete("page");
                router.push(pathname + "?" + params.toString());
              }
            });
          }}
          className="block w-full rounded-lg border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
        >
          <option value="">Trạng thái (Tất cả)</option>
          <option value="OPEN">Đang tuyển (OPEN)</option>
          <option value="PAUSED">Tạm dừng (PAUSED)</option>
          <option value="FILLED">Đã tuyển (FILLED)</option>
          <option value="CANCELLED">Đã hủy (CANCELLED)</option>
        </select>
      </div>
    </div>
  );
}
