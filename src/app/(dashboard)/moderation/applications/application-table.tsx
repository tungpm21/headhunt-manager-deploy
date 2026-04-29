"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ImportButton } from "./import-button";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  NEW: { label: "Mới", className: "bg-blue-100 text-blue-700" },
  REVIEWED: { label: "Đã xem", className: "bg-amber-100 text-amber-700" },
  SHORTLISTED: { label: "Chọn lọc", className: "bg-purple-100 text-purple-700" },
  REJECTED: { label: "Từ chối", className: "bg-red-100 text-red-700" },
  IMPORTED: { label: "Đã import", className: "bg-emerald-100 text-emerald-700" },
};

type DuplicateMatch = {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  matchBy: Array<"email" | "phone">;
};

interface ApplicationItem {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  cvFileUrl: string | null;
  cvFileName: string | null;
  status: string;
  createdAt: string | Date;
  jobPosting: {
    title: string;
    slug: string;
    industry: string | null;
    location: string | null;
    salaryDisplay: string | null;
    workType: string | null;
    jobOrderId: number | null;
    employer: { companyName: string };
  };
  candidate: { id: number; fullName: string } | null;
  duplicateMatches?: DuplicateMatch[];
}

function formatApplicationCode(id: number) {
  return `APP-${String(id).padStart(6, "0")}`;
}

function formatCandidateCode(id: number) {
  return `UV-${String(id).padStart(6, "0")}`;
}

function formatDuplicateReason(matchBy: DuplicateMatch["matchBy"]) {
  if (matchBy.includes("email") && matchBy.includes("phone")) {
    return "email + SĐT";
  }
  return matchBy.includes("email") ? "email" : "SĐT";
}

export function ApplicationTable({ applications }: { applications: ApplicationItem[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="w-8 px-2 py-3" />
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                <User className="mr-1 inline h-3.5 w-3.5" />Ứng viên
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                <Briefcase className="mr-1 inline h-3.5 w-3.5" />Vị trí ứng tuyển
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                <Building2 className="mr-1 inline h-3.5 w-3.5" />Công ty
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">
                <Clock className="mr-1 inline h-3.5 w-3.5" />Ngày nộp
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const statusCfg = STATUS_CONFIG[app.status] ?? {
                label: app.status,
                className: "bg-gray-100 text-gray-600",
              };
              const isExpanded = expandedId === app.id;
              const duplicateMatches = app.duplicateMatches ?? [];
              const duplicateCount = duplicateMatches.length;

              return (
                <Fragment key={app.id}>
                  <tr
                    onClick={() => toggle(app.id)}
                    className={`cursor-pointer border-b border-border/50 transition-colors ${
                      isExpanded ? "bg-primary/5" : "hover:bg-background/50"
                    }`}
                  >
                    <td className="px-2 py-3 text-muted">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{app.fullName}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-background px-1.5 py-0.5 text-[11px] font-semibold text-muted">
                          {formatApplicationCode(app.id)}
                        </span>
                        {duplicateCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                            <AlertTriangle className="h-3 w-3" />
                            Trùng Talent Pool
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                        {app.email ? (
                          <span className="flex items-center gap-0.5">
                            <Mail className="h-3 w-3" />
                            {app.email}
                          </span>
                        ) : null}
                        {app.phone ? (
                          <span className="flex items-center gap-0.5">
                            <Phone className="h-3 w-3" />
                            {app.phone}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      <Link
                        href={`/viec-lam/${app.jobPosting.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        {app.jobPosting.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{app.jobPosting.employer.companyName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.className}`}
                      >
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true, locale: vi })}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                      {app.status === "IMPORTED" && app.candidate ? (
                        <Link
                          href={`/candidates/${app.candidate.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
                        >
                          {formatCandidateCode(app.candidate.id)}
                        </Link>
                      ) : duplicateCount > 0 ? (
                        <div className="flex flex-col items-end gap-1">
                          <Link
                            href={`/candidates/${duplicateMatches[0].id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {formatCandidateCode(duplicateMatches[0].id)}
                          </Link>
                          {app.status !== "REJECTED" ? (
                            <ImportButton applicationId={app.id} jobOrderId={app.jobPosting.jobOrderId} />
                          ) : null}
                        </div>
                      ) : app.status !== "REJECTED" ? (
                        <ImportButton applicationId={app.id} jobOrderId={app.jobPosting.jobOrderId} />
                      ) : null}
                    </td>
                  </tr>

                  {isExpanded ? (
                    <tr className="bg-primary/[0.03]">
                      <td colSpan={7} className="p-0">
                        <div className="relative px-6 py-5 animate-in slide-in-from-top-1 duration-200">
                          <Link
                            href={`/viec-lam/${app.jobPosting.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="absolute right-6 top-4 inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Xem trên FDIWork
                          </Link>

                          {duplicateCount > 0 ? (
                            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
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

                          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                                Thông tin ứng viên
                              </h4>
                              <div className="space-y-2.5">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-foreground">{app.fullName}</span>
                                  <span className="rounded-md bg-background px-1.5 py-0.5 text-[11px] font-semibold text-muted">
                                    {formatApplicationCode(app.id)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted" />
                                  <a href={`mailto:${app.email}`} className="text-sm text-primary hover:underline">
                                    {app.email}
                                  </a>
                                </div>
                                {app.phone ? (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted" />
                                    <a href={`tel:${app.phone}`} className="text-sm text-foreground">
                                      {app.phone}
                                    </a>
                                  </div>
                                ) : null}
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted" />
                                  <span className="text-sm text-muted">
                                    Nộp lúc {format(new Date(app.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                                  </span>
                                </div>
                              </div>

                              {app.cvFileUrl ? (
                                <a
                                  href={app.cvFileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/20"
                                >
                                  <Download className="h-4 w-4" />
                                  Tải CV: {app.cvFileName || "Download"}
                                </a>
                              ) : null}
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                                Vị trí ứng tuyển
                              </h4>
                              <div className="space-y-2.5">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-foreground">{app.jobPosting.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted" />
                                  <span className="text-sm text-foreground">{app.jobPosting.employer.companyName}</span>
                                </div>
                                {app.jobPosting.location ? (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted" />
                                    <span className="text-sm text-muted">{app.jobPosting.location}</span>
                                  </div>
                                ) : null}
                                {app.jobPosting.salaryDisplay ? (
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted" />
                                    <span className="text-sm text-muted">{app.jobPosting.salaryDisplay}</span>
                                  </div>
                                ) : null}
                                {app.jobPosting.workType ? (
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted" />
                                    <span className="text-sm text-muted">{app.jobPosting.workType}</span>
                                  </div>
                                ) : null}
                                {app.jobPosting.industry ? (
                                  <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                    {app.jobPosting.industry}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
