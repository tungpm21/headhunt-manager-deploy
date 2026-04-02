"use server";

import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export type NotificationCounts = {
  newApplications: number;
  pendingJobs: number;
  pendingEmployers: number;
  expiringJobs: number;
};

export async function getNotificationCounts(): Promise<NotificationCounts> {
  try {
    await requireAdmin();

    const now = new Date();
    const threeDaysLater = addDays(now, 3);

    const [newApplications, pendingJobs, pendingEmployers, expiringJobs] =
      await Promise.all([
        prisma.application.count({ where: { status: "NEW" } }),
        prisma.jobPosting.count({ where: { status: "PENDING" } }),
        prisma.employer.count({ where: { status: "PENDING" } }),
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
      expiringJobs,
    };
  } catch (error) {
    console.error("getNotificationCounts error:", error);
    return {
      newApplications: 0,
      pendingJobs: 0,
      pendingEmployers: 0,
      expiringJobs: 0,
    };
  }
}
