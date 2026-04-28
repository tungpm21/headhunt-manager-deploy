import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { prisma } from "@/lib/prisma";
import {
    Briefcase,
    FileText,
    Mail,
    Send,
    Users,
} from "lucide-react";

export const metadata = {
    title: "Company Dashboard — FDIWork",
};

export default async function CompanyDashboardPage() {
    const session = await requireCompanyPortalSession();

    // Gather stats based on capabilities
    const workspace = await prisma.companyWorkspace.findUnique({
        where: { id: session.workspaceId },
        select: {
            displayName: true,
            employerId: true,
            clientId: true,
            portalEnabled: true,
        },
    });

    const stats = await Promise.all([
        workspace?.employerId
            ? prisma.jobPosting.count({
                where: { employerId: workspace.employerId, status: "APPROVED" },
            })
            : 0,
        workspace?.employerId
            ? prisma.application.count({
                where: {
                    jobPosting: { employerId: workspace.employerId },
                    status: "NEW",
                },
            })
            : 0,
        workspace?.clientId
            ? prisma.jobOrder.count({
                where: { clientId: workspace.clientId, status: "OPEN" },
            })
            : 0,
        workspace?.clientId
            ? prisma.jobCandidate.count({
                where: {
                    jobOrder: { clientId: workspace.clientId },
                    stage: { in: ["SENT_TO_CLIENT", "CLIENT_REVIEWING"] },
                },
            })
            : 0,
    ]);

    const [activeJobs, newApplications, openOrders, pendingSubmissions] = stats;

    const cards = [
        {
            label: "Tin tuyển dụng đang hiển thị",
            value: activeJobs,
            icon: FileText,
            href: "/company/job-postings",
            show: session.capabilities.employer,
            color: "text-blue-600 bg-blue-50",
        },
        {
            label: "Ứng tuyển mới",
            value: newApplications,
            icon: Mail,
            href: "/company/applications",
            show: session.capabilities.employer,
            color: "text-amber-600 bg-amber-50",
        },
        {
            label: "Job Orders đang mở",
            value: openOrders,
            icon: Briefcase,
            href: "/company/job-orders",
            show: session.capabilities.client,
            color: "text-purple-600 bg-purple-50",
        },
        {
            label: "Submissions cần review",
            value: pendingSubmissions,
            icon: Send,
            href: "/company/submissions",
            show: session.capabilities.client,
            color: "text-emerald-600 bg-emerald-50",
        },
    ].filter((c) => c.show);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Xin chào, {workspace?.displayName}
                </h1>
                <p className="mt-1 text-sm text-muted">
                    Tổng quan hoạt động công ty
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => (
                    <a
                        key={card.label}
                        href={card.href}
                        className="group rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md hover:border-primary/30"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`rounded-lg p-2 ${card.color}`}>
                                <card.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-4 text-2xl font-bold text-foreground">{card.value}</p>
                        <p className="mt-1 text-sm text-muted group-hover:text-foreground transition-colors">
                            {card.label}
                        </p>
                    </a>
                ))}
            </div>

            {cards.length === 0 && (
                <div className="text-center py-12 rounded-xl border border-border bg-surface">
                    <Users className="mx-auto h-10 w-10 text-muted mb-3" />
                    <p className="text-lg font-medium text-foreground">Chào mừng đến Company Portal</p>
                    <p className="text-sm text-muted mt-1">
                        Workspace của bạn chưa có chức năng employer hoặc client. Liên hệ admin để thiết lập.
                    </p>
                </div>
            )}
        </div>
    );
}
