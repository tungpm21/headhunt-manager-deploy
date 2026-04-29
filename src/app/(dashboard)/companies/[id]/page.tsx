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
import { AdminCompanyProfileEditor } from "@/components/dashboard/AdminCompanyProfileEditor";
import {
    AdminPortalUsersManager,
    type AdminPortalUserRow,
} from "@/components/company/AdminPortalUsersManager";
import { OPTION_GROUPS } from "@/lib/config-option-definitions";
import { getOptionsForSelect } from "@/lib/config-options";
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

const jobPostingStatusMeta: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "Nháp", className: "bg-slate-100 text-slate-700" },
    PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
    APPROVED: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-700" },
    REJECTED: { label: "Từ chối", className: "bg-red-100 text-red-700" },
    EXPIRED: { label: "Hết hạn", className: "bg-slate-100 text-slate-700" },
    PAUSED: { label: "Tạm ẩn", className: "bg-blue-100 text-blue-700" },
};

const applicationStatusMeta: Record<string, { label: string; className: string }> = {
    NEW: { label: "Mới", className: "bg-blue-100 text-blue-700" },
    REVIEWED: { label: "Đã xem", className: "bg-slate-100 text-slate-700" },
    SHORTLISTED: { label: "Shortlist", className: "bg-emerald-100 text-emerald-700" },
    REJECTED: { label: "Từ chối", className: "bg-red-100 text-red-700" },
    IMPORTED: { label: "Đã import", className: "bg-purple-100 text-purple-700" },
};

const jobOrderStatusMeta: Record<string, { label: string; className: string }> = {
    OPEN: { label: "Đang mở", className: "bg-emerald-100 text-emerald-700" },
    PAUSED: { label: "Tạm dừng", className: "bg-amber-100 text-amber-700" },
    FILLED: { label: "Đã tuyển", className: "bg-blue-100 text-blue-700" },
    CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
};

const subscriptionStatusMeta: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Đang hoạt động", className: "bg-emerald-100 text-emerald-700" },
    EXPIRED: { label: "Hết hạn", className: "bg-amber-100 text-amber-700" },
    CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
};

const formatDateTime = (value: Date) =>
    new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(value);

const formatDate = (value: Date | null | undefined) =>
    value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(value) : "Chưa có";

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
                { key: "profile-edit", label: "Chỉnh sửa profile", icon: Building },
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

    const hasActiveTab = tabs.some((tab) => tab.key === activeTab);
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
                {activeTab === "profile-edit" && workspace.employer && (
                    <ProfileEditTab workspaceId={workspace.id} employerId={workspace.employer.id} />
                )}
                {activeTab === "submissions" && workspace.client && (
                    <SubmissionsTab workspaceId={workspace.id} />
                )}
                {activeTab === "profile-drafts" && workspace.employer && (
                    <ProfileDraftsTab workspaceId={workspace.id} />
                )}
                {activeTab === "jobs" && workspace.employer && (
                    <JobPostingsTab employerId={workspace.employer.id} />
                )}
                {activeTab === "applications" && workspace.employer && (
                    <ApplicationsTab employerId={workspace.employer.id} />
                )}
                {activeTab === "orders" && workspace.client && (
                    <JobOrdersTab clientId={workspace.client.id} />
                )}
                {activeTab === "portal-users" && (
                    <PortalUsersTab workspaceId={workspace.id} />
                )}
                {activeTab === "billing" && (
                    <BillingTab employerId={workspace.employer?.id ?? null} />
                )}
                {activeTab === "activity" && (
                    <ActivityTab workspaceId={workspace.id} workspace={workspace} />
                )}
                {!hasActiveTab && (
                    <div className="text-center py-12 text-muted">
                        <p className="text-lg font-medium mb-1">Tab &quot;{activeTab}&quot;</p>
                        <p className="text-sm">Tab này không khả dụng với workspace hiện tại.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==================== TAB COMPONENTS ====================

async function ProfileEditTab({
    workspaceId,
    employerId,
}: {
    workspaceId: number;
    employerId: number;
}) {
    const employer = await prisma.employer.findUnique({
        where: { id: employerId },
        select: {
            id: true,
            companyName: true,
            slug: true,
            email: true,
            logo: true,
            coverImage: true,
            coverPositionX: true,
            coverPositionY: true,
            coverZoom: true,
            description: true,
            industry: true,
            companySize: true,
            address: true,
            location: true,
            industrialZone: true,
            website: true,
            phone: true,
            profileConfig: {
                select: {
                    theme: true,
                    capabilities: true,
                    sections: true,
                    primaryVideoUrl: true,
                },
            },
        },
    });

    if (!employer) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted">
                Không tìm thấy Employer để chỉnh profile.
            </div>
        );
    }

    const [industryOptions, companySizeOptions, locationOptions, industrialZoneOptions] =
        await Promise.all([
            getOptionsForSelect(OPTION_GROUPS.industry, { currentValue: employer.industry }),
            getOptionsForSelect(OPTION_GROUPS.companySize, { currentValue: employer.companySize }),
            getOptionsForSelect(OPTION_GROUPS.location, { currentValue: employer.location }),
            getOptionsForSelect(OPTION_GROUPS.industrialZone, { currentValue: employer.industrialZone }),
        ]);

    return (
        <AdminCompanyProfileEditor
            workspaceId={workspaceId}
            employer={{
                ...employer,
                companySize: employer.companySize ?? null,
            }}
            options={{
                industryOptions,
                companySizeOptions,
                locationOptions,
                industrialZoneOptions,
            }}
        />
    );
}

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

