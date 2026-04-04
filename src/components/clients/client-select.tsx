"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { ClientSelectOption, PaginatedClientOptions } from "@/types/client";

type ClientSelectProps = {
  name: string;
  required?: boolean;
  defaultValue?: number | null;
  defaultLabel?: string | null;
  initialOptions?: ClientSelectOption[];
};

function buildOptionsUrl(params: {
  query: string;
  page: number;
  pageSize: number;
  includeIds: number[];
}) {
  const searchParams = new URLSearchParams();

  if (params.query.trim()) {
    searchParams.set("q", params.query.trim());
  }

  searchParams.set("page", String(params.page));
  searchParams.set("pageSize", String(params.pageSize));

  params.includeIds.forEach((id) => {
    searchParams.append("includeId", String(id));
  });

  return `/api/clients/options?${searchParams.toString()}`;
}

export function ClientSelect({
  name,
  required,
  defaultValue,
  defaultLabel,
  initialOptions = [],
}: ClientSelectProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState(defaultLabel ?? "");
  const [selected, setSelected] = useState<ClientSelectOption | null>(
    defaultValue && defaultLabel
      ? { id: defaultValue, companyName: defaultLabel }
      : null
  );
  const [options, setOptions] = useState<ClientSelectOption[]>(() => {
    if (!selected) {
      return initialOptions;
    }

    return Array.from(
      new Map([selected, ...initialOptions].map((option) => [option.id, option])).values()
    );
  });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const includeIds = useMemo(
    () => (selected ? [selected.id] : defaultValue ? [defaultValue] : []),
    [defaultValue, selected]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          buildOptionsUrl({
            query,
            page,
            pageSize,
            includeIds,
          }),
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch client.");
        }

        const result = (await response.json()) as PaginatedClientOptions;

        setOptions((current) => {
          const nextOptions =
            page === 1 ? result.clients : [...current, ...result.clients];

          return Array.from(
            new Map(nextOptions.map((option) => [option.id, option])).values()
          );
        });
        setTotalPages(result.totalPages);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("client select load error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [includeIds, page, pageSize, query]);

  const canLoadMore = page < totalPages;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="hidden"
        name={name}
        value={selected?.id ?? ""}
        required={required}
      />

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-muted" />
        </div>
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setPage(1);
            setIsOpen(true);

            if (selected && nextQuery !== selected.companyName) {
              setSelected(null);
            }
          }}
          placeholder="Tim client theo ten..."
          className="w-full rounded-lg border border-border bg-background px-10 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted/50 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted"
          aria-label="Mo danh sach client"
        >
          <ChevronsUpDown className="h-4 w-4" />
        </button>
      </div>

      {selected ? (
        <p className="mt-1.5 text-xs text-muted">
          Da chon client:{" "}
          <span className="font-medium text-foreground">{selected.companyName}</span>
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-muted">
          Tim theo ten cong ty. Ket qua duoc phan trang de tranh load qua nhieu client.
        </p>
      )}

      {isOpen ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <div className="border-b border-border bg-background px-3 py-2 text-xs text-muted">
            {isLoading ? "Dang tai client..." : `${options.length} client dang hien thi`}
          </div>

          <div className="max-h-56 overflow-y-auto">
            {options.length === 0 && !isLoading ? (
              <div className="px-3 py-4 text-sm text-muted">
                Khong tim thay client phu hop.
              </div>
            ) : (
              options.map((option) => {
                const isSelected = option.id === selected?.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSelected(option);
                      setQuery(option.companyName);
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-background"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted" />
                      <span className="text-foreground">{option.companyName}</span>
                    </span>
                    {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border bg-background px-3 py-2">
            <span className="text-xs text-muted">
              Trang {page}/{totalPages}
            </span>
            {canLoadMore ? (
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Xem them
              </button>
            ) : (
              <span className="text-xs text-muted">Da het ket qua</span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
