"use server";

import { ApplicationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { prisma } from "@/lib/prisma";
import { withWorkspaceApplicationAccess } from "@/lib/workspace";

const VALID_APPLICATION_STATUSES = new Set<ApplicationStatus>(
  Object.values(ApplicationStatus)
);

export async function updateCompanyApplicationStatusAction(
  applicationId: number,
  status: string
): Promise<{ success: boolean; message: string; status?: ApplicationStatus }> {
  const session = await requireCompanyPortalSession();

  if (!session.capabilities.employer) {
    return {
      success: false,
      message: "Workspace chưa liên kết Employer.",
    };
  }

  const nextStatus = VALID_APPLICATION_STATUSES.has(status as ApplicationStatus)
    ? (status as ApplicationStatus)
    : null;

  if (!Number.isInteger(applicationId) || applicationId <= 0 || !nextStatus) {
    return {
      success: false,
      message: "Trạng thái hoặc hồ sơ ứng tuyển không hợp lệ.",
    };
  }

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      ...withWorkspaceApplicationAccess(session.workspaceId),
    },
    select: { id: true },
  });

  if (!application) {
    return {
      success: false,
      message: "Không tìm thấy hồ sơ ứng tuyển trong workspace này.",
    };
  }

  await prisma.application.update({
    where: { id: application.id },
    data: { status: nextStatus },
  });

  revalidatePath("/company/applications");
  revalidatePath("/company/dashboard");

  return {
    success: true,
    message: "Đã cập nhật trạng thái ứng tuyển.",
    status: nextStatus,
  };
}
