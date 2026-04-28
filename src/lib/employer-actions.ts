"use server";

import { ApplicationStatus, CompanyDraftStatus, Prisma } from "@prisma/client";
import { compareSync, hashSync } from "bcrypt-ts";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearEmployerCookie,
  requireEmployerSession,
  setEmployerCookie,
  signEmployerToken,
} from "@/lib/employer-auth";
import {
  createEmployerAccount,
  createEmployerJobPostingAndIncrementQuota,
  deleteEmployerJobPostingWithQuotaPolicy,
  findEmployerByEmail,
  findEmployerBySlug,
  findEmployerJobPostingBySlug,
  findRecentEmployerJobPostingDuplicate,
  getEmployerApplicationPipelineData,
  getEmployerDashboardSnapshot,
  getEmployerJobApplicants,
  getEmployerJobPostingsForPortal,
  getEmployerNotificationSnapshot,
  getEmployerOwnedJobPosting,
  getEmployerProfileForPortalById,
  getEmployerProfileById,
  getEmployerSubscriptionSnapshot,
  getEmployerWithSubscription,
  updateEmployerApplicationStatus,
  updateEmployerJobPosting,
  updateEmployerJobPostingStatus,
} from "@/lib/employers";
import { OPTION_GROUPS } from "@/lib/config-option-definitions";
import {
  getConfigOptionItems,
  getOptionsForSelect,
  resolveConfigOptionValue,
} from "@/lib/config-options";
import {
  DEFAULT_COMPANY_CAPABILITIES,
  DEFAULT_COMPANY_THEME,
  countBlockImages,
  normalizeCompanyCapabilities,
  normalizeCompanyTheme,
  normalizeContentBlocks,
  parseJson,
  type CompanyProfileCapabilities,
  type ContentBlock,
} from "@/lib/content-blocks";
import {
  buildServerActionRateLimitKey,
  checkRateLimit,
} from "@/lib/rate-limit-redis";
import { deleteFile, uploadFile } from "@/lib/storage";
import { getWorkspaceForEmployer } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import {
  employerJobPostingSchema,
  employerLoginSchema,
  employerProfileSchema,
  employerRegisterSchema,
  getFirstZodErrorMessage,
} from "@/lib/validation/forms";

function parseJobPostingSkills(value: FormDataEntryValue | null): string[] {
  const raw = value?.toString().trim() ?? "";

  if (!raw) {
    return [];
  }

  return Array.from(
    new Set(
      raw
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    )
  );
}

function parseNullableNumber(value: FormDataEntryValue | null) {
  const normalized = value?.toString().trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function strNull(value: FormDataEntryValue | null): string | null {
  const normalized = value?.toString().trim();
  return normalized || null;
}

async function uploadEmployerImageFile(
  folder: string,
  prefix: string,
  file: File,
  maxBytes: number
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Chỉ chấp nhận file JPG, PNG hoặc WebP." };
  }
  if (file.size > maxBytes) {
    return { error: `File quá lớn. Tối đa ${Math.round(maxBytes / 1024 / 1024)}MB.` };
  }

  const extension = IMAGE_EXTENSION_MAP[file.type] ?? "tmp";
  const fileName = `${prefix}-${Date.now()}.${extension}`;
  const result = await uploadFile(folder, fileName, file);
  return { url: result.url };
}

function buildEmployerJobCoverInput(formData: FormData) {
  const coverImage = strNull(formData.get("coverImage"));
  const coverAlt = coverImage ? strNull(formData.get("coverAlt")) : null;
  return { coverImage, coverAlt };
}

