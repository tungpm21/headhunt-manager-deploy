"use server";

import {
  CandidateSeniority,
  FeeType,
  JobCandidateStage,
  JobStatus,
  SubmissionResult,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-log";
import { requireAdmin, requireViewerScope } from "@/lib/authz";
import { getClientById } from "@/lib/clients";
import {
  createJob,
  getJobBridgeSummary,
  getJobById,
  publishJobToFdiWork,
  searchAvailableCandidates,
  syncJobStatusToLinkedJobPostings,
  syncJobToLinkedJobPostings,
  updateJob,
  updateJobStatus,
} from "@/lib/jobs";
import { prisma } from "@/lib/prisma";
import { getFirstZodErrorMessage, jobFormSchema } from "@/lib/validation/forms";
import { CreateJobInput, UpdateJobInput } from "@/types/job";
import { dateVal, enumVal, intVal, strVal } from "@/lib/utils/form-helpers";

function parseRequiredSkills(value: FormDataEntryValue | null): string[] {
  const raw = value?.toString().trim();

  if (!raw) {
    return [];
  }

  return [...new Set(raw.split(",").map((skill) => skill.trim()).filter(Boolean))];
}

function parseJobInput(formData: FormData, clientId: number) {
  const salaryMinStr = formData.get("salaryMin")?.toString();
  const salaryMaxStr = formData.get("salaryMax")?.toString();
  const quantityStr = formData.get("quantity")?.toString();
  const feeStr = formData.get("fee")?.toString();

  return jobFormSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    clientId,
    description: strVal(formData.get("description")),
    industry: strVal(formData.get("industry")),
    location: strVal(formData.get("location")),
    requiredSkills: parseRequiredSkills(formData.get("requiredSkills")),
    salaryMin: salaryMinStr ? parseFloat(salaryMinStr) : undefined,
    salaryMax: salaryMaxStr ? parseFloat(salaryMaxStr) : undefined,
    quantity: quantityStr ? parseInt(quantityStr, 10) : 1,
    deadline: dateVal(formData.get("deadline")) ?? undefined,
    status: enumVal(formData.get("status"), Object.values(JobStatus)) || "OPEN",
    assignedToId: intVal(formData.get("assignedToId")) ?? undefined,
    fee: feeStr ? parseFloat(feeStr) : undefined,
    feeType: enumVal(formData.get("feeType"), Object.values(FeeType)),
    notes: strVal(formData.get("notes")),
  });
}

function canManageJob(
  scope: { isAdmin: boolean; userId: number },
  job: { createdById: number; assignedToId: number | null }
) {
  if (scope.isAdmin) {
    return true;
  }

  return job.createdById === scope.userId || job.assignedToId === scope.userId;
}

export async function createJobAction(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean; id?: number }> {
  try {
    const scope = await requireViewerScope();
    const userId = scope.userId;
    const clientId = intVal(formData.get("clientId")) ?? 0;

    if (!clientId) {
      return { error: "Doanh nghiệp là bắt buộc." };
    }

    const client = await getClientById(clientId, scope);

    if (!client) {
      return { error: "Không tìm thấy doanh nghiệp hoặc bạn không có quyền." };
    }

    const parsedInput = parseJobInput(formData, clientId);

    if (!parsedInput.success) {
      return { error: getFirstZodErrorMessage(parsedInput.error) };
    }

    const input: CreateJobInput = parsedInput.data;

    if (!scope.isAdmin) {
      input.assignedToId = userId;
    }

    if (!input.title) {
      return { error: "Vị trí tuyển dụng không được để trống." };
    }

    const job = await createJob(input, userId);
    revalidatePath("/jobs");
    return { success: true, id: job.id };
  } catch (error) {
    console.error("createJobAction error:", error);
    return { error: "Đã có lỗi xảy ra khi tạo Job Order." };
  }
}

export async function updateJobAction(
  id: number,
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const scope = await requireViewerScope();
    const clientId = intVal(formData.get("clientId")) ?? 0;

    if (!clientId) {
      return { error: "Doanh nghiệp là bắt buộc." };
    }

    const client = await getClientById(clientId, scope);

    if (!client) {
      return { error: "Không tìm thấy doanh nghiệp hoặc bạn không có quyền." };
    }

    const existingBridge = await getJobBridgeSummary(id, scope);

    if (!existingBridge) {
      return { error: "Khong tim thay job hoac ban khong co quyen." };
    }

    if (
      existingBridge.jobPostings.length > 0 &&
      existingBridge.client.id !== clientId
    ) {
      return {
        error:
          "Khong the doi doanh nghiep cua Job Order da link voi FDIWork. Hay tao job moi neu can publish cho doanh nghiep khac.",
      };
    }

    const parsedInput = parseJobInput(formData, clientId);

    if (!parsedInput.success) {
      return { error: getFirstZodErrorMessage(parsedInput.error) };
    }

    const input: UpdateJobInput = parsedInput.data;

    if (!scope.isAdmin) {
      input.assignedToId = scope.userId;
    }

    if (!input.title) {
      return { error: "Vị trí tuyển dụng không được để trống." };
    }

    await updateJob(id, input, scope);
    await syncJobToLinkedJobPostings(id, scope);
    if (input.status) {
      await syncJobStatusToLinkedJobPostings(id, input.status, scope);
    }
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/jobs");
    revalidatePath("/moderation");
    return { success: true };
  } catch (error) {
    console.error("updateJobAction error:", error);
    return { error: "Đã có lỗi xảy ra khi cập nhật Job Order." };
  }
}

