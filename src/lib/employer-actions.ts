"use server";

import { compareSync, hashSync } from "bcrypt-ts";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  clearEmployerCookie,
  requireEmployerSession,
  setEmployerCookie,
  signEmployerToken,
} from "@/lib/employer-auth";
import {
  buildServerActionRateLimitKey,
  checkRateLimit,
} from "@/lib/rate-limit";

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

export async function registerEmployerAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const companyName = formData.get("companyName")?.toString().trim() ?? "";

  const rateLimitKey = await buildServerActionRateLimitKey(
    "employer-register",
    email || companyName
  );
  const rateLimit = checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: `Thu lai sau ${rateLimit.retryAfterSeconds} giay.`,
    };
  }

  if (!email || !password || !companyName) {
    return { success: false, message: "Vui long dien day du thong tin." };
  }

  if (password.length < 8) {
    return { success: false, message: "Mat khau phai co it nhat 8 ky tu." };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Mat khau xac nhan khong khop." };
  }

  const existing = await prisma.employer.findUnique({ where: { email } });
  if (existing) {
    return { success: false, message: "Email da duoc su dung." };
  }

  const hashedPassword = hashSync(password, 10);
  let slug = generateSlug(companyName);

  const slugExists = await prisma.employer.findUnique({ where: { slug } });
  if (slugExists) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await prisma.employer.create({
    data: {
      email,
      password: hashedPassword,
      companyName,
      slug,
      status: "PENDING",
    },
  });

  return {
    success: true,
    message: "Dang ky thanh cong. Tai khoan dang cho admin duyet.",
  };
}

export async function loginEmployerAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const password = formData.get("password") as string;

  const rateLimitKey = await buildServerActionRateLimitKey("employer-login", email);
  const rateLimit = checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: `Thu lai sau ${rateLimit.retryAfterSeconds} giay.`,
    };
  }

  if (!email || !password) {
    return { success: false, message: "Vui long nhap email va mat khau." };
  }

  const employer = await prisma.employer.findUnique({ where: { email } });
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

  const employer = await prisma.employer.findUnique({
    where: { id: session.employerId },
    include: {
      subscription: true,
      jobPostings: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { applications: true } },
        },
      },
    },
  });

  if (!employer) redirect("/employer/login");

  const totalJobs = await prisma.jobPosting.count({
    where: { employerId: session.employerId },
  });

  const pendingJobs = await prisma.jobPosting.count({
    where: { employerId: session.employerId, status: "PENDING" },
  });

  const approvedJobs = await prisma.jobPosting.count({
    where: { employerId: session.employerId, status: "APPROVED" },
  });

  const totalApplicants = await prisma.application.count({
    where: { jobPosting: { employerId: session.employerId } },
  });

  const newApplicants = await prisma.application.count({
    where: {
      jobPosting: { employerId: session.employerId },
      status: "NEW",
    },
  });

  const recentApplications = await prisma.application.findMany({
    where: { jobPosting: { employerId: session.employerId } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      jobPosting: { select: { title: true } },
    },
  });

  return {
    employer,
    stats: {
      totalJobs,
      pendingJobs,
      approvedJobs,
      totalApplicants,
      newApplicants,
      quotaTotal: employer.subscription?.jobQuota ?? 0,
      quotaUsed: employer.subscription?.jobsUsed ?? 0,
    },
    recentJobs: employer.jobPostings,
    recentApplications,
  };
}

export async function updateCompanyProfileAction(formData: FormData) {
  const session = await requireEmployerSession();

  const companyName = formData.get("companyName")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  const industry = formData.get("industry")?.toString().trim() ?? "";
  const companySize = formData.get("companySize")?.toString().trim() ?? "";
  const address = formData.get("address")?.toString().trim() ?? "";
  const website = formData.get("website")?.toString().trim() ?? "";
  const phone = formData.get("phone")?.toString().trim() ?? "";

  if (!companyName) {
    return { success: false, message: "Ten cong ty khong duoc de trong." };
  }

  const validSizes = ["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"];
  const sizeValue = validSizes.includes(companySize) ? companySize : undefined;

  await prisma.employer.update({
    where: { id: session.employerId },
    data: {
      companyName,
      description: description || null,
      industry: industry || null,
      companySize: sizeValue as "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE" | undefined,
      address: address || null,
      website: website || null,
      phone: phone || null,
    },
  });

  revalidatePath("/employer/company");
  return { success: true, message: "Cap nhat thong tin thanh cong." };
}

export async function getCompanyProfile() {
  const session = await requireEmployerSession();
  return prisma.employer.findUnique({
    where: { id: session.employerId },
  });
}

export async function getSubscriptionData() {
  const session = await requireEmployerSession();
  return prisma.employer.findUnique({
    where: { id: session.employerId },
    include: { subscription: true },
  });
}

export async function getMyJobPostings(status?: string, page = 1) {
  const session = await requireEmployerSession();
  const take = 10;
  const skip = (page - 1) * take;
  const where: Record<string, unknown> = { employerId: session.employerId };

  if (status && status !== "ALL") {
    where.status = status;
  }

  const [jobs, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: { _count: { select: { applications: true } } },
    }),
    prisma.jobPosting.count({ where }),
  ]);

  return { jobs, total, page, totalPages: Math.ceil(total / take) };
}