function StatusPill({
    meta,
    fallback,
}: {
    meta: { label: string; className: string } | undefined;
    fallback: string;
}) {
    return (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta?.className ?? "bg-slate-100 text-slate-700"}`}>
            {meta?.label ?? fallback}
        </span>
    );
}

function EmptyTab({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof FileText;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted">
            <Icon className="mx-auto mb-2 h-9 w-9 opacity-40" />
            <p className="font-medium text-foreground">{title}</p>
            <p className="mt-1 text-sm">{description}</p>
        </div>
    );
}

async function JobPostingsTab({ employerId }: { employerId: number }) {
    const [jobs, statusCounts] = await Promise.all([
        prisma.jobPosting.findMany({
            where: { employerId },
            orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
            take: 50,
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                industry: true,
                location: true,
                viewCount: true,
                applyCount: true,
                publishedAt: true,
                expiresAt: true,
                updatedAt: true,
                jobOrder: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                    },
                },
            },
        }),
        prisma.jobPosting.groupBy({
            by: ["status"],
            where: { employerId },
            _count: { _all: true },
        }),
    ]);

    const countByStatus = new Map(statusCounts.map((item) => [item.status, item._count._all]));
    const publicCount = countByStatus.get("APPROVED") ?? 0;
    const pendingCount = countByStatus.get("PENDING") ?? 0;
    const rejectedCount = countByStatus.get("REJECTED") ?? 0;

    return (
        <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Đang public" value={publicCount} icon={Globe} />
                <SummaryCard label="Chờ duyệt" value={pendingCount} icon={Clock} />
                <SummaryCard label="Bị từ chối" value={rejectedCount} icon={AlertTriangle} />
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30 text-left">
                            <th className="px-4 py-3 font-medium text-muted">Tin tuyển dụng</th>
                            <th className="px-4 py-3 font-medium text-muted">Trạng thái</th>
                            <th className="px-4 py-3 font-medium text-muted">Hiệu suất</th>
                            <th className="px-4 py-3 font-medium text-muted">Link CRM</th>
                            <th className="px-4 py-3 text-right font-medium text-muted">Cập nhật</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {jobs.map((job) => (
                            <tr key={job.id} className="transition-colors hover:bg-muted/20">
                                <td className="px-4 py-3">
                                            <Link href={`/moderation/${job.id}/edit`} className="font-medium text-foreground hover:text-primary">
                                        {job.title}
                                    </Link>
                                    <p className="mt-0.5 text-xs text-muted">
                                        /{job.slug}
                                        {job.industry ? ` · ${job.industry}` : ""}
                                        {job.location ? ` · ${job.location}` : ""}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <StatusPill meta={jobPostingStatusMeta[job.status]} fallback={job.status} />
                                    <p className="mt-1 text-xs text-muted">
                                        Public: {formatDate(job.publishedAt)} · Hết hạn: {formatDate(job.expiresAt)}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-muted">
                                    <span className="font-medium text-foreground">{job.viewCount}</span> view ·{" "}
                                    <span className="font-medium text-foreground">{job.applyCount}</span> ứng tuyển
                                </td>
                                <td className="px-4 py-3">
                                    {job.jobOrder ? (
                                        <Link href={`/jobs/${job.jobOrder.id}`} className="font-medium text-primary hover:underline">
                                            {job.jobOrder.title}
                                        </Link>
                                    ) : (
                                        <span className="text-xs text-muted">Chưa link Job Order</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-muted">
                                    {formatDateTime(job.updatedAt)}
                                </td>
                            </tr>
                        ))}
                        {jobs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8">
                                    <EmptyTab icon={FileText} title="Chưa có tin tuyển dụng" description="Workspace Employer này chưa đăng tin trên FDIWork." />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

async function ApplicationsTab({ employerId }: { employerId: number }) {
    const [applications, statusCounts] = await Promise.all([
        prisma.application.findMany({
            where: { jobPosting: { employerId } },
            orderBy: [{ createdAt: "desc" }],
            take: 50,
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                status: true,
                cvFileName: true,
                createdAt: true,
                jobPosting: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                candidate: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        }),
        prisma.application.groupBy({
            by: ["status"],
            where: { jobPosting: { employerId } },
            _count: { _all: true },
        }),
    ]);

    const countByStatus = new Map(statusCounts.map((item) => [item.status, item._count._all]));

    return (
        <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-4">
                <SummaryCard label="Mới" value={countByStatus.get("NEW") ?? 0} icon={Mail} />
                <SummaryCard label="Shortlist" value={countByStatus.get("SHORTLISTED") ?? 0} icon={CheckCircle2} />
                <SummaryCard label="Đã import CRM" value={countByStatus.get("IMPORTED") ?? 0} icon={Users} />
                <SummaryCard label="Tổng" value={applications.length} icon={FileText} />
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30 text-left">
                            <th className="px-4 py-3 font-medium text-muted">Ứng viên</th>
                            <th className="px-4 py-3 font-medium text-muted">Tin tuyển dụng</th>
                            <th className="px-4 py-3 font-medium text-muted">Trạng thái</th>
                            <th className="px-4 py-3 font-medium text-muted">CRM Candidate</th>
                            <th className="px-4 py-3 text-right font-medium text-muted">Ngày nộp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {applications.map((application) => (
                            <tr key={application.id} className="transition-colors hover:bg-muted/20">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-foreground">{application.fullName}</p>
                                    <p className="mt-0.5 text-xs text-muted">
                                        {application.email}
                                        {application.phone ? ` · ${application.phone}` : ""}
                                    </p>
                                    {application.cvFileName && (
                                        <p className="mt-0.5 text-xs text-primary">{application.cvFileName}</p>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                                <Link href={`/moderation/${application.jobPosting.id}/edit`} className="font-medium text-primary hover:underline">
                                        {application.jobPosting.title}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">
                                    <StatusPill meta={applicationStatusMeta[application.status]} fallback={application.status} />
                                </td>
                                <td className="px-4 py-3">
                                    {application.candidate ? (
                                        <Link href={`/candidates/${application.candidate.id}`} className="font-medium text-primary hover:underline">
                                            {application.candidate.fullName}
                                        </Link>
                                    ) : (
                                        <span className="text-xs text-muted">Chưa import</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-muted">
                                    {formatDateTime(application.createdAt)}
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8">
                                    <EmptyTab icon={Mail} title="Chưa có hồ sơ ứng tuyển" description="Ứng viên public sẽ xuất hiện tại đây theo workspace Employer." />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

async function JobOrdersTab({ clientId }: { clientId: number }) {
    const orders = await prisma.jobOrder.findMany({
        where: { clientId },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 50,
        select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            location: true,
            industrialZone: true,
            quantity: true,
            deadline: true,
            updatedAt: true,
            _count: {
                select: {
                    candidates: true,
                    jobPostings: true,
                },
            },
        },
    });

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/30 text-left">
                        <th className="px-4 py-3 font-medium text-muted">Job Order</th>
                        <th className="px-4 py-3 font-medium text-muted">Trạng thái</th>
                        <th className="px-4 py-3 font-medium text-muted">Nhu cầu</th>
                        <th className="px-4 py-3 font-medium text-muted">Liên kết</th>
                        <th className="px-4 py-3 text-right font-medium text-muted">Cập nhật</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                        <tr key={order.id} className="transition-colors hover:bg-muted/20">
                            <td className="px-4 py-3">
                                <Link href={`/jobs/${order.id}`} className="font-medium text-foreground hover:text-primary">
                                    {order.title}
                                </Link>
                                <p className="mt-0.5 text-xs text-muted">
                                    {order.location || "Chưa có địa điểm"}
                                    {order.industrialZone ? ` · ${order.industrialZone}` : ""}
                                </p>
                            </td>
                            <td className="px-4 py-3">
                                <StatusPill meta={jobOrderStatusMeta[order.status]} fallback={order.status} />
                                <p className="mt-1 text-xs text-muted">Priority: {order.priority}</p>
                            </td>
                            <td className="px-4 py-3 text-muted">
                                <span className="font-medium text-foreground">{order.quantity}</span> headcount · deadline{" "}
                                {formatDate(order.deadline)}
                            </td>
                            <td className="px-4 py-3 text-muted">
                                <span className="font-medium text-foreground">{order._count.candidates}</span> submissions ·{" "}
                                <span className="font-medium text-foreground">{order._count.jobPostings}</span> public jobs
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-muted">
                                {formatDateTime(order.updatedAt)}
                            </td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-4 py-8">
                                <EmptyTab icon={Briefcase} title="Chưa có Job Order" description="Workspace Client này chưa có yêu cầu tuyển dụng trong CRM." />
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

async function PortalUsersTab({ workspaceId }: { workspaceId: number }) {
    const users = await prisma.companyPortalUser.findMany({
        where: { workspaceId },
        orderBy: [{ role: "asc" }, { email: "asc" }],
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    const serializedUsers: AdminPortalUserRow[] = users.map((user) => ({
        ...user,
        role: user.role as AdminPortalUserRow["role"],
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    }));

    return <AdminPortalUsersManager workspaceId={workspaceId} users={serializedUsers} />;

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border bg-muted/30 text-left">
                        <th className="px-4 py-3 font-medium text-muted">Portal user</th>
                        <th className="px-4 py-3 font-medium text-muted">Role</th>
                        <th className="px-4 py-3 font-medium text-muted">Trạng thái</th>
                        <th className="px-4 py-3 text-right font-medium text-muted">Hoạt động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {users.map((user) => (
                        <tr key={user.id} className="transition-colors hover:bg-muted/20">
                            <td className="px-4 py-3">
                                <p className="font-medium text-foreground">{user.name || user.email}</p>
                                <p className="mt-0.5 text-xs text-muted">{user.email}</p>
                            </td>
                            <td className="px-4 py-3">
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                    {user.isActive ? "Active" : "Inactive"}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-muted">
                                Login: {formatDateTime(user.lastLoginAt ?? user.createdAt)}
                                <br />
                                Updated: {formatDateTime(user.updatedAt)}
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-4 py-8">
                                <EmptyTab icon={UserCog} title="Chưa có portal user" description="Owner hoặc admin có thể tạo user portal ở bước tiếp theo." />
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

async function BillingTab({ employerId }: { employerId: number | null }) {
    if (!employerId) {
        return (
            <EmptyTab
                icon={CreditCard}
                title="Workspace chưa có Employer capability"
                description="Billing/quota FDIWork được đọc từ Employer.subscription nên chỉ hiển thị khi workspace đã link Employer."
            />
        );
    }

    const subscription = await prisma.subscription.findUnique({
        where: { employerId },
        select: {
            tier: true,
            status: true,
            jobQuota: true,
            jobsUsed: true,
            jobDuration: true,
            showLogo: true,
            showBanner: true,
            startDate: true,
            endDate: true,
        },
    });

    if (!subscription) {
        return (
            <EmptyTab
                icon={CreditCard}
                title="Chưa có gói dịch vụ"
                description="Workspace này có Employer capability nhưng chưa có subscription/quota được cấu hình."
            />
        );
    }

    const used = Math.min(subscription.jobsUsed, subscription.jobQuota);
    const remaining = Math.max(0, subscription.jobQuota - subscription.jobsUsed);
    const percent = subscription.jobQuota > 0 ? Math.round((used / subscription.jobQuota) * 100) : 0;

    return (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm text-muted">Gói FDIWork</p>
                        <h3 className="mt-1 text-xl font-bold text-foreground">{subscription.tier}</h3>
                    </div>
                    <StatusPill meta={subscriptionStatusMeta[subscription.status]} fallback={subscription.status} />
                </div>

                <div className="mt-5">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">Quota đăng tin</span>
                        <span className="text-muted">
                            {subscription.jobsUsed}/{subscription.jobQuota} đã dùng · còn {remaining}
                        </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted/30">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <InfoCell label="Ngày bắt đầu" value={formatDate(subscription.startDate)} />
                    <InfoCell label="Ngày hết hạn" value={formatDate(subscription.endDate)} />
                    <InfoCell label="Thời hạn tin" value={`${subscription.jobDuration} ngày`} />
                </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <h3 className="text-base font-semibold text-foreground">Quyền lợi gói</h3>
                <div className="mt-4 space-y-3 text-sm">
                    <FeatureRow label="Logo trang chủ" enabled={subscription.showLogo} />
                    <FeatureRow label="Banner VIP" enabled={subscription.showBanner} />
                    <FeatureRow label="Portal billing" enabled />
                </div>
                <p className="mt-4 rounded-lg bg-muted/20 p-3 text-xs text-muted">
                    Panel này chỉ đọc dữ liệu subscription hiện có; thay đổi gói vẫn đi qua flow admin/subscription hiện tại.
                </p>
            </div>
        </div>
    );
}

function SummaryCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: typeof FileText;
}) {
    return (
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted">
                <Icon className="h-4 w-4" />
                {label}
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        </div>
    );
}

function InfoCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-medium uppercase text-muted">{label}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
        </div>
    );
}

function FeatureRow({ label, enabled }: { label: string; enabled: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-muted">{label}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {enabled ? "Bật" : "Tắt"}
            </span>
        </div>
    );
}

async function ActivityTab({
    workspaceId,
    workspace,
}: {
    workspaceId: number;
    workspace: NonNullable<Awaited<ReturnType<typeof getCompanyWorkspaceById>>>;
}) {
    const [users, drafts, feedback] = await Promise.all([
        prisma.companyPortalUser.findMany({
            where: { workspaceId },
            orderBy: { updatedAt: "desc" },
            take: 8,
            select: { email: true, name: true, role: true, isActive: true, updatedAt: true },
        }),
        prisma.companyProfileDraft.findMany({
            where: { workspaceId },
            orderBy: { updatedAt: "desc" },
            take: 8,
            select: { status: true, submittedByName: true, submittedByEmail: true, updatedAt: true },
        }),
        prisma.submissionFeedback.findMany({
            where: { workspaceId },
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
                decision: true,
                message: true,
                createdAt: true,
                authorPortalUser: { select: { name: true, email: true } },
                jobCandidate: {
                    select: {
                        candidate: { select: { fullName: true } },
                        jobOrder: { select: { title: true } },
                    },
                },
            },
        }),
    ]);

    const events = [
        {
            date: workspace.updatedAt,
            title: "Workspace updated",
            description: `${workspace.displayName} · portal ${workspace.portalEnabled ? "enabled" : "disabled"}`,
        },
        {
            date: workspace.createdAt,
            title: "Workspace created",
            description: workspace.slug,
        },
        ...users.map((user) => ({
            date: user.updatedAt,
            title: "Portal user updated",
            description: `${user.name || user.email} · ${user.role} · ${user.isActive ? "active" : "inactive"}`,
        })),
        ...drafts.map((draft) => ({
            date: draft.updatedAt,
            title: "Company profile draft",
            description: `${draft.status} · ${draft.submittedByName || draft.submittedByEmail || "Company user"}`,
        })),
        ...feedback.map((item) => ({
            date: item.createdAt,
            title: "Submission feedback",
            description: `${item.authorPortalUser?.name || item.authorPortalUser?.email || "Portal user"} · ${item.jobCandidate.candidate.fullName} · ${item.jobCandidate.jobOrder.title}${item.decision ? ` · ${feedbackDecisionMeta[item.decision]?.label ?? item.decision}` : ""}${item.message ? ` · ${item.message}` : ""}`,
        })),
    ]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 20);

    return (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Activity className="h-5 w-5 text-primary" />
                Workspace activity
            </h3>
            <div className="mt-4 divide-y divide-border">
                {events.map((event, index) => (
                    <div key={`${event.title}-${event.date.toISOString()}-${index}`} className="py-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="font-medium text-foreground">{event.title}</p>
                                <p className="mt-0.5 text-sm text-muted">{event.description}</p>
                            </div>
                            <span className="text-xs text-muted">{formatDateTime(event.date)}</span>
                        </div>
                    </div>
                ))}
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
