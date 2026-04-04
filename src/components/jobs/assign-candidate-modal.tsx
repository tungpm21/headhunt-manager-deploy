"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search, Users, X } from "lucide-react";
import {
  assignMultipleCandidatesAction,
  searchAvailableCandidatesAction,
} from "@/lib/job-actions";

type CandidateSeniority =
  | "INTERN"
  | "JUNIOR"
  | "MID_LEVEL"
  | "SENIOR"
  | "LEAD"
  | "MANAGER"
  | "DIRECTOR";

type SearchCandidate = {
  id: number;
  fullName: string;
  currentPosition: string | null;
  currentCompany: string | null;
  industry: string | null;
  status: string;
  skills: string[];
  level: CandidateSeniority | null;
  expectedSalary: number | null;
};

const seniorityLabels: Record<CandidateSeniority, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  MID_LEVEL: "Mid-level",
  SENIOR: "Senior",
  LEAD: "Lead",
  MANAGER: "Manager",
  DIRECTOR: "Director",
};

function formatSalary(value: number | null) {
  if (value == null) {
    return "Chưa cập nhật lương";
  }

  return `${value.toLocaleString("vi-VN")} triệu/tháng`;
}

export function AssignCandidateModal({
  jobId,
  jobTitle,
  requiredSkills,
}: {
  jobId: number;
  jobTitle: string;
  requiredSkills: string[];
}) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<CandidateSeniority | "">("");
  const [skillsInput, setSkillsInput] = useState(requiredSkills.join(", "));
  const [maxSalary, setMaxSalary] = useState("");
  const [results, setResults] = useState<SearchCandidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();
  const [isAssigning, startAssign] = useTransition();

  const parsedSkills = useMemo(
    () => skillsInput.split(",").map((skill) => skill.trim()).filter(Boolean),
    [skillsInput]
  );

  useEffect(() => {
    setSkillsInput(requiredSkills.join(", "));
  }, [requiredSkills]);

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
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      startSearch(async () => {
        const data = await searchAvailableCandidatesAction(jobId, {
          query,
          level: level || undefined,
          skills: parsedSkills,
          maxSalary: maxSalary ? Number(maxSalary) : null,
        });

        const typedData = data as SearchCandidate[];
        setResults(typedData);
        setSelectedIds((current) =>
          current.filter((candidateId) =>
            typedData.some((candidate) => candidate.id === candidateId)
          )
        );
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [isOpen, jobId, level, maxSalary, parsedSkills, query]);

  const toggleSelected = (candidateId: number) => {
    setSelectedIds((current) =>
      current.includes(candidateId)
        ? current.filter((id) => id !== candidateId)
        : [...current, candidateId]
    );
  };

  const handleAssignSelected = () => {
    startAssign(async () => {
      setMessage(null);
      const result = await assignMultipleCandidatesAction(jobId, selectedIds);

      if (!result.success) {
        setMessage(result.message ?? "Không thể gán ứng viên vào job.");
        return;
      }

      setResults((current) =>
        current.filter((candidate) => !selectedIds.includes(candidate.id))
      );
      setSelectedIds([]);
      setMessage(result.message ?? null);
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
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border bg-background px-5 py-4">
              <div>
                <h3 className="font-semibold text-foreground">Gán ứng viên vào job</h3>
                <p className="mt-1 text-sm text-muted">{jobTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted transition hover:bg-surface hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 border-b border-border px-5 py-4">
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

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value as CandidateSeniority | "")}
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Tất cả cấp bậc</option>
                  {Object.entries(seniorityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={skillsInput}
                  onChange={(event) => setSkillsInput(event.target.value)}
                  placeholder="Node.js, TypeScript..."
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                <input
                  type="number"
                  min="0"
                  value={maxSalary}
                  onChange={(event) => setMaxSalary(event.target.value)}
                  placeholder="Lương tối đa (triệu)"
                  className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {requiredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : null}

              {message ? <p className="text-sm text-danger">{message}</p> : null}
            </div>

            <div className="flex-1 overflow-y-auto bg-background/60 px-5 py-4">
              {isSearching ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted" />
                </div>
              ) : results.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted">
                  Không tìm thấy ứng viên phù hợp chưa được gán.
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((candidate) => {
                    const isSelected = selectedIds.includes(candidate.id);

                    return (
                      <label
                        key={candidate.id}
                        className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-primary/40 bg-primary/5"
                            : "border-border bg-surface hover:border-primary/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelected(candidate.id)}
                          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-foreground">
                                {candidate.fullName}
                              </div>
                              <div className="mt-1 text-sm text-muted">
                                {candidate.currentPosition
                                  ? `${candidate.currentPosition}${
                                      candidate.currentCompany
                                        ? ` tại ${candidate.currentCompany}`
                                        : ""
                                    }`
                                  : candidate.industry || "Chưa cập nhật vị trí hiện tại"}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-medium text-foreground">
                                {formatSalary(candidate.expectedSalary)}
                              </div>
                              <div className="mt-1 text-xs text-muted">
                                {candidate.level ? seniorityLabels[candidate.level] : "Chưa rõ cấp bậc"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {candidate.skills.length > 0 ? (
                              candidate.skills.slice(0, 6).map((skill) => (
                                <span
                                  key={`${candidate.id}-${skill}`}
                                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted">Chưa cập nhật skills</span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border bg-background px-5 py-4">
              <div className="text-sm text-muted">
                {selectedIds.length > 0
                  ? `Đã chọn ${selectedIds.length} ứng viên`
                  : "Chọn một hoặc nhiều ứng viên để gán"}
              </div>

              <button
                type="button"
                onClick={handleAssignSelected}
                disabled={isAssigning || selectedIds.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang gán...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Gán {selectedIds.length} ứng viên đã chọn
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
