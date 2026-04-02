"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function searchOpenJobsAction(query = "") {
  try {
    await requireAdmin();

    const normalizedQuery = query.trim();

    return await prisma.jobOrder.findMany({
      where: {
        status: "OPEN",
        OR: normalizedQuery
          ? [
              { title: { contains: normalizedQuery, mode: "insensitive" } },
              {
                client: {
                  companyName: { contains: normalizedQuery, mode: "insensitive" },
                },
              },
            ]
          : undefined,
      },
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
  } catch (error) {
    console.error("searchOpenJobsAction error:", error);
    return [];
  }
}

export async function bulkAssignToJob(candidateIds: number[], jobOrderId: number) {
  try {
    await requireAdmin();

    if (candidateIds.length === 0) {
      return { success: false, message: "Chưa chọn ứng viên để gán." };
    }

    const existing = await prisma.jobCandidate.findMany({
      where: {
        jobOrderId,
        candidateId: { in: candidateIds },
      },
      select: { candidateId: true },
    });

    const existingIds = new Set(existing.map((item) => item.candidateId));
    const newCandidateIds = candidateIds.filter((id) => !existingIds.has(id));

    if (newCandidateIds.length === 0) {
      return {
        success: false,
        message: "Tất cả ứng viên đã có trong job này.",
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
    await requireAdmin();

    if (candidateIds.length === 0) {
      return { success: false, message: "Chưa chọn ứng viên để gắn tag." };
    }

    await prisma.candidateTag.createMany({
      data: candidateIds.map((candidateId) => ({ candidateId, tagId })),
      skipDuplicates: true,
    });

    revalidatePath("/candidates");
    return {
      success: true,
      message: `Đã gắn tag cho ${candidateIds.length} ứng viên.`,
    };
  } catch (error) {
    console.error("bulkAddTag error:", error);
    return {
      success: false,
      message: "Không thể gắn tag hàng loạt.",
    };
  }
}