function filterProfileBlocksByCapabilities(
  blocks: ContentBlock[],
  capabilities: CompanyProfileCapabilities
) {
  return blocks.filter((block) => {
    if (block.type === "gallery" && !capabilities.gallery) return false;
    if (block.type === "video" && !capabilities.video) return false;
    if (block.type === "html" && !capabilities.html) return false;
    return true;
  });
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
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

async function parseRequiredLanguages(formData: FormData): Promise<string[]> {
  const lang = formData.get("requiredLanguage")?.toString().trim();
  if (!lang || lang === "none") return [];
  const canonicalLanguage = await resolveConfigOptionValue(
    OPTION_GROUPS.requiredLanguage,
    lang
  );
  return canonicalLanguage && canonicalLanguage !== "none" ? [canonicalLanguage] : [];
}

async function buildEmployerJobPostingInput(formData: FormData) {
  const [
    industry,
    location,
    workType,
    industrialZone,
    requiredLanguages,
    languageProficiency,
    shiftType,
  ] = await Promise.all([
    resolveConfigOptionValue(OPTION_GROUPS.industry, formData.get("industry")?.toString().trim() || null),
    resolveConfigOptionValue(OPTION_GROUPS.location, formData.get("location")?.toString().trim() || null),
    resolveConfigOptionValue(OPTION_GROUPS.workType, formData.get("workType")?.toString().trim() || null),
    resolveConfigOptionValue(OPTION_GROUPS.industrialZone, formData.get("industrialZone")?.toString().trim() || null),
    parseRequiredLanguages(formData),
    resolveConfigOptionValue(OPTION_GROUPS.languageProficiency, formData.get("languageProficiency")?.toString().trim() || null),
    resolveConfigOptionValue(OPTION_GROUPS.shiftType, formData.get("shiftType")?.toString().trim() || null),
  ]);

  return {
    title: formData.get("title")?.toString().trim() ?? "",
    description: formData.get("description")?.toString().trim() ?? "",
    requirements: formData.get("requirements")?.toString().trim() || null,
    benefits: formData.get("benefits")?.toString().trim() || null,
    salaryMin: parseNullableNumber(formData.get("salaryMin")),
    salaryMax: parseNullableNumber(formData.get("salaryMax")),
    salaryDisplay: formData.get("salaryDisplay")?.toString().trim() || null,
    industry,
    position: formData.get("position")?.toString().trim() || null,
    location,
    workType,
    quantity: Number(formData.get("quantity")?.toString().trim() || "1"),
    skills: parseJobPostingSkills(formData.get("skills")),
    industrialZone,
    requiredLanguages,
    languageProficiency,
    shiftType,
  };
}

export async function registerEmployerAction(formData: FormData) {
  const parsedInput = employerRegisterSchema.safeParse({
    email: formData.get("email")?.toString().trim().toLowerCase(),
    password: formData.get("password")?.toString() ?? "",
    confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
    companyName: formData.get("companyName")?.toString().trim() ?? "",
  });

  const rateLimitKey = await buildServerActionRateLimitKey(
    "employer-register",
    parsedInput.success ? parsedInput.data.email : formData.get("companyName")?.toString()
  );
  const rateLimit = await checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: `Thu lai sau ${rateLimit.retryAfterSeconds} giay.`,
    };
  }

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }

  const { email, password, companyName } = parsedInput.data;
  const existing = await findEmployerByEmail(email);
  if (existing) {
    return { success: false, message: "Email da duoc su dung." };
  }

  const hashedPassword = hashSync(password, 10);
  let slug = generateSlug(companyName);

  const slugExists = await findEmployerBySlug(slug);
  if (slugExists) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await createEmployerAccount({
    email,
    password: hashedPassword,
    companyName,
    slug,
    status: "PENDING",
  });

  return {
    success: true,
    message: "Dang ky thanh cong. Tai khoan dang cho admin duyet.",
  };
}

