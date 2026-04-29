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
    AlertTriangle,
} from "lucide-react";
import { requireAdmin } from "@/lib/authz";
import {
    getCompanyWorkspaceById,
    withWorkspaceSubmissionAccess,
} from "@/lib/workspace";
import {
    CompanyWorkspaceMappingPanel,
    type MappingClientOption,
    type MappingEmployerOption,
} from "@/components/dashboard/CompanyWorkspaceMappingPanel";
import { prisma } from "@/lib/prisma";
import {
    approveCompanyProfileDraftAction,
    rejectCompanyProfileDraftAction,
} from "@/lib/workspace-actions";

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

async function getMappingOptions(workspaceId: number): Promise<{
    employers: MappingEmployerOption[];
    clients: MappingClientOption[];
}> {
    const [employers, clients] = await Promise.all([
        prisma.employer.findMany({
            orderBy: { companyName: "asc" },
            take: 200,
            select: {
                id: true,
                companyName: true,
                email: true,
                status: true,
                clientId: true,
                workspace: {
                    select: {
                        id: true,
                        displayName: true,
                    },
                },
            },
        }),
        prisma.client.findMany({
            where: { isDeleted: false },
            orderBy: { companyName: "asc" },
            take: 200,
            select: {
                id: true,
                companyName: true,
                status: true,
                workspace: {
                    select: {
                        id: true,
                        displayName: true,
                    },
                },
                employer: {
                    select: {
                        id: true,
                        companyName: true,
                    },
                },
            },
        }),
    ]);

    return {
        employers: employers
            .map((employer) => ({
                id: employer.id,
                companyName: employer.companyName,
                email: employer.email,
                status: employer.status,
                linkedWorkspaceId: employer.workspace?.id ?? null,
                linkedWorkspaceName: employer.workspace?.displayName ?? null,
                legacyClientId: employer.clientId,
            }))
            .sort((a, b) => {
                if (a.linkedWorkspaceId === workspaceId) return -1;
                if (b.linkedWorkspaceId === workspaceId) return 1;
                return 0;
            }),
        clients: clients
            .map((client) => ({
                id: client.id,
                companyName: client.companyName,
                status: client.status,
                linkedWorkspaceId: client.workspace?.id ?? null,
                linkedWorkspaceName: client.workspace?.displayName ?? null,
                legacyEmployerId: client.employer?.id ?? null,
                legacyEmployerName: client.employer?.companyName ?? null,
            }))
            .sort((a, b) => {
                if (a.linkedWorkspaceId === workspaceId) return -1;
                if (b.linkedWorkspaceId === workspaceId) return 1;
                return 0;
            }),
    };
}

