import Link from "next/link";
import {
    Briefcase,
    ChevronRight,
    SendHorizonal,
    Users,
} from "lucide-react";
import { requireViewerScope } from "@/lib/authz";
import { withJobAccess } from "@/lib/access-scope";
import { prisma } from "@/lib/prisma";
import { PIPELINE_STAGES } from "@/lib/job-pipeline";

export const metadata = { title: "Submissions - Headhunt Manager" };

type SubmissionRow = {
    id: number;
    stage: string;
    result: string;
    interviewDate: Date | null;
    notes: string | null;
    updatedAt: Date;
    candidate: {
        id: number;
        fullName: string;
        email: string | null;
        phone: string | null;
        currentPosition: string | null;
    };
    jobOrder: {
        id: number;
        title: string;
        client: {
            companyName: string;
        };
    };
};

const STAGE_BADGE_CLASS: Record<string, string> = {
    SENT_TO_CLIENT: "bg-slate-100 text-slate-700",
    CLIENT_REVIEWING: "bg-sky-100 text-sky-700",
    INTERVIEW: "bg-violet-100 text-violet-700",
    FINAL_INTERVIEW: "bg-indigo-100 text-indigo-700",
    OFFER: "bg-amber-100 text-amber-700",
    HIRED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-700",
};

const RESULT_BADGE_CLASS: Record<string, string> = {
    PENDING: "bg-slate-50 text-slate-600",
    HIRED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-rose-50 text-rose-700",
    WITHDRAWN: "bg-amber-50 text-amber-700",
};

const RESULT_LABEL: Record<string, string> = {
    PENDING: "Đang xử lý",
    HIRED: "Đã tuyển",
    REJECTED: "Từ chối",
    WITHDRAWN: "Rút hồ sơ",
};

export default async function SubmissionsPage({
    searchParams,
}: {
    searchParams: Promise<{ stage?: string; page?: string }>;
}) {
    const scope = await requireViewerScope();
    const params = await searchParams;
    const stageFilter = params.stage ?? "ALL";
    const page = Math.max(1, parseInt(params.page ?? "1", 10));
    const take = 20;
    const skip = (page - 1) * take;

    const where: Record<string, unknown> = {
        jobOrder: withJobAccess({}, scope),
    };

    if (stageFilter !== "ALL") {
        where.stage = stageFilter;
    }

    const [submissions, total, stageCounts] = await Promise.all([
        prisma.jobCandidate.findMany({
            where,
            orderBy: { updatedAt: "desc" },
            skip,
            take,
            include: {
                candidate: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        currentPosition: true,
                    },
                },
                jobOrder: {
                    select: {
                        id: true,
                        title: true,
                        client: { select: { companyName: true } },
                    },
                },
            },
        }),
        prisma.jobCandidate.count({ where }),
        prisma.jobCandidate.groupBy({
            by: ["stage"],
            where: { jobOrder: withJobAccess({}, scope) },
            _count: true,
        }),
    ]);

    const totalPages = Math.ceil(total / take);

    const stageCountMap: Record<string, number> = {};
    let totalAll = 0;
    for (const sc of stageCounts) {
        stageCountMap[sc.stage] = sc._count;
        totalAll += sc._count;
    }

    const stageLabel = (stage: string) =>
        PIPELINE_STAGES.find((s) => s.value === stage)?.label ?? stage;

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                        <SendHorizonal className="h-6 w-6 text-primary" />
                        Submissions
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                        Theo dõi tiến trình gửi hồ sơ ứng viên đến khách hàng
                    </p>
                </div>
                <div className="text-sm text-muted">
                    Tổng cộng <span className="font-semibold text-foreground">{totalAll}</span> submissions
                </div>
            </div>

            {/* Stage filter tabs */}
            <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-2">
                <Link
                    href="/submissions"
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${stageFilter === "ALL"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted hover:bg-background hover:text-foreground"
                        }`}
                >
                    Tất cả ({totalAll})
                </Link>
                {PIPELINE_STAGES.map((stage) => {
                    const count = stageCountMap[stage.value] ?? 0;

                    return (
                        <Link
                            key={stage.value}
                            href={`/submissions?stage=${stage.value}`}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${stageFilter === stage.value
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted hover:bg-background hover:text-foreground"
                                }`}
                        >
                            {stage.label} ({count})
                        </Link>
                    );
                })}
            </div>

            {/* Table */}
            {(submissions as SubmissionRow[]).length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
                    <Users className="mx-auto h-8 w-8 text-muted" />
                    <p className="mt-3 text-sm text-muted">
                        Chưa có submission nào {stageFilter !== "ALL" ? `ở stage "${stageLabel(stageFilter)}"` : ""}.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-background text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                <th className="px-4 py-3">Ứng viên</th>
                                <th className="px-4 py-3">Job Order</th>
                                <th className="px-4 py-3">Stage</th>
                                <th className="px-4 py-3">Kết quả</th>
                                <th className="px-4 py-3">Cập nhật</th>
                                <th className="px-4 py-3 text-right" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {(submissions as SubmissionRow[]).map((sub) => (
                                <tr key={sub.id} className="transition hover:bg-background/50">
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/candidates/${sub.candidate.id}`}
                                            className="font-medium text-foreground hover:text-primary"
                                        >
                                            {sub.candidate.fullName}
                                        </Link>
                                        <p className="mt-0.5 text-xs text-muted">
                                            {sub.candidate.currentPosition ?? sub.candidate.email ?? "—"}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/jobs/${sub.jobOrder.id}`}
                                            className="flex items-center gap-1 text-foreground hover:text-primary"
                                        >
                                            <Briefcase className="h-3.5 w-3.5 text-muted" />
                                            <span className="truncate">{sub.jobOrder.title}</span>
                                        </Link>
                                        <p className="mt-0.5 text-xs text-muted">{sub.jobOrder.client.companyName}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STAGE_BADGE_CLASS[sub.stage] ?? "bg-slate-100 text-slate-700"
                                                }`}
                                        >
                                            {stageLabel(sub.stage)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${RESULT_BADGE_CLASS[sub.result] ?? "bg-slate-50 text-slate-600"
                                                }`}
                                        >
                                            {RESULT_LABEL[sub.result] ?? sub.result}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted">
                                        {new Date(sub.updatedAt).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/jobs/${sub.jobOrder.id}`}
                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                            Xem pipeline
                                            <ChevronRight className="h-3 w-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 ? (
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                    <p className="text-sm text-muted">
                        Hiển thị {skip + 1}–{Math.min(skip + take, total)} / {total}
                    </p>
                    <div className="flex gap-2">
                        {page > 1 ? (
                            <Link
                                href={`/submissions?${stageFilter !== "ALL" ? `stage=${stageFilter}&` : ""}page=${page - 1}`}
                                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-surface"
                            >
                                ← Trước
                            </Link>
                        ) : null}
                        {page < totalPages ? (
                            <Link
                                href={`/submissions?${stageFilter !== "ALL" ? `stage=${stageFilter}&` : ""}page=${page + 1}`}
                                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-surface"
                            >
                                Sau →
                            </Link>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