export async function loginEmployerAction(formData: FormData) {
  const parsedInput = employerLoginSchema.safeParse({
    email: formData.get("email")?.toString().trim().toLowerCase(),
    password: formData.get("password")?.toString() ?? "",
  });
  const email = parsedInput.success ? parsedInput.data.email : undefined;

  const rateLimitKey = await buildServerActionRateLimitKey("employer-login", email);
  const rateLimit = await checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: `Thu lai sau ${rateLimit.retryAfterSeconds} giay.`,
    };
  }

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }

  const { email: normalizedEmail, password } = parsedInput.data;
  const employer = await findEmployerByEmail(normalizedEmail);
  if (!employer) {
    return { success: false, message: "Email hoac mat khau khong dung." };
  }

  const valid = compareSync(password, employer.password);
  if (!valid) {
    return { success: false, message: "Email hoac mat khau khong dung." };
  }

  if (employer.status === "PENDING") {
    return {
      success: false,
      message: "Tai khoan chua duoc duyet. Vui long cho admin kich hoat.",
    };
  }

  if (employer.status === "SUSPENDED") {
    return {
      success: false,
      message: "Tai khoan da bi khoa. Vui long lien he admin.",
    };
  }

  const token = await signEmployerToken({
    employerId: employer.id,
    email: employer.email,
    companyName: employer.companyName,
    status: employer.status,
  });

  await setEmployerCookie(token);
  redirect("/employer/dashboard");
}

export async function logoutEmployerAction() {
  await clearEmployerCookie();
  redirect("/employer/login");
}

export async function getEmployerDashboardData() {
  const session = await requireEmployerSession();
  const dashboardData = await getEmployerDashboardSnapshot(session.employerId);

  if (!dashboardData) {
    redirect("/employer/login");
  }

  return dashboardData;
}

