"use server";

import { revalidatePath } from "next/cache";
import { requireViewerScope } from "@/lib/authz";
import {
  addCandidateCV,
  deleteCandidateCV,
  setPrimaryCV,
} from "@/lib/candidate-cv";
import { getCandidateById } from "@/lib/candidates";
import {
  addLanguage,
  deleteLanguage,
  updateLanguage,
} from "@/lib/candidate-language";
import { uploadFile } from "@/lib/storage";
import {
  candidateLanguageSchema,
  getFirstZodErrorMessage,
  workExperienceSchema,
} from "@/lib/validation/forms";
import {
  addExperience,
  deleteExperience,
  updateExperience,
} from "@/lib/work-experience";
import { dateVal, intVal, strVal } from "@/lib/utils/form-helpers";

type ActionResult = { error?: string; success?: boolean };

const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_CV_SIZE_BYTES = 10 * 1024 * 1024;

function revalidateCandidatePaths(candidateId: number) {
  revalidatePath(`/candidates/${candidateId}`);
  revalidatePath(`/candidates/${candidateId}/edit`);
  revalidatePath("/candidates");
}

async function ensureCandidateAccess(candidateId: number) {
  const scope = await requireViewerScope();
  const candidate = await getCandidateById(candidateId, scope);

  if (!candidate) {
    return null;
  }

  return {
    scope,
    candidate,
  };
}

export async function addCandidateCVAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    const candidateId = intVal(formData.get("candidateId"));
    const label = strVal(formData.get("label"));
    const file = formData.get("file");

    if (!candidateId) {
      return { error: "Thieu ma ung vien." };
    }

    const access = await ensureCandidateAccess(candidateId);
    if (!access) {
      return { error: "Ban khong co quyen cap nhat ung vien nay." };
    }

    if (!(file instanceof File) || file.size === 0) {
      return { error: "Vui long chon file CV." };
    }

    if (!ALLOWED_CV_TYPES.includes(file.type)) {
      return { error: "Chi chap nhan file PDF hoac Word (.doc, .docx)." };
    }

    if (file.size > MAX_CV_SIZE_BYTES) {
      return { error: "File qua lon. Toi da 10MB." };
    }

    const ext = file.name.split(".").pop() || "file";
    const safeName = `candidate-${candidateId}-${Date.now()}.${ext}`;
    const { url } = await uploadFile("cvs", safeName, file);

    await addCandidateCV({
      candidateId,
      fileUrl: url,
      fileName: file.name,
      label,
      uploadedById: access.scope.userId,
    });

    revalidateCandidatePaths(candidateId);
    return { success: true };
  } catch (error) {
    console.error("addCandidateCVAction error:", error);
    return { error: "Khong the tai CV len. Vui long thu lai." };
  }
}

export async function setPrimaryCVAction(formData: FormData): Promise<ActionResult> {
  try {
    const cvId = intVal(formData.get("cvId"));
    const candidateId = intVal(formData.get("candidateId"));

    if (!cvId || !candidateId) {
      return { error: "Thieu du lieu CV." };
    }

    const access = await ensureCandidateAccess(candidateId);
    if (!access) {
      return { error: "Ban khong co quyen cap nhat ung vien nay." };
    }

    const updated = await setPrimaryCV(cvId, candidateId);
    if (!updated) {
      return { error: "Khong tim thay CV can dat mac dinh." };
    }

    revalidateCandidatePaths(candidateId);
    return { success: true };
  } catch (error) {
    console.error("setPrimaryCVAction error:", error);
    return { error: "Khong the cap nhat CV mac dinh." };
  }
}

export async function deleteCVAction(formData: FormData): Promise<ActionResult> {
  try {
    const cvId = intVal(formData.get("cvId"));
    const candidateId = intVal(formData.get("candidateId"));

    if (!cvId || !candidateId) {
      return { error: "Thieu du lieu CV." };
    }

    const access = await ensureCandidateAccess(candidateId);
    if (!access) {
      return { error: "Ban khong co quyen cap nhat ung vien nay." };
    }

    const deleted = await deleteCandidateCV(cvId);
    if (!deleted || deleted.candidateId !== candidateId) {
      return { error: "CV khong ton tai hoac da bi xoa." };
    }

    revalidateCandidatePaths(candidateId);
    return { success: true };
  } catch (error) {
    console.error("deleteCVAction error:", error);
    return { error: "Khong the xoa CV." };
  }
}

export async function addLanguageAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    const validated = candidateLanguageSchema.safeParse({
      candidateId: intVal(formData.get("candidateId")),
      language: strVal(formData.get("language")),
      level: strVal(formData.get("level")),
      certificate: strVal(formData.get("certificate")),
    });

    if (!validated.success) {
      return { error: getFirstZodErrorMessage(validated.error) };
    }

    const access = await ensureCandidateAccess(validated.data.candidateId);
    if (!access) {
      return { error: "Ban khong co quyen cap nhat ung vien nay." };
    }

    await addLanguage(validated.data);
    revalidateCandidatePaths(validated.data.candidateId);
    return { success: true };
  } catch (error) {
    console.error("addLanguageAction error:", error);
    return { error: "Khong the them ngon ngu." };
  }
}

