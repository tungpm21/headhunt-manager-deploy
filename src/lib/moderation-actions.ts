"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-log";
import { requireAdmin } from "@/lib/authz";
import {
  activateEmployerIfPending,
  createCandidateFromImportedApplication,
  countNewApplicationsForModeration,
  createEmployerSubscription,
  findCandidateForImportedApplication,
  getApplicationForImportById,
  getApplicationsForImportData,
  getClientsForEmployerLinkingData,
  getClientForEmployerLinking,
  getEmployerForClientLinking,
  getEmployerForInfoUpdate,
  getEmployerJobPostingsForModeration,
  getEmployerModerationById,
  getEmployerSimpleById,
  getEmployerSubscriptionByEmployerId,
  getEmployersData,
  getJobPostingForModeration,
  getPendingJobPostingsData,
  getRecentApplicationsForModeration,
  getSubscriptionsData,
  markApplicationImported,
  updateCandidateCvIfMissing,
  updateEmployerClientLink,
  updateEmployerModerationInfo,
  updateEmployerModerationStatus,
  updateEmployerSubscription,
  updateJobPostingModeration,
  upsertImportedApplicationJobLink,
} from "@/lib/moderation";
import { deleteFile, uploadFile } from "@/lib/storage";
import { expireSubscriptionsIfNeeded } from "@/lib/subscriptions";
import {
  employerClientLinkSchema,
  getFirstZodErrorMessage,
  moderationEmployerInfoSchema,
  moderationEmployerStatusSchema,
  moderationRejectJobSchema,
  moderationSubscriptionSchema,
} from "@/lib/validation/forms";

const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

function strNull(value: FormDataEntryValue | null): string | null {
  const normalized = value?.toString().trim();
  return normalized || null;
}

function normalizeWebsite(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(normalized).toString();
  } catch {
    return null;
  }
}

function parsePositiveInt(value: FormDataEntryValue | null, fallback?: number) {
  const normalized = value?.toString().trim();

  if (!normalized) {
    return fallback ?? Number.NaN;
  }

  return Number.parseInt(normalized, 10);
}

export async function getPendingJobPostings(status = "PENDING", page = 1) {
  await requireAdmin();
  return getPendingJobPostingsData(status, page);
}

export async function approveJobPosting(id: number) {
  await requireAdmin();
  const job = await getJobPostingForModeration(id);

  if (!job) {
    return { success: false, message: "Khong tim thay tin." };
  }

  const duration = job.employer.subscription?.jobDuration ?? 30;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

  await updateJobPostingModeration(id, {
    status: "APPROVED",
    publishedAt: now,
    expiresAt,
    rejectReason: null,
  });

  revalidatePath("/moderation");
  revalidatePath("/viec-lam");
  return { success: true, message: "Da duyet tin." };
}

export async function rejectJobPosting(id: number, reason: string) {
  await requireAdmin();
  const parsedInput = moderationRejectJobSchema.safeParse({ reason });

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }

  await updateJobPostingModeration(id, {
    status: "REJECTED",
    rejectReason: parsedInput.data.reason.trim(),
  });

  revalidatePath("/moderation");
  return { success: true, message: "Da tu choi tin." };
}

export async function getEmployers(status = "ALL", page = 1) {
  await requireAdmin();
  await expireSubscriptionsIfNeeded();
  return getEmployersData(status, page);
}

export async function updateEmployerStatus(id: number, newStatus: string) {
  await requireAdmin();
  const parsedInput = moderationEmployerStatusSchema.safeParse({ newStatus });

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }

  const employer = await updateEmployerModerationStatus(id, parsedInput.data.newStatus);

  revalidatePath("/employers");
  revalidatePath(`/employers/${id}`);
  revalidatePath("/");
  revalidatePath("/cong-ty");
  revalidatePath(`/cong-ty/${employer.slug}`);
  return {
    success: true,
    message: `Da cap nhat trang thai: ${parsedInput.data.newStatus}`,
  };
}

export async function getEmployerById(id: number) {
  await requireAdmin();
  await expireSubscriptionsIfNeeded();
  return getEmployerModerationById(id);
}

export async function getEmployerJobPostings(employerId: number, page = 1) {
  await requireAdmin();
  return getEmployerJobPostingsForModeration(employerId, page);
}