export async function updateCompanyProfileAction(formData: FormData) {
  const session = await requireEmployerSession();
  const employer = await getEmployerProfileForPortalById(session.employerId);

  if (!employer) {
    return { success: false, message: "Không tìm thấy tài khoản công ty." };
  }

  const websiteInput = formData.get("website")?.toString().trim() || null;
  const normalizedWebsite = normalizeWebsite(websiteInput);
  const [industry, companySize, location, industrialZone] = await Promise.all([
    resolveConfigOptionValue(
      OPTION_GROUPS.industry,
      formData.get("industry")?.toString().trim() || null
    ),
    resolveConfigOptionValue(
      OPTION_GROUPS.companySize,
      formData.get("companySize")?.toString().trim() || null
    ),
    resolveConfigOptionValue(
      OPTION_GROUPS.location,
      formData.get("location")?.toString().trim() || null
    ),
    resolveConfigOptionValue(
      OPTION_GROUPS.industrialZone,
      formData.get("industrialZone")?.toString().trim() || null
    ),
  ]);
  const parsedInput = employerProfileSchema.safeParse({
    companyName: formData.get("companyName")?.toString().trim() ?? "",
    description: formData.get("description")?.toString().trim() || null,
    industry,
    companySize,
    address: formData.get("address")?.toString().trim() || null,
    location,
    industrialZone,
    website: websiteInput ? normalizedWebsite ?? websiteInput : null,
    phone: formData.get("phone")?.toString().trim() || null,
  });

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }

  const currentCapabilities = normalizeCompanyCapabilities(
    employer.profileConfig?.capabilities ?? DEFAULT_COMPANY_CAPABILITIES
  );
  const currentTheme = normalizeCompanyTheme(employer.profileConfig?.theme ?? DEFAULT_COMPANY_THEME);
  const profileTheme = currentCapabilities.theme
    ? normalizeCompanyTheme(parseJson(formData.get("profileTheme")?.toString() ?? ""))
    : currentTheme;
  const profileSections = filterProfileBlocksByCapabilities(
    normalizeContentBlocks(formData.get("profileSections")?.toString() ?? "[]"),
    currentCapabilities
  );
  const primaryVideoUrl = currentCapabilities.video
    ? strNull(formData.get("primaryVideoUrl"))
    : employer.profileConfig?.primaryVideoUrl ?? null;

  if (countBlockImages(profileSections) > currentCapabilities.maxImages) {
    return {
      success: false,
      message: `Bạn chỉ được dùng tối đa ${currentCapabilities.maxImages} ảnh trong builder.`,
    };
  }

  const workspace = await getWorkspaceForEmployer(session.employerId);
  if (!workspace) {
    return {
      success: false,
      message: "Company Workspace chưa được liên kết với tài khoản này.",
    };
  }

  const logoFile = formData.get("logo");
  const nextLogo = logoFile instanceof File && logoFile.size > 0 ? logoFile : null;
  let uploadedLogoUrl: string | null = null;

  if (nextLogo) {
    const result = await uploadEmployerImageFile(
      "logos",
      `employer-logo-${session.employerId}`,
      nextLogo,
      MAX_LOGO_SIZE_BYTES
    );
    if ("error" in result) {
      return { success: false, message: result.error };
    }
    uploadedLogoUrl = result.url;
  }

  const coverFile = formData.get("coverImage");
  const nextCover = coverFile instanceof File && coverFile.size > 0 ? coverFile : null;
  let uploadedCoverUrl: string | null = null;

  if (nextCover) {
    const result = await uploadEmployerImageFile(
      "covers",
      `employer-cover-${session.employerId}`,
      nextCover,
      MAX_COVER_SIZE_BYTES
    );
    if ("error" in result) {
      if (uploadedLogoUrl) await deleteFile(uploadedLogoUrl);
      return { success: false, message: result.error };
    }
    uploadedCoverUrl = result.url;
  }

  try {
    const existingDraft = await prisma.companyProfileDraft.findFirst({
      where: {
        workspaceId: workspace.id,
        status: {
          in: [
            CompanyDraftStatus.DRAFT,
            CompanyDraftStatus.SUBMITTED,
            CompanyDraftStatus.REJECTED,
          ],
        },
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });

    const draftPayload = {
      companyName: parsedInput.data.companyName,
      description: parsedInput.data.description || null,
      logo: uploadedLogoUrl ?? employer.logo,
      coverImage: uploadedCoverUrl ?? employer.coverImage,
      industry: parsedInput.data.industry || null,
      companySize: parsedInput.data.companySize ?? null,
      address: parsedInput.data.address || null,
      location: parsedInput.data.location || null,
      industrialZone: parsedInput.data.industrialZone || null,
      website: parsedInput.data.website || null,
      phone: parsedInput.data.phone || null,
      coverPositionX: parseInt(formData.get("coverPositionX")?.toString() || "50") || 50,
      coverPositionY: parseInt(formData.get("coverPositionY")?.toString() || "50") || 50,
      coverZoom: parseInt(formData.get("coverZoom")?.toString() || "100") || 100,
      profileConfig: {
        theme: profileTheme,
        capabilities: currentCapabilities,
        sections: profileSections,
        primaryVideoUrl,
      },
    };
    const draftData = {
      payload: JSON.parse(JSON.stringify(draftPayload)) as Prisma.InputJsonValue,
      status: CompanyDraftStatus.SUBMITTED,
      submittedByName: employer.companyName,
      submittedByEmail: employer.email,
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedById: null,
      rejectReason: null,
    };

    if (existingDraft) {
      await prisma.companyProfileDraft.update({
        where: { id: existingDraft.id },
        data: draftData,
      });
    } else {
      await prisma.companyProfileDraft.create({
        data: { workspaceId: workspace.id, ...draftData },
      });
    }

    revalidatePath("/employer/company");
    revalidatePath("/companies");
    revalidatePath(`/companies/${workspace.id}`);

    return {
      success: true,
      message: "Đã gửi bản nháp hồ sơ công ty để admin duyệt.",
    };
  } catch (error) {
    if (uploadedLogoUrl) await deleteFile(uploadedLogoUrl);
    if (uploadedCoverUrl) await deleteFile(uploadedCoverUrl);
    console.error("updateCompanyProfileAction error:", error);
    return {
      success: false,
      message: "Không thể cập nhật thông tin công ty.",
    };
  }



}

export async function getCompanyProfile() {
  const session = await requireEmployerSession();
  return getEmployerProfileForPortalById(session.employerId);
}

