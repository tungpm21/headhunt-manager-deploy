"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  NotificationEventType,
  NotificationSeverity,
  SubscriptionStatus,
  SubscriptionTier,
} from "@prisma/client";
import { logActivity } from "@/lib/activity-log";
import { requireAdmin } from "@/lib/authz";
import { createCompanyNotificationEventForEmployer } from "@/lib/notification-events";
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
  getEmployersForSubscriptionSelectData,
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
  upsertEmployerProfileConfig,
  upsertImportedApplicationJobLink,
} from "@/lib/moderation";
import type { JobPostingModerationFilters } from "@/lib/moderation";
import { deleteFile, uploadFile } from "@/lib/storage";
import { expireSubscriptionsIfNeeded } from "@/lib/subscriptions";
import {
  normalizeCompanyCapabilities,
  normalizeCompanyTheme,
  normalizeContentBlocks,
  parseJson,
} from "@/lib/content-blocks";
import { OPTION_GROUPS } from "@/lib/config-option-definitions";
import { resolveConfigOptionValue } from "@/lib/config-options";
import {
  getMediaFileExtension,
  type MediaUploadKind,
  validateMediaImageFile,
} from "@/lib/media-validation";
import {
  PUBLIC_COMPANY_PROFILE_CACHE_TAG,
  PUBLIC_HOMEPAGE_CACHE_TAG,
} from "@/lib/public-cache-tags";
import {
  employerClientLinkSchema,
  getFirstZodErrorMessage,
  moderationEmployerInfoSchema,
  moderationEmployerStatusSchema,
  moderationRejectJobSchema,
  moderationSubscriptionSchema,
} from "@/lib/validation/forms";

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

