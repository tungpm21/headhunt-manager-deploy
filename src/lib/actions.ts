"use server";

import {
  CandidateSeniority,
  CandidateSource,
  CandidateStatus,
  Gender,
} from "@prisma/client";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { logActivity } from "@/lib/activity-log";
import { requireAdmin, requireViewerScope } from "@/lib/authz";
import { OPTION_GROUPS } from "@/lib/config-option-definitions";
import { resolveConfigOptionValue } from "@/lib/config-options";
import {
  addCandidateNote,
  addTagToCandidate,
  checkDuplicate,
  createCandidate,
  getCandidateById,
  permanentlyDeleteCandidate,
  removeTagFromCandidate,
  restoreCandidate,
  softDeleteCandidate,
  updateCandidate,
} from "@/lib/candidates";
import {
  completeCandidateReminder,
  createCandidateReminder,
} from "@/lib/reminders";
import {
  buildServerActionRateLimitKey,
  checkRateLimit,
} from "@/lib/rate-limit-redis";
import { createTag } from "@/lib/tags";
import {
  authLoginSchema,
  candidateFormSchema,
  candidateReminderSchema,
  getFirstZodErrorMessage,
} from "@/lib/validation/forms";
import { CreateCandidateInput, UpdateCandidateInput } from "@/types/candidate";
import { enumVal, strVal } from "@/lib/utils/form-helpers";

function strNull(value: FormDataEntryValue | null): string | null {
  const normalized = value?.toString()?.trim();
  return normalized || null;
}

function parseCandidateSkills(value: FormDataEntryValue | null): string[] {
  const raw = value?.toString().trim();

  if (!raw) {
    return [];
  }

  return [
    ...new Set(
      raw
        .split(",")
        .map((skill) => skill.toLowerCase().trim())
        .filter(Boolean)
    ),
  ];
}

async function buildCandidateInput(formData: FormData): Promise<CreateCandidateInput> {
  const tagIds = formData
    .getAll("tagIds")
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value) && value > 0);

  const yearsOfExpRaw = formData.get("yearsOfExp")?.toString().trim();
  const currentSalaryRaw = formData.get("currentSalary")?.toString().trim();
  const expectedSalaryRaw = formData.get("expectedSalary")?.toString().trim();
  const dateOfBirthRaw = formData.get("dateOfBirth")?.toString().trim();
  const [industry, location] = await Promise.all([
    resolveConfigOptionValue(OPTION_GROUPS.industry, strVal(formData.get("industry"))),
    resolveConfigOptionValue(OPTION_GROUPS.location, strVal(formData.get("location"))),
  ]);

  return {
    fullName: String(formData.get("fullName") ?? "").trim(),
    phone: strVal(formData.get("phone")),
    email: strVal(formData.get("email")),
    dateOfBirth: dateOfBirthRaw ? new Date(dateOfBirthRaw) : undefined,
    gender: enumVal(formData.get("gender"), Object.values(Gender)),
    address: strVal(formData.get("address")),
    currentPosition: strVal(formData.get("currentPosition")),
    currentCompany: strVal(formData.get("currentCompany")),
    industry: industry ?? undefined,
    yearsOfExp: yearsOfExpRaw ? Number(yearsOfExpRaw) : undefined,
    currentSalary: currentSalaryRaw ? Number(currentSalaryRaw) : undefined,
    expectedSalary: expectedSalaryRaw ? Number(expectedSalaryRaw) : undefined,
    location: location ?? undefined,
    status: enumVal(formData.get("status"), Object.values(CandidateStatus)),
    level: enumVal(formData.get("level"), Object.values(CandidateSeniority)),
    skills: parseCandidateSkills(formData.get("skills")),
    source: enumVal(formData.get("source"), Object.values(CandidateSource)),
    sourceDetail: strVal(formData.get("sourceDetail")),
    avatarUrl: strNull(formData.get("avatarUrl")),
    tagIds,
  };
}

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
) {
  const parsedInput = authLoginSchema.safeParse({
    email: formData.get("email")?.toString().trim().toLowerCase(),
    password: formData.get("password")?.toString() ?? "",
  });
  const email = parsedInput.success ? parsedInput.data.email : undefined;
  const password = parsedInput.success ? parsedInput.data.password : "";
  const rateLimitKey = await buildServerActionRateLimitKey("crm-login", email);
  const rateLimit = await checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);

  if (!rateLimit.allowed) {
    return `Thu lai sau ${rateLimit.retryAfterSeconds} giay.`;
  }

  if (!parsedInput.success) {
    return getFirstZodErrorMessage(parsedInput.error);
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email hoac mat khau khong dung.";
        default:
          return "Da co loi xay ra.";
      }
    }

    throw error;
  }
}