export async function getCompanyProfileDraftStatus() {
  const session = await requireEmployerSession();
  const workspace = await getWorkspaceForEmployer(session.employerId);

  if (!workspace) return null;

  const draft = await prisma.companyProfileDraft.findFirst({
    where: {
      workspaceId: workspace.id,
      status: {
        in: [CompanyDraftStatus.SUBMITTED, CompanyDraftStatus.REJECTED],
      },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      reviewedAt: true,
      rejectReason: true,
      updatedAt: true,
    },
  });

  if (!draft) return null;

  return {
    ...draft,
    submittedAt: draft.submittedAt?.toISOString() ?? null,
    reviewedAt: draft.reviewedAt?.toISOString() ?? null,
    updatedAt: draft.updatedAt.toISOString(),
  };
}

export async function getCompanyProfileOptions() {
  const session = await requireEmployerSession();
  const employer = await getEmployerProfileById(session.employerId);

  const [industryOptions, companySizeOptions, locationOptions, industrialZoneOptions] = await Promise.all([
    getOptionsForSelect(OPTION_GROUPS.industry, { currentValue: employer?.industry }),
    getOptionsForSelect(OPTION_GROUPS.companySize, { currentValue: employer?.companySize }),
    getOptionsForSelect(OPTION_GROUPS.location, { currentValue: employer?.location }),
    getOptionsForSelect(OPTION_GROUPS.industrialZone, { currentValue: employer?.industrialZone }),
  ]);

  return { industryOptions, companySizeOptions, locationOptions, industrialZoneOptions };
}

export async function getJobPostingFormOptions(current?: {
  industry?: string | null;
  location?: string | null;
  workType?: string | null;
  industrialZone?: string | null;
  requiredLanguage?: string | null;
  languageProficiency?: string | null;
  shiftType?: string | null;
}) {
  await requireEmployerSession();

  const [
    industryOptions,
    locationOptions,
    workTypeOptions,
    industrialZoneItems,
    requiredLanguageOptions,
    languageProficiencyOptions,
    shiftTypeOptions,
  ] = await Promise.all([
    getOptionsForSelect(OPTION_GROUPS.industry, { currentValue: current?.industry }),
    getOptionsForSelect(OPTION_GROUPS.location, { currentValue: current?.location }),
    getOptionsForSelect(OPTION_GROUPS.workType, { currentValue: current?.workType }),
    getConfigOptionItems(OPTION_GROUPS.industrialZone, { includeInactive: true }),
    getOptionsForSelect(OPTION_GROUPS.requiredLanguage, { currentValue: current?.requiredLanguage }),
    getOptionsForSelect(OPTION_GROUPS.languageProficiency, { currentValue: current?.languageProficiency }),
    getOptionsForSelect(OPTION_GROUPS.shiftType, { currentValue: current?.shiftType }),
  ]);

  const industrialZoneGroups = Object.values(
    industrialZoneItems
      .filter((item) => item.isActive || item.value === current?.industrialZone)
      .reduce<Record<string, { group: string; zones: { value: string; label: string }[] }>>(
        (groups, item) => {
          const region =
            item.metadata &&
            typeof item.metadata === "object" &&
            !Array.isArray(item.metadata) &&
            "region" in item.metadata &&
            typeof item.metadata.region === "string"
              ? item.metadata.region
              : "Khác";

          groups[region] ??= { group: region, zones: [] };
          groups[region].zones.push({ value: item.value, label: item.label });
          return groups;
        },
        {}
      )
  );

  return {
    industryOptions,
    locationOptions,
    workTypeOptions,
    industrialZoneGroups,
    requiredLanguageOptions,
    languageProficiencyOptions,
    shiftTypeOptions,
  };
}

export async function getSubscriptionData() {
  const session = await requireEmployerSession({ allowExpiredSubscription: true });
  return getEmployerSubscriptionSnapshot(session.employerId);
}

export async function getMyJobPostings(status?: string, page = 1) {
  const session = await requireEmployerSession();
  return getEmployerJobPostingsForPortal(session.employerId, status, page);
}

export async function getEmployerNotificationData() {
  const session = await requireEmployerSession({ allowExpiredSubscription: true });
  return getEmployerNotificationSnapshot(session.employerId);
}

export async function getJobPostingDetail(id: number) {
  const session = await requireEmployerSession();
  return getEmployerOwnedJobPosting(id, session.employerId);
}