function parseNonNegativeNumber(value: FormDataEntryValue | null, fallback = 0) {
  const normalized = value?.toString().trim();

  if (!normalized) {
    return fallback;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

const SUBSCRIPTION_TIERS = [
  SubscriptionTier.BASIC,
  SubscriptionTier.STANDARD,
  SubscriptionTier.PREMIUM,
  SubscriptionTier.VIP,
] as const;

const SUBSCRIPTION_STATUSES = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.EXPIRED,
  SubscriptionStatus.CANCELLED,
] as const;

function parseSubscriptionTier(value: FormDataEntryValue | null) {
  const normalized = value?.toString().trim() as SubscriptionTier | undefined;
  return normalized && SUBSCRIPTION_TIERS.includes(normalized) ? normalized : null;
}

function parseSubscriptionStatus(value: FormDataEntryValue | null) {
  const normalized = value?.toString().trim() as SubscriptionStatus | undefined;
  return normalized && SUBSCRIPTION_STATUSES.includes(normalized) ? normalized : null;
}

function parseDateInput(value: FormDataEntryValue | null, fallback: Date) {
  const normalized = value?.toString().trim();
  if (!normalized) return fallback;

  const parsed = new Date(`${normalized}T23:59:59.999`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export async function getPendingJobPostings(
  statusOrFilters: string | JobPostingModerationFilters = "PENDING",
  page = 1
) {
  await requireAdmin();
  return getPendingJobPostingsData(statusOrFilters, page);
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

  await createCompanyNotificationEventForEmployer(job.employer.id, {
    type: NotificationEventType.JOB_POSTING_APPROVED,
    entityType: "JobPosting",
    entityId: job.id,
    title: "Tin tuyển dụng đã được duyệt",
    body: `${job.title} hiện đã public trên FDIWork.`,
    href: "/company/job-postings",
    severity: NotificationSeverity.SUCCESS,
  });

  revalidatePath("/moderation");
  revalidatePath("/jobs");
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

  const job = await updateJobPostingModeration(id, {
    status: "REJECTED",
    rejectReason: parsedInput.data.reason.trim(),
  });

  await createCompanyNotificationEventForEmployer(job.employerId, {
    type: NotificationEventType.JOB_POSTING_REJECTED,
    entityType: "JobPosting",
    entityId: job.id,
    title: "Tin tuyển dụng bị từ chối",
    body: `${job.title}: ${parsedInput.data.reason.trim()}`,
    href: "/company/job-postings?status=REJECTED",
    severity: NotificationSeverity.WARNING,
  });

  revalidatePath("/moderation");
  revalidatePath("/jobs");
  return { success: true, message: "Da tu choi tin." };
}

export async function getEmployers(status = "ALL", page = 1, query = "") {
  await requireAdmin();
  await expireSubscriptionsIfNeeded();
  return getEmployersData(status, page, query);
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

async function uploadImageFile(
  folder: string,
  prefix: string,
  file: File,
  kind: MediaUploadKind
): Promise<{ url: string } | { error: string }> {
  const validationError = validateMediaImageFile(file, kind);
  if (validationError) {
    return { error: validationError };
  }
  const safeExt = getMediaFileExtension(file.type);
  const fileName = `${prefix}-${Date.now()}.${safeExt}`;
  const result = await uploadFile(folder, fileName, file);
  return { url: result.url };
}

export async function updateEmployerInfo(
  employerId: number,
  _prevState: { success?: boolean; message?: string; logoUrl?: string | null; coverImageUrl?: string | null } | undefined,
  formData: FormData
) {
  await requireAdmin();

  const employer = await getEmployerForInfoUpdate(employerId);
  if (!employer) {
    return { success: false, message: "Khong tim thay employer." };
  }

  const websiteInput = strNull(formData.get("website"));
  const normalizedWebsite = normalizeWebsite(websiteInput);
  const profileTheme = normalizeCompanyTheme(parseJson(formData.get("profileTheme")?.toString() ?? ""));
  const profileCapabilities = normalizeCompanyCapabilities(
    parseJson(formData.get("profileCapabilities")?.toString() ?? "")
  );
  const profileSections = normalizeContentBlocks(formData.get("profileSections")?.toString() ?? "[]");
  const primaryVideoUrl = strNull(formData.get("primaryVideoUrl"));
  const parsedInput = moderationEmployerInfoSchema.safeParse({
    companyName: formData.get("companyName")?.toString().trim() ?? "",
    description: strNull(formData.get("description")),
    industry: strNull(formData.get("industry")),
    address: strNull(formData.get("address")),
    location: strNull(formData.get("location")),
    industrialZone: strNull(formData.get("industrialZone")),
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

  const canonicalIndustry = await resolveConfigOptionValue(
    OPTION_GROUPS.industry,
    parsedInput.data.industry
  );
  const [canonicalLocation, canonicalIndustrialZone] = await Promise.all([
    resolveConfigOptionValue(OPTION_GROUPS.location, parsedInput.data.location),
    resolveConfigOptionValue(OPTION_GROUPS.industrialZone, parsedInput.data.industrialZone),
  ]);

  // --- Logo upload ---
  const logoFile = formData.get("logo");
  const nextLogo = logoFile instanceof File && logoFile.size > 0 ? logoFile : null;
  let uploadedLogoUrl: string | null = null;

  if (nextLogo) {
    const result = await uploadImageFile(
      "logos",
      `employer-logo-${employerId}`,
      nextLogo,
      "profileLogo"
    );
    if ("error" in result) {
      return { success: false, message: result.error };
    }
    uploadedLogoUrl = result.url;
  }

  // --- Cover image upload ---
  const coverFile = formData.get("coverImage");
  const nextCover = coverFile instanceof File && coverFile.size > 0 ? coverFile : null;
  let uploadedCoverUrl: string | null = null;

  if (nextCover) {
    const result = await uploadImageFile(
      "covers",
      `employer-cover-${employerId}`,
      nextCover,
      "profileCover"
    );
    if ("error" in result) {
      // Roll back logo if already uploaded
      if (uploadedLogoUrl) await deleteFile(uploadedLogoUrl);
      return { success: false, message: result.error };
    }
    uploadedCoverUrl = result.url;
  }

  try {
    await Promise.all([
      updateEmployerModerationInfo(employerId, {
        companyName: parsedInput.data.companyName,
        description: parsedInput.data.description || null,
        logo: uploadedLogoUrl ?? employer.logo,
        coverImage: uploadedCoverUrl ?? employer.coverImage,
        coverPositionX: parseInt(formData.get("coverPositionX")?.toString() || "50") || 50,
        coverPositionY: parseInt(formData.get("coverPositionY")?.toString() || "50") || 50,
        coverZoom: parseInt(formData.get("coverZoom")?.toString() || "100") || 100,
        industry: canonicalIndustry,
        companySize: parsedInput.data.companySize ?? null,
        address: parsedInput.data.address || null,
        location: canonicalLocation,
        industrialZone: canonicalIndustrialZone,
        website: parsedInput.data.website || null,
        phone: parsedInput.data.phone || null,
      }),
      upsertEmployerProfileConfig(employerId, {
        theme: JSON.parse(JSON.stringify(profileTheme)),
        capabilities: JSON.parse(JSON.stringify(profileCapabilities)),
        sections: JSON.parse(JSON.stringify(profileSections)),
        primaryVideoUrl,
      }),
    ]);
  } catch (error) {
    if (uploadedLogoUrl) await deleteFile(uploadedLogoUrl);
    if (uploadedCoverUrl) await deleteFile(uploadedCoverUrl);
    console.error("updateEmployerInfo error:", error);
    return {
      success: false,
      message: "Khong the cap nhat thong tin employer.",
    };
  }

  // Delete old files only after successful DB update
  if (uploadedLogoUrl && employer.logo && employer.logo !== uploadedLogoUrl) {
    await deleteFile(employer.logo);
  }
  if (uploadedCoverUrl && employer.coverImage && employer.coverImage !== uploadedCoverUrl) {
    await deleteFile(employer.coverImage);
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
    coverImageUrl: uploadedCoverUrl ?? employer.coverImage,
  };
}

export async function getSubscriptions(page = 1) {
  await requireAdmin();
  await expireSubscriptionsIfNeeded();
  return getSubscriptionsData(page);
}

export async function getEmployersForSubscriptionSelect() {
  await requireAdmin();
  await expireSubscriptionsIfNeeded();
  return getEmployersForSubscriptionSelectData();
}

export async function assignSubscription(formData: FormData) {
  await requireAdmin();
  const parsedInput = moderationSubscriptionSchema.safeParse({
    employerId: parsePositiveInt(formData.get("employerId")),
    tier: formData.get("tier")?.toString().trim(),
    jobQuota: parsePositiveInt(formData.get("jobQuota")),
    jobDuration: parsePositiveInt(formData.get("jobDuration"), 30),
    durationMonths: parsePositiveInt(formData.get("durationMonths"), 12),
    price: parseNonNegativeNumber(formData.get("price"), 0),
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
  const existingSub = await getEmployerSubscriptionByEmployerId(parsedInput.data.employerId);
  if (existingSub && parsedInput.data.jobQuota < existingSub.jobsUsed) {
    return {
      success: false,
      message: `Quota moi khong duoc thap hon so tin da dung (${existingSub.jobsUsed}).`,
    };
  }

  const baseDate =
    existingSub?.status === "ACTIVE" && existingSub.endDate > now
      ? existingSub.endDate
      : now;
  const endDate = new Date(
    baseDate.getTime() + parsedInput.data.durationMonths * 30 * 24 * 60 * 60 * 1000
  );

  if (existingSub) {
    await updateEmployerSubscription(existingSub.id, {
      tier: parsedInput.data.tier,
      jobQuota: parsedInput.data.jobQuota,
      jobDuration: parsedInput.data.jobDuration,
      price: parsedInput.data.price,
      startDate:
        existingSub.status === "ACTIVE" && existingSub.endDate > now
          ? existingSub.startDate
          : now,
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
      price: parsedInput.data.price,
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
  revalidatePath(`/employers/${parsedInput.data.employerId}`);
  revalidatePath("/cong-ty");
  revalidatePath("/viec-lam");
  revalidateTag(PUBLIC_HOMEPAGE_CACHE_TAG, { expire: 0 });
  revalidateTag(PUBLIC_COMPANY_PROFILE_CACHE_TAG, { expire: 0 });
  return {
    success: true,
    message: `Da cap goi ${parsedInput.data.tier} cho ${employer.companyName}.`,
  };
}

export async function updateSubscriptionInline(formData: FormData) {
  await requireAdmin();

  const subscriptionId = parsePositiveInt(formData.get("subscriptionId"));
  const employerId = parsePositiveInt(formData.get("employerId"));
  const tier = parseSubscriptionTier(formData.get("tier"));
  const status = parseSubscriptionStatus(formData.get("status"));
  const jobQuota = parsePositiveInt(formData.get("jobQuota"));
  const jobDuration = parsePositiveInt(formData.get("jobDuration"), 30);
  const price = parseNonNegativeNumber(formData.get("price"), 0);

  if (!Number.isFinite(subscriptionId) || !Number.isFinite(employerId)) {
    return { success: false, message: "Goi dich vu khong hop le." };
  }
  if (!tier || !status || !Number.isFinite(jobQuota) || !Number.isFinite(jobDuration) || !Number.isFinite(price)) {
    return { success: false, message: "Du lieu goi dich vu khong hop le." };
  }

  const existingSub = await getEmployerSubscriptionByEmployerId(employerId);
  if (!existingSub || existingSub.id !== subscriptionId) {
    return { success: false, message: "Khong tim thay goi dich vu cua cong ty." };
  }
  if (jobQuota < existingSub.jobsUsed) {
    return {
      success: false,
      message: `Quota moi khong duoc thap hon so tin da dung (${existingSub.jobsUsed}).`,
    };
  }

  const endDate = parseDateInput(formData.get("endDate"), existingSub.endDate);

  await updateEmployerSubscription(subscriptionId, {
    tier,
    status,
    jobQuota,
    jobDuration,
    price,
    startDate: existingSub.startDate,
    endDate,
    showLogo: formData.get("showLogo") === "true",
    showBanner: formData.get("showBanner") === "true",
  });

  revalidatePath("/packages");
  revalidatePath("/companies");
  revalidatePath(`/employers/${employerId}`);
  revalidatePath("/viec-lam");
  revalidatePath("/cong-ty");
  revalidateTag(PUBLIC_HOMEPAGE_CACHE_TAG, { expire: 0 });
  revalidateTag(PUBLIC_COMPANY_PROFILE_CACHE_TAG, { expire: 0 });
  return { success: true, message: "Da cap nhat goi dich vu." };
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
  const existingCandidate = await findCandidateForImportedApplication(
    normalizedEmail,
    application.phone
  );

  if (existingCandidate) {
    candidateId = existingCandidate.id;
    if (application.cvFileUrl) {
      await updateCandidateCvIfMissing(
        candidateId,
        application.cvFileUrl,
        application.cvFileName,
        userId
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

  await createCompanyNotificationEventForEmployer(application.jobPosting.employerId, {
    type: NotificationEventType.FDIWORK_APPLICATION_IMPORTED,
    entityType: "Application",
    entityId: application.id,
    title: "FDIWork đã chuyển hồ sơ mới",
    body: `${application.fullName} ứng tuyển ${application.jobPosting.title}.`,
    href: "/company/applications?imported=imported",
    severity: NotificationSeverity.INFO,
  });

  revalidatePath("/moderation/applications");
  revalidatePath("/jobs");
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

export async function importAndSubmitApplication(
  applicationId: number,
  jobOrderId: number
) {
  // Step 1: Import to Talent Pool (reuse existing logic)
  const importResult = await importApplicationToCRM(applicationId);

  if (!importResult.success || !importResult.candidateId) {
    return importResult;
  }

  // Step 2: Create submission (JobCandidate) with SENT_TO_CLIENT stage
  try {
    await upsertImportedApplicationJobLink(jobOrderId, importResult.candidateId);
    revalidatePath(`/jobs/${jobOrderId}`);
    revalidatePath("/submissions");

    return {
      success: true,
      message: `${importResult.message} Đã tạo submission cho Job #${jobOrderId}.`,
      candidateId: importResult.candidateId,
    };
  } catch (error) {
    console.error("importAndSubmitApplication error:", error);
    return {
      success: true,
      message: `${importResult.message} Nhưng không thể tạo submission.`,
      candidateId: importResult.candidateId,
    };
  }
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
