"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import {
  addCandidateNote,
  addTagToCandidate,
  checkDuplicate,
  createCandidate,
  removeTagFromCandidate,
  softDeleteCandidate,
  updateCandidate,
} from "@/lib/candidates";
import {
  buildServerActionRateLimitKey,
  checkRateLimit,
} from "@/lib/rate-limit";
import { createTag } from "@/lib/tags";
import {
  CandidateSeniority,
  CandidateSource,
  CandidateStatus,
  CreateCandidateInput,
  Gender,
  UpdateCandidateInput,
} from "@/types/candidate";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const rateLimitKey = await buildServerActionRateLimitKey("crm-login", email);
  const rateLimit = checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);

  if (!rateLimit.allowed) {
    return `Thử lại sau ${rateLimit.retryAfterSeconds} giây.`;
  }

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

async function getCurrentUserId(): Promise<number> {
  const { userId } = await requireAdmin();
  return userId;
}

function enumVal<T>(value: FormDataEntryValue | null): T | undefined {
  const normalized = value?.toString()?.trim();
  return normalized ? (normalized as T) : undefined;
}

function strVal(value: FormDataEntryValue | null): string | undefined {
  const normalized = value?.toString()?.trim();
  return normalized || undefined;
}

function strNull(value: FormDataEntryValue | null): string | null {
  const normalized = value?.toString()?.trim();
  return normalized || null;
}

export async function createCandidateAction(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean; id?: number }> {
  try {
    const userId = await getCurrentUserId();

    const tagIds = formData
      .getAll("tagIds")
      .map((value) => Number(value))
      .filter((value) => !Number.isNaN(value) && value > 0);

    const yearsOfExpRaw = formData.get("yearsOfExp")?.toString().trim();
    const currentSalaryRaw = formData.get("currentSalary")?.toString().trim();
    const expectedSalaryRaw = formData.get("expectedSalary")?.toString().trim();
    const dateOfBirthRaw = formData.get("dateOfBirth")?.toString().trim();

    const skillsRaw = formData.get("skills")?.toString().trim();
    const skills = skillsRaw
      ? skillsRaw.split(",").map((skill) => skill.trim()).filter(Boolean)
      : [];

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
      level: enumVal<CandidateSeniority>(formData.get("level")),
      skills,
      source: enumVal<CandidateSource>(formData.get("source")),
      sourceDetail: strVal(formData.get("sourceDetail")),
      avatarUrl: strNull(formData.get("avatarUrl")),
      tagIds,
    };

    if (!input.fullName) return { error: "Họ và tên không được để trống." };
    if (!input.email && !input.phone) {
      return { error: "Vui lòng nhập Email hoặc Số điện thoại." };
    }
    if (!input.location) return { error: "Khu vực là bắt buộc." };
    if (!input.industry) return { error: "Ngành nghề là bắt buộc." };
    if (!input.status) return { error: "Trạng thái là bắt buộc." };

    const duplicate = await checkDuplicate(input.email, input.phone);
    if (duplicate) {
      return {
        error: `Đã có ứng viên trùng thông tin: ${duplicate.fullName}.`,
      };
    }

    const candidate = await createCandidate(input, userId);
    revalidatePath("/candidates");

    return { success: true, id: candidate.id };
  } catch (error) {
    console.error("createCandidateAction error:", error);
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." };
  }
}

export async function updateCandidateAction(
  id: number,
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();

    const tagIds = formData
      .getAll("tagIds")
      .map((value) => Number(value))
      .filter((value) => !Number.isNaN(value) && value > 0);

    const yearsOfExpRaw = formData.get("yearsOfExp")?.toString().trim();
    const currentSalaryRaw = formData.get("currentSalary")?.toString().trim();
    const expectedSalaryRaw = formData.get("expectedSalary")?.toString().trim();
    const dateOfBirthRaw = formData.get("dateOfBirth")?.toString().trim();

    const skillsRaw = formData.get("skills")?.toString().trim();
    const skills =
      skillsRaw !== undefined
        ? skillsRaw
          ? skillsRaw.split(",").map((skill) => skill.trim()).filter(Boolean)
          : []
        : undefined;

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
      level: enumVal<CandidateSeniority>(formData.get("level")),
      skills,
      source: enumVal<CandidateSource>(formData.get("source")),
      sourceDetail: strVal(formData.get("sourceDetail")),
      avatarUrl: strNull(formData.get("avatarUrl")),
      tagIds,
    };

    if (!input.fullName) return { error: "Họ và tên không được để trống." };
    if (!input.email && !input.phone) {
      return { error: "Vui lòng nhập Email hoặc Số điện thoại." };
    }
    if (!input.location) return { error: "Khu vực là bắt buộc." };
    if (!input.industry) return { error: "Ngành nghề là bắt buộc." };
    if (!input.status) return { error: "Trạng thái là bắt buộc." };

    const duplicate = await checkDuplicate(input.email, input.phone, id);
    if (duplicate) {
      return {
        error: `Đã có ứng viên trùng thông tin: ${duplicate.fullName}.`,
      };
    }

    await updateCandidate(id, input);
    revalidatePath(`/candidates/${id}`);
    revalidatePath("/candidates");

    return { success: true };
  } catch (error) {
    console.error("updateCandidateAction error:", error);
    return { error: "Đã có lỗi xảy ra. Vui lòng thử lại." };
  }
}

export async function deleteCandidateAction(id: number): Promise<void> {
  await getCurrentUserId();
  await softDeleteCandidate(id);
  revalidatePath("/candidates");
  redirect("/candidates");
}

export async function updateCandidateStatusAction(
  id: number,
  status: CandidateStatus
) {
  try {
    await requireAdmin();
    await updateCandidate(id, { status } as UpdateCandidateInput);
    revalidatePath(`/candidates/${id}`);
    revalidatePath("/candidates");
    return { success: true };
  } catch (error) {
    console.error("updateCandidateStatusAction error:", error);
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

    if (!content) {
      return { error: "Ghi chú không được để trống." };
    }

    await addCandidateNote(candidateId, content, userId);
    revalidatePath(`/candidates/${candidateId}`);
    return { success: true };
  } catch (error) {
    console.error("addNoteAction error:", error);
    return { error: "Đã có lỗi xảy ra." };
  }
}

export async function createTagAction(name: string, color?: string) {
  try {
    await requireAdmin();
    const tag = await createTag(name.trim(), color);
    revalidatePath("/candidates");
    return { tag };
  } catch (error) {
    console.error("createTagAction error:", error);
    return { error: "Không thể tạo tag." };
  }
}

export async function addTagToCandidateAction(candidateId: number, tagId: number) {
  try {
    await requireAdmin();
    await addTagToCandidate(candidateId, tagId);
    revalidatePath(`/candidates/${candidateId}`);
    return { success: true };
  } catch (error) {
    console.error("addTagToCandidateAction error:", error);
    return { error: "Không thể thêm tag." };
  }
}

export async function removeTagFromCandidateAction(candidateId: number, tagId: number) {
  try {
    await requireAdmin();
    await removeTagFromCandidate(candidateId, tagId);
    revalidatePath(`/candidates/${candidateId}`);
    return { success: true };
  } catch (error) {
    console.error("removeTagFromCandidateAction error:", error);
    return { error: "Không thể bỏ tag." };
  }
}
