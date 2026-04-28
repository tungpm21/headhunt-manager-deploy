"use server";

import { SubmissionFeedbackDecision } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
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
    select: { id: true },
  });

  if (!submission) {
    return {
      success: false,
      message: "Không tìm thấy submission trong workspace này.",
    };
  }

  await prisma.submissionFeedback.create({
    data: {
      workspaceId: session.workspaceId,
      jobCandidateId: submission.id,
      authorPortalUserId: session.portalUserId,
      decision: nextDecision,
      message: normalizedMessage || null,
    },
  });

  revalidatePath("/company/submissions");
  return {
    success: true,
    message: "Đã gửi feedback cho đội tuyển dụng.",
  };
}