export async function updateJobStatusAction(id: number, status: JobStatus) {
  try {
    const scope = await requireViewerScope();
    await updateJobStatus(id, status, scope);
    await syncJobStatusToLinkedJobPostings(id, status, scope);
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/jobs");
    revalidatePath("/moderation");
    return { success: true };
  } catch (error) {
    console.error("updateJobStatusAction error:", error);
    return { success: false, message: "Không thể cập nhật trạng thái." };
  }
}

export async function publishJobToFdiWorkAction(jobId: number) {
  try {
    const scope = await requireViewerScope();
    const posting = await publishJobToFdiWork(jobId, scope);

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/jobs");
    revalidatePath("/moderation");
    revalidatePath("/employers");

    return {
      success: true,
      message:
        "Da tao JobPosting tren FDIWork va gui vao hang cho moderation.",
      slug: posting.slug,
      postingId: posting.id,
    };
  } catch (error) {
    console.error("publishJobToFdiWorkAction error:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "FORBIDDEN_JOB":
          return {
            success: false,
            message: "Khong tim thay job hoac ban khong co quyen thao tac.",
          };
        case "JOB_ALREADY_PUBLISHED":
          return {
            success: false,
            message:
              "Job Order nay da duoc link voi JobPosting FDIWork truoc do.",
          };
        case "MISSING_EMPLOYER_LINK":
          return {
            success: false,
            message:
              "Client nay chua duoc link voi Employer FDIWork. Hay vao trang Employers de link truoc.",
          };
        case "EMPLOYER_NOT_ACTIVE":
          return {
            success: false,
            message:
              "Employer FDIWork dang o trang thai chua hoat dong, khong the publish.",
          };
        case "SUBSCRIPTION_NOT_ACTIVE":
          return {
            success: false,
            message:
              "Employer FDIWork chua co goi dich vu dang hoat dong hoac da het han.",
          };
        case "SUBSCRIPTION_QUOTA_EXCEEDED":
          return {
            success: false,
            message: "Employer FDIWork da het quota dang tin cua goi hien tai.",
          };
      }
    }

    return {
      success: false,
      message: "Khong the dang Job Order len FDIWork luc nay.",
    };
  }
}

export async function assignCandidateAction(jobOrderId: number, candidateId: number) {
  return assignMultipleCandidatesAction(jobOrderId, [candidateId]);
}

export async function assignMultipleCandidatesAction(
  jobOrderId: number,
  candidateIds: number[]
) {
  try {
    const scope = await requireViewerScope();
    const job = await getJobById(jobOrderId, scope);

    if (!job) {
      return { success: false, message: "Không tìm thấy job hoặc bạn không có quyền." };
    }

    const uniqueCandidateIds = [...new Set(candidateIds.filter((candidateId) => candidateId > 0))];

    if (uniqueCandidateIds.length === 0) {
      return { success: false, message: "Vui lòng chọn ít nhất một ứng viên." };
    }

    const accessibleCandidates = await prisma.candidate.findMany({
      where: {
        id: { in: uniqueCandidateIds },
        isDeleted: false,
        ...(!scope.isAdmin ? { createdById: scope.userId } : {}),
      },
      select: { id: true },
    });
    const accessibleCandidateIds = new Set(
      accessibleCandidates.map((candidate) => candidate.id)
    );

    const existingLinks = await prisma.jobCandidate.findMany({
      where: {
        jobOrderId,
        candidateId: { in: Array.from(accessibleCandidateIds) },
      },
      select: { candidateId: true },
    });

    const existingCandidateIds = new Set(existingLinks.map((link) => link.candidateId));
    const newCandidateIds = uniqueCandidateIds.filter(
      (candidateId) =>
        accessibleCandidateIds.has(candidateId) && !existingCandidateIds.has(candidateId)
    );

    if (newCandidateIds.length === 0) {
      return { success: false, message: "Khong co ung vien hop le de gan vao job nay." };
    }

    if (newCandidateIds.length === 0) {
      return { success: false, message: "Các ứng viên đã chọn đã có trong job." };
    }

    await prisma.jobCandidate.createMany({
      data: newCandidateIds.map((candidateId) => ({
        jobOrderId,
        candidateId,
        stage: "SOURCED",
        result: "PENDING",
      })),
      skipDuplicates: true,
    });

    revalidatePath(`/jobs/${jobOrderId}`);

    const skippedCount = uniqueCandidateIds.length - newCandidateIds.length;
    const message =
      skippedCount > 0
        ? `Đã gán ${newCandidateIds.length} ứng viên. Bỏ qua ${skippedCount} ứng viên đã tồn tại.`
        : `Đã gán ${newCandidateIds.length} ứng viên vào job.`;

    return {
      success: true,
      message,
      assignedCount: newCandidateIds.length,
      skippedCount,
    };
  } catch (error) {
    console.error("assignMultipleCandidatesAction error:", error);
    return { success: false, message: "Không thể gán ứng viên vào Job." };
  }
}

