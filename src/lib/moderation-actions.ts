"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ==================== MODERATION ====================

export async function getPendingJobPostings(status = "PENDING", page = 1) {
  const take = 10;
  const skip = (page - 1) * take;

  const where: any = {};
  if (status !== "ALL") {
    where.status = status;
  }

  const [jobs, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        employer: { select: { companyName: true, email: true, logo: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.jobPosting.count({ where }),
  ]);

  return { jobs, total, page, totalPages: Math.ceil(total / take) };
}

export async function approveJobPosting(id: number) {
  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: { employer: { include: { subscription: true } } },
  });

  if (!job) return { success: false, message: "Không tìm thấy tin." };

  const duration = job.employer.subscription?.jobDuration ?? 30;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

  await prisma.jobPosting.update({
    where: { id },
    data: {
      status: "APPROVED",
      publishedAt: now,
      expiresAt,
      rejectReason: null,
    },
  });

  revalidatePath("/moderation");
  revalidatePath("/viec-lam");
  return { success: true, message: "Đã duyệt tin." };
}

export async function rejectJobPosting(id: number, reason: string) {
  if (!reason.trim()) {
    return { success: false, message: "Vui lòng nhập lý do từ chối." };
  }

  await prisma.jobPosting.update({
    where: { id },
    data: { status: "REJECTED", rejectReason: reason },
  });

  revalidatePath("/moderation");
  return { success: true, message: "Đã từ chối tin." };
}

// ==================== EMPLOYER MANAGEMENT ====================

export async function getEmployers(status = "ALL", page = 1) {
  const take = 10;
  const skip = (page - 1) * take;

  const where: any = {};
  if (status !== "ALL") {
    where.status = status;
  }

  const [employers, total] = await Promise.all([
    prisma.employer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        subscription: { select: { tier: true, status: true, jobQuota: true, jobsUsed: true } },
        _count: { select: { jobPostings: true } },
      },
    }),
    prisma.employer.count({ where }),
  ]);

  return { employers, total, page, totalPages: Math.ceil(total / take) };
}

export async function updateEmployerStatus(id: number, newStatus: string) {
  const validStatuses = ["ACTIVE", "PENDING", "SUSPENDED"];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, message: "Trạng thái không hợp lệ." };
  }

  await prisma.employer.update({
    where: { id },
    data: { status: newStatus as any },
  });

  revalidatePath("/employers");
  return { success: true, message: `Đã cập nhật trạng thái: ${newStatus}` };
}

// ==================== PACKAGE / SUBSCRIPTION MANAGEMENT ====================

export async function getSubscriptions(page = 1) {
  const take = 10;
  const skip = (page - 1) * take;

  const [subs, total] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        employer: { select: { companyName: true, email: true } },
      },
    }),
    prisma.subscription.count(),
  ]);

  return { subs, total, page, totalPages: Math.ceil(total / take) };
}

export async function assignSubscription(formData: FormData) {
  const employerId = parseInt(formData.get("employerId") as string);
  const tier = formData.get("tier") as string;
  const jobQuota = parseInt(formData.get("jobQuota") as string);
  const jobDuration = parseInt(formData.get("jobDuration") as string) || 30;
  const durationMonths = parseInt(formData.get("durationMonths") as string) || 12;
  const showLogo = formData.get("showLogo") === "true";
  const showBanner = formData.get("showBanner") === "true";

  if (!employerId || !tier || !jobQuota) {
    return { success: false, message: "Vui lòng điền đầy đủ thông tin." };
  }

  const employer = await prisma.employer.findUnique({ where: { id: employerId } });
  if (!employer) {
    return { success: false, message: "Không tìm thấy employer." };
  }

  const now = new Date();
  const endDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);

  // Upsert subscription
  const existingSub = await prisma.subscription.findUnique({ where: { employerId } });

  if (existingSub) {
    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        tier: tier as any,
        jobQuota,
        jobDuration,
        startDate: now,
        endDate,
        status: "ACTIVE",
        showLogo,
        showBanner,
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        employerId,
        tier: tier as any,
        jobQuota,
        jobsUsed: 0,
        jobDuration,
        price: 0,
        startDate: now,
        endDate,
        status: "ACTIVE",
        showLogo,
        showBanner,
      },
    });
  }

  // Also activate employer if still pending
  if (employer.status === "PENDING") {
    await prisma.employer.update({
      where: { id: employerId },
      data: { status: "ACTIVE" },
    });
  }

  revalidatePath("/packages");
  revalidatePath("/employers");
  return { success: true, message: `Đã cấp gói ${tier} cho ${employer.companyName}!` };
}

