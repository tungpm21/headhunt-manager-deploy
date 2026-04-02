"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search, UserPlus, X } from "lucide-react";
import {
  assignCandidateAction,
  searchAvailableCandidatesAction,
} from "@/lib/job-actions";

type SearchCandidate = {
  id: number;
  fullName: string;
  currentPosition: string | null;
  currentCompany: string | null;
  industry: string | null;
  status: string;
};

export function AssignCandidateModal({ jobId }: { jobId: number }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCandidate[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();
  const [isAssigning, startAssign] = useTransition();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      startSearch(async () => {
        const data = await searchAvailableCandidatesAction(jobId, query);
        setResults(data as SearchCandidate[]);
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [isOpen, jobId, query]);

  const handleAssign = (candidateId: number) => {
    startAssign(async () => {
      setMessage(null);
      const result = await assignCandidateAction(jobId, candidateId);

      if (!result.success) {
        setMessage(result.message ?? "Có lỗi xảy ra.");
        return;
      }

      setResults((currentResults) =>
        currentResults.filter((candidate) => candidate.id !== candidateId)
      );
      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover"
      >
        <Plus className="h-4 w-4" />
        Ứng viên mới
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            ref={modalRef}
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border bg-background px-4 py-4">
              <h3 className="font-semibold text-foreground">Gán ứng viên vào Job</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted transition hover:bg-surface hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-border px-4 py-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-muted" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, SĐT..."
                  className="block w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  autoFocus
                />
              </div>
              {message ? (
                <p className="mt-2 text-sm text-danger">{message}</p>
              ) : null}
            </div>

            <div className="flex-1 overflow-y-auto bg-background/60 p-4">
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted" />
                </div>
              ) : results.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted">
                  {query
                    ? "Không tìm thấy ứng viên phù hợp chưa được gán."
                    : "Nhập từ khóa để tìm ứng viên."}
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 shadow-sm"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="truncate text-sm font-medium text-foreground">
                          {candidate.fullName}
                        </div>
                        <div className="mt-0.5 text-xs text-muted">
                          {candidate.currentPosition
                            ? `${candidate.currentPosition} tại ${candidate.currentCompany || "?"}`
                            : candidate.industry || "Chưa cập nhật ngành nghề"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAssign(candidate.id)}
                        disabled={isAssigning}
                        className="inline-flex items-center justify-center rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface disabled:opacity-50"
                      >
                        {isAssigning ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="mr-1 h-3.5 w-3.5 text-primary" />
                            Gán
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
