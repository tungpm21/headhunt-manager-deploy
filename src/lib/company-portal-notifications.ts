import {
  JobCandidateStage,
  JobPostingStatus,
  NotificationRecipientKind,
  type NotificationEventType,
  type NotificationSeverity,
} from "@prisma/client";
import type { CompanyPortalSession } from "@/lib/company-portal-auth";
import { prisma } from "@/lib/prisma";

export type CompanyPortalNotificationTone =
  | "blue"
  | "amber"
  | "red"
  | "emerald";

export type CompanyPortalNotificationItem = {
  key: string;
  label: string;
  description: string;
  count: number;
  href: string;
  tone: CompanyPortalNotificationTone;
};

export type CompanyPortalNotificationEventItem = {
  id: number;
  type: NotificationEventType;
  title: string;
  body: string | null;
  href: string;
  severity: NotificationSeverity;
  createdAt: string;
};

export type CompanyPortalNotificationData = {
  total: number;
  items: CompanyPortalNotificationItem[];
  actionableItems: CompanyPortalNotificationItem[];
  eventItems: CompanyPortalNotificationEventItem[];
  actionableTotal: number;
  unreadTotal: number;
};

export async function getCompanyPortalNotificationData(
  session: CompanyPortalSession
): Promise<CompanyPortalNotificationData> {
  const workspace = await prisma.companyWorkspace.findUnique({
    where: { id: session.workspaceId },
    select: { employerId: true, clientId: true },
  });
  const notificationEventDelegate = prisma.notificationEvent;

  const [pendingJobs, rejectedJobs, submissionsToReview, subscription, events] =
    await Promise.all([
      session.capabilities.employer && workspace?.employerId
        ? prisma.jobPosting.count({
            where: {
              employerId: workspace.employerId,
              status: JobPostingStatus.PENDING,
            },
          })
        : Promise.resolve(0),
      session.capabilities.employer && workspace?.employerId
        ? prisma.jobPosting.count({
            where: {
              employerId: workspace.employerId,
              status: JobPostingStatus.REJECTED,
            },
          })
        : Promise.resolve(0),
      session.capabilities.client && workspace?.clientId
        ? prisma.jobCandidate.count({
            where: {
              jobOrder: { clientId: workspace.clientId },
              stage: {
                in: [
                  JobCandidateStage.SENT_TO_CLIENT,
                  JobCandidateStage.CLIENT_REVIEWING,
                ],
              },
            },
          })
        : Promise.resolve(0),
      session.capabilities.billing && workspace?.employerId
        ? prisma.subscription.findUnique({
            where: { employerId: workspace.employerId },
            select: {
              status: true,
              jobQuota: true,
              jobsUsed: true,
              endDate: true,
            },
          })
        : Promise.resolve(null),
      notificationEventDelegate
        ? notificationEventDelegate.findMany({
            where: {
              recipientKind: NotificationRecipientKind.COMPANY,
              portalUserId: session.portalUserId,
              workspaceId: session.workspaceId,
              readAt: null,
            },
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
              id: true,
              type: true,
              title: true,
              body: true,
              href: true,
              severity: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
    ]);

  const actionableItems: CompanyPortalNotificationItem[] = [];

  if (session.capabilities.employer) {
    actionableItems.push(
      {
        key: "pending-jobs",
        label: "Tin chờ duyệt",
        description:
          pendingJobs > 0
            ? `${pendingJobs} tin đang chờ FDIWork duyệt`
            : "Hiện không có mục mới",
        count: pendingJobs,
        href: "/company/job-postings?status=PENDING",
        tone: "amber",
      },
      {
        key: "rejected-jobs",
        label: "Tin bị từ chối",
        description:
          rejectedJobs > 0
            ? `${rejectedJobs} tin cần cập nhật`
            : "Hiện không có mục mới",
        count: rejectedJobs,
        href: "/company/job-postings?status=REJECTED",
        tone: "red",
      }
    );
  }

  if (session.capabilities.client) {
    actionableItems.push({
      key: "submissions-to-review",
      label: "Hồ sơ cần phản hồi",
      description:
        submissionsToReview > 0
          ? `${submissionsToReview} hồ sơ đang chờ phản hồi`
          : "Hiện không có mục mới",
      count: submissionsToReview,
      href: "/company/submissions?stage=SENT_TO_CLIENT",
      tone: "emerald",
    });
  }

  if (session.capabilities.billing) {
    const now = new Date();
    const remainingQuota = subscription
      ? Math.max(subscription.jobQuota - subscription.jobsUsed, 0)
      : 0;
    const isExpired =
      !subscription || subscription.status !== "ACTIVE" || subscription.endDate < now;
    const isLowQuota = !isExpired && remainingQuota <= 1;

    if (isExpired || isLowQuota) {
      actionableItems.push({
        key: "subscription",
        label: "Gói dịch vụ",
        description: isExpired
          ? "Gói dịch vụ đã hết hạn"
          : remainingQuota === 0
            ? "Đã hết lượt đăng tin"
            : `Chỉ còn ${remainingQuota} lượt đăng tin`,
        count: isExpired || remainingQuota === 0 ? 1 : remainingQuota,
        href: "/company/billing",
        tone: isExpired ? "red" : "amber",
      });
    }
  }

  const eventItems = events.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));
  const actionableTotal = actionableItems.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const unreadTotal = eventItems.length;

  return {
    total: actionableTotal + unreadTotal,
    items: actionableItems,
    actionableItems,
    eventItems,
    actionableTotal,
    unreadTotal,
  };
}