export default async function CompanyDetailPage({ params, searchParams }: PageProps) {
    await requireAdmin();
    const { id } = await params;
    const sp = await searchParams;
    const workspaceId = Number(id);
    if (isNaN(workspaceId)) notFound();

    const workspace = await getCompanyWorkspaceById(workspaceId);
    if (!workspace) notFound();

    const activeTab = sp.tab ?? "overview";
    const mappingOptions =
        activeTab === "mapping"
            ? await getMappingOptions(workspaceId)
            : { employers: [], clients: [] };

    // Gather stats for overview
    const [
        jobPostingCount,
        applicationCount,
        jobOrderCount,
        submissionCount,
        portalUserCount,
        profileDraftCount,
    ] =
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
            prisma.companyProfileDraft.count({
                where: { workspaceId, status: "SUBMITTED" },
            }),
        ]);

    const tabs = [
        { key: "overview", label: "Tổng quan", icon: Building },
        { key: "mapping", label: "Liên kết", icon: LinkIcon },
        ...(workspace.employer
            ? [
                { key: "jobs", label: `Tin tuyển dụng (${jobPostingCount})`, icon: FileText },
                { key: "applications", label: `Ứng tuyển (${applicationCount})`, icon: Mail },
                { key: "profile-drafts", label: `Duyệt hồ sơ (${profileDraftCount})`, icon: AlertTriangle },
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
                    <MappingTab
                        workspace={workspace}
                        employerOptions={mappingOptions.employers}
                        clientOptions={mappingOptions.clients}
                    />
                )}
                {activeTab === "submissions" && workspace.client && (
                    <SubmissionsTab workspaceId={workspace.id} />
                )}
                {activeTab === "profile-drafts" && workspace.employer && (
                    <ProfileDraftsTab workspaceId={workspace.id} />
                )}
                {activeTab !== "overview" && activeTab !== "mapping" && activeTab !== "submissions" && activeTab !== "profile-drafts" && (
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
    employerOptions,
    clientOptions,
}: {
    workspace: NonNullable<Awaited<ReturnType<typeof getCompanyWorkspaceById>>>;
    employerOptions: MappingEmployerOption[];
    clientOptions: MappingClientOption[];
}) {
    return (
        <CompanyWorkspaceMappingPanel
            workspace={{
                id: workspace.id,
                displayName: workspace.displayName,
                portalEnabled: workspace.portalEnabled,
                employer: workspace.employer,
                client: workspace.client,
            }}
            employerOptions={employerOptions}
            clientOptions={clientOptions}
        />
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

async function ProfileDraftsTab({ workspaceId }: { workspaceId: number }) {
    const drafts = await prisma.companyProfileDraft.findMany({
        where: { workspaceId },
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        take: 20,
        select: {
            id: true,
            status: true,
            payload: true,
            submittedByName: true,
            submittedByEmail: true,
            submittedAt: true,
            reviewedAt: true,
            rejectReason: true,
            updatedAt: true,
            reviewedBy: { select: { name: true, email: true } },
        },
    });

    return (
        <div className="space-y-4">
            {drafts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted">
                    <AlertTriangle className="mx-auto mb-2 h-9 w-9 opacity-40" />
                    Chưa có bản nháp hồ sơ nào từ công ty.
                </div>
            ) : (
                drafts.map((draft) => {
                    const payload =
                        draft.payload && typeof draft.payload === "object" && !Array.isArray(draft.payload)
                            ? (draft.payload as Record<string, unknown>)
                            : {};
                    const companyName =
                        typeof payload.companyName === "string" && payload.companyName.trim()
                            ? payload.companyName
                            : "Hồ sơ công ty";
                    const description =
                        typeof payload.description === "string" ? payload.description : "";
                    const isSubmitted = draft.status === "SUBMITTED";

                    return (
                        <div key={draft.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-base font-semibold text-foreground">{companyName}</h3>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                draft.status === "SUBMITTED"
                                                    ? "bg-amber-100 text-amber-700"
                                                    : draft.status === "APPROVED"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : draft.status === "REJECTED"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {draft.status}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-muted">
                                        {draft.submittedByName || draft.submittedByEmail || "Company user"} ·{" "}
                                        {formatDateTime(draft.submittedAt ?? draft.updatedAt)}
                                    </p>
                                    {description && (
                                        <p className="mt-3 line-clamp-3 max-w-3xl text-sm text-foreground">
                                            {description}
                                        </p>
                                    )}
                                    <Link
                                        href={`/companies/${workspaceId}/profile-drafts/${draft.id}/preview`}
                                        target="_blank"
                                        className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
                                    >
                                        Preview bản nháp
                                    </Link>
                                    {draft.rejectReason && (
                                        <p className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                                            {draft.rejectReason}
                                        </p>
                                    )}
                                    {draft.reviewedBy && (
                                        <p className="mt-2 text-xs text-muted">
                                            Reviewed by {draft.reviewedBy.name || draft.reviewedBy.email}
                                            {draft.reviewedAt ? ` · ${formatDateTime(draft.reviewedAt)}` : ""}
                                        </p>
                                    )}
                                </div>

                                {isSubmitted && (
                                    <div className="flex min-w-[280px] flex-col gap-2">
                                        <form action={approveCompanyProfileDraftAction}>
                                            <input type="hidden" name="draftId" value={draft.id} />
                                            <button
                                                type="submit"
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Duyệt và publish
                                            </button>
                                        </form>
                                        <form action={rejectCompanyProfileDraftAction} className="space-y-2">
                                            <input type="hidden" name="draftId" value={draft.id} />
                                            <textarea
                                                name="reason"
                                                rows={3}
                                                placeholder="Lý do từ chối để công ty chỉnh lại"
                                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                            <button
                                                type="submit"
                                                className="inline-flex w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                                            >
                                                Từ chối
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
