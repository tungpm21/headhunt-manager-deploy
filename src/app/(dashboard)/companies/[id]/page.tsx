import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Building,
    Building2,
    Globe,
    Users,
    Briefcase,
    FileText,
    Mail,
    Shield,
    CreditCard,
    Activity,
    UserCog,
    LinkIcon,
    MessageSquare,
    Clock,
    CheckCircle2,
} from "lucide-react";
import { requireAdmin } from "@/lib/authz";
import {
    getCompanyWorkspaceById,
    withWorkspaceSubmissionAccess,
} from "@/lib/workspace";
import { prisma } from "@/lib/prisma";

export const metadata = {
    title: "Chi tiết Công ty — Headhunt Manager",
};

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string }>;
}

const statusMeta: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Hoạt động", className: "bg-emerald-100 text-emerald-700" },
    PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
    SUSPENDED: { label: "Bị khóa", className: "bg-red-100 text-red-700" },
};

const employerStatusMeta: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Hoạt động", className: "text-emerald-600" },
    PENDING: { label: "Chờ duyệt", className: "text-amber-600" },
    SUSPENDED: { label: "Bị khóa", className: "text-red-600" },
};

const submissionStageLabel: Record<string, string> = {
    SENT_TO_CLIENT: "Đã gửi Client",
    CLIENT_REVIEWING: "Client đang xem",
    INTERVIEW: "Phỏng vấn",
    FINAL_INTERVIEW: "Phỏng vấn cuối",
    OFFER: "Offer",
    HIRED: "Đã tuyển",
    REJECTED: "Từ chối",
};

const submissionResultMeta: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Đang xử lý", className: "bg-slate-100 text-slate-700" },
    HIRED: { label: "Đã tuyển", className: "bg-emerald-100 text-emerald-700" },
    REJECTED: { label: "Từ chối", className: "bg-red-100 text-red-700" },
    WITHDRAWN: { label: "Rút hồ sơ", className: "bg-amber-100 text-amber-700" },
};

const feedbackDecisionMeta: Record<string, { label: string; className: string }> = {
    INTERESTED: { label: "Quan tâm", className: "bg-emerald-100 text-emerald-700" },
    NEED_MORE_INFO: { label: "Cần thêm thông tin", className: "bg-amber-100 text-amber-700" },
    INTERVIEW: { label: "Muốn phỏng vấn", className: "bg-blue-100 text-blue-700" },
    REJECTED: { label: "Từ chối", className: "bg-red-100 text-red-700" },
};

const formatDateTime = (value: Date) =>
    new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(value);