export async function getJobPostingDetail(id: number) {
  const session = await requireEmployerSession();
  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: {
      employer: { select: { id: true, companyName: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!job || job.employerId !== session.employerId) return null;
  return job;
}

export async function createJobPostingAction(formData: FormData) {
  const session = await requireEmployerSession();

  const employer = await prisma.employer.findUnique({
    where: { id: session.employerId },
    include: { subscription: true },
  });

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

  const title = formData.get("title")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";

  if (!title || !description) {
    return { success: false, message: "Tieu de va mo ta khong duoc de trong." };
  }

  const requirements = formData.get("requirements")?.toString().trim() ?? "";
  const benefits = formData.get("benefits")?.toString().trim() ?? "";
  const salaryMin = formData.get("salaryMin")?.toString().trim() ?? "";
  const salaryMax = formData.get("salaryMax")?.toString().trim() ?? "";
  const salaryDisplay = formData.get("salaryDisplay")?.toString().trim() ?? "";
  const industry = formData.get("industry")?.toString().trim() ?? "";
  const position = formData.get("position")?.toString().trim() ?? "";
  const location = formData.get("location")?.toString().trim() ?? "";
  const workType = formData.get("workType")?.toString().trim() ?? "";
  const quantity = formData.get("quantity")?.toString().trim() ?? "";
  const skills = formData.get("skills")?.toString().trim() ?? "";

  let slug = generateSlug(title);
  const slugExists = await prisma.jobPosting.findUnique({ where: { slug } });
  if (slugExists) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await prisma.$transaction([
    prisma.jobPosting.create({
      data: {
        title,
        slug,
        description,
        requirements: requirements || null,
        benefits: benefits || null,
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
        salaryDisplay: salaryDisplay || null,
        industry: industry || null,
        position: position || null,
        location: location || null,
        workType: workType || null,
        quantity: quantity ? parseInt(quantity, 10) : 1,
        skills: skills || null,
        status: "PENDING",
        employerId: session.employerId,
      },
    }),
    prisma.subscription.update({
      where: { id: sub.id },
      data: { jobsUsed: { increment: 1 } },
    }),
  ]);

  revalidatePath("/employer/job-postings");
  redirect("/employer/job-postings");
}

export async function updateJobPostingAction(id: number, formData: FormData) {
  const session = await requireEmployerSession();

  const job = await prisma.jobPosting.findUnique({ where: { id } });
  if (!job || job.employerId !== session.employerId) {
    return { success: false, message: "Khong tim thay tin tuyen dung." };
  }

  const title = formData.get("title")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";

  if (!title || !description) {
    return { success: false, message: "Tieu de va mo ta khong duoc de trong." };
  }

  await prisma.jobPosting.update({
    where: { id },
    data: {
      title,
      description,
      requirements: formData.get("requirements")?.toString().trim() || null,
      benefits: formData.get("benefits")?.toString().trim() || null,
      salaryMin: formData.get("salaryMin")
        ? parseFloat(formData.get("salaryMin") as string)
        : null,
      salaryMax: formData.get("salaryMax")
        ? parseFloat(formData.get("salaryMax") as string)
        : null,
      salaryDisplay: formData.get("salaryDisplay")?.toString().trim() || null,
      industry: formData.get("industry")?.toString().trim() || null,
      position: formData.get("position")?.toString().trim() || null,
      location: formData.get("location")?.toString().trim() || null,
      workType: formData.get("workType")?.toString().trim() || null,
      quantity: formData.get("quantity")
        ? parseInt(formData.get("quantity") as string, 10)
        : 1,
      skills: formData.get("skills")?.toString().trim() || null,
      status: job.status === "REJECTED" ? "PENDING" : job.status,
    },
  });

  revalidatePath("/employer/job-postings");
  return { success: true, message: "Cap nhat tin thanh cong." };
}

export async function toggleJobPostingStatus(id: number) {
  const session = await requireEmployerSession();

  const job = await prisma.jobPosting.findUnique({ where: { id } });
  if (!job || job.employerId !== session.employerId) {
    return { success: false, message: "Khong tim thay tin." };
  }

  if (job.status === "APPROVED") {
    await prisma.jobPosting.update({
      where: { id },
      data: { status: "PAUSED" },
    });
    revalidatePath("/employer/job-postings");
    return { success: true, message: "Da tam an tin." };
  }

  if (job.status === "PAUSED") {
    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      return { success: false, message: "Tin da het han, khong the bat lai." };
    }

    await prisma.jobPosting.update({
      where: { id },
      data: { status: "APPROVED" },
    });
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

  const job = await prisma.jobPosting.findUnique({
    where: { id: jobPostingId },
    select: { employerId: true, title: true },
  });

  if (!job || job.employerId !== session.employerId) return null;

  const applicants = await prisma.application.findMany({
    where: { jobPostingId },
    orderBy: { createdAt: "desc" },
  });

  return { jobTitle: job.title, applicants };
}
