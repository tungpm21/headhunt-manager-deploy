"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { CandidateWithRelations } from "@/types/candidate";
import {
  addExperienceAction,
  deleteExperienceAction,
  updateExperienceAction,
} from "@/lib/candidate-detail-actions";

interface WorkHistoryProps {
  candidateId: number;
  workHistory: CandidateWithRelations["workHistory"];
}

type ActionState = { error?: string; success?: boolean } | undefined;

function formatMonth(date?: Date | string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("vi-VN", {
    month: "2-digit",
    year: "numeric",
  });
}

export function WorkHistory({ candidateId, workHistory }: WorkHistoryProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    addExperienceAction,
    undefined
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isMutating, startTransition] = useTransition();

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state?.success]);

  const submitRowAction = (
    experienceId: number,
    formData: FormData,
    action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
  ) => {
    setActionError(null);
    setActiveId(experienceId);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setActionError(result.error);
      } else {
        setEditingId(null);
        router.refresh();
      }
      setActiveId(null);
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground">Kinh nghiệm làm việc</h3>
        <p className="mt-1 text-sm text-muted">
          Lưu career path để review nhanh mà không cần mở CV thủ công.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="rounded-xl border border-border bg-background p-4 space-y-4">
        <input type="hidden" name="candidateId" value={candidateId} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Công ty</label>
            <input
              name="companyName"
              type="text"
              placeholder="Tên công ty"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Vị trí</label>
            <input
              name="position"
              type="text"
              placeholder="Chức danh / vị trí"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Bắt đầu</label>
            <input
              name="startDate"
              type="date"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Kết thúc</label>
            <input
              name="endDate"
              type="date"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input name="isCurrent" type="checkbox" className="h-4 w-4 rounded border-border" />
          Đang làm tại công ty này
        </label>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Ghi chú</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Mô tả ngắn trách nhiệm, thành tích hoặc context..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Thêm kinh nghiệm
          </button>
        </div>

        {state?.error && (
          <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}
      </form>

      {actionError && (
        <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
          {actionError}
        </p>
      )}

      {workHistory.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <Briefcase className="mx-auto h-10 w-10 text-muted/30" />
          <p className="mt-3 text-sm font-medium text-foreground">Chưa có kinh nghiệm làm việc</p>
          <p className="mt-1 text-sm text-muted">Thêm work history để xem nhanh career path của ứng viên.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workHistory.map((item) => {
            const busy = isMutating && activeId === item.id;

            if (editingId === item.id) {
              return (
                <form
                  key={item.id}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    formData.set("id", String(item.id));
                    formData.set("candidateId", String(candidateId));
                    submitRowAction(item.id, formData, updateExperienceAction);
                  }}
                  className="rounded-xl border border-border bg-background p-4 space-y-3"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      name="companyName"
                      type="text"
                      defaultValue={item.companyName}
                      placeholder="Tên công ty"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      name="position"
                      type="text"
                      defaultValue={item.position}
                      placeholder="Vị trí"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      name="startDate"
                      type="date"
                      defaultValue={item.startDate ? new Date(item.startDate).toISOString().split("T")[0] : ""}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      name="endDate"
                      type="date"
                      defaultValue={item.endDate ? new Date(item.endDate).toISOString().split("T")[0] : ""}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      name="isCurrent"
                      type="checkbox"
                      defaultChecked={item.isCurrent}
                      className="h-4 w-4 rounded border-border"
                    />
                    Đang làm tại công ty này
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={item.notes ?? ""}
                    placeholder="Ghi chú"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface transition"
                    >
                      <X className="h-4 w-4" />
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition"
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Lưu
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div key={item.id} className="relative rounded-xl border border-border bg-background p-4">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-border" aria-hidden />
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-primary shadow-sm" aria-hidden />

                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground">{item.position}</h4>
                        {item.isCurrent && (
                          <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                            Đang làm
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted">{item.companyName}</p>
                      <p className="mt-1 text-xs text-muted">
                        {formatMonth(item.startDate) ?? "Chưa rõ"} - {item.isCurrent ? "Hiện tại" : formatMonth(item.endDate) ?? "Chưa rõ"}
                      </p>
                      {item.notes && (
                        <p className="mt-3 text-sm text-foreground whitespace-pre-wrap">{item.notes}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface transition"
                      >
                        <Pencil className="h-4 w-4" />
                        Sửa
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          const formData = new FormData();
                          formData.set("id", String(item.id));
                          formData.set("candidateId", String(candidateId));
                          submitRowAction(item.id, formData, deleteExperienceAction);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-danger/20 bg-danger/10 px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/15 disabled:opacity-60 transition"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
