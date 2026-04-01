"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/storage";
import {
  addCandidateCV,
  deleteCandidateCV,
  setPrimaryCV,
} from "@/lib/candidate-cv";
import {
  addLanguage,
  deleteLanguage,
  updateLanguage,
} from "@/lib/candidate-language";
import {
  addExperience,
  deleteExperience,
  updateExperience,
} from "@/lib/work-experience";

type ActionResult = { error?: string; success?: boolean };

const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_CV_SIZE_BYTES = 10 * 1024 * 1024;

async function getCurrentUserId(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return Number(session.user.id);
}

function strVal(value: FormDataEntryValue | null): string | undefined {
  const s = value?.toString().trim();
  return s || undefined;
}

function intVal(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value?.toString());
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function dateVal(value: FormDataEntryValue | null): Date | null {
  const raw = value?.toString().trim();
  return raw ? new Date(raw) : null;
}

function revalidateCandidatePaths(candidateId: number) {
  revalidatePath(`/candidates/${candidateId}`);
  revalidatePath(`/candidates/${candidateId}/edit`);
  revalidatePath("/candidates");
}

export async function addCandidateCVAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    const uploadedById = await getCurrentUserId();
    const candidateId = intVal(formData.get("candidateId"));
    const label = strVal(formData.get("label"));
    const file = formData.get("file");

    if (!candidateId) return { error: "Thiếu mã ứng viên." };
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Vui lòng chọn file CV." };
    }
    if (!ALLOWED_CV_TYPES.includes(file.type)) {
      return { error: "Chỉ chấp nhận file PDF hoặc Word (.doc, .docx)." };
    }
    if (file.size > MAX_CV_SIZE_BYTES) {
      return { error: "File quá lớn. Tối đa 10MB." };
    }

    const ext = file.name.split(".").pop() || "file";
    const safeName = `candidate-${candidateId}-${Date.now()}.${ext}`;
    const { url } = await uploadFile("cvs", safeName, file);

    await addCandidateCV({
      candidateId,
      fileUrl: url,
      fileName: file.name,
      label,
      uploadedById,
    });

    revalidateCandidatePaths(candidateId);
    return { success: true };
  } catch (e) {
    console.error("addCandidateCVAction error:", e);
    return { error: "Không thể tải CV lên. Vui lòng thử lại." };
  }
}

export async function setPrimaryCVAction(formData: FormData): Promise<ActionResult> {
  try {
    await getCurrentUserId();
    const cvId = intVal(formData.get("cvId"));
    const candidateId = intVal(formData.get("candidateId"));

    if (!cvId || !candidateId) return { error: "Thiếu dữ liệu CV." };

    const updated = await setPrimaryCV(cvId, candidateId);
    if (!updated) return { error: "Không tìm thấy CV cần đặt mặc định." };

    revalidateCandidatePaths(candidateId);
    return { success: true };
  } catch (e) {
    console.error("setPrimaryCVAction error:", e);
    return { error: "Không thể cập nhật CV mặc định." };
  }
}

export async function deleteCVAction(formData: FormData): Promise<ActionResult> {
  try {
    await getCurrentUserId();
    const cvId = intVal(formData.get("cvId"));

    if (!cvId) return { error: "Thiếu mã CV." };

    const deleted = await deleteCandidateCV(cvId);
    if (!deleted) return { error: "CV không tồn tại hoặc đã bị xoá." };

    revalidateCandidatePaths(deleted.candidateId);
    return { success: true };
  } catch (e) {
    console.error("deleteCVAction error:", e);
    return { error: "Không thể xoá CV." };
  }
}

export async function addLanguageAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    await getCurrentUserId();
    const candidateId = intVal(formData.get("candidateId"));
    const language = strVal(formData.get("language"));
    const level = strVal(formData.get("level"));
    const certificate = strVal(formData.get("certificate"));

    if (!candidateId) return { error: "Thiếu mã ứng viên." };
    if (!language) return { error: "Ngôn ngữ là bắt buộc." };

    await addLanguage({ candidateId, language, level, certificate });
    revalidateCandidatePaths(candidateId);
    return { success: true };
  } catch (e) {
    console.error("addLanguageAction error:", e);
    return { error: "Không thể thêm ngôn ngữ." };
  }
}

