"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { searchAvailableCandidatesAction, assignCandidateAction } from "@/lib/job-actions";
import { Plus, Search, Loader2, UserPlus, X } from "lucide-react";

export function AssignCandidateModal({ jobId }: { jobId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, startSearch] = useTransition();
  const [isAssigning, startAssign] = useTransition();
  const [error, setError] = useState("");
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle Search
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      startSearch(async () => {
        const data = await searchAvailableCandidatesAction(jobId, query);
        setResults(data);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, isOpen, jobId]);

  const handleAssign = (candidateId: number) => {
    startAssign(async () => {
      setError("");
      const res = await assignCandidateAction(jobId, candidateId);
      if (res.success) {
        // Refresh local search results by removing assigned
        setResults((prev) => prev.filter((c) => c.id !== candidateId));
      } else {
        setError(res.error || "Có lỗi xảy ra");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover shadow-sm transition"
      >
        <Plus className="h-4 w-4" /> Ứng viên mới
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div ref={modalRef} className="w-full max-w-lg rounded-xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">Gán ứng viên vào Job</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 border-b">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, SĐT..."
                  className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              </div>
              {error && <p className="text-danger text-sm mt-2">{error}</p>}
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {query ? "Không tìm thấy ứng viên phù hợp chưa được gán." : "Nhập từ khóa để tìm ứng viên."}
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{c.fullName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {c.currentPosition ? `${c.currentPosition} tại ${c.currentCompany || '?'}` : (c.industry || 'Chưa cập nhật ngành nghề')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssign(c.id)}
                        disabled={isAssigning}
                        className="inline-flex items-center justify-center rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {isAssigning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><UserPlus className="h-3.5 w-3.5 mr-1 text-primary" /> Gán</>}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
