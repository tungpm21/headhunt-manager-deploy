"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCandidate,
  updateCandidate,
  softDeleteCandidate,
  addCandidateNote,
  addTagToCandidate,
  removeTagFromCandidate,
} from "@/lib/candidates";
import { createTag } from "@/lib/tags";
import { CreateCandidateInput, UpdateCandidateInput, CandidateStatus, CandidateSource, Gender } from "@/types/candidate";

// ============================================================
// Auth
// ============================================================
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email hoặc mật khẩu không đúng.";
        default:
          return "Đã có lỗi xảy ra.";
      }
    }
    throw error;
  }
}

// ============================================================
// Helper: get current user ID from session
// ============================================================
async function getCurrentUserId(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return Number(session.user.id);
}

/** Convert empty-string form values to undefined for optional enum fields */
function enumVal<T>(value: FormDataEntryValue | null): T | undefined {
  const s = value?.toString()?.trim();
  return s ? (s as T) : undefined;
}

function strVal(value: FormDataEntryValue | null): string | undefined {
  const s = value?.toString()?.trim();
  return s || undefined;
}

/** Convert empty-string form values to null for optional nullable DB fields */
function strNull(value: FormDataEntryValue | null): string | null {
  const s = value?.toString()?.trim();
  return s || null;
}

// ============================================================
// Candidate Actions
// ============================================================

export async function createCandidateAction(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean; id?: number }> {
  try {
    const userId = await getCurrentUserId();

    const tagIdsRaw = formData.getAll("tagIds");
    const tagIds = tagIdsRaw
      .map((v) => Number(v))
      .filter((v) => !isNaN(v) && v > 0);

    const yearsOfExpRaw = formData.get("yearsOfExp")?.toString().trim();
    const currentSalaryRaw = formData.get("currentSalary")?.toString().trim();
    const expectedSalaryRaw = formData.get("expectedSalary")?.toString().trim();
    const dateOfBirthRaw = formData.get("dateOfBirth")?.toString().trim();

    const input: CreateCandidateInput = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      phone: strVal(formData.get("phone")),
      email: strVal(formData.get("email")),
      dateOfBirth: dateOfBirthRaw ? new Date(dateOfBirthRaw) : undefined,
      gender: enumVal<Gender>(formData.get("gender")),
      address: strVal(formData.get("address")),
      currentPosition: strVal(formData.get("currentPosition")),
      currentCompany: strVal(formData.get("currentCompany")),
      industry: strVal(formData.get("industry")),
      yearsOfExp: yearsOfExpRaw ? Number(yearsOfExpRaw) : undefined,
      currentSalary: currentSalaryRaw ? Number(currentSalaryRaw) : undefined,
      expectedSalary: expectedSalaryRaw ? Number(expectedSalaryRaw) : undefined,
      location: strVal(formData.get("location")),
      status: enumVal<CandidateStatus>(formData.get("status")),
      source: enumVal<CandidateSource>(formData.get("source")),
      sourceDetail: strVal(formData.get("sourceDetail")),
      avatarUrl: strNull(formData.get("avatarUrl")),
      tagIds,
    };

    // Required fields validation
    if (!input.fullName) return { error: "Họ và tên không được để trống." };
    if (!input.email && !input.phone) return { error: "Vui lòng nhập Email hoặc Số điện thoại." };
    if (!input.location) return { error: "Khu vực là bắt buộc." };
    if (!input.industry) return { error: "Ngành nghề là bắt buộc." };
    if (!input.status) return { error: "Trạng thái là bắt buộc." };

    const candidate = await createCandidate(input, userId);
    revalidatePath("/candidates");
    return { success: true, id: candidate.id };
  } catch (e) {
    console.error("createCandidateAction error:", e);
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." };
  }
}

