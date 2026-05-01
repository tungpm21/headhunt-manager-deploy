"use server";

import { CompanyDraftStatus } from "@prisma/client";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";

export type NotificationCounts = {
  newApplications: number;
  pendingJobs: number;
  pendingEmployers: number;
  pendingProfileDrafts: number;
  expiringJobs: number;
};

const EMPTY_COUNTS: NotificationCounts = {
  newApplications: 0,
  pendingJobs: 0,
  pendingEmployers: 0,
  pendingProfileDrafts: 0,
  expiringJobs: 0,
};

/**
 * Fetch notification badge counts.
 * Accepts `isAdmin` from caller to avoid a redundant `auth()` round-trip.
 */
export async function getNotificationCounts(
  isAdmin: boolean
): Promise<NotificationCounts> {
  if (!isAdmin) return EMPTY_COUNTS;

  try {
    const now = new Date();
    const threeDaysLater = addDays(now, 3);

    const [
      newApplications,
      pendingJobs,
      pendingEmployers,
      pendingProfileDrafts,
      expiringJobs,
    ] =
      await Promise.all([
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
      ]);

    return {
      newApplications,
      pendingJobs,
      pendingEmployers,
      pendingProfileDrafts,
      expiringJobs,
    };
  } catch (error) {
    console.error("getNotificationCounts error:", error);
    return EMPTY_COUNTS;
  }
}