export async function updateLanguageAction(formData: FormData): Promise<ActionResult> {
  try {
    const id = intVal(formData.get("id"));
    const validated = candidateLanguageSchema.safeParse({
      candidateId: intVal(formData.get("candidateId")),
      language: strVal(formData.get("language")),
      level: strVal(formData.get("level")),
      certificate: strVal(formData.get("certificate")),
    });

    if (!id) {
      return { error: "Thieu du lieu ngon ngu." };
    }

    if (!validated.success) {
      return { error: getFirstZodErrorMessage(validated.error) };
    }

    const access = await ensureCandidateAccess(validated.data.candidateId);
    if (!access) {
      return { error: "Ban khong co quyen cap nhat ung vien nay." };
    }

    await updateLanguage(id, {
      language: validated.data.language,
      level: validated.data.level,
      certificate: validated.data.certificate,
    });
    revalidateCandidatePaths(validated.data.candidateId);
    return { success: true };
  } catch (error) {
    console.error("updateLanguageAction error:", error);
    return { error: "Khong the cap nhat ngon ngu." };
  }
}

export async function deleteLanguageAction(formData: FormData): Promise<ActionResult> {
  try {
    const id = intVal(formData.get("id"));
    const candidateId = intVal(formData.get("candidateId"));

    if (!id || !candidateId) {
      return { error: "Thieu du lieu ngon ngu." };
    }

    const access = await ensureCandidateAccess(candidateId);
    if (!access) {
      return { error: "Ban khong co quyen cap nhat ung vien nay." };
    }

    await deleteLanguage(id, candidateId);
    revalidateCandidatePaths(candidateId);
    return { success: true };
  } catch (error) {
    console.error("deleteLanguageAction error:", error);
    return { error: "Khong the xoa ngon ngu." };
  }
}

export async function addExperienceAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  try {
    const validated = workExperienceSchema.safeParse({
      candidateId: intVal(formData.get("candidateId")),
      companyName: strVal(formData.get("companyName")),
      position: strVal(formData.get("position")),
      startDate: dateVal(formData.get("startDate")) ?? null,
      endDate: dateVal(formData.get("endDate")) ?? null,
      isCurrent: formData.get("isCurrent") === "on",
      notes: strVal(formData.get("notes")),
    });

    if (!validated.success) {
      return { error: getFirstZodErrorMessage(validated.error) };
    }

    const access = await ensureCandidateAccess(validated.data.candidateId);
    if (!access) {
      return { error: "Ban khong co quyen cap nhat ung vien nay." };
    }

    await addExperience(validated.data);
    revalidateCandidatePaths(validated.data.candidateId);
    return { success: true };
  } catch (error) {
    console.error("addExperienceAction error:", error);
    return { error: "Khong the them kinh nghiem lam viec." };
  }
}

export async function updateExperienceAction(formData: FormData): Promise<ActionResult> {
  try {
    const id = intVal(formData.get("id"));
    const validated = workExperienceSchema.safeParse({
      candidateId: intVal(formData.get("candidateId")),
      companyName: strVal(formData.get("companyName")),
      position: strVal(formData.get("position")),
      startDate: dateVal(formData.get("startDate")) ?? null,
      endDate: dateVal(formData.get("endDate")) ?? null,
      isCurrent: formData.get("isCurrent") === "on",
      notes: strVal(formData.get("notes")),
    });

    if (!id) {
      return { error: "Thieu du lieu kinh nghiem." };
    }

    if (!validated.success) {
      return { error: getFirstZodErrorMessage(validated.error) };
    }

    const access = await ensureCandidateAccess(validated.data.candidateId);
    if (!access) {
      return { error: "Ban khong co quyen cap nhat ung vien nay." };
    }

    await updateExperience(id, {
      companyName: validated.data.companyName,
      position: validated.data.position,
      startDate: validated.data.startDate,
      endDate: validated.data.endDate,
      isCurrent: validated.data.isCurrent,
      notes: validated.data.notes,
    });

    revalidateCandidatePaths(validated.data.candidateId);
    return { success: true };
  } catch (error) {
    console.error("updateExperienceAction error:", error);
    return { error: "Khong the cap nhat kinh nghiem lam viec." };
  }
}

export async function deleteExperienceAction(formData: FormData): Promise<ActionResult> {
  try {
    const id = intVal(formData.get("id"));
    const candidateId = intVal(formData.get("candidateId"));

    if (!id || !candidateId) {
      return { error: "Thieu du lieu kinh nghiem." };
    }

    const access = await ensureCandidateAccess(candidateId);
    if (!access) {
      return { error: "Ban khong co quyen cap nhat ung vien nay." };
    }

    await deleteExperience(id, candidateId);
    revalidateCandidatePaths(candidateId);
    return { success: true };
  } catch (error) {
    console.error("deleteExperienceAction error:", error);
    return { error: "Khong the xoa kinh nghiem lam viec." };
  }
}
