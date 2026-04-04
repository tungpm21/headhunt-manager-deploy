"use client";

import { useActionState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Loader2, Send } from "lucide-react";
import { addNoteAction } from "@/lib/actions";

type NoteWithUser = {
  id: number;
  content: string;
  createdAt: Date;
  createdBy: {
    id: number;
    name: string;
  };
};

interface CandidateNotesProps {
  candidateId: number;
  notes: NoteWithUser[];
}

export function CandidateNotes({ candidateId, notes }: CandidateNotesProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const boundAction = addNoteAction.bind(null, candidateId);
  const [state, formAction, isPending] = useActionState(boundAction, undefined);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  return (
    <div className="space-y-4">
      <form ref={formRef} action={formAction} className="space-y-2">
        <textarea
          name="content"
          rows={3}
          placeholder="Viết ghi chú về ứng viên này..."
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Dang luu...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Thêm ghi chú
              </>
            )}
          </button>
        </div>
      </form>

      {notes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <p className="text-sm text-muted">Chua co ghi chu nao.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {note.createdBy.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {note.createdBy.name}
                  </span>
                </div>
                <span className="text-xs text-muted">
                  {formatDistanceToNow(new Date(note.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
