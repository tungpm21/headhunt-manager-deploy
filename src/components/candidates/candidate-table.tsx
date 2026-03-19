import Link from "next/link";
import { CandidateWithTags } from "@/types/candidate";
import { StatusBadge } from "@/components/candidates/status-badge";
import { Phone, Mail, Briefcase, MapPin, FileText, ChevronRight } from "lucide-react";
import Image from "next/image";

interface CandidateTableProps {
  candidates: CandidateWithTags[];
}

function formatSalary(amount: number | null) {
  if (!amount) return "—";
  return `${amount.toLocaleString("vi-VN")} tr`;
}

export function CandidateTable({ candidates }: CandidateTableProps) {
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-16 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted/10">
          <FileText className="h-7 w-7 text-muted/50" />
        </div>
        <p className="font-medium text-foreground">Không có ứng viên nào</p>
        <p className="mt-1 text-sm text-muted">Thêm ứng viên mới hoặc thay đổi bộ lọc.</p>
        <Link
          href="/candidates/new"
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition"
        >
          + Thêm ứng viên
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs font-medium text-muted uppercase tracking-wide">
              <th className="px-4 py-3">Ứng viên</th>
              <th className="px-4 py-3">Liên hệ</th>
              <th className="px-4 py-3">Vị trí / Ngành</th>
              <th className="px-4 py-3">Lương kỳ vọng</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidates.map((c) => (
              <tr
                key={c.id}
                className="group hover:bg-surface/60 transition-colors"
              >
                {/* Name + location */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary overflow-hidden border border-border">
                      {c.avatarUrl ? (
                        <Image src={c.avatarUrl} alt={c.fullName} fill className="object-cover" sizes="36px" unoptimized />
                      ) : (
                        c.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/candidates/${c.id}`}
                        className="font-medium text-foreground hover:text-primary transition line-clamp-1"
                      >
                        {c.fullName}
                      </Link>
                      {c.location && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted">
                          <MapPin className="h-3 w-3" />
                          {c.location}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-4 py-3 text-muted">
                  <div className="space-y-1">
                    {c.phone && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-1.5 text-xs truncate max-w-[160px]">
                        <Mail className="h-3 w-3" /> {c.email}
                      </div>
                    )}
                  </div>
                </td>

                {/* Position / Industry */}
                <td className="px-4 py-3">
                  <div className="text-sm">
                    {c.currentPosition && (
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <Briefcase className="h-3.5 w-3.5 text-muted/60" />
                        {c.currentPosition}
                      </div>
                    )}
                    {c.industry && (
                      <div className="text-xs text-muted mt-0.5">{c.industry}</div>
                    )}
                    {c.yearsOfExp !== null && c.yearsOfExp !== undefined && (
                      <div className="text-xs text-muted">{c.yearsOfExp} năm KN</div>
                    )}
                  </div>
                </td>

                {/* Salary */}
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {formatSalary(c.expectedSalary)}
                </td>

                {/* Tags */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.slice(0, 3).map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="inline-block rounded-full px-2 py-0.5 text-xs font-medium border"
                        style={{
                          borderColor: tag.color + "40",
                          color: tag.color,
                          backgroundColor: tag.color + "10",
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                    {c.tags.length > 3 && (
                      <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted border border-border">
                        +{c.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>

                {/* Arrow */}
                <td className="px-4 py-3">
                  <Link href={`/candidates/${c.id}`}>
                    <ChevronRight className="h-4 w-4 text-muted/40 group-hover:text-primary transition" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-border">
        {candidates.map((c) => (
          <Link
            key={c.id}
            href={`/candidates/${c.id}`}
            className="flex items-start gap-3 p-4 hover:bg-surface/60 transition"
          >
            <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary overflow-hidden border border-border">
              {c.avatarUrl ? (
                <Image src={c.avatarUrl} alt={c.fullName} fill className="object-cover" sizes="40px" unoptimized />
              ) : (
                c.fullName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground truncate">{c.fullName}</p>
                <StatusBadge status={c.status} />
              </div>
              {c.currentPosition && (
                <p className="text-sm text-muted mt-0.5 truncate">{c.currentPosition}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {c.tags.slice(0, 2).map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="inline-block rounded-full px-2 py-0.5 text-xs font-medium border"
                    style={{ borderColor: tag.color + "40", color: tag.color, backgroundColor: tag.color + "10" }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted/40 flex-shrink-0 mt-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
