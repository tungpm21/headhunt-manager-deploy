"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe2, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { CandidateWithRelations } from "@/types/candidate";
import {
  addLanguageAction,
  deleteLanguageAction,
  updateLanguageAction,
} from "@/lib/candidate-detail-actions";

interface LanguageListProps {
  candidateId: number;
  languages: CandidateWithRelations["languages"];
}

type ActionState = { error?: string; success?: boolean } | undefined;

const LANGUAGE_OPTIONS = [
  "Tiếng Anh",
  "Tiếng Nhật",
  "Tiếng Hàn",
  "Tiếng Trung",
  "Tiếng Đức",
  "Tiếng Pháp",
];

export function LanguageList({ candidateId, languages }: LanguageListProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    addLanguageAction,
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
    languageId: number,
    formData: FormData,
    action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
  ) => {
    setActionError(null);
    setActiveId(languageId);
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
        <h3 className="text-base font-semibold text-foreground">Ngoại ngữ</h3>
        <p className="mt-1 text-sm text-muted">
          Dùng để lọc nhanh ứng viên phù hợp cho các job FDI theo ngôn ngữ và chứng chỉ.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="rounded-xl border border-border bg-background p-4 space-y-4">
        <input type="hidden" name="candidateId" value={candidateId} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Ngôn ngữ</label>
            <select
              name="language"
              defaultValue=""
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Chọn ngôn ngữ...</option>
              {LANGUAGE_OPTIONS.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Trình độ</label>
            <input
              name="level"
              type="text"
              placeholder="VD: N2, IELTS 7.0"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Chứng chỉ</label>
            <input
              name="certificate"
              type="text"
              placeholder="VD: JLPT, TOEIC..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Thêm
            </button>
          </div>
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

      {languages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <Globe2 className="mx-auto h-10 w-10 text-muted/30" />
          <p className="mt-3 text-sm font-medium text-foreground">Chưa có ngôn ngữ nào</p>
          <p className="mt-1 text-sm text-muted">Thêm ngoại ngữ để filter nhanh khi tìm ứng viên cho job FDI.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {languages.map((item) => {
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
                    submitRowAction(item.id, formData, updateLanguageAction);
                  }}
                  className="rounded-xl border border-border bg-background p-4 space-y-3"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <select
                      name="language"
                      defaultValue={item.language}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {LANGUAGE_OPTIONS.map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                    <input
                      name="level"
                      type="text"
                      defaultValue={item.level ?? ""}
                      placeholder="Trình độ"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      name="certificate"
                      type="text"
                      defaultValue={item.certificate ?? ""}
                      placeholder="Chứng chỉ"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
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
              <div key={item.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {item.language}
                      </span>
                      {item.level && (
                        <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-foreground border border-border">
                          {item.level}
                        </span>
                      )}
                    </div>
                    {item.certificate && (
                      <p className="mt-2 text-sm text-muted">Chứng chỉ: {item.certificate}</p>
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
                        submitRowAction(item.id, formData, deleteLanguageAction);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-danger/20 bg-danger/10 px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/15 disabled:opacity-60 transition"
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Xóa
                    </button>
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