export async function createCandidateAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean; id?: number }> {
  try {
    const scope = await requireViewerScope();
    const userId = scope.userId;
    const parsedInput = candidateFormSchema.safeParse(await buildCandidateInput(formData));

    if (!parsedInput.success) {
      return { error: getFirstZodErrorMessage(parsedInput.error) };
    }

    const input: CreateCandidateInput = parsedInput.data;
    const duplicate = await checkDuplicate(input.email, input.phone);

    if (duplicate) {
      return {
        error: `Da co ung vien trung thong tin: ${duplicate.fullName}.`,
      };
    }

    const candidate = await createCandidate(input, userId);
    revalidatePath("/candidates");

    return { success: true, id: candidate.id };
  } catch (error) {
    console.error("createCandidateAction error:", error);
    return { error: "Da co loi xay ra. Vui long thu lai." };
  }
}

export async function updateCandidateAction(
  id: number,
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const scope = await requireViewerScope();
    const parsedInput = candidateFormSchema.safeParse(await buildCandidateInput(formData));

    if (!parsedInput.success) {
      return { error: getFirstZodErrorMessage(parsedInput.error) };
    }

    const input: UpdateCandidateInput = parsedInput.data;
    const duplicate = await checkDuplicate(input.email, input.phone, id);

    if (duplicate) {
      return {
        error: `Da co ung vien trung thong tin: ${duplicate.fullName}.`,
      };
    }

    await updateCandidate(id, input, scope);
    revalidatePath(`/candidates/${id}`);
    revalidatePath("/candidates");

    return { success: true };
  } catch (error) {
    console.error("updateCandidateAction error:", error);
    return { error: "Da co loi xay ra. Vui long thu lai." };
  }
}

export async function deleteCandidateAction(id: number): Promise<void> {
  const scope = await requireViewerScope();
  await softDeleteCandidate(id, scope);
  revalidatePath("/candidates");
  revalidatePath("/candidates/trash");
  redirect("/candidates");
}

export async function quickDeleteCandidateAction(id: number) {
  try {
    const scope = await requireViewerScope();
    await softDeleteCandidate(id, scope);
    await logActivity("DELETE", "CANDIDATE", id, scope.userId, {
      action: "soft-delete-from-list",
    });
    revalidatePath("/candidates");
    revalidatePath("/candidates/trash");
    return { success: true };
  } catch (error) {
    console.error("quickDeleteCandidateAction error:", error);
    return { error: "Khong the xoa ung vien." };
  }
}

export async function restoreCandidateAction(id: number) {
  try {
    await requireAdmin();
    await restoreCandidate(id);
    revalidatePath("/candidates");
    revalidatePath("/candidates/trash");
    return { success: true };
  } catch (error) {
    console.error("restoreCandidateAction error:", error);
    return { error: "Khong the khoi phuc ung vien." };
  }
}

export async function permanentlyDeleteCandidateAction(id: number) {
  try {
    await requireAdmin();
    await permanentlyDeleteCandidate(id);
    revalidatePath("/candidates");
    revalidatePath("/candidates/trash");
    return { success: true };
  } catch (error) {
    console.error("permanentlyDeleteCandidateAction error:", error);
    return { error: "Khong the xoa triet de ung vien." };
  }
}

export async function updateCandidateStatusAction(
  id: number,
  status: CandidateStatus
) {
  try {
    const scope = await requireViewerScope();
    const userId = scope.userId;
    const currentCandidate = await getCandidateById(id, scope);

    if (!currentCandidate) {
      return { error: "Khong tim thay ung vien." };
    }

    await updateCandidate(id, { status } as UpdateCandidateInput, scope);

    await logActivity("STATUS_CHANGE", "CANDIDATE", id, userId, {
      from: currentCandidate.status,
      to: status,
      candidateName: currentCandidate.fullName,
    });

    revalidatePath(`/candidates/${id}`);
    revalidatePath("/candidates");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("updateCandidateStatusAction error:", error);
    return { error: "Khong the cap nhat trang thai." };
  }
}