export async function updateCandidateStageAction(
  jobCandidateId: number,
  stage: JobCandidateStage,
  result?: SubmissionResult
) {
  try {
    const scope = await requireViewerScope();
    const userId = scope.userId;

    const currentJobCandidate = await prisma.jobCandidate.findUnique({
      where: { id: jobCandidateId },
      select: {
        id: true,
        stage: true,
        result: true,
        jobOrderId: true,
        candidateId: true,
        candidate: {
          select: {
            fullName: true,
          },
        },
        jobOrder: {
          select: {
            title: true,
            createdById: true,
            assignedToId: true,
          },
        },
      },
    });

    if (!currentJobCandidate) {
      return {
        success: false,
        message: "Không tìm thấy hồ sơ ứng tuyển để cập nhật.",
      };
    }

    if (!canManageJob(scope, currentJobCandidate.jobOrder)) {
      return {
        success: false,
        message: "Bạn không có quyền cập nhật pipeline của job này.",
      };
    }

    const nextResult =
      result ??
      (stage === "PLACED"
        ? "HIRED"
        : stage === "REJECTED"
          ? "REJECTED"
          : "PENDING");

    const jobCandidate = await prisma.jobCandidate.update({
      where: { id: jobCandidateId },
      data: {
        stage,
        result: nextResult,
      },
    });

    await logActivity("STAGE_CHANGE", "CANDIDATE", currentJobCandidate.candidateId, userId, {
      from: currentJobCandidate.stage,
      to: stage,
      result: nextResult,
      candidateName: currentJobCandidate.candidate.fullName,
      jobOrderId: currentJobCandidate.jobOrderId,
      jobTitle: currentJobCandidate.jobOrder.title,
    });

    revalidatePath(`/jobs/${jobCandidate.jobOrderId}`);
    revalidatePath("/dashboard");
    return { success: true, message: "Đã cập nhật trạng thái ứng tuyển." };
  } catch (error) {
    console.error("updateCandidateStageAction error:", error);
    return {
      success: false,
      message: "Không thể cập nhật trạng thái ứng tuyển.",
    };
  }
}

export async function updateCandidatePipelineAction(
  jobCandidateId: number,
  data: {
    stage?: JobCandidateStage;
    result?: SubmissionResult;
    interviewDate?: string | null;
    notes?: string | null;
  }
) {
  try {
    const scope = await requireViewerScope();

    const existingJobCandidate = await prisma.jobCandidate.findUnique({
      where: { id: jobCandidateId },
      select: {
        jobOrder: {
          select: {
            createdById: true,
            assignedToId: true,
          },
        },
      },
    });

    if (!existingJobCandidate || !canManageJob(scope, existingJobCandidate.jobOrder)) {
      return {
        success: false,
        message: "Bạn không có quyền cập nhật pipeline của job này.",
      };
    }

    const jobCandidate = await prisma.jobCandidate.update({
      where: { id: jobCandidateId },
      data: {
        ...(data.stage !== undefined && { stage: data.stage }),
        ...(data.result !== undefined && { result: data.result }),
        ...(data.interviewDate !== undefined && {
          interviewDate: data.interviewDate ? new Date(data.interviewDate) : null,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    revalidatePath(`/jobs/${jobCandidate.jobOrderId}`);
    return { success: true, message: "Đã cập nhật thông tin pipeline." };
  } catch (error) {
    console.error("updateCandidatePipelineAction error:", error);
    return {
      success: false,
      message: "Không thể cập nhật thông tin pipeline.",
    };
  }
}

export async function removeCandidateAction(jobOrderId: number, candidateId: number) {
  try {
    const scope = await requireViewerScope();
    const job = await getJobById(jobOrderId, scope);

    if (!job) {
      return { success: false, message: "Không tìm thấy job hoặc bạn không có quyền." };
    }

    await prisma.jobCandidate.delete({
      where: {
        jobOrderId_candidateId: { jobOrderId, candidateId },
      },
    });

    revalidatePath(`/jobs/${jobOrderId}`);
    return { success: true, message: "Đã gỡ ứng viên khỏi job." };
  } catch (error) {
    console.error("removeCandidateAction error:", error);
    return { success: false, message: "Không thể gỡ ứng viên khỏi Job." };
  }
}

export async function searchAvailableCandidatesAction(
  jobId: number,
  filters: {
    query?: string;
    level?: CandidateSeniority;
    skills?: string[];
    maxSalary?: number | null;
  } = {}
) {
  try {
    const scope = await requireViewerScope();
    return await searchAvailableCandidates(jobId, filters, scope);
  } catch (error) {
    console.error("searchAvailableCandidatesAction error:", error);
    return [];
  }
}
