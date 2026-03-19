"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createJob, updateJob, updateJobStatus, searchAvailableCandidates } from "@/lib/jobs";
import { prisma } from "@/lib/prisma";
import { JobStatus, FeeType, JobCandidateStage, CreateJobInput, UpdateJobInput } from "@/types/job";

async function getCurrentUserId(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return Number(session.user.id);
}

function enumVal<T>(value: FormDataEntryValue | null): T | undefined {
  const s = value?.toString()?.trim();
  return s ? (s as T) : undefined;
}

function strVal(value: FormDataEntryValue | null): string | undefined {
  const s = value?.toString()?.trim();
  return s || undefined;
}

// ============================================================
// Job Actions
// ============================================================

export async function createJobAction(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean; id?: number }> {
  try {
    const userId = await getCurrentUserId();

    const clientIdStr = formData.get("clientId")?.toString();
    const clientId = clientIdStr ? parseInt(clientIdStr) : 0;
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
      quantity: quantityStr ? parseInt(quantityStr) : 1,
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
  } catch (e) {
    console.error("createJobAction error:", e);
    return { error: "Đã có lỗi xảy ra khi tạo Job Order." };
  }
}

export async function updateJobAction(
  id: number,
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const clientIdStr = formData.get("clientId")?.toString();
    const clientId = clientIdStr ? parseInt(clientIdStr) : 0;
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
      quantity: quantityStr ? parseInt(quantityStr) : 1,
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
  } catch (e) {
    console.error("updateJobAction error:", e);
    return { error: "Đã có lỗi xảy ra khi cập nhật Job Order." };
  }
}

export async function updateJobStatusAction(id: number, status: JobStatus) {
  try {
    await updateJobStatus(id, status);
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/jobs");
    return { success: true };
  } catch (e) {
    console.error("updateJobStatusAction error:", e);
    return { error: "Không thể cập nhật trạng thái." };
  }
}

// ============================================================
// Job Pipeline Actions
// ============================================================

export async function assignCandidateAction(jobOrderId: number, candidateId: number) {
  try {
    await prisma.jobCandidate.create({
      data: {
        jobOrderId,
        candidateId,
        stage: "SOURCED",
      },
    });
    revalidatePath(`/jobs/${jobOrderId}`);
    return { success: true };
  } catch (e) {
    console.error("assignCandidateAction error:", e);
    return { error: "Không thể gán ứng viên vào Job." };
  }
}

export async function updateCandidateStageAction(jobCandidateId: number, stage: JobCandidateStage) {
  try {
    const jc = await prisma.jobCandidate.update({
      where: { id: jobCandidateId },
      data: { stage },
    });
    revalidatePath(`/jobs/${jc.jobOrderId}`);
    return { success: true };
  } catch (e) {
    console.error("updateCandidateStageAction error:", e);
    return { error: "Không thể cập nhật trạng thái ứng tuyển." };
  }
}

export async function removeCandidateAction(jobOrderId: number, candidateId: number) {
  try {
    await prisma.jobCandidate.delete({
      where: {
        jobOrderId_candidateId: { jobOrderId, candidateId },
      },
    });
    revalidatePath(`/jobs/${jobOrderId}`);
    return { success: true };
  } catch (e) {
    console.error("removeCandidateAction error:", e);
    return { error: "Không thể gỡ ứng viên khỏi Job." };
  }
}

export async function searchAvailableCandidatesAction(jobId: number, query: string = "") {
  try {
    return await searchAvailableCandidates(jobId, query);
  } catch (e) {
    console.error("searchAvailableCandidatesAction error:", e);
    return [];
  }
}
