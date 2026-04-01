"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function getPendingJobPostings(status = "PENDING", page = 1) {
  await requireAdmin();

  const take = 10;
  const skip = (page - 1) * take;
  const where: Record<string, unknown> = {};

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
  await requireAdmin();

  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: { employer: { include: { subscription: true } } },
  });

  if (!job) return { success: false, message: "Khong tim thay tin." };

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
  return { success: true, message: "Da duyet tin." };
}

export async function rejectJobPosting(id: number, reason: string) {
  await requireAdmin();

  if (!reason.trim()) {
    return { success: false, message: "Vui long nhap ly do tu choi." };
  }

  await prisma.jobPosting.update({
    where: { id },
    data: { status: "REJECTED", rejectReason: reason.trim() },
  });

  revalidatePath("/moderation");
  return { success: true, message: "Da tu choi tin." };
}

export async function getEmployers(status = "ALL", page = 1) {
  await requireAdmin();

  const take = 10;
  const skip = (page - 1) * take;
  const where: Record<string, unknown> = {};

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
  await requireAdmin();

  const validStatuses = ["ACTIVE", "PENDING", "SUSPENDED"];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, message: "Trang thai khong hop le." };
  }

  await prisma.employer.update({
    where: { id },
    data: { status: newStatus as "ACTIVE" | "PENDING" | "SUSPENDED" },
  });

  revalidatePath("/employers");
  return { success: true, message: `Da cap nhat trang thai: ${newStatus}` };
}

export async function getSubscriptions(page = 1) {
  await requireAdmin();

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
  await requireAdmin();

  const employerId = parseInt(formData.get("employerId") as string, 10);
  const tier = formData.get("tier") as string;
  const jobQuota = parseInt(formData.get("jobQuota") as string, 10);
  const jobDuration = parseInt(formData.get("jobDuration") as string, 10) || 30;
  const durationMonths =
    parseInt(formData.get("durationMonths") as string, 10) || 12;
  const showLogo = formData.get("showLogo") === "true";
  const showBanner = formData.get("showBanner") === "true";

  if (!employerId || !tier || !jobQuota) {
    return { success: false, message: "Vui long dien day du thong tin." };
  }

  const employer = await prisma.employer.findUnique({ where: { id: employerId } });
  if (!employer) {
    return { success: false, message: "Khong tim thay employer." };
  }

  const now = new Date();
  const endDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);
  const existingSub = await prisma.subscription.findUnique({ where: { employerId } });

  if (existingSub) {
    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        tier: tier as "BASIC" | "STANDARD" | "PREMIUM" | "VIP",
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
        tier: tier as "BASIC" | "STANDARD" | "PREMIUM" | "VIP",
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

  if (employer.status === "PENDING") {
    await prisma.employer.update({
      where: { id: employerId },
      data: { status: "ACTIVE" },
    });
  }

  revalidatePath("/packages");
  revalidatePath("/employers");
  return { success: true, message: `Da cap goi ${tier} cho ${employer.companyName}.` };
}

export async function getApplicationsForImport(status = "NEW", page = 1) {
  await requireAdmin();

  const take = 15;
  const skip = (page - 1) * take;
  const where: Record<string, unknown> = {};

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
  const { userId } = await requireAdmin();

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      jobPosting: {
        select: {
          title: true,
          industry: true,
          location: true,
          employer: { select: { companyName: true } },
        },
      },
    },
  });

  if (!application) {
    return { success: false, message: "Khong tim thay don ung tuyen." };
  }
  if (application.status === "IMPORTED") {
    return { success: false, message: "Don nay da duoc import truoc do." };
  }

  let candidateId: number;
  const normalizedEmail = application.email.trim().toLowerCase();
  const existingCandidate = normalizedEmail
    ? await prisma.candidate.findFirst({
        where: { email: normalizedEmail, isDeleted: false },
      })
    : null;

  if (existingCandidate) {
    candidateId = existingCandidate.id;
    if (!existingCandidate.cvFileUrl && application.cvFileUrl) {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          cvFileUrl: application.cvFileUrl,
          cvFileName: application.cvFileName,
        },
      });
    }
  } else {
    const newCandidate = await prisma.candidate.create({
      data: {
        fullName: application.fullName,
        email: normalizedEmail,
        phone: application.phone,
        cvFileUrl: application.cvFileUrl,
        cvFileName: application.cvFileName,
        source: "FDIWORK",
        sourceDetail: `${application.jobPosting.employer.companyName} - ${application.jobPosting.title}`,
        industry: application.jobPosting.industry,
        location: application.jobPosting.location,
        status: "AVAILABLE",
        createdById: userId,
      },
    });
    candidateId = newCandidate.id;
  }

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

  const employer = await prisma.employer.findUnique({ where: { id: employerId } });
  if (!employer) {
    return { success: false, message: "Khong tim thay employer." };
  }

  if (clientId) {
    const client = await prisma.client.findFirst({
      where: { id: clientId, isDeleted: false },
    });
    if (!client) {
      return { success: false, message: "Khong tim thay client." };
    }
  }

  await prisma.employer.update({
    where: { id: employerId },
    data: { clientId },
  });

  revalidatePath("/employers");
  return {
    success: true,
    message: clientId ? "Da link Employer voi Client." : "Da bo link Client.",
  };
}

export async function getNewApplicationsCount() {
  await requireAdmin();
  return prisma.application.count({ where: { status: "NEW" } });
}

export async function getRecentApplications(take = 5) {
  await requireAdmin();

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
  await requireAdmin();

  return prisma.client.findMany({
    where: { isDeleted: false, employer: null },
    select: { id: true, companyName: true },
    orderBy: { companyName: "asc" },
  });
}
