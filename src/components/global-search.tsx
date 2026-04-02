"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  Briefcase,
  Building2,
  Loader2,
  Search,
  UserCog,
  Users,
} from "lucide-react";
import { globalSearch, SearchResultItem } from "@/lib/global-search";

const groups = [
  {
    type: "candidate",
    label: "Ứng viên",
    icon: Users,
  },
  {
    type: "client",
    label: "Khách hàng",
    icon: Building2,
  },
  {
    type: "job",
    label: "Job Orders",
    icon: Briefcase,
  },
  {
    type: "employer",
    label: "Nhà tuyển dụng",
    icon: UserCog,
  },
] as const;

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const groupedResults = groups
    .map((group) => ({
      ...group,
      items: results.filter((item) => item.type === group.type),
    }))
    .filter((group) => group.items.length > 0);

  const flatResults = groupedResults.flatMap((group) => group.items);

  const debouncedSearch = useDebouncedCallback((nextQuery: string) => {
    startTransition(async () => {
      const nextResults = await globalSearch(nextQuery);
      setResults(nextResults);
      setActiveIndex(0);
    });
  }, 300);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    };
    const handleOpen = () => {
      setIsOpen(true);
    };

    document.addEventListener("keydown", handleShortcut);
    window.addEventListener("open-global-search", handleOpen);

    return () => {
      document.removeEventListener("keydown", handleShortcut);
      window.removeEventListener("open-global-search", handleOpen);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      return;
    }

    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setResults([]);
      setActiveIndex(0);
      return;
    }

    debouncedSearch(normalizedQuery);
  }, [debouncedSearch, isOpen, query]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePaletteKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((currentIndex) =>
          flatResults.length === 0 ? 0 : (currentIndex + 1) % flatResults.length
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((currentIndex) =>
          flatResults.length === 0
            ? 0
            : (currentIndex - 1 + flatResults.length) % flatResults.length
        );
        return;
      }

      if (event.key === "Enter") {
        const activeItem = flatResults[activeIndex];
        if (!activeItem) {
          return;
        }

        event.preventDefault();
        setIsOpen(false);
        router.push(activeItem.href);
      }
    };

    document.addEventListener("keydown", handlePaletteKeys);
    return () => document.removeEventListener("keydown", handlePaletteKeys);
  }, [activeIndex, flatResults, isOpen, router]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Đóng tìm kiếm nhanh"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="border-b border-border px-4 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm ứng viên, khách hàng, job order, nhà tuyển dụng..."
              className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto bg-background/50 px-2 py-2">
          {isPending ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tìm kiếm...
            </div>
          ) : query.trim().length < 2 ? (
            <div className="px-4 py-10 text-center text-sm text-muted">
              Nhập ít nhất 2 ký tự để bắt đầu tìm kiếm.
            </div>
          ) : groupedResults.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted">
              Không tìm thấy kết quả phù hợp.
            </div>
          ) : (
            groupedResults.map((group) => (
              <div key={group.type} className="py-2">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  <group.icon className="h-4 w-4" />
                  {group.label}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const itemIndex = flatResults.findIndex(
                      (candidate) => candidate.type === item.type && candidate.id === item.id
                    );
                    const isActive = itemIndex === activeIndex;

                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          router.push(item.href);
                        }}
                        onMouseEnter={() => setActiveIndex(itemIndex)}
                        className={`flex w-full flex-col rounded-xl px-3 py-3 text-left transition ${
                          isActive
                            ? "bg-primary text-white"
                            : "text-foreground hover:bg-surface"
                        }`}
                      >
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className={`mt-1 text-xs ${isActive ? "text-white/80" : "text-muted"}`}>
                          {item.subtitle || "Không có mô tả bổ sung"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-3 text-xs text-muted">
          <span>ESC để đóng</span>
          <span>↑↓ di chuyển</span>
          <span>Enter để mở</span>
        </div>
      </div>
    </div>
  );
}
