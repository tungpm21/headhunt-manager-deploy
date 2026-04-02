"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { createJob, searchAvailableCandidates, updateJob, updateJobStatus } from "@/lib/jobs";
import { prisma } from "@/lib/prisma";
import {
  CreateJobInput,
  FeeType,
  JobCandidateStage,
  JobStatus,
  SubmissionResult,
  UpdateJobInput,
} from "@/types/job";

function enumVal<T>(value: FormDataEntryValue | null): T | undefined {
  const normalized = value?.toString()?.trim();
  return normalized ? (normalized as T) : undefined;
}

function strVal(value: FormDataEntryValue | null): string | undefined {
  const normalized = value?.toString()?.trim();
  return normalized || undefined;
}

export async function createJobAction(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean; id?: number }> {
  try {
    const { userId } = await requireAdmin();

    const clientIdStr = formData.get("clientId")?.toString();
    const clientId = clientIdStr ? parseInt(clientIdStr, 10) : 0;
    if (!clientId) return { error: "Doanh nghiệp là bắt buộc." };

    const salaryMinStr = formData.get("salaryMin")?.toString();
    const salaryMaxStr = formData.get("salaryMax")?.toString();
    const quantityStr = formData.get("quantity")?.toString();
    const feeStr = formData.get("fee")?.toString();
    const deadlineStr = strVal(formData.get("deadline"));

    const input: CreateJobInput = {
      title: String(formData.get("title") ?? "").trim(),
      clientId,
      description: strVal(formData.get("description")),
      salaryMin: salaryMinStr ? parseFloat(salaryMinStr) : undefined,
      salaryMax: salaryMaxStr ? parseFloat(salaryMaxStr) : undefined,
      quantity: quantityStr ? parseInt(quantityStr, 10) : 1,
      deadline: deadlineStr ? new Date(deadlineStr) : undefined,
      status: enumVal<JobStatus>(formData.get("status")) || "OPEN",
      fee: feeStr ? parseFloat(feeStr) : undefined,
      feeType: enumVal<FeeType>(formData.get("feeType")),
      notes: strVal(formData.get("notes")),
    };

    if (!input.title) return { error: "Vị trí tuyển dụng không được để trống." };

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
    await requireAdmin();

    const clientIdStr = formData.get("clientId")?.toString();
    const clientId = clientIdStr ? parseInt(clientIdStr, 10) : 0;
    if (!clientId) return { error: "Doanh nghiệp là bắt buộc." };

    const salaryMinStr = formData.get("salaryMin")?.toString();
    const salaryMaxStr = formData.get("salaryMax")?.toString();
    const quantityStr = formData.get("quantity")?.toString();
    const feeStr = formData.get("fee")?.toString();
    const deadlineStr = strVal(formData.get("deadline"));

    const input: UpdateJobInput = {
      title: String(formData.get("title") ?? "").trim(),
      clientId,
      description: strVal(formData.get("description")),
      salaryMin: salaryMinStr ? parseFloat(salaryMinStr) : undefined,
      salaryMax: salaryMaxStr ? parseFloat(salaryMaxStr) : undefined,
      quantity: quantityStr ? parseInt(quantityStr, 10) : 1,
      deadline: deadlineStr ? new Date(deadlineStr) : undefined,
      status: enumVal<JobStatus>(formData.get("status")) || "OPEN",
      fee: feeStr ? parseFloat(feeStr) : undefined,
      feeType: enumVal<FeeType>(formData.get("feeType")),
      notes: strVal(formData.get("notes")),
    };

    if (!input.title) return { error: "Vị trí tuyển dụng không được để trống." };

    await updateJob(id, input);
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/jobs");
    return { success: true };
  } catch (error) {
    console.error("updateJobAction error:", error);
    return { error: "Đã có lỗi xảy ra khi cập nhật Job Order." };
  }
}

export async function updateJobStatusAction(id: number, status: JobStatus) {
  try {
    await requireAdmin();
    await updateJobStatus(id, status);
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/jobs");
    return { success: true };
  } catch (error) {
    console.error("updateJobStatusAction error:", error);
    return { success: false, message: "Không thể cập nhật trạng thái." };
  }
}

export async function assignCandidateAction(jobOrderId: number, candidateId: number) {
  try {
    await requireAdmin();

    const existing = await prisma.jobCandidate.findUnique({
      where: {
        jobOrderId_candidateId: {
          jobOrderId,
          candidateId,
        },
      },
    });

    if (existing) {
      return { success: false, message: "Ứng viên này đã có trong job." };
    }

    await prisma.jobCandidate.create({
      data: {
        jobOrderId,
        candidateId,
        stage: "SOURCED",
      },
    });

    revalidatePath(`/jobs/${jobOrderId}`);
    return { success: true, message: "Đã gán ứng viên vào job." };
  } catch (error) {
    console.error("assignCandidateAction error:", error);
    return { success: false, message: "Không thể gán ứng viên vào Job." };
  }
}

export async function updateCandidateStageAction(
  jobCandidateId: number,
  stage: JobCandidateStage,
  result?: SubmissionResult
) {
  try {
    await requireAdmin();

    const currentJobCandidate = await prisma.jobCandidate.findUnique({
      where: { id: jobCandidateId },
      select: { jobOrderId: true },
    });

    if (!currentJobCandidate) {
      return {
        success: false,
        message: "Không tìm thấy hồ sơ ứng tuyển để cập nhật.",
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

    revalidatePath(`/jobs/${jobCandidate.jobOrderId}`);
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
    await requireAdmin();

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
    await requireAdmin();

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

export async function searchAvailableCandidatesAction(jobId: number, query: string = "") {
  try {
    await requireAdmin();
    return await searchAvailableCandidates(jobId, query);
  } catch (error) {
    console.error("searchAvailableCandidatesAction error:", error);
    return [];
  }
}