export default async function CompanyDetailPage({ params, searchParams }: PageProps) {
    await requireAdmin();
    const { id } = await params;
    const sp = await searchParams;
    const workspaceId = Number(id);
    if (isNaN(workspaceId)) notFound();

    const workspace = await getCompanyWorkspaceById(workspaceId);
    if (!workspace) notFound();

    const activeTab = sp.tab ?? "overview";

    // Gather stats for overview
    const [jobPostingCount, applicationCount, jobOrderCount, submissionCount, portalUserCount] =
        await Promise.all([
            workspace.employer
                ? prisma.jobPosting.count({ where: { employerId: workspace.employer.id } })
                : 0,
            workspace.employer
                ? prisma.application.count({
                    where: { jobPosting: { employerId: workspace.employer.id } },
                })
                : 0,
            workspace.client
                ? prisma.jobOrder.count({ where: { clientId: workspace.client.id } })
                : 0,
            workspace.client
                ? prisma.jobCandidate.count({
                    where: { jobOrder: { clientId: workspace.client.id } },
                })
                : 0,
            prisma.companyPortalUser.count({ where: { workspaceId } }),
        ]);

    const tabs = [
        { key: "overview", label: "Tổng quan", icon: Building },
        { key: "mapping", label: "Liên kết", icon: LinkIcon },
        ...(workspace.employer
            ? [
                { key: "jobs", label: `Tin tuyển dụng (${jobPostingCount})`, icon: FileText },
                { key: "applications", label: `Ứng tuyển (${applicationCount})`, icon: Mail },
            ]
            : []),
        ...(workspace.client
            ? [
                { key: "orders", label: `Job Orders (${jobOrderCount})`, icon: Briefcase },
                { key: "submissions", label: `Submissions (${submissionCount})`, icon: Users },
            ]
            : []),
        { key: "portal-users", label: `Portal Users (${portalUserCount})`, icon: UserCog },
        { key: "billing", label: "Thanh toán", icon: CreditCard },
        { key: "activity", label: "Lịch sử", icon: Activity },
    ];

    const wsStatus = statusMeta[workspace.status] ?? statusMeta.ACTIVE;

    return (
        <div className="space-y-6">
            {/* Back link + Header */}
            <div className="flex items-center gap-3">
                <Link
                    href="/companies"
                    className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Danh sách
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground">{workspace.displayName}</h1>
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${wsStatus.className}`}
                        >
                            {wsStatus.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted">
                        <span>/{workspace.slug}</span>
                        {workspace.portalEnabled && (
                            <span className="inline-flex items-center gap-1 text-emerald-600">
                                <Globe className="h-3.5 w-3.5" />
                                Portal bật
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Facet badges */}
            <div className="flex flex-wrap gap-2">
                {workspace.employer && (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span>FDI Employer: {workspace.employer.companyName}</span>
                        <span className={employerStatusMeta[workspace.employer.status]?.className ?? ""}>
                            ({employerStatusMeta[workspace.employer.status]?.label ?? workspace.employer.status})
                        </span>
                    </div>
                )}
                {workspace.client && (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                        <Shield className="h-4 w-4 text-purple-500" />
                        <span>CRM Client: {workspace.client.companyName}</span>
                        <span className={`text-sm ${workspace.client.isDeleted ? "text-red-500" : "text-emerald-600"}`}>
                            ({workspace.client.isDeleted ? "Đã xóa" : workspace.client.status})
                        </span>
                    </div>
                )}
                {!workspace.employer && !workspace.client && (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        <LinkIcon className="h-4 w-4" />
                        Chưa liên kết Employer hoặc Client nào
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-border overflow-x-auto">
                <nav className="flex gap-0 -mb-px" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <Link
                                key={tab.key}
                                href={`/companies/${workspace.id}?tab=${tab.key}`}
                                className={`group inline-flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted hover:text-foreground hover:border-border"
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
                {activeTab === "overview" && (
                    <OverviewTab
                        workspace={workspace}
                        stats={{ jobPostingCount, applicationCount, jobOrderCount, submissionCount, portalUserCount }}
                    />
                )}
                {activeTab === "mapping" && (
                    <MappingTab workspace={workspace} />
                )}
                {activeTab === "submissions" && workspace.client && (
                    <SubmissionsTab workspaceId={workspace.id} />
                )}
                {activeTab !== "overview" && activeTab !== "mapping" && activeTab !== "submissions" && (
                    <div className="text-center py-12 text-muted">
                        <p className="text-lg font-medium mb-1">Tab &quot;{activeTab}&quot;</p>
                        <p className="text-sm">Sẽ được xây dựng trong các phase tiếp theo.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==================== TAB COMPONENTS ====================

function OverviewTab({
    workspace,
    stats,
}: {
    workspace: NonNullable<Awaited<ReturnType<typeof getCompanyWorkspaceById>>>;
    stats: {
        jobPostingCount: number;
        applicationCount: number;
        jobOrderCount: number;
        submissionCount: number;
        portalUserCount: number;
    };
}) {
    const statCards = [
        { label: "Tin tuyển dụng", value: stats.jobPostingCount, show: !!workspace.employer },
        { label: "Ứng tuyển", value: stats.applicationCount, show: !!workspace.employer },
        { label: "Job Orders", value: stats.jobOrderCount, show: !!workspace.client },
        { label: "Submissions", value: stats.submissionCount, show: !!workspace.client },
        { label: "Portal Users", value: stats.portalUserCount, show: true },
    ].filter((s) => s.show);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map((card) => (
                <div
                    key={card.label}
                    className="rounded-xl border border-border bg-surface p-4 shadow-sm"
                >
                    <p className="text-sm text-muted">{card.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                </div>
            ))}
        </div>
    );
}

function MappingTab({
    workspace,
}: {
    workspace: NonNullable<Awaited<ReturnType<typeof getCompanyWorkspaceById>>>;
}) {
    return (
        <div className="space-y-6">
            {/* Employer mapping card */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    FDI Employer
                </h3>
                {workspace.employer ? (
                    <div className="space-y-2">
                        <p className="text-sm">
                            <strong>{workspace.employer.companyName}</strong> (ID: {workspace.employer.id})
                        </p>
                        <p className="text-sm text-muted">Email: {workspace.employer.email}</p>
                        <p className="text-sm text-muted">Slug: /{workspace.employer.slug}</p>
                        <Link
                            href={`/employers/${workspace.employer.id}`}
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                        >
                            Xem chi tiết Employer →
                        </Link>
                    </div>
                ) : (
                    <p className="text-sm text-muted">
                        Chưa liên kết Employer. Vào tab Admin để liên kết hoặc tạo tài khoản Employer.
                    </p>
                )}
            </div>

            {/* Client mapping card */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-500" />
                    CRM Client
                </h3>
                {workspace.client ? (
                    <div className="space-y-2">
                        <p className="text-sm">
                            <strong>{workspace.client.companyName}</strong> (ID: {workspace.client.id})
                        </p>
                        <Link
                            href={`/clients/${workspace.client.id}`}
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                        >
                            Xem chi tiết Client →
                        </Link>
                    </div>
                ) : (
                    <p className="text-sm text-muted">
                        Chưa liên kết Client. Vào tab Admin để liên kết hoặc tạo Client.
                    </p>
                )}
            </div>

            {/* Portal status card */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-emerald-500" />
                    Company Portal
                </h3>
                <p className="text-sm">
                    Trạng thái:{" "}
                    <strong className={workspace.portalEnabled ? "text-emerald-600" : "text-muted"}>
                        {workspace.portalEnabled ? "Đang bật" : "Đang tắt"}
                    </strong>
                </p>
                <p className="text-xs text-muted mt-1">
                    Chức năng bật/tắt portal sẽ được bổ sung với Account Mapping wizard đầy đủ.
                </p>
            </div>
        </div>
    );
}

async function SubmissionsTab({ workspaceId }: { workspaceId: number }) {
    const accessWhere = withWorkspaceSubmissionAccess(workspaceId);

    const [submissions, total, withFeedback, latestFeedback] = await Promise.all([
        prisma.jobCandidate.findMany({
            where: accessWhere,
            orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
            take: 50,
            select: {
                id: true,
                stage: true,
                result: true,
                interviewDate: true,
                updatedAt: true,
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
                        status: true,
                    },
                },
                feedback: {
                    where: { workspaceId },
                    orderBy: { createdAt: "desc" },
                    take: 3,
                    select: {
                        id: true,
                        decision: true,
                        message: true,
                        createdAt: true,
                        authorPortalUser: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.jobCandidate.count({ where: accessWhere }),
        prisma.jobCandidate.count({
            where: {
                ...accessWhere,
                feedback: { some: { workspaceId } },
            },
        }),
        prisma.submissionFeedback.findMany({
            where: { workspaceId },
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
                id: true,
                decision: true,
                message: true,
                createdAt: true,
                authorPortalUser: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                jobCandidate: {
                    select: {
                        id: true,
                        candidate: {
                            select: {
                                id: true,
                                fullName: true,
                            },
                        },
                        jobOrder: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        }),
    ]);

    const withoutFeedback = Math.max(0, total - withFeedback);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <Users className="h-4 w-4" />
                        Tổng submissions
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{total}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <MessageSquare className="h-4 w-4" />
                        Đã có feedback
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{withFeedback}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <Clock className="h-4 w-4" />
                        Chờ phản hồi
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">{withoutFeedback}</p>
                </div>
            </div>

            {latestFeedback.length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Feedback mới nhất từ portal
                    </h3>
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        {latestFeedback.map((feedback) => {
                            const decision = feedback.decision
                                ? feedbackDecisionMeta[feedback.decision]
                                : null;

                            return (
                                <div
                                    key={feedback.id}
                                    className="rounded-lg border border-border bg-background p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <Link
                                                href={`/candidates/${feedback.jobCandidate.candidate.id}`}
                                                className="font-medium text-foreground hover:text-primary"
                                            >
                                                {feedback.jobCandidate.candidate.fullName}
                                            </Link>
                                            <p className="mt-0.5 text-xs text-muted">
                                                {feedback.jobCandidate.jobOrder.title}
                                            </p>
                                        </div>
                                        {decision && (
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${decision.className}`}
                                            >
                                                {decision.label}
                                            </span>
                                        )}
                                    </div>
                                    {feedback.message && (
                                        <p className="mt-3 text-sm text-foreground">
                                            {feedback.message}
                                        </p>
                                    )}
                                    <p className="mt-3 text-xs text-muted">
                                        {feedback.authorPortalUser?.name ||
                                            feedback.authorPortalUser?.email ||
                                            "Portal user"}{" "}
                                        · {formatDateTime(feedback.createdAt)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30 text-left">
                            <th className="px-4 py-3 font-medium text-muted">Ứng viên</th>
                            <th className="px-4 py-3 font-medium text-muted">Job Order</th>
                            <th className="px-4 py-3 font-medium text-muted">Stage</th>
                            <th className="px-4 py-3 font-medium text-muted">Kết quả</th>
                            <th className="px-4 py-3 font-medium text-muted">Feedback portal</th>
                            <th className="px-4 py-3 text-right font-medium text-muted">Cập nhật</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {submissions.map((submission) => {
                            const latest = submission.feedback[0];
                            const result =
                                submissionResultMeta[submission.result] ??
                                submissionResultMeta.PENDING;
                            const decision = latest?.decision
                                ? feedbackDecisionMeta[latest.decision]
                                : null;

                            return (
                                <tr key={submission.id} className="transition-colors hover:bg-muted/20">
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/candidates/${submission.candidate.id}`}
                                            className="font-medium text-foreground hover:text-primary"
                                        >
                                            {submission.candidate.fullName}
                                        </Link>
                                        <p className="mt-0.5 text-xs text-muted">
                                            {submission.candidate.currentPosition ||
                                                submission.candidate.email ||
                                                submission.candidate.phone ||
                                                "Chưa có thông tin liên hệ"}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/jobs/${submission.jobOrder.id}`}
                                            className="font-medium text-foreground hover:text-primary"
                                        >
                                            {submission.jobOrder.title}
                                        </Link>
                                        <p className="mt-0.5 text-xs text-muted">
                                            {submission.jobOrder.status}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                            {submissionStageLabel[submission.stage] ?? submission.stage}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${result.className}`}
                                        >
                                            {result.label}
                                        </span>
                                    </td>
                                    <td className="max-w-md px-4 py-3">
                                        {latest ? (
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {decision && (
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${decision.className}`}
                                                        >
                                                            {decision.label}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-muted">
                                                        {formatDateTime(latest.createdAt)}
                                                    </span>
                                                </div>
                                                {latest.message && (
                                                    <p className="line-clamp-2 text-xs text-muted">
                                                        {latest.message}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-muted">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Chưa có feedback
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-xs text-muted">
                                        {formatDateTime(submission.updatedAt)}
                                    </td>
                                </tr>
                            );
                        })}
                        {submissions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                                    <Users className="mx-auto mb-2 h-10 w-10 opacity-40" />
                                    Chưa có submission nào cho workspace này.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
