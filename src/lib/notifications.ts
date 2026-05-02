"use server";

import {
  CompanyDraftStatus,
  NotificationRecipientKind,
  type NotificationEventType,
  type NotificationSeverity,
} from "@prisma/client";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";

export type NotificationCounts = {
  newApplications: number;
  pendingJobs: number;
  pendingEmployers: number;
  pendingProfileDrafts: number;
  expiringJobs: number;
  unreadEvents: number;
};

export type NotificationTone = "blue" | "amber" | "red" | "emerald" | "slate";

export type NotificationActionItem = {
  key: string;
  label: string;
  description: string;
  count: number;
  href: string;
  tone: NotificationTone;
};

export type NotificationEventItem = {
  id: number;
  type: NotificationEventType;
  title: string;
  body: string | null;
  href: string;
  severity: NotificationSeverity;
  createdAt: string;
};

export type AdminNotificationSnapshot = {
  counts: NotificationCounts;
  actionableItems: NotificationActionItem[];
  eventItems: NotificationEventItem[];
  actionableTotal: number;
  unreadTotal: number;
  total: number;
};

const EMPTY_COUNTS: NotificationCounts = {
  newApplications: 0,
  pendingJobs: 0,
  pendingEmployers: 0,
  pendingProfileDrafts: 0,
  expiringJobs: 0,
  unreadEvents: 0,
};

const EMPTY_SNAPSHOT: AdminNotificationSnapshot = {
  counts: EMPTY_COUNTS,
  actionableItems: [],
  eventItems: [],
  actionableTotal: 0,
  unreadTotal: 0,
  total: 0,
};

function buildActionableItems(
  counts: NotificationCounts
): NotificationActionItem[] {
  return [
    {
      key: "newApplications",
      label: "CV mới chờ import",
      description:
        counts.newApplications > 0
          ? `${counts.newApplications} hồ sơ FDIWork cần xử lý`
          : "Hiện không có mục mới",
      count: counts.newApplications,
      href: "/jobs?tab=applications&status=NEW",
      tone: "blue",
    },
    {
      key: "pendingJobs",
      label: "Tin chờ duyệt",
      description:
        counts.pendingJobs > 0
          ? `${counts.pendingJobs} bài đăng đang chờ duyệt`
          : "Hiện không có mục mới",
      count: counts.pendingJobs,
      href: "/jobs?tab=posts&status=PENDING",
      tone: "amber",
    },
    {
      key: "pendingEmployers",
      label: "Nhà tuyển dụng chờ duyệt",
      description:
        counts.pendingEmployers > 0
          ? `${counts.pendingEmployers} tài khoản cần kiểm tra`
          : "Hiện không có mục mới",
      count: counts.pendingEmployers,
      href: "/companies?role=employer&status=PENDING",
      tone: "red",
    },
    {
      key: "pendingProfileDrafts",
      label: "Hồ sơ công ty chờ duyệt",
      description:
        counts.pendingProfileDrafts > 0
          ? `${counts.pendingProfileDrafts} bản chỉnh sửa cần duyệt`
          : "Hiện không có mục mới",
      count: counts.pendingProfileDrafts,
      href: "/companies?profileDrafts=pending",
      tone: "emerald",
    },
    {
      key: "expiringJobs",
      label: "Job sắp hết hạn",
      description:
        counts.expiringJobs > 0
          ? `${counts.expiringJobs} job cần theo dõi hạn`
          : "Hiện không có mục mới",
      count: counts.expiringJobs,
      href: "/jobs",
      tone: "slate",
    },
  ];
}

/**
 * Fetch notification badge counts.
 * Accepts `isAdmin` from caller to avoid a redundant `auth()` round-trip.
 */
export async function getNotificationCounts(
  isAdmin: boolean
): Promise<NotificationCounts> {
  const snapshot = await getAdminNotificationSnapshot(isAdmin);
  return snapshot.counts;
}

export async function getAdminNotificationSnapshot(
  isAdmin: boolean,
  adminUserId?: number
): Promise<AdminNotificationSnapshot> {
  if (!isAdmin) return EMPTY_SNAPSHOT;

  try {
    const now = new Date();
    const threeDaysLater = addDays(now, 3);
    const notificationEventDelegate = prisma.notificationEvent;

    const [
      newApplications,
      pendingJobs,
      pendingEmployers,
      pendingProfileDrafts,
      expiringJobs,
      eventItems,
    ] = await Promise.all([
      prisma.application.count({ where: { status: "NEW" } }),
      prisma.jobPosting.count({ where: { status: "PENDING" } }),
      prisma.employer.count({ where: { status: "PENDING" } }),
      prisma.companyProfileDraft.count({
        where: { status: CompanyDraftStatus.SUBMITTED },
      }),
      prisma.jobOrder.count({
        where: {
          status: "OPEN",
          deadline: {
            gte: now,
            lte: threeDaysLater,
          },
        },
      }),
      adminUserId && notificationEventDelegate
        ? notificationEventDelegate.findMany({
            where: {
              recipientKind: NotificationRecipientKind.ADMIN,
              adminUserId,
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

    const counts: NotificationCounts = {
      newApplications,
      pendingJobs,
      pendingEmployers,
      pendingProfileDrafts,
      expiringJobs,
      unreadEvents: eventItems.length,
    };
    const actionableItems = buildActionableItems(counts);
    const actionableTotal = actionableItems.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const unreadTotal = eventItems.length;

    return {
      counts,
      actionableItems,
      eventItems: eventItems.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
      actionableTotal,
      unreadTotal,
      total: actionableTotal + unreadTotal,
    };
  } catch (error) {
    console.error("getAdminNotificationSnapshot error:", error);
    return EMPTY_SNAPSHOT;
  }
}
