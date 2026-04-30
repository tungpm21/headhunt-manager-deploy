import { Suspense } from "react";
import { Database, Search, SlidersHorizontal } from "lucide-react";
import { requireAdmin } from "@/lib/authz";
import { Pagination } from "@/components/ui/pagination";
import {
  getConfigOptionSets,
  getOptionUsageReferences,
  getOptionUsageCount,
  normalizeOptionText,
  type ConfigOptionItem,
  type ConfigOptionSet,
  type OptionUsageReference,
} from "@/lib/config-options";
import {
  AddOptionFormClient,
  OptionItemRowForm,
  SyncDefaultOptionsForm,
} from "./option-action-forms";

export const metadata = {
  title: "Cấu hình dữ liệu - Headhunt Manager",
};

type PageProps = {
  searchParams: Promise<{ q?: string; group?: string; page?: string; pageSize?: string }>;
};

const inputClass =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";

const OPTION_PAGE_SIZES = [10, 25, 50, 100] as const;

function normalizeOptionPageSize(value: string | undefined) {
  const pageSize = Number.parseInt(value ?? "25", 10);
  return OPTION_PAGE_SIZES.includes(pageSize as (typeof OPTION_PAGE_SIZES)[number]) ? pageSize : 25;
}

function normalizePage(value: string | undefined, totalPages: number) {
  const page = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, totalPages);
}

function matchesSearch(set: ConfigOptionSet, item: ConfigOptionItem, query: string) {
  if (!query) return true;
  const haystack = [
    set.label,
    item.value,
    item.label,
    item.description ?? "",
    ...item.aliases,
  ].join(" ");
  return normalizeOptionText(haystack).includes(normalizeOptionText(query));
}

type OptionSetWithUsage = Omit<ConfigOptionSet, "items"> & {
  items: { item: ConfigOptionItem; usageCount: number; usageReferences: OptionUsageReference[] }[];
};

async function withUsageCounts(
  set: ConfigOptionSet,
  visibleItems: ConfigOptionItem[]
): Promise<OptionSetWithUsage> {
  const items = await Promise.all(
    visibleItems.map(async (item) => {
      try {
        return {
          item,
          usageCount: await getOptionUsageCount(set.key, item),
          usageReferences: [],
        };
      } catch (error) {
        console.warn(`Cannot calculate usage for ${set.key}:${item.value}`, error);
        return { item, usageCount: 0, usageReferences: [] };
      }
    })
  );

  const itemsWithReferences = await Promise.all(
    items.map(async (entry) => {
      if (entry.usageCount === 0) return entry;
      try {
        return {
          ...entry,
          usageReferences: await getOptionUsageReferences(set.key, entry.item, 4),
        };
      } catch (error) {
        console.warn(`Cannot load usage references for ${set.key}:${entry.item.value}`, error);
        return entry;
      }
    })
  );

  return { ...set, items: itemsWithReferences };
}

export default async function AdminOptionsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const activeGroup = params.group?.trim();
  const pageSize = normalizeOptionPageSize(params.pageSize);
  const allSets = await getConfigOptionSets();
  const filteredSets = activeGroup
    ? allSets.filter((set) => set.key === activeGroup)
    : allSets;
  const matchedSets = filteredSets.map((set) => ({
    ...set,
    items: set.items.filter((item) => matchesSearch(set, item, query)),
  }));
  const totalItems = matchedSets.reduce((sum, set) => sum + set.items.length, 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = normalizePage(params.page, totalPages);
  const pageStart = (page - 1) * pageSize;
  const pageEntries = matchedSets
    .flatMap((set) => set.items.map((item) => ({ setKey: set.key, item })))
    .slice(pageStart, pageStart + pageSize);
  const paginatedSets = matchedSets
    .map((set) => {
      const items = pageEntries
        .filter((entry) => entry.setKey === set.key)
        .map((entry) => entry.item);
      return { ...set, items };
    })
    .filter((set) => set.items.length > 0);
  const sets = await Promise.all(paginatedSets.map((set) => withUsageCounts(set, set.items)));

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            <Database className="h-3.5 w-3.5" />
            Admin CRM
          </div>
          <h1 className="text-2xl font-bold text-foreground">Cấu hình dữ liệu</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            Quản trị option dùng chung cho backend, public frontend, employer portal và Admin CRM.
            Enum/system value bị khóa value; admin chỉ đổi label, thứ tự, visibility và alias.
          </p>
        </div>
        <SyncDefaultOptionsForm />
      </div>

      <div className="sticky top-0 z-10 space-y-3 rounded-xl border border-border bg-surface/95 p-3 shadow-sm backdrop-blur">
        <form className="grid gap-3 lg:grid-cols-[1fr_auto]" action="/settings/options">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Tìm option, alias, value..."
              className={`${inputClass} pl-10`}
            />
          </div>
          {activeGroup ? <input type="hidden" name="group" value={activeGroup} /> : null}
          <input type="hidden" name="pageSize" value={pageSize} />
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover active:translate-y-px"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Lọc
          </button>
        </form>

        <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto pr-1">
          <a
            href={`/settings/options?${new URLSearchParams({
              ...(query ? { q: query } : {}),
              pageSize: String(pageSize),
            }).toString()}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-border ${
              !activeGroup ? "bg-primary text-white ring-primary" : "bg-background text-muted hover:text-foreground"
            }`}
          >
            Tất cả
          </a>
          {allSets.map((set) => (
            <a
              key={set.key}
              href={`/settings/options?group=${set.key}${query ? `&q=${encodeURIComponent(query)}` : ""}&pageSize=${pageSize}`}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-border ${
                activeGroup === set.key
                  ? "bg-primary text-white ring-primary"
                  : "bg-background text-muted hover:text-foreground"
              }`}
            >
              {set.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            Đang hiển thị <span className="font-semibold text-foreground">{sets.length}</span> nhóm,
            <span className="font-semibold text-foreground"> {totalItems}</span> option phù hợp.
          </span>
          <form action="/settings/options" className="flex items-center gap-2">
            {activeGroup ? <input type="hidden" name="group" value={activeGroup} /> : null}
            {query ? <input type="hidden" name="q" value={query} /> : null}
            <label htmlFor="pageSize" className="text-xs font-semibold uppercase text-muted">
              Mỗi trang
            </label>
            <select
              id="pageSize"
              name="pageSize"
              defaultValue={String(pageSize)}
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm font-semibold text-foreground"
            >
              {OPTION_PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition hover:bg-surface"
            >
              Áp dụng
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        {sets.map((set) => (
          <section
            key={set.key}
            id={set.key}
            className="rounded-xl border border-border bg-surface shadow-sm"
          >
            <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{set.label}</h2>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-muted ring-1 ring-border">
                    {set.valueType}
                  </span>
                  {!set.allowCustomValues ? (
                    <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                      Value khóa
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted">{set.description}</p>
              </div>
              <p className="text-sm font-semibold text-muted">{set.items.length} option</p>
            </div>

            {set.items.length > 0 ? (
              set.items.map(({ item, usageCount, usageReferences }) => (
                <OptionItemRowForm
                  key={item.id ?? `${set.key}-${item.value}`}
                  set={set}
                  item={item}
                  usageCount={usageCount}
                  usageReferences={usageReferences}
                />
              ))
            ) : (
              <div className="border-t border-border px-5 py-8 text-sm text-muted">
                Không có option khớp bộ lọc.
              </div>
            )}

            <AddOptionFormClient set={set} />
          </section>
        ))}
      </div>

      <Suspense>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          total={totalItems}
          pageSize={pageSize}
          itemLabel="option"
        />
      </Suspense>
    </div>
  );
}
