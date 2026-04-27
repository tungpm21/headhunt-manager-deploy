"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import {
    ChevronDown,
    ChevronRight,
    Clock,
    Download,
    FileText,
    Mail,
    MapPin,
    Phone,
    User,
    Briefcase,
    Building2,
    DollarSign,
    ExternalLink,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import { ImportButton } from "./import-button";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    NEW: { label: "Mới", className: "bg-blue-100 text-blue-700" },
    REVIEWED: { label: "Đã xem", className: "bg-amber-100 text-amber-700" },
    SHORTLISTED: { label: "Chọn lọc", className: "bg-purple-100 text-purple-700" },
    REJECTED: { label: "Từ chối", className: "bg-red-100 text-red-700" },
    IMPORTED: { label: "Đã import", className: "bg-emerald-100 text-emerald-700" },
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
}

export function ApplicationTable({ applications }: { applications: ApplicationItem[] }) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggle = (id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="w-8 py-3 px-2" />
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">
                                <User className="h-3.5 w-3.5 inline mr-1" />Ứng viên
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">
                                <Briefcase className="h-3.5 w-3.5 inline mr-1" />Vị trí ứng tuyển
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">
                                <Building2 className="h-3.5 w-3.5 inline mr-1" />Công ty
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Trạng thái</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">
                                <Clock className="h-3.5 w-3.5 inline mr-1" />Ngày nộp
                            </th>
                            <th className="text-right py-3 px-4 text-xs font-medium text-muted uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app) => {
                            const statusCfg = STATUS_CONFIG[app.status] ?? {
                                label: app.status,
                                className: "bg-gray-100 text-gray-600",
                            };
                            const isExpanded = expandedId === app.id;

                            return (
                                <Fragment key={app.id}>
                                    {/* Main row */}
                                    <tr
                                        onClick={() => toggle(app.id)}
                                        className={`border-b border-border/50 cursor-pointer transition-colors ${isExpanded ? "bg-primary/5" : "hover:bg-background/50"
                                            }`}
                                    >
                                        <td className="py-3 px-2 text-muted">
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-foreground">{app.fullName}</p>
                                            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted">
                                                {app.email && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Mail className="h-3 w-3" />{app.email}
                                                    </span>
                                                )}
                                                {app.phone && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Phone className="h-3 w-3" />{app.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-foreground">
                                            <Link
                                                href={`/viec-lam/${app.jobPosting.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                            >
                                                {app.jobPosting.title}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 text-muted">{app.jobPosting.employer.companyName}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}
                                            >
                                                {statusCfg.label}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-xs text-muted">
                                            {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true, locale: vi })}
                                        </td>
                                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            {app.status === "IMPORTED" && app.candidate ? (
                                                <Link
                                                    href={`/candidates/${app.candidate.id}`}
                                                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline font-medium"
                                                >
                                                    UV #{app.candidate.id}
                                                </Link>
                                            ) : app.status !== "REJECTED" ? (
                                                <ImportButton applicationId={app.id} jobOrderId={app.jobPosting.jobOrderId} />
                                            ) : null}
                                        </td>
                                    </tr>

                                    {/* Expanded detail panel */}
                                    {isExpanded && (
                                        <tr className="bg-primary/[0.03]">
                                            <td colSpan={7} className="p-0">
                                                <div className="relative px-6 py-5 animate-in slide-in-from-top-1 duration-200">
                                                    <Link
                                                        href={`/viec-lam/${app.jobPosting.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="absolute top-4 right-6 inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                        Xem trên FDIWork
                                                    </Link>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        {/* Left: Applicant Info */}
                                                        <div className="space-y-4">
                                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                                                                Thông tin ứng viên
                                                            </h4>
                                                            <div className="space-y-2.5">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-primary" />
                                                                    <span className="font-medium text-foreground">{app.fullName}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Mail className="h-4 w-4 text-muted" />
                                                                    <a href={`mailto:${app.email}`} className="text-primary hover:underline text-sm">
                                                                        {app.email}
                                                                    </a>
                                                                </div>
                                                                {app.phone && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Phone className="h-4 w-4 text-muted" />
                                                                        <a href={`tel:${app.phone}`} className="text-foreground text-sm">
                                                                            {app.phone}
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="h-4 w-4 text-muted" />
                                                                    <span className="text-sm text-muted">
                                                                        Nộp lúc {format(new Date(app.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* CV download */}
                                                            {app.cvFileUrl && (
                                                                <a
                                                                    href={app.cvFileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2.5 text-sm font-medium transition mt-2"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                    Tải CV: {app.cvFileName || "Download"}
                                                                </a>
                                                            )}
                                                        </div>

                                                        {/* Middle: Job info */}
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
                                                                {app.jobPosting.location && (
                                                                    <div className="flex items-center gap-2">
                                                                        <MapPin className="h-4 w-4 text-muted" />
                                                                        <span className="text-sm text-muted">{app.jobPosting.location}</span>
                                                                    </div>
                                                                )}
                                                                {app.jobPosting.salaryDisplay && (
                                                                    <div className="flex items-center gap-2">
                                                                        <DollarSign className="h-4 w-4 text-muted" />
                                                                        <span className="text-sm text-muted">{app.jobPosting.salaryDisplay}</span>
                                                                    </div>
                                                                )}
                                                                {app.jobPosting.workType && (
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="h-4 w-4 text-muted" />
                                                                        <span className="text-sm text-muted">{app.jobPosting.workType}</span>
                                                                    </div>
                                                                )}
                                                                {app.jobPosting.industry && (
                                                                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                                        {app.jobPosting.industry}
                                                                    </span>
                                                                )}

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