export async function addCandidateNoteAction(
  candidateId: number,
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const scope = await requireViewerScope();
    const userId = scope.userId;
    const content = String(formData.get("content") ?? "").trim();

    if (!content) {
      return { error: "Ghi chu khong duoc de trong." };
    }

    await addCandidateNote(candidateId, content, userId, scope);

    await logActivity("NOTE", "CANDIDATE", candidateId, userId, {
      preview: content.slice(0, 100),
    });

    revalidatePath(`/candidates/${candidateId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("addCandidateNoteAction error:", error);
    return { error: "Da co loi xay ra." };
  }
}

export const addNoteAction = addCandidateNoteAction;

export async function addCandidateReminderAction(
  candidateId: number,
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const scope = await requireViewerScope();
    const userId = scope.userId;
    const candidate = await getCandidateById(candidateId, scope);
    const parsedInput = candidateReminderSchema.safeParse({
      title: String(formData.get("title") ?? "").trim(),
      note: strVal(formData.get("note")),
      dueAt: new Date(String(formData.get("dueAt") ?? "").trim()),
    });

    if (!candidate) {
      return { error: "Khong tim thay ung vien hoac ban khong co quyen." };
    }

    if (!parsedInput.success) {
      return { error: getFirstZodErrorMessage(parsedInput.error) };
    }

    const reminder = await createCandidateReminder({
      candidateId,
      ...parsedInput.data,
      assignedToId: userId,
    });

    await logActivity("REMINDER_CREATED", "CANDIDATE", candidateId, userId, {
      candidateName: reminder.candidate.fullName,
      reminderId: reminder.id,
      reminderTitle: reminder.title,
      dueAt: reminder.dueAt.toISOString(),
      assignedTo: reminder.assignedTo.name,
    });

    revalidatePath(`/candidates/${candidateId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("addCandidateReminderAction error:", error);
    return { error: "Khong the tao nhac viec." };
  }
}

export async function completeCandidateReminderAction(
  reminderId: number
): Promise<{ error?: string; success?: boolean }> {
  try {
    const scope = await requireViewerScope();
    const userId = scope.userId;
    const result = await completeCandidateReminder(reminderId, userId, scope);

    if (!result) {
      return { error: "Khong tim thay nhac viec." };
    }

    if (result.justCompleted) {
      await logActivity("REMINDER_COMPLETED", "CANDIDATE", result.reminder.candidateId, userId, {
        candidateName: result.reminder.candidate.fullName,
        reminderId: result.reminder.id,
        reminderTitle: result.reminder.title,
        dueAt: result.reminder.dueAt.toISOString(),
        assignedTo: result.reminder.assignedTo.name,
      });
    }

    revalidatePath(`/candidates/${result.reminder.candidateId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("completeCandidateReminderAction error:", error);
    return { error: "Khong the cap nhat nhac viec." };
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
    return { error: "Khong the tao tag." };
  }
}

export async function addTagToCandidateAction(candidateId: number, tagId: number) {
  try {
    const scope = await requireViewerScope();
    const candidate = await getCandidateById(candidateId, scope);

    if (!candidate) {
      return { error: "Khong tim thay ung vien hoac ban khong co quyen." };
    }

    await addTagToCandidate(candidateId, tagId);
    revalidatePath(`/candidates/${candidateId}`);
    return { success: true };
  } catch (error) {
    console.error("addTagToCandidateAction error:", error);
    return { error: "Khong the them tag." };
  }
}

export async function removeTagFromCandidateAction(candidateId: number, tagId: number) {
  try {
    const scope = await requireViewerScope();
    const candidate = await getCandidateById(candidateId, scope);

    if (!candidate) {
      return { error: "Khong tim thay ung vien hoac ban khong co quyen." };
    }

    await removeTagFromCandidate(candidateId, tagId);
    revalidatePath(`/candidates/${candidateId}`);
    return { success: true };
  } catch (error) {
    console.error("removeTagFromCandidateAction error:", error);
    return { error: "Khong the bo tag." };
  }
}