export async function createJobPostingAction(formData: FormData) {
  const session = await requireEmployerSession();
  const employer = await getEmployerWithSubscription(session.employerId);

  if (!employer) {
    return { success: false, message: "Khong tim thay tai khoan." };
  }

  const sub = employer.subscription;
  if (!sub || sub.status !== "ACTIVE") {
    return { success: false, message: "Ban chua co goi dich vu dang hoat dong." };
  }

  if (sub.jobsUsed >= sub.jobQuota) {
    return {
      success: false,
      message: `Ban da het luot dang tin (${sub.jobsUsed}/${sub.jobQuota}).`,
    };
  }

  const parsedInput = employerJobPostingSchema.safeParse(
    await buildEmployerJobPostingInput(formData)
  );
  const coverInput = buildEmployerJobCoverInput(formData);

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }
  if (coverInput.coverImage && !coverInput.coverAlt) {
    return { success: false, message: "Vui lòng nhập alt text cho ảnh cover." };
  }

  const duplicate = await findRecentEmployerJobPostingDuplicate(
    session.employerId,
    parsedInput.data.title,
    parsedInput.data.description
  );

  if (duplicate) {
    return {
      success: false,
      message: "Tin này vừa được tạo. Vui lòng kiểm tra danh sách tin.",
    };
  }

  let slug = generateSlug(parsedInput.data.title);
  const slugExists = await findEmployerJobPostingBySlug(slug);
  if (slugExists) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  try {
    await createEmployerJobPostingAndIncrementQuota({
      employerId: session.employerId,
      subscriptionId: sub.id,
      jobPosting: {
        title: parsedInput.data.title,
        slug,
        coverImage: coverInput.coverImage,
        coverAlt: coverInput.coverAlt,
        description: parsedInput.data.description,
        requirements: parsedInput.data.requirements || null,
        benefits: parsedInput.data.benefits || null,
        salaryMin: parsedInput.data.salaryMin ?? null,
        salaryMax: parsedInput.data.salaryMax ?? null,
        salaryDisplay: parsedInput.data.salaryDisplay || null,
        industry: parsedInput.data.industry || null,
        position: parsedInput.data.position || null,
        location: parsedInput.data.location || null,
        workType: parsedInput.data.workType || null,
        quantity: parsedInput.data.quantity,
        skills: parsedInput.data.skills,
        industrialZone: parsedInput.data.industrialZone || null,
        requiredLanguages: parsedInput.data.requiredLanguages,
        languageProficiency: parsedInput.data.languageProficiency || null,
        shiftType: parsedInput.data.shiftType || null,
        status: "PENDING",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "QUOTA_EXHAUSTED") {
      return {
        success: false,
        message: "Bạn đã hết lượt đăng tin. Vui lòng gia hạn gói.",
      };
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Tin này đang được xử lý. Vui lòng kiểm tra danh sách tin.",
      };
    }

    console.error("createJobPostingAction error:", error);
    return {
      success: false,
      message: "Không thể đăng tin lúc này. Vui lòng thử lại.",
    };
  }

  revalidatePath("/employer/job-postings");
  revalidatePath("/employer/dashboard");
  redirect("/employer/job-postings");
}

