"use client";

import { Fragment, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Trash2,
} from "lucide-react";
import type { CandidateWithTags } from "@/types/candidate-ui";
import type { CandidateStatus } from "@/types/candidate";
import { quickDeleteCandidateAction, updateCandidateStatusAction } from "@/lib/actions";
import { CandidateQuickView } from "@/components/candidates/candidate-quick-view";
import { STATUS_OPTIONS } from "@/components/candidates/status-badge";

interface CandidateTableProps {
  candidates: CandidateWithTags[];
  selectedIds: Set<number>;
  allSelected: boolean;
  onToggle: (candidateId: number) => void;
  onToggleAll: () => void;
}

function formatSalary(amount: number | null) {
  if (!amount) return "—";
  return `${amount.toLocaleString("vi-VN")} tr`;
}

function formatCandidateCode(id: number) {
  return `UV-${String(id).padStart(6, "0")}`;
}

function formatDuplicateReason(matchBy: Array<"email" | "phone">) {
  if (matchBy.includes("email") && matchBy.includes("phone")) {
    return "email + SĐT";
  }
  return matchBy.includes("email") ? "email" : "SĐT";
}

function CandidateStatusInline({ candidate }: { candidate: CandidateWithTags }) {
  const router = useRouter();
  const [status, setStatus] = useState(candidate.status);
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(event) => {
        const nextStatus = event.target.value as CandidateStatus;
        const previousStatus = status;
        setStatus(nextStatus);
        startTransition(async () => {
          const result = await updateCandidateStatusAction(candidate.id, nextStatus);
          if (result?.error) {
            setStatus(previousStatus);
            window.alert(result.error);
            return;
          }
          router.refresh();
        });
      }}
      className="min-h-9 rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
      aria-label={`Đổi trạng thái ứng viên ${candidate.fullName}`}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function CandidateDeleteButton({ candidate }: { candidate: CandidateWithTags }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Đẩy "${candidate.fullName}" vào thùng rác?`)) return;
        startTransition(async () => {
          const result = await quickDeleteCandidateAction(candidate.id);
          if (result?.error) {
            window.alert(result.error);
            return;
          }
          router.refresh();
        });
      }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-60"
      title="Xóa mềm ứng viên"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}

export function CandidateTable({
  candidates,
  selectedIds,
  allSelected,
  onToggle,
  onToggleAll,
}: CandidateTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-16 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted/10">
          <FileText className="h-7 w-7 text-muted/50" />
        </div>
        <p className="font-medium text-foreground">Không có ứng viên nào</p>
        <p className="mt-1 text-sm text-muted">
          Thêm ứng viên mới hoặc thay đổi bộ lọc.
        </p>
        <Link
          href="/candidates/new"
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          + Thêm ứng viên
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs font-medium uppercase tracking-wide text-muted">
              <th className="w-12 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/30"
                  aria-label="Chọn tất cả ứng viên trên trang"
                />
              </th>
              <th className="w-10 px-2 py-3" />
              <th className="px-4 py-3">Ứng viên</th>
              <th className="hidden px-4 py-3 lg:table-cell">Liên hệ</th>
              <th className="px-4 py-3">Vị trí / Ngành</th>
              <th className="px-4 py-3">Lương kỳ vọng</th>
              <th className="hidden px-4 py-3 lg:table-cell">Tags</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="w-16 px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidates.map((candidate) => {
              const isExpanded = expandedId === candidate.id;
              const duplicateMatches = candidate.duplicateMatches ?? [];
              const duplicateCount = duplicateMatches.length;

              return (
                <Fragment key={candidate.id}>
                  <tr
                    className={`group transition-colors ${isExpanded ? "bg-primary/5" : "hover:bg-surface/60"}`}
                  >
                    <td className="px-3 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(candidate.id)}
                        onChange={() => onToggle(candidate.id)}
                        className="mt-1 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/30"
                        aria-label={`Chọn ứng viên ${candidate.fullName}`}
                      />
                    </td>
                    <td className="px-2 py-3 align-top">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId((currentId) =>
                            currentId === candidate.id ? null : candidate.id
                          )
                        }
                        className="rounded-lg border border-border bg-surface p-1.5 text-muted transition hover:bg-background hover:text-foreground"
                        aria-label={`Mở xem nhanh ứng viên ${candidate.fullName}`}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 text-sm font-bold text-primary">
                          {candidate.avatarUrl ? (
                            <Image
                              src={candidate.avatarUrl}
                              alt={candidate.fullName}
                              fill
                              className="object-cover"
                              sizes="36px"
                              unoptimized
                            />
                          ) : (
                            candidate.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/candidates/${candidate.id}`}
                            className="line-clamp-1 font-medium text-foreground transition hover:text-primary"
                          >
                            {candidate.fullName}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-md bg-surface px-1.5 py-0.5 text-[11px] font-semibold text-muted">
                              {formatCandidateCode(candidate.id)}
                            </span>
                            {duplicateCount > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                                <AlertTriangle className="h-3 w-3" />
                                Trùng {duplicateCount}
                              </span>
                            ) : null}
                          </div>
                          {candidate.location ? (
                            <div className="mt-0.5 hidden items-center gap-1 text-xs text-muted lg:flex">
                              <MapPin className="h-3 w-3" />
                              {candidate.location}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted lg:table-cell">
                      <div className="space-y-1">
                        {candidate.phone ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Phone className="h-3 w-3" />
                            {candidate.phone}
                          </div>
                        ) : null}
                        {candidate.email ? (
                          <div className="flex max-w-[160px] items-center gap-1.5 truncate text-xs">
                            <Mail className="h-3 w-3" />
                            {candidate.email}
                          </div>
                        ) : null}
                        {duplicateCount > 0 ? (
                          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
                            <div className="flex items-center gap-1 font-semibold">
                              <AlertTriangle className="h-3 w-3" />
                              Có hồ sơ trùng
                            </div>
                            <div className="mt-1 space-y-0.5">
                              {duplicateMatches.slice(0, 2).map((match) => (
                                <Link
                                  key={match.id}
                                  href={`/candidates/${match.id}`}
                                  className="block truncate hover:underline"
                                >
                                  {formatCandidateCode(match.id)} · {formatDuplicateReason(match.matchBy)}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="text-sm">
                        {candidate.currentPosition ? (
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <Briefcase className="h-3.5 w-3.5 text-muted/60" />
                            {candidate.currentPosition}
                          </div>
                        ) : null}
                        {candidate.level ? (
                          <span className="mt-0.5 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {candidate.level.replace("_", "-")}
                          </span>
                        ) : null}
                        {candidate.industry ? (
                          <div className="mt-0.5 text-xs text-muted">{candidate.industry}</div>
                        ) : null}
                        {candidate.yearsOfExp !== null && candidate.yearsOfExp !== undefined ? (
                          <div className="text-xs text-muted">{candidate.yearsOfExp} năm KN</div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {formatSalary(candidate.expectedSalary)}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {candidate.tags.slice(0, 3).map(({ tag }) => (
                          <span
                            key={tag.id}
                            className="inline-block rounded-full border px-2 py-0.5 text-xs font-medium"
                            style={{
                              borderColor: `${tag.color}40`,
                              color: tag.color,
                              backgroundColor: `${tag.color}10`,
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {candidate.tags.length > 3 ? (
                          <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted">
                            +{candidate.tags.length - 3}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <CandidateStatusInline candidate={candidate} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CandidateDeleteButton candidate={candidate} />
                    </td>
                  </tr>

                  {isExpanded ? (
                    <tr className="bg-primary/[0.03]">
                      <td colSpan={9} className="px-4 py-4">
                        <CandidateQuickView candidate={candidate} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border md:hidden">
        {candidates.map((candidate) => {
          const isExpanded = expandedId === candidate.id;
          const duplicateMatches = candidate.duplicateMatches ?? [];
          const duplicateCount = duplicateMatches.length;

          return (
            <div key={candidate.id}>
              <div className="flex items-start gap-3 p-4 transition hover:bg-surface/60">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(candidate.id)}
                    onChange={() => onToggle(candidate.id)}
                    className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/30"
                    aria-label={`Chọn ứng viên ${candidate.fullName}`}
                  />
                </div>
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId((currentId) =>
                        currentId === candidate.id ? null : candidate.id
                      )
                    }
                    className="mt-1 rounded-lg border border-border bg-surface p-1.5 text-muted transition hover:bg-background hover:text-foreground"
                    aria-label={`Mở xem nhanh ứng viên ${candidate.fullName}`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <Link
                    href={`/candidates/${candidate.id}`}
                    className="flex min-w-0 flex-1 items-start gap-3"
                  >
                    <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 text-sm font-bold text-primary">
                      {candidate.avatarUrl ? (
                        <Image
                          src={candidate.avatarUrl}
                          alt={candidate.fullName}
                          fill
                          className="object-cover"
                          sizes="40px"
                          unoptimized
                        />
                      ) : (
                        candidate.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium text-foreground">{candidate.fullName}</p>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-surface px-1.5 py-0.5 text-[11px] font-semibold text-muted">
                          {formatCandidateCode(candidate.id)}
                        </span>
                        {duplicateCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                            <AlertTriangle className="h-3 w-3" />
                            Trùng {duplicateCount}
                          </span>
                        ) : null}
                      </div>
                      {candidate.currentPosition ? (
                        <p className="mt-0.5 truncate text-sm text-muted">
                          {candidate.currentPosition}
                        </p>
                      ) : null}
                      {candidate.level ? (
                        <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          {candidate.level.replace("_", "-")}
                        </span>
                      ) : null}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {candidate.tags.slice(0, 2).map(({ tag }) => (
                          <span
                            key={tag.id}
                            className="inline-block rounded-full border px-2 py-0.5 text-xs font-medium"
                            style={{
                              borderColor: `${tag.color}40`,
                              color: tag.color,
                              backgroundColor: `${tag.color}10`,
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <CandidateStatusInline candidate={candidate} />
                  <CandidateDeleteButton candidate={candidate} />
                </div>
              </div>

              {isExpanded ? (
                <div className="px-4 pb-4">
                  <CandidateQuickView candidate={candidate} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
