"use server";

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
  findEmployerByEmail,
  findEmployerBySlug,
  findEmployerJobPostingBySlug,
  getEmployerDashboardSnapshot,
  getEmployerJobApplicants,
  getEmployerJobPostingsForPortal,
  getEmployerOwnedJobPosting,
  getEmployerProfileById,
  getEmployerSubscriptionSnapshot,
  getEmployerWithSubscription,
  updateEmployerJobPosting,
  updateEmployerJobPostingStatus,
  updateEmployerProfileById,
} from "@/lib/employers";
import {
  buildServerActionRateLimitKey,
  checkRateLimit,
} from "@/lib/rate-limit-redis";
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

function parseRequiredLanguages(formData: FormData): string[] {
  const lang = formData.get("requiredLanguage")?.toString().trim();
  if (!lang || lang === "none") return [];
  return [lang];
}

function buildEmployerJobPostingInput(formData: FormData) {
  return {
    title: formData.get("title")?.toString().trim() ?? "",
    description: formData.get("description")?.toString().trim() ?? "",
    requirements: formData.get("requirements")?.toString().trim() || null,
    benefits: formData.get("benefits")?.toString().trim() || null,
    salaryMin: parseNullableNumber(formData.get("salaryMin")),
    salaryMax: parseNullableNumber(formData.get("salaryMax")),
    salaryDisplay: formData.get("salaryDisplay")?.toString().trim() || null,
    industry: formData.get("industry")?.toString().trim() || null,
    position: formData.get("position")?.toString().trim() || null,
    location: formData.get("location")?.toString().trim() || null,
    workType: formData.get("workType")?.toString().trim() || null,
    quantity: Number(formData.get("quantity")?.toString().trim() || "1"),
    skills: parseJobPostingSkills(formData.get("skills")),
    industrialZone: formData.get("industrialZone")?.toString().trim() || null,
    requiredLanguages: parseRequiredLanguages(formData),
    languageProficiency: formData.get("languageProficiency")?.toString().trim() || null,
    visaSupport: formData.get("visaSupport")?.toString().trim() || null,
    shiftType: formData.get("shiftType")?.toString().trim() || null,
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
  const websiteInput = formData.get("website")?.toString().trim() || null;
  const normalizedWebsite = normalizeWebsite(websiteInput);
  const parsedInput = employerProfileSchema.safeParse({
    companyName: formData.get("companyName")?.toString().trim() ?? "",
    description: formData.get("description")?.toString().trim() || null,
    industry: formData.get("industry")?.toString().trim() || null,
    companySize: formData.get("companySize")?.toString().trim() || null,
    address: formData.get("address")?.toString().trim() || null,
    website: websiteInput ? normalizedWebsite ?? websiteInput : null,
    phone: formData.get("phone")?.toString().trim() || null,
  });

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }

  await updateEmployerProfileById(session.employerId, {
    companyName: parsedInput.data.companyName,
    description: parsedInput.data.description || null,
    industry: parsedInput.data.industry || null,
    companySize: parsedInput.data.companySize ?? undefined,
    address: parsedInput.data.address || null,
    website: parsedInput.data.website || null,
    phone: parsedInput.data.phone || null,
    coverPositionX: parseInt(formData.get("coverPositionX")?.toString() || "50") || 50,
    coverPositionY: parseInt(formData.get("coverPositionY")?.toString() || "50") || 50,
    coverZoom: parseInt(formData.get("coverZoom")?.toString() || "100") || 100,
  });

  revalidatePath("/employer/company");
  return { success: true, message: "Cap nhat thong tin thanh cong." };
}

export async function getCompanyProfile() {
  const session = await requireEmployerSession();
  return getEmployerProfileById(session.employerId);
}

export async function getSubscriptionData() {
  const session = await requireEmployerSession({ allowExpiredSubscription: true });
  return getEmployerSubscriptionSnapshot(session.employerId);
}

export async function getMyJobPostings(status?: string, page = 1) {
  const session = await requireEmployerSession();
  return getEmployerJobPostingsForPortal(session.employerId, status, page);
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
    buildEmployerJobPostingInput(formData)
  );

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }

  let slug = generateSlug(parsedInput.data.title);
  const slugExists = await findEmployerJobPostingBySlug(slug);
  if (slugExists) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await createEmployerJobPostingAndIncrementQuota({
    employerId: session.employerId,
    subscriptionId: sub.id,
    jobPosting: {
      title: parsedInput.data.title,
      slug,
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
      visaSupport: parsedInput.data.visaSupport || null,
      shiftType: parsedInput.data.shiftType || null,
      status: "PENDING",
    },
  });

  revalidatePath("/employer/job-postings");
  redirect("/employer/job-postings");
}

export async function updateJobPostingAction(id: number, formData: FormData) {
  const session = await requireEmployerSession();
  const job = await getEmployerOwnedJobPosting(id, session.employerId);

  if (!job) {
    return { success: false, message: "Khong tim thay tin tuyen dung." };
  }

  const parsedInput = employerJobPostingSchema.safeParse(
    buildEmployerJobPostingInput(formData)
  );

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }

  await updateEmployerJobPosting(id, {
    title: parsedInput.data.title,
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
    visaSupport: parsedInput.data.visaSupport || null,
    shiftType: parsedInput.data.shiftType || null,
    status: job.status === "REJECTED" ? "PENDING" : job.status,
  });

  revalidatePath("/employer/job-postings");
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

export async function getJobApplicants(jobPostingId: number) {
  const session = await requireEmployerSession();
  return getEmployerJobApplicants(jobPostingId, session.employerId);
}