export async function updateEmployerInfo(
  employerId: number,
  _prevState: { success?: boolean; message?: string; logoUrl?: string | null } | undefined,
  formData: FormData
) {
  await requireAdmin();

  const employer = await getEmployerForInfoUpdate(employerId);
  if (!employer) {
    return { success: false, message: "Khong tim thay employer." };
  }

  const websiteInput = strNull(formData.get("website"));
  const normalizedWebsite = normalizeWebsite(websiteInput);
  const parsedInput = moderationEmployerInfoSchema.safeParse({
    companyName: formData.get("companyName")?.toString().trim() ?? "",
    description: strNull(formData.get("description")),
    industry: strNull(formData.get("industry")),
    address: strNull(formData.get("address")),
    phone: strNull(formData.get("phone")),
    website: websiteInput ? normalizedWebsite ?? websiteInput : null,
    companySize: strNull(formData.get("companySize")),
  });

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }

  const logoFile = formData.get("logo");
  const nextLogo = logoFile instanceof File && logoFile.size > 0 ? logoFile : null;
  let uploadedLogoUrl: string | null = null;

  if (nextLogo) {
    if (!ALLOWED_LOGO_TYPES.includes(nextLogo.type)) {
      return {
        success: false,
        message: "Chi chap nhan logo JPG, PNG hoac WebP.",
      };
    }

    if (nextLogo.size > MAX_LOGO_SIZE_BYTES) {
      return {
        success: false,
        message: "Logo qua lon. Toi da 2MB.",
      };
    }

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const safeExt = extensionMap[nextLogo.type] ?? "tmp";
    const fileName = `employer-logo-${employerId}-${Date.now()}.${safeExt}`;

    try {
      const uploadResult = await uploadFile("logos", fileName, nextLogo);
      uploadedLogoUrl = uploadResult.url;
    } catch (error) {
      console.error("Employer logo upload error:", error);
      return {
        success: false,
        message: "Khong the tai logo len. Vui long thu lai.",
      };
    }
  }

  try {
    await updateEmployerModerationInfo(employerId, {
      companyName: parsedInput.data.companyName,
      description: parsedInput.data.description || null,
      logo: uploadedLogoUrl ?? employer.logo,
      industry: parsedInput.data.industry || null,
      companySize: parsedInput.data.companySize ?? null,
      address: parsedInput.data.address || null,
      website: parsedInput.data.website || null,
      phone: parsedInput.data.phone || null,
    });
  } catch (error) {
    if (uploadedLogoUrl) {
      await deleteFile(uploadedLogoUrl);
    }

    console.error("updateEmployerInfo error:", error);
    return {
      success: false,
      message: "Khong the cap nhat thong tin employer.",
    };
  }

  if (uploadedLogoUrl && employer.logo && employer.logo !== uploadedLogoUrl) {
    await deleteFile(employer.logo);
  }

  revalidatePath("/employers");
  revalidatePath(`/employers/${employerId}`);
  revalidatePath(`/employers/${employerId}/edit`);
  revalidatePath(`/cong-ty/${employer.slug}`);
  revalidatePath("/cong-ty");
  revalidatePath("/viec-lam");
  employer.jobPostings.forEach((job) => {
    revalidatePath(`/viec-lam/${job.slug}`);
  });

  return {
    success: true,
    message: "Da cap nhat thong tin cong ty.",
    logoUrl: uploadedLogoUrl ?? employer.logo,
  };
}

export async function getSubscriptions(page = 1) {
  await requireAdmin();
  await expireSubscriptionsIfNeeded();
  return getSubscriptionsData(page);
}

export async function assignSubscription(formData: FormData) {
  await requireAdmin();
  const parsedInput = moderationSubscriptionSchema.safeParse({
    employerId: parsePositiveInt(formData.get("employerId")),
    tier: formData.get("tier")?.toString().trim(),
    jobQuota: parsePositiveInt(formData.get("jobQuota")),
    jobDuration: parsePositiveInt(formData.get("jobDuration"), 30),
    durationMonths: parsePositiveInt(formData.get("durationMonths"), 12),
    showLogo: formData.get("showLogo") === "true",
    showBanner: formData.get("showBanner") === "true",
  });

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }

  const employer = await getEmployerSimpleById(parsedInput.data.employerId);
  if (!employer) {
    return { success: false, message: "Khong tim thay employer." };
  }

  const now = new Date();
  const endDate = new Date(
    now.getTime() + parsedInput.data.durationMonths * 30 * 24 * 60 * 60 * 1000
  );
  const existingSub = await getEmployerSubscriptionByEmployerId(parsedInput.data.employerId);

  if (existingSub) {
    await updateEmployerSubscription(existingSub.id, {
      tier: parsedInput.data.tier,
      jobQuota: parsedInput.data.jobQuota,
      jobDuration: parsedInput.data.jobDuration,
      startDate: now,
      endDate,
      status: "ACTIVE",
      showLogo: parsedInput.data.showLogo,
      showBanner: parsedInput.data.showBanner,
    });
  } else {
    await createEmployerSubscription({
      employerId: parsedInput.data.employerId,
      tier: parsedInput.data.tier,
      jobQuota: parsedInput.data.jobQuota,
      jobsUsed: 0,
      jobDuration: parsedInput.data.jobDuration,
      price: 0,
      startDate: now,
      endDate,
      status: "ACTIVE",
      showLogo: parsedInput.data.showLogo,
      showBanner: parsedInput.data.showBanner,
    });
  }

  await activateEmployerIfPending(parsedInput.data.employerId, employer.status);

  revalidatePath("/packages");
  revalidatePath("/employers");
  return {
    success: true,
    message: `Da cap goi ${parsedInput.data.tier} cho ${employer.companyName}.`,
  };
}

