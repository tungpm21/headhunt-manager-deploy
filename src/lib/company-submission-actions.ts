"use server";

import {
  NotificationEventType,
  NotificationSeverity,
  SubmissionFeedbackDecision,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { createAdminNotificationEventForAllAdmins } from "@/lib/notification-events";
import { prisma } from "@/lib/prisma";
import { withWorkspaceSubmissionAccess } from "@/lib/workspace";

const VALID_FEEDBACK_DECISIONS = new Set<SubmissionFeedbackDecision>(
  Object.values(SubmissionFeedbackDecision)
);

export async function submitCompanySubmissionFeedbackAction(
  jobCandidateId: number,
  decision: string,
  message: string
): Promise<{ success: boolean; message: string }> {
  const session = await requireCompanyPortalSession();

  if (!session.capabilities.client) {
    return {
      success: false,
      message: "Workspace chưa liên kết Client.",
    };
  }

  const nextDecision = VALID_FEEDBACK_DECISIONS.has(
    decision as SubmissionFeedbackDecision
  )
    ? (decision as SubmissionFeedbackDecision)
    : null;
  const normalizedMessage = message.trim().slice(0, 2000);

  if (!Number.isInteger(jobCandidateId) || jobCandidateId <= 0 || !nextDecision) {
    return {
      success: false,
      message: "Feedback hoặc hồ sơ submission không hợp lệ.",
    };
  }

  const submission = await prisma.jobCandidate.findFirst({
    where: {
      id: jobCandidateId,
      ...withWorkspaceSubmissionAccess(session.workspaceId),
    },
    select: {
      id: true,
      candidate: { select: { fullName: true } },
      jobOrder: { select: { id: true, title: true } },
    },
  });

  if (!submission) {
    return {
      success: false,
      message: "Không tìm thấy submission trong workspace này.",
    };
  }

  const feedback = await prisma.submissionFeedback.create({
    data: {
      workspaceId: session.workspaceId,
      jobCandidateId: submission.id,
      authorPortalUserId: session.portalUserId,
      decision: nextDecision,
      message: normalizedMessage || null,
    },
  });

  await createAdminNotificationEventForAllAdmins({
    type: NotificationEventType.SUBMISSION_FEEDBACK_RECEIVED,
    entityType: "SubmissionFeedback",
    entityId: feedback.id,
    title: "Company Portal vừa gửi feedback",
    body: `${submission.candidate.fullName} - ${submission.jobOrder.title}`,
    href: `/jobs/${submission.jobOrder.id}`,
    severity: NotificationSeverity.INFO,
  });

  revalidatePath("/company/submissions");
  revalidatePath("/dashboard");
  revalidatePath(`/jobs/${submission.jobOrder.id}`);
  return {
    success: true,
    message: "Đã gửi feedback cho đội tuyển dụng.",
  };
}
