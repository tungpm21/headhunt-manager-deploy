"use client";

import { useActionState } from "react";
import { addNoteAction } from "@/lib/actions";
import { CandidateNote, User } from "@prisma/client";
import { Loader2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

type NoteWithUser = CandidateNote & {
  createdBy: Pick<User, "id" | "name">;
};

interface CandidateNotesProps {
  candidateId: number;
  notes: NoteWithUser[];
}

export function CandidateNotes({ candidateId, notes }: CandidateNotesProps) {
  const boundAction = addNoteAction.bind(null, candidateId);
  const [state, formAction, isPending] = useActionState(boundAction, undefined);

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <form action={formAction} className="space-y-2">
        <textarea
          name="content"
          rows={3}
          placeholder="Viết ghi chú về ứng viên này..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
          key={state?.success ? Date.now() : "note"} // reset on success
        />
        {state?.error && (
          <p className="text-sm text-danger">{state.error}</p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</>
            ) : (
              <><Send className="h-4 w-4" /> Thêm ghi chú</>
            )}
          </button>
        </div>
      </form>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <p className="text-sm text-muted">Chưa có ghi chú nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {note.createdBy.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground">{note.createdBy.name}</span>
                </div>
                <span className="text-xs text-muted">
                  {formatDistanceToNow(new Date(note.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