export async function updateCandidateAction(
  id: number,
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const tagIdsRaw = formData.getAll("tagIds");
    const tagIds = tagIdsRaw
      .map((v) => Number(v))
      .filter((v) => !isNaN(v) && v > 0);

    const yearsOfExpRaw = formData.get("yearsOfExp")?.toString().trim();
    const currentSalaryRaw = formData.get("currentSalary")?.toString().trim();
    const expectedSalaryRaw = formData.get("expectedSalary")?.toString().trim();
    const dateOfBirthRaw = formData.get("dateOfBirth")?.toString().trim();

    const input: UpdateCandidateInput = {
      fullName: strVal(formData.get("fullName")),
      phone: strVal(formData.get("phone")),
      email: strVal(formData.get("email")),
      dateOfBirth: dateOfBirthRaw ? new Date(dateOfBirthRaw) : undefined,
      gender: enumVal<Gender>(formData.get("gender")),
      address: strVal(formData.get("address")),
      currentPosition: strVal(formData.get("currentPosition")),
      currentCompany: strVal(formData.get("currentCompany")),
      industry: strVal(formData.get("industry")),
      yearsOfExp: yearsOfExpRaw ? Number(yearsOfExpRaw) : undefined,
      currentSalary: currentSalaryRaw ? Number(currentSalaryRaw) : undefined,
      expectedSalary: expectedSalaryRaw ? Number(expectedSalaryRaw) : undefined,
      location: strVal(formData.get("location")),
      status: enumVal<CandidateStatus>(formData.get("status")),
      source: enumVal<CandidateSource>(formData.get("source")),
      sourceDetail: strVal(formData.get("sourceDetail")),
      avatarUrl: strNull(formData.get("avatarUrl")),
      tagIds,
    };

    // Required fields validation
    if (!input.fullName) return { error: "Họ và tên không được để trống." };
    if (!input.email && !input.phone) return { error: "Vui lòng nhập Email hoặc Số điện thoại." };
    if (!input.location) return { error: "Khu vực là bắt buộc." };
    if (!input.industry) return { error: "Ngành nghề là bắt buộc." };
    if (!input.status) return { error: "Trạng thái là bắt buộc." };

    await updateCandidate(id, input);
    revalidatePath(`/candidates/${id}`);
    revalidatePath("/candidates");
    return { success: true };
  } catch (e) {
    console.error("updateCandidateAction error:", e);
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." };
  }
}

export async function deleteCandidateAction(id: number): Promise<void> {
  await getCurrentUserId();
  await softDeleteCandidate(id);
  revalidatePath("/candidates");
  redirect("/candidates");
}

export async function updateCandidateStatusAction(id: number, status: CandidateStatus) {
  try {
    // update is imported from lib/candidates, but the type allows partial updates except tagIds handling has to be careful.
    // In updateCandidate, it extracts tagIds and updates the rest.
    await updateCandidate(id, { status } as any);
    revalidatePath(`/candidates/${id}`);
    revalidatePath("/candidates");
    return { success: true };
  } catch (e) {
    console.error("updateCandidateStatusAction error:", e);
    return { error: "Không thể cập nhật trạng thái." };
  }
}

export async function addNoteAction(
  candidateId: number,
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const userId = await getCurrentUserId();
    const content = String(formData.get("content") ?? "").trim();
    if (!content) return { error: "Ghi chú không được để trống." };

    await addCandidateNote(candidateId, content, userId);
    revalidatePath(`/candidates/${candidateId}`);
    return { success: true };
  } catch (e) {
    console.error("addNoteAction error:", e);
    return { error: "Đã có lỗi xảy ra." };
  }
}

export async function createTagAction(name: string, color?: string) {
  try {
    const tag = await createTag(name.trim(), color);
    revalidatePath("/candidates");
    return { tag };
  } catch (e) {
    console.error("createTagAction error:", e);
    return { error: "Không thể tạo tag." };
  }
}

export async function addTagToCandidateAction(candidateId: number, tagId: number) {
  try {
    await addTagToCandidate(candidateId, tagId);
    revalidatePath(`/candidates/${candidateId}`);
    return { success: true };
  } catch (e) {
    console.error("addTagToCandidateAction error:", e);
    return { error: "Không thể thêm tag." };
  }
}

export async function removeTagFromCandidateAction(candidateId: number, tagId: number) {
  try {
    await removeTagFromCandidate(candidateId, tagId);
    revalidatePath(`/candidates/${candidateId}`);
    return { success: true };
  } catch (e) {
    console.error("removeTagFromCandidateAction error:", e);
    return { error: "Không thể bỏ tag." };
  }
}
