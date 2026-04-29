"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import {
  createOptionItemAction,
  deleteOptionItemAction,
  syncDefaultConfigOptionsAction,
  updateOptionItemAction,
} from "@/lib/config-option-actions";
import type { ConfigOptionItem, ConfigOptionSet } from "@/lib/config-options";

type ActionState = { error?: string; success?: boolean } | undefined;

const inputClass =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";

const optionRowGridClass =
  "grid gap-3 border-t border-border px-4 py-3 md:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_minmax(190px,1fr)_minmax(260px,1.25fr)_84px_144px_184px] xl:items-end";

function ActionFeedback({ state }: { state: ActionState }) {
  if (!state?.success && !state?.error) return null;

  return (
    <p
      className={`flex items-center gap-1.5 text-xs font-semibold ${
        state.success ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {state.success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
      {state.success ? "Đã lưu thay đổi." : state.error}
    </p>
  );
}

function StatusPill({ system }: { system: boolean }) {
  if (!system) return null;

  return (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
      System
    </span>
  );
}

export function SyncDefaultOptionsForm() {
  const [state, formAction, pending] = useActionState(syncDefaultConfigOptionsAction, undefined);

  return (
    <form action={formAction} className="flex flex-col items-start gap-2 lg:items-end">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-background active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
        {pending ? "Đang đồng bộ..." : "Đồng bộ mặc định + DB"}
      </button>
      <ActionFeedback state={state} />
    </form>
  );
}

export function OptionItemRowForm({
  set,
  item,
  usageCount,
}: {
  set: Omit<ConfigOptionSet, "items">;
  item: ConfigOptionItem;
  usageCount: number;
}) {
  const router = useRouter();
  const updateAction = updateOptionItemAction.bind(null, item.id ?? 0);
  const [state, formAction, pending] = useActionState(updateAction, undefined);
  const [deleteState, setDeleteState] = useState<ActionState>(undefined);
  const [isDeleting, startDeleteTransition] = useTransition();
  const valueLocked = set.valueType === "ENUM" || item.isSystem || !set.allowCustomValues;
  const canDelete =
    Boolean(item.id) &&
    !item.isSystem &&
    set.valueType === "STRING" &&
    set.allowCustomValues &&
    usageCount === 0;

  function handleDelete() {
    if (!item.id) return;

    if (!canDelete) {
      setDeleteState({
        error: usageCount > 0 ? "Option đang được dùng. Hãy tắt Active nếu cần ẩn." : "Option này không thể xóa.",
      });
      return;
    }

    if (!window.confirm(`Xóa option "${item.label}"? Thao tác này không thể hoàn tác.`)) return;

    startDeleteTransition(() => {
      void deleteOptionItemAction(item.id!).then((nextState) => {
        setDeleteState(nextState);
        if (nextState?.success) router.refresh();
      });
    });
  }

  return (
    <form
      action={formAction}
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
        <div className="space-y-2">
          <button
            type="submit"
            disabled={pending}
            title="Lưu option"
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-white transition hover:bg-primary-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {pending ? "Đang lưu..." : "Lưu"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            title={canDelete ? "Xóa option" : "Chỉ xóa được option custom chưa có usage"}
            className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 ${
              canDelete
                ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                : "border-border bg-background text-muted"
            }`}
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </button>
          <ActionFeedback state={state} />
          <ActionFeedback state={deleteState} />
        </div>
      </div>
    </form>
  );
}

export function AddOptionFormClient({ set }: { set: Omit<ConfigOptionSet, "items"> }) {
  const [state, formAction, pending] = useActionState(createOptionItemAction, undefined);

  if (!set.allowCustomValues || set.valueType === "ENUM") return null;

  return (
    <form
      action={formAction}
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
          disabled={pending}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 text-sm font-semibold text-primary transition hover:bg-primary/15 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {pending ? "Đang thêm..." : "Thêm"}
        </button>
        <ActionFeedback state={state} />
      </div>
    </form>
  );
}
