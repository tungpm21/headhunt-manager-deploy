"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireViewerScope } from "@/lib/authz";
import { checkDuplicate } from "@/lib/candidates";

type JobSearchOption = {
  id: number;
  title: string;
  status: string;
  client: {
    companyName: string;
  };
};

export async function searchOpenJobsAction(query = ""): Promise<JobSearchOption[]> {
  try {
    const scope = await requireViewerScope();
    const normalizedQuery = query.trim();
    const where: Prisma.JobOrderWhereInput = { status: "OPEN" };
    const andWhere: Prisma.JobOrderWhereInput[] = [];

    if (!scope.isAdmin) {
      andWhere.push({
        OR: [{ createdById: scope.userId }, { assignedToId: scope.userId }],
      });
    }

    if (normalizedQuery) {
      andWhere.push({
        OR: [
          { title: { contains: normalizedQuery, mode: Prisma.QueryMode.insensitive } },
          {
            client: {
              companyName: {
                contains: normalizedQuery,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        ],
      });
    }

    if (andWhere.length > 0) {
      where.AND = andWhere;
    }

    const jobs = await prisma.jobOrder.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        client: {
          select: {
            companyName: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    return jobs.map((job) => ({
      id: job.id,
      title: job.title,
      status: job.status,
      client: {
        companyName: job.client.companyName,
      },
    }));
  } catch (error) {
    console.error("searchOpenJobsAction error:", error);
    return [];
  }
}

export async function bulkAssignToJob(candidateIds: number[], jobOrderId: number) {
  try {
    const scope = await requireViewerScope();

    if (candidateIds.length === 0) {
      return { success: false, message: "Chưa chọn ứng viên để gán." };
    }

    const accessibleJob = await prisma.jobOrder.findFirst({
      where: {
        id: jobOrderId,
        ...(!scope.isAdmin
          ? { OR: [{ createdById: scope.userId }, { assignedToId: scope.userId }] }
          : {}),
      },
      select: { id: true },
    });

    if (!accessibleJob) {
      return { success: false, message: "Không tìm thấy job hoặc bạn không có quyền." };
    }

    const accessibleCandidates = await prisma.candidate.findMany({
      where: {
        id: { in: candidateIds },
        isDeleted: false,
        ...(!scope.isAdmin ? { createdById: scope.userId } : {}),
      },
      select: { id: true },
    });
    const accessibleCandidateIds = accessibleCandidates.map((candidate) => candidate.id);

    if (accessibleCandidateIds.length === 0) {
      return { success: false, message: "Không có ứng viên hợp lệ để gán." };
    }

    const existing = await prisma.jobCandidate.findMany({
      where: {
        jobOrderId,
        candidateId: { in: accessibleCandidateIds },
      },
      select: { candidateId: true },
    });

    const existingIds = new Set(existing.map((item) => item.candidateId));
    const newCandidateIds = accessibleCandidateIds.filter((id) => !existingIds.has(id));

    if (newCandidateIds.length === 0) {
      return {
        success: false,
        message: "Tất cả ứng viên hợp lệ đã có trong job này.",
      };
    }

    await prisma.jobCandidate.createMany({
      data: newCandidateIds.map((candidateId) => ({
        jobOrderId,
        candidateId,
        stage: "SOURCED",
      })),
      skipDuplicates: true,
    });

    revalidatePath(`/jobs/${jobOrderId}`);
    revalidatePath("/candidates");

    return {
      success: true,
      message: `Đã gán ${newCandidateIds.length} ứng viên vào job.`,
      skipped: existingIds.size,
    };
  } catch (error) {
    console.error("bulkAssignToJob error:", error);
    return {
      success: false,
      message: "Không thể gán ứng viên vào job.",
    };
  }
}

export async function bulkAddTag(candidateIds: number[], tagId: number) {
  try {
    const scope = await requireViewerScope();

    if (candidateIds.length === 0) {
      return { success: false, message: "Chưa chọn ứng viên để gán tag." };
    }

    const accessibleCandidates = await prisma.candidate.findMany({
      where: {
        id: { in: candidateIds },
        isDeleted: false,
        ...(!scope.isAdmin ? { createdById: scope.userId } : {}),
      },
      select: { id: true },
    });
    const accessibleCandidateIds = accessibleCandidates.map((candidate) => candidate.id);

    if (accessibleCandidateIds.length === 0) {
      return { success: false, message: "Không có ứng viên hợp lệ để gán tag." };
    }

    await prisma.candidateTag.createMany({
      data: accessibleCandidateIds.map((candidateId) => ({ candidateId, tagId })),
      skipDuplicates: true,
    });

    revalidatePath("/candidates");
    return {
      success: true,
      message: `Đã gán tag cho ${accessibleCandidateIds.length} ứng viên.`,
    };
  } catch (error) {
    console.error("bulkAddTag error:", error);
    return {
      success: false,
      message: "Không thể gán tag hàng loạt.",
    };
  }
}

export async function checkDuplicateAction(
  email?: string,
  phone?: string,
  excludeId?: number
) {
  try {
    await requireViewerScope();
    return await checkDuplicate(email, phone, excludeId);
  } catch (error) {
    console.error("checkDuplicateAction error:", error);
    return null;
  }
}
