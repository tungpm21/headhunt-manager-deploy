"use server";

import { prisma } from "@/lib/prisma";
import { hashSync, compareSync } from "bcrypt-ts";
import {
  signEmployerToken,
  setEmployerCookie,
  clearEmployerCookie,
  requireEmployerSession,
} from "@/lib/employer-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

// ==================== AUTH ACTIONS ====================

export async function registerEmployerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const companyName = formData.get("companyName") as string;

  if (!email || !password || !companyName) {
    return { success: false, message: "Vui lòng điền đầy đủ thông tin." };
  }

  if (password.length < 6) {
    return { success: false, message: "Mật khẩu phải có ít nhất 6 ký tự." };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Mật khẩu xác nhận không khớp." };
  }

  const existing = await prisma.employer.findUnique({ where: { email } });
  if (existing) {
    return { success: false, message: "Email đã được sử dụng." };
  }

  const hashedPassword = hashSync(password, 10);
  let slug = generateSlug(companyName);

  // Ensure slug uniqueness
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
    message: "Đăng ký thành công! Tài khoản đang chờ admin duyệt.",
  };
}

export async function loginEmployerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Vui lòng nhập email và mật khẩu." };
  }

  const employer = await prisma.employer.findUnique({ where: { email } });
  if (!employer) {
    return { success: false, message: "Email hoặc mật khẩu không đúng." };
  }

  const valid = compareSync(password, employer.password);
  if (!valid) {
    return { success: false, message: "Email hoặc mật khẩu không đúng." };
  }

  if (employer.status === "PENDING") {
    return {
      success: false,
      message: "Tài khoản chưa được duyệt. Vui lòng chờ admin kích hoạt.",
    };
  }

  if (employer.status === "SUSPENDED") {
    return {
      success: false,
      message: "Tài khoản đã bị khóa. Vui lòng liên hệ admin.",
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

// ==================== DASHBOARD ====================

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

// ==================== COMPANY PROFILE ====================

export async function updateCompanyProfileAction(formData: FormData) {
  const session = await requireEmployerSession();

  const companyName = formData.get("companyName") as string;
  const description = formData.get("description") as string;
  const industry = formData.get("industry") as string;
  const companySize = formData.get("companySize") as string;
  const address = formData.get("address") as string;
  const website = formData.get("website") as string;
  const phone = formData.get("phone") as string;

  if (!companyName) {
    return { success: false, message: "Tên công ty không được để trống." };
  }

  const validSizes = ["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"];
  const sizeValue = validSizes.includes(companySize) ? companySize : undefined;

  await prisma.employer.update({
    where: { id: session.employerId },
    data: {
      companyName,
      description: description || null,
      industry: industry || null,
      companySize: sizeValue as any,
      address: address || null,
      website: website || null,
      phone: phone || null,
    },
  });

  revalidatePath("/employer/company");
  return { success: true, message: "Cập nhật thông tin thành công!" };
}

export async function getCompanyProfile() {
  const session = await requireEmployerSession();
  return prisma.employer.findUnique({
    where: { id: session.employerId },
  });
}

// ==================== SUBSCRIPTION ====================

export async function getSubscriptionData() {
  const session = await requireEmployerSession();
  const employer = await prisma.employer.findUnique({
    where: { id: session.employerId },
    include: { subscription: true },
  });
  return employer;
}

// ==================== JOB MANAGEMENT ====================

export async function getMyJobPostings(status?: string, page = 1) {
  const session = await requireEmployerSession();
  const take = 10;
  const skip = (page - 1) * take;

  const where: any = { employerId: session.employerId };
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

  // Check quota
  const employer = await prisma.employer.findUnique({
    where: { id: session.employerId },
    include: { subscription: true },
  });

  if (!employer) {
    return { success: false, message: "Không tìm thấy tài khoản." };
  }

  const sub = employer.subscription;
  if (!sub || sub.status !== "ACTIVE") {
    return { success: false, message: "Bạn chưa có gói dịch vụ đang hoạt động." };
  }

  if (sub.jobsUsed >= sub.jobQuota) {
    return {
      success: false,
      message: `Bạn đã hết lượt đăng tin (${sub.jobsUsed}/${sub.jobQuota}). Vui lòng liên hệ admin để nâng gói.`,
    };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title || !description) {
    return { success: false, message: "Tiêu đề và mô tả không được để trống." };
  }

  const requirements = formData.get("requirements") as string;
  const benefits = formData.get("benefits") as string;
  const salaryMin = formData.get("salaryMin") as string;
  const salaryMax = formData.get("salaryMax") as string;
  const salaryDisplay = formData.get("salaryDisplay") as string;
  const industry = formData.get("industry") as string;
  const position = formData.get("position") as string;
  const location = formData.get("location") as string;
  const workType = formData.get("workType") as string;
  const quantity = formData.get("quantity") as string;
  const skills = formData.get("skills") as string;

  let slug = generateSlug(title);
  const slugExists = await prisma.jobPosting.findUnique({ where: { slug } });
  if (slugExists) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  // Create job + increment quota in transaction
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
        quantity: quantity ? parseInt(quantity) : 1,
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
    return { success: false, message: "Không tìm thấy tin tuyển dụng." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title || !description) {
    return { success: false, message: "Tiêu đề và mô tả không được để trống." };
  }

  await prisma.jobPosting.update({
    where: { id },
    data: {
      title,
      description,
      requirements: (formData.get("requirements") as string) || null,
      benefits: (formData.get("benefits") as string) || null,
      salaryMin: formData.get("salaryMin") ? parseFloat(formData.get("salaryMin") as string) : null,
      salaryMax: formData.get("salaryMax") ? parseFloat(formData.get("salaryMax") as string) : null,
      salaryDisplay: (formData.get("salaryDisplay") as string) || null,
      industry: (formData.get("industry") as string) || null,
      position: (formData.get("position") as string) || null,
      location: (formData.get("location") as string) || null,
      workType: (formData.get("workType") as string) || null,
      quantity: formData.get("quantity") ? parseInt(formData.get("quantity") as string) : 1,
      skills: (formData.get("skills") as string) || null,
      // Re-submit for review if previously rejected
      status: job.status === "REJECTED" ? "PENDING" : job.status,
    },
  });

  revalidatePath(`/employer/job-postings`);
  return { success: true, message: "Cập nhật tin thành công!" };
}

export async function toggleJobPostingStatus(id: number) {
  const session = await requireEmployerSession();

  const job = await prisma.jobPosting.findUnique({ where: { id } });
  if (!job || job.employerId !== session.employerId) {
    return { success: false, message: "Không tìm thấy tin." };
  }

  if (job.status === "APPROVED") {
    await prisma.jobPosting.update({
      where: { id },
      data: { status: "PAUSED" },
    });
    revalidatePath("/employer/job-postings");
    return { success: true, message: "Đã tạm ẩn tin." };
  }

  if (job.status === "PAUSED") {
    // Check if still within expiry
    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      return { success: false, message: "Tin đã hết hạn, không thể bật lại." };
    }
    await prisma.jobPosting.update({
      where: { id },
      data: { status: "APPROVED" },
    });
    revalidatePath("/employer/job-postings");
    return { success: true, message: "Đã bật lại tin." };
  }

  return { success: false, message: "Chỉ có thể ẩn/bật tin đang hiển thị hoặc đã tạm ẩn." };
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