export async function updateJobPostingAction(id: number, formData: FormData) {
  const session = await requireEmployerSession();
  const job = await getEmployerOwnedJobPosting(id, session.employerId);

  if (!job) {
    return { success: false, message: "Khong tim thay tin tuyen dung." };
  }

  const parsedInput = employerJobPostingSchema.safeParse(
    await buildEmployerJobPostingInput(formData)
  );
  const coverInput = buildEmployerJobCoverInput(formData);

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }
  if (coverInput.coverImage && !coverInput.coverAlt) {
    return { success: false, message: "Vui lòng nhập alt text cho ảnh cover." };
  }

  await updateEmployerJobPosting(id, {
    title: parsedInput.data.title,
    coverImage: coverInput.coverImage,
    coverAlt: coverInput.coverAlt,
    description: parsedInput.data.description,
    requirements: parsedInput.data.requirements || null,
    benefits: parsedInput.data.benefits || null,
    salaryMin: parsedInput.data.salaryMin ?? null,
    salaryMax: parsedInput.data.salaryMax ?? null,
    salaryDisplay: parsedInput.data.salaryDisplay || null,
    industry: parsedInput.data.industry || null,
    position: parsedInput.data.position || null,
    location: parsedInput.data.location || null,
    workType: parsedInput.data.workType || null,
    quantity: parsedInput.data.quantity,
    skills: parsedInput.data.skills,
    industrialZone: parsedInput.data.industrialZone || null,
    requiredLanguages: parsedInput.data.requiredLanguages,
    languageProficiency: parsedInput.data.languageProficiency || null,
    shiftType: parsedInput.data.shiftType || null,
    status: job.status === "REJECTED" ? "PENDING" : job.status,
  });

  revalidatePath("/employer/job-postings");
  revalidatePath(`/employer/job-postings/${id}`);
  revalidatePath("/viec-lam");
  revalidatePath(`/viec-lam/${job.slug}`);
  return { success: true, message: "Cap nhat tin thanh cong." };
}

export async function toggleJobPostingStatus(id: number) {
  const session = await requireEmployerSession();
  const job = await getEmployerOwnedJobPosting(id, session.employerId);

  if (!job) {
    return { success: false, message: "Khong tim thay tin." };
  }

  if (job.status === "APPROVED") {
    await updateEmployerJobPostingStatus(id, "PAUSED");
    revalidatePath("/employer/job-postings");
    return { success: true, message: "Da tam an tin." };
  }

  if (job.status === "PAUSED") {
    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      return { success: false, message: "Tin da het han, khong the bat lai." };
    }

    await updateEmployerJobPostingStatus(id, "APPROVED");
    revalidatePath("/employer/job-postings");
    return { success: true, message: "Da bat lai tin." };
  }

  return {
    success: false,
    message: "Chi co the an hoac bat lai tin dang hien thi hoac tam an.",
  };
}

export async function deleteJobPostingAction(id: number) {
  const session = await requireEmployerSession();
  const result = await deleteEmployerJobPostingWithQuotaPolicy(id, session.employerId);

  if (!result) {
    return { success: false, message: "Không tìm thấy tin." };
  }

  revalidatePath("/employer/job-postings");
  revalidatePath("/employer/dashboard");
  revalidatePath("/viec-lam");
  revalidatePath("/cong-ty");
  revalidatePath(`/viec-lam/${result.slug}`);

  if (result.mode === "deleted") {
    return {
      success: true,
      deleted: true,
      message: result.refunded
        ? "Đã xoá tin và hoàn 1 lượt đăng."
        : "Đã xoá tin.",
    };
  }

  return {
    success: true,
    deleted: false,
    message: "Tin đã có ứng viên nên được tạm ẩn để giữ lịch sử. Không hoàn quota.",
  };
}

export async function getJobApplicants(jobPostingId: number) {
  const session = await requireEmployerSession();
  return getEmployerJobApplicants(jobPostingId, session.employerId);
}

export async function getRecruitmentPipelineData(jobPostingId?: number) {
  const session = await requireEmployerSession();
  return getEmployerApplicationPipelineData(session.employerId, jobPostingId);
}

export async function updateApplicationPipelineStatusAction(
  applicationId: number,
  status: string
) {
  const session = await requireEmployerSession();
  const nextStatus = Object.values(ApplicationStatus).includes(status as ApplicationStatus)
    ? (status as ApplicationStatus)
    : null;

  if (!nextStatus) {
    return { success: false, message: "Trạng thái ứng viên không hợp lệ." };
  }

  const application = await updateEmployerApplicationStatus(
    session.employerId,
    applicationId,
    nextStatus
  );

  if (!application) {
    return { success: false, message: "Không tìm thấy hồ sơ ứng tuyển." };
  }

  revalidatePath("/employer/pipeline");
  revalidatePath("/employer/job-postings");
  revalidatePath(`/employer/job-postings/${application.jobPosting.id}`);

  return { success: true, application };
}