export async function getApplicationsForImport(status = "NEW", page = 1) {
  await requireAdmin();
  return getApplicationsForImportData(status, page);
}

export async function importApplicationToCRM(applicationId: number) {
  const { userId } = await requireAdmin();
  const application = await getApplicationForImportById(applicationId);

  if (!application) {
    return { success: false, message: "Khong tim thay don ung tuyen." };
  }
  if (application.status === "IMPORTED") {
    return { success: false, message: "Don nay da duoc import truoc do." };
  }

  let candidateId: number;
  const normalizedEmail = application.email.trim().toLowerCase();
  const existingCandidate = normalizedEmail
    ? await findCandidateForImportedApplication(normalizedEmail)
    : null;

  if (existingCandidate) {
    candidateId = existingCandidate.id;
    if (!existingCandidate.cvFileUrl && application.cvFileUrl) {
      await updateCandidateCvIfMissing(
        candidateId,
        application.cvFileUrl,
        application.cvFileName
      );
    }
  } else {
    const newCandidate = await createCandidateFromImportedApplication({
      fullName: application.fullName,
      email: normalizedEmail,
      phone: application.phone,
      cvFileUrl: application.cvFileUrl,
      cvFileName: application.cvFileName,
      sourceDetail: `${application.jobPosting.employer.companyName} - ${application.jobPosting.title}`,
      industry: application.jobPosting.industry,
      location: application.jobPosting.location,
      createdById: userId,
    });
    candidateId = newCandidate.id;
  }

  await markApplicationImported(applicationId, candidateId);

  if (application.jobPosting.jobOrderId) {
    await upsertImportedApplicationJobLink(
      application.jobPosting.jobOrderId,
      candidateId
    );
    revalidatePath(`/jobs/${application.jobPosting.jobOrderId}`);
  }

  await logActivity("IMPORT", "CANDIDATE", candidateId, userId, {
    applicationId: application.id,
    candidateId,
    candidateName: application.fullName,
    jobPostingId: application.jobPosting.id,
    jobOrderId: application.jobPosting.jobOrderId,
    jobTitle: application.jobPosting.title,
    employerName: application.jobPosting.employer.companyName,
    linkedExistingCandidate: Boolean(existingCandidate),
  });

  revalidatePath("/moderation/applications");
  revalidatePath("/candidates");
  revalidatePath("/dashboard");
  return {
    success: true,
    message: existingCandidate
      ? `Da link vao ung vien #${candidateId} (${existingCandidate.fullName}).`
      : `Da tao ung vien moi #${candidateId} trong CRM.`,
    candidateId,
  };
}

export async function linkEmployerToClient(
  employerId: number,
  clientId: number | null
) {
  await requireAdmin();
  const parsedInput = employerClientLinkSchema.safeParse({
    employerId,
    clientId,
  });

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }

  const employer = await getEmployerForClientLinking(parsedInput.data.employerId);
  if (!employer) {
    return { success: false, message: "Khong tim thay employer." };
  }

  if (parsedInput.data.clientId) {
    const client = await getClientForEmployerLinking(
      parsedInput.data.clientId,
      parsedInput.data.employerId
    );
    if (!client) {
      return { success: false, message: "Khong tim thay client." };
    }

    if (client.employer && client.employer.id !== parsedInput.data.employerId) {
      return {
        success: false,
        message: "Client nay da duoc link voi employer khac.",
      };
    }
  }

  try {
    await updateEmployerClientLink(
      parsedInput.data.employerId,
      parsedInput.data.clientId
    );
  } catch (error) {
    console.error("linkEmployerToClient error:", error);
    return {
      success: false,
      message: "Khong the cap nhat lien ket Client.",
    };
  }

  revalidatePath("/employers");
  revalidatePath(`/employers/${parsedInput.data.employerId}`);
  return {
    success: true,
    message: parsedInput.data.clientId
      ? "Da link Employer voi Client."
      : "Da bo link Client.",
  };
}

export async function getNewApplicationsCount() {
  await requireAdmin();
  return countNewApplicationsForModeration();
}

export async function getRecentApplications(take = 5) {
  await requireAdmin();
  return getRecentApplicationsForModeration(take);
}

export async function getClientsForEmployerLinking(employerId: number) {
  await requireAdmin();
  return getClientsForEmployerLinkingData(employerId);
}
