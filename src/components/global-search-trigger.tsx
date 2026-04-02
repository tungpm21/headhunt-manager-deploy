"use client";

import { Search } from "lucide-react";

export function GlobalSearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-global-search"))}
      className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted transition hover:bg-surface hover:text-foreground sm:inline-flex"
    >
      <Search className="h-4 w-4" />
      <span>Tìm kiếm...</span>
      <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-muted">
        ⌘K
      </kbd>
    </button>
  );
}