export async function updateLanguageAction(formData: FormData): Promise<ActionResult> {
  try {
    await getCurrentUserId();
    const id = intVal(formData.get("id"));
    const candidateId = intVal(formData.get("candidateId"));
    const language = strVal(formData.get("language"));
    const level = strVal(formData.get("level"));
    const certificate = strVal(formData.get("certificate"));

    if (!id || !candidateId) return { error: "Thiếu dữ liệu ngôn ngữ." };
    if (!language) return { error: "Ngôn ngữ là bắt buộc." };

    await updateLanguage(id, { language, level, certificate });
    revalidateCandidatePaths(candidateId);
    return { success: true };
  } catch (e) {
    console.error("updateLanguageAction error:", e);
    return { error: "Không thể cập nhật ngôn ngữ." };
  }
}

export async function deleteLanguageAction(formData: FormData): Promise<ActionResult> {
  try {
    await getCurrentUserId();
    const id = intVal(formData.get("id"));
    const candidateId = intVal(formData.get("candidateId"));

    if (!id || !candidateId) return { error: "Thiếu dữ liệu ngôn ngữ." };

    await deleteLanguage(id);
    revalidateCandidatePaths(candidateId);
    return { success: true };
  } catch (e) {
    console.error("deleteLanguageAction error:", e);
    return { error: "Không thể xoá ngôn ngữ." };
  }
}

export async function addExperienceAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    await getCurrentUserId();
    const candidateId = intVal(formData.get("candidateId"));
    const companyName = strVal(formData.get("companyName"));
    const position = strVal(formData.get("position"));
    const startDate = dateVal(formData.get("startDate"));
    const endDate = dateVal(formData.get("endDate"));
    const isCurrent = formData.get("isCurrent") === "on";
    const notes = strVal(formData.get("notes"));

    if (!candidateId) return { error: "Thiếu mã ứng viên." };
    if (!companyName) return { error: "Tên công ty là bắt buộc." };
    if (!position) return { error: "Vị trí là bắt buộc." };
    if (startDate && endDate && startDate > endDate) {
      return { error: "Ngày bắt đầu không được sau ngày kết thúc." };
    }

    await addExperience({
      candidateId,
      companyName,
      position,
      startDate,
      endDate,
      isCurrent,
      notes,
    });

    revalidateCandidatePaths(candidateId);
    return { success: true };
  } catch (e) {
    console.error("addExperienceAction error:", e);
    return { error: "Không thể thêm kinh nghiệm làm việc." };
  }
}

export async function updateExperienceAction(formData: FormData): Promise<ActionResult> {
  try {
    await getCurrentUserId();
    const id = intVal(formData.get("id"));
    const candidateId = intVal(formData.get("candidateId"));
    const companyName = strVal(formData.get("companyName"));
    const position = strVal(formData.get("position"));
    const startDate = dateVal(formData.get("startDate"));
    const endDate = dateVal(formData.get("endDate"));
    const isCurrent = formData.get("isCurrent") === "on";
    const notes = strVal(formData.get("notes"));

    if (!id || !candidateId) return { error: "Thiếu dữ liệu kinh nghiệm." };
    if (!companyName) return { error: "Tên công ty là bắt buộc." };
    if (!position) return { error: "Vị trí là bắt buộc." };
    if (startDate && endDate && startDate > endDate) {
      return { error: "Ngày bắt đầu không được sau ngày kết thúc." };
    }

    await updateExperience(id, {
      companyName,
      position,
      startDate,
      endDate,
      isCurrent,
      notes,
    });

    revalidateCandidatePaths(candidateId);
    return { success: true };
  } catch (e) {
    console.error("updateExperienceAction error:", e);
    return { error: "Không thể cập nhật kinh nghiệm làm việc." };
  }
}

export async function deleteExperienceAction(formData: FormData): Promise<ActionResult> {
  try {
    await getCurrentUserId();
    const id = intVal(formData.get("id"));
    const candidateId = intVal(formData.get("candidateId"));

    if (!id || !candidateId) return { error: "Thiếu dữ liệu kinh nghiệm." };

    await deleteExperience(id);
    revalidateCandidatePaths(candidateId);
    return { success: true };
  } catch (e) {
    console.error("deleteExperienceAction error:", e);
    return { error: "Không thể xoá kinh nghiệm làm việc." };
  }
}