// ==================== CRM INTEGRATION (Phase 08) ====================

export async function getApplicationsForImport(status = "NEW", page = 1) {
  const take = 15;
  const skip = (page - 1) * take;

  const where: any = {};
  if (status !== "ALL") {
    where.status = status;
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        jobPosting: {
          select: {
            title: true,
            industry: true,
            location: true,
            employer: { select: { companyName: true } },
          },
        },
        candidate: { select: { id: true, fullName: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return { applications, total, page, totalPages: Math.ceil(total / take) };
}

export async function importApplicationToCRM(applicationId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Bạn cần đăng nhập." };
  }
  const userId = Number(session.user.id);

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      jobPosting: {
        select: { title: true, industry: true, location: true, employer: { select: { companyName: true } } },
      },
    },
  });

  if (!application) {
    return { success: false, message: "Không tìm thấy đơn ứng tuyển." };
  }
  if (application.status === "IMPORTED") {
    return { success: false, message: "Đơn này đã được import trước đó." };
  }

  // Check duplicate email
  let candidateId: number;
  const existingCandidate = application.email
    ? await prisma.candidate.findFirst({
        where: { email: application.email, isDeleted: false },
      })
    : null;

  if (existingCandidate) {
    // Link to existing candidate, update CV if missing
    candidateId = existingCandidate.id;
    if (!existingCandidate.cvFileUrl && application.cvFileUrl) {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: { cvFileUrl: application.cvFileUrl, cvFileName: application.cvFileName },
      });
    }
  } else {
    // Create new candidate
    const newCandidate = await prisma.candidate.create({
      data: {
        fullName: application.fullName,
        email: application.email,
        phone: application.phone,
        cvFileUrl: application.cvFileUrl,
        cvFileName: application.cvFileName,
        source: "FDIWORK",
        sourceDetail: `${application.jobPosting.employer.companyName} — ${application.jobPosting.title}`,
        industry: application.jobPosting.industry,
        location: application.jobPosting.location,
        status: "AVAILABLE",
        createdById: userId,
      },
    });
    candidateId = newCandidate.id;
  }

  // Update application
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "IMPORTED", candidateId },
  });

  revalidatePath("/moderation/applications");
  revalidatePath("/candidates");
  revalidatePath("/dashboard");
  return {
    success: true,
    message: existingCandidate
      ? `Đã link vào ứng viên #${candidateId} (${existingCandidate.fullName}) — trùng email.`
      : `Đã tạo ứng viên mới #${candidateId} trong CRM.`,
    candidateId,
  };
}

export async function linkEmployerToClient(employerId: number, clientId: number | null) {
  const employer = await prisma.employer.findUnique({ where: { id: employerId } });
  if (!employer) {
    return { success: false, message: "Không tìm thấy employer." };
  }

  if (clientId) {
    const client = await prisma.client.findUnique({ where: { id: clientId, isDeleted: false } });
    if (!client) {
      return { success: false, message: "Không tìm thấy client." };
    }
  }

  await prisma.employer.update({
    where: { id: employerId },
    data: { clientId },
  });

  revalidatePath("/employers");
  return { success: true, message: clientId ? "Đã link Employer với Client." : "Đã bỏ link Client." };
}

export async function getNewApplicationsCount() {
  return prisma.application.count({ where: { status: "NEW" } });
}

export async function getRecentApplications(take = 5) {
  return prisma.application.findMany({
    where: { status: { in: ["NEW", "REVIEWED", "SHORTLISTED"] } },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      jobPosting: {
        select: { title: true, employer: { select: { companyName: true } } },
      },
    },
  });
}

export async function getClientsForLinking() {
  return prisma.client.findMany({
    where: { isDeleted: false, employer: null },
    select: { id: true, companyName: true },
    orderBy: { companyName: "asc" },
  });
}
