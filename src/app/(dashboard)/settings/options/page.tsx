import { Database, Plus, RefreshCw, Save, Search, SlidersHorizontal } from "lucide-react";
import { requireAdmin } from "@/lib/authz";
import {
  createOptionItemFormAction,
  syncDefaultConfigOptionsFormAction,
  updateOptionItemFormAction,
} from "@/lib/config-option-actions";
import {
  getConfigOptionSets,
  getOptionUsageCount,
  normalizeOptionText,
  type ConfigOptionItem,
  type ConfigOptionSet,
} from "@/lib/config-options";

export const metadata = {
  title: "Cấu hình dữ liệu — Headhunt Manager",
};

type PageProps = {
  searchParams: Promise<{ q?: string; group?: string }>;
};

const inputClass =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";

const optionRowGridClass =
  "grid gap-3 border-t border-border px-4 py-3 md:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_minmax(190px,1fr)_minmax(260px,1.25fr)_84px_144px_120px] xl:items-end";

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
  items: { item: ConfigOptionItem; usageCount: number }[];
};

async function withUsageCounts(
  set: ConfigOptionSet,
  query: string
): Promise<OptionSetWithUsage> {
  const visibleItems = set.items.filter((item) => matchesSearch(set, item, query));
  const items = await Promise.all(
    visibleItems.map(async (item) => {
      try {
        return {
          item,
          usageCount: await getOptionUsageCount(set.key, item),
        };
      } catch (error) {
        console.warn(`Cannot calculate usage for ${set.key}:${item.value}`, error);
        return { item, usageCount: 0 };
      }
    })
  );

  return { ...set, items };
}

function StatusPill({ system }: { system: boolean }) {
  if (!system) return null;

  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
      System
    </span>
  );
}

function OptionItemRow({
  set,
  item,
  usageCount,
}: {
  set: Omit<ConfigOptionSet, "items">;
  item: ConfigOptionItem;
  usageCount: number;
}) {
  const updateAction = updateOptionItemFormAction.bind(null, item.id ?? 0);
  const valueLocked = set.valueType === "ENUM" || item.isSystem || !set.allowCustomValues;

  return (
    <form
      action={updateAction}
      className={`${optionRowGridClass} ${!item.isActive ? "bg-surface/45" : "bg-surface"}`}
    >
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold text-muted">Value</label>
        <input
          name="value"
          defaultValue={item.value}
          readOnly={valueLocked}
          className={`${inputClass} ${valueLocked ? "bg-surface text-muted" : ""}`}
        />
      </div>
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold text-muted">Label</label>
        <input name="label" defaultValue={item.label} required className={inputClass} />
      </div>
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold text-muted">Aliases</label>
        <input
          name="aliases"
          defaultValue={item.aliases.join(", ")}
          placeholder="Giá trị cũ, cách nhau bằng dấu phẩy"
          className={inputClass}
        />
        <input name="description" type="hidden" defaultValue={item.description ?? ""} />
      </div>
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold text-muted">Order</label>
        <input name="sortOrder" type="number" defaultValue={item.sortOrder} className={inputClass} />
      </div>
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold text-muted">Hiển thị</label>
        <div className="grid min-h-10 grid-cols-2 gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <label className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium text-foreground">
            <input name="isActive" type="checkbox" defaultChecked={item.isActive} className="h-4 w-4" />
            Active
          </label>
          <label className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium text-foreground">
            <input
              name="showInPublic"
              type="checkbox"
              defaultChecked={item.showInPublic}
              className="h-4 w-4"
            />
            Public
          </label>
        </div>
      </div>
      <div className="flex items-end justify-between gap-3 md:col-span-2 xl:col-span-1 xl:flex-col xl:items-stretch">
        <div className="flex flex-wrap items-center gap-1.5 xl:justify-end">
          <StatusPill system={item.isSystem} />
          <span className="rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-muted ring-1 ring-border">
            {usageCount} dùng
          </span>
        </div>
        <button
          type="submit"
          title="Luu option"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-white transition hover:bg-primary-hover active:translate-y-px"
        >
          <Save className="h-4 w-4" />
          Lưu
        </button>
      </div>
    </form>
  );
}

function AddOptionForm({ set }: { set: Omit<ConfigOptionSet, "items"> }) {
  if (!set.allowCustomValues || set.valueType === "ENUM") return null;

  return (
    <form
      action={createOptionItemFormAction}
      className="grid gap-3 border-t border-dashed border-border bg-surface/45 px-4 py-4 md:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_minmax(190px,1fr)_minmax(260px,1.25fr)_84px_156px] xl:items-end"
    >
      <input name="setKey" type="hidden" value={set.key} />
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold text-muted">Value mới</label>
        <input name="value" required placeholder="canonical-value" className={inputClass} />
      </div>
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold text-muted">Label</label>
        <input name="label" required placeholder="Label hiển thị" className={inputClass} />
      </div>
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold text-muted">Aliases</label>
        <input name="aliases" placeholder="Giá trị cũ, đồng nghĩa..." className={inputClass} />
      </div>
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold text-muted">Order</label>
        <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
      </div>
      <div className="flex flex-col justify-end gap-2 md:col-span-2 xl:col-span-1">
        <div className="grid min-h-10 grid-cols-2 gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <label className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium text-foreground">
            <input name="isActive" type="checkbox" defaultChecked className="h-4 w-4" />
            Active
          </label>
          <label className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium text-foreground">
            <input name="showInPublic" type="checkbox" className="h-4 w-4" />
            Public
          </label>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 text-sm font-semibold text-primary transition hover:bg-primary/15 active:translate-y-px"
        >
          <Plus className="h-4 w-4" />
          Thêm
        </button>
      </div>
    </form>
  );
}

export default async function AdminOptionsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const activeGroup = params.group?.trim();
  const allSets = await getConfigOptionSets();
  const filteredSets = activeGroup
    ? allSets.filter((set) => set.key === activeGroup)
    : allSets;
  const sets = await Promise.all(filteredSets.map((set) => withUsageCounts(set, query)));

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
        <form action={syncDefaultConfigOptionsFormAction}>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-background active:translate-y-px"
          >
            <RefreshCw className="h-4 w-4" />
            Đồng bộ mặc định + DB
          </button>
        </form>
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
            href="/settings/options"
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-border ${
              !activeGroup ? "bg-primary text-white ring-primary" : "bg-background text-muted hover:text-foreground"
            }`}
          >
            Tất cả
          </a>
          {allSets.map((set) => (
            <a
              key={set.key}
              href={`/settings/options?group=${set.key}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
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
              set.items.map(({ item, usageCount }) => (
                <OptionItemRow
                  key={item.id ?? `${set.key}-${item.value}`}
                  set={set}
                  item={item}
                  usageCount={usageCount}
                />
              ))
            ) : (
              <div className="border-t border-border px-5 py-8 text-sm text-muted">
                Không có option khớp bộ lọc.
              </div>
            )}

            <AddOptionForm set={set} />
          </section>
        ))}
      </div>
    </div>
  );
}
