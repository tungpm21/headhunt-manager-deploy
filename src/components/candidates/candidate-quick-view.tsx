"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Briefcase,
  Languages,
  ArrowRight,
} from "lucide-react";
import type { CandidateWithTags } from "@/types/candidate-ui";

function formatSalary(amount: number | null) {
  if (!amount) {
    return "Chưa cập nhật";
  }

  return `${amount.toLocaleString("vi-VN")} triệu/tháng`;
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

export function CandidateQuickView({ candidate }: { candidate: CandidateWithTags }) {
  const duplicateMatches = candidate.duplicateMatches ?? [];

  return (
    <div className="rounded-xl border border-border bg-background px-4 py-4">
      {duplicateMatches.length > 0 ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Có hồ sơ trùng trong Talent Pool
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {duplicateMatches.map((match) => (
              <Link
                key={match.id}
                href={`/candidates/${match.id}`}
                className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-white px-2 py-1 text-xs font-semibold text-amber-800 transition hover:border-amber-300 hover:bg-amber-100"
              >
                {formatCandidateCode(match.id)} · {match.fullName} · {formatDuplicateReason(match.matchBy)}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Thông tin nhanh
          </h4>
          <div className="space-y-2 text-sm text-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted" />
              <span>{candidate.email || "Chưa có email"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted" />
              <span>{candidate.phone || "Chưa có số điện thoại"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted" />
              <span>{candidate.location || "Chưa cập nhật khu vực"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted" />
              <span>
                {candidate.currentCompany
                  ? `${candidate.currentPosition || "Ứng viên"} tại ${candidate.currentCompany}`
                  : candidate.currentPosition || "Chưa cập nhật vị trí hiện tại"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted" />
              <span>Lương kỳ vọng: {formatSalary(candidate.expectedSalary)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Kỹ năng & ngôn ngữ
          </h4>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.length > 0 ? (
              candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted">Chưa cập nhật kỹ năng</span>
            )}
          </div>
          <div className="space-y-2 pt-2">
            {candidate.languages.length > 0 ? (
              candidate.languages.map((language) => (
                <div
                  key={language.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
                >
                  <Languages className="h-4 w-4 text-muted" />
                  <span>
                    {language.language}
                    {language.level ? ` • ${language.level}` : ""}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">Chưa cập nhật ngoại ngữ</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">CV</h4>
          <div className="space-y-2">
            {candidate.cvFiles.length > 0 ? (
              candidate.cvFiles.map((cv) => (
                <a
                  key={cv.id}
                  href={cv.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground transition hover:bg-background"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted" />
                    <span className="line-clamp-1">{cv.label || cv.fileName}</span>
                  </div>
                  <Download className="h-4 w-4 text-muted" />
                </a>
              ))
            ) : (
              <p className="text-sm text-muted">Chưa có CV đã tải lên</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <Link
          href="/jobs"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:bg-background"
        >
          Gán vào Job
        </Link>
        {candidate.email ? (
          <a
            href={`mailto:${candidate.email}`}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:bg-background"
          >
            Email
          </a>
        ) : null}
        <Link
          href={`/candidates/${candidate.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          Xem chi tiết
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
