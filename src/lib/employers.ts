import { JobPostingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function findEmployerByEmail(email: string) {
  return prisma.employer.findUnique({ where: { email } });
}

export async function findEmployerBySlug(slug: string) {
  return prisma.employer.findUnique({ where: { slug } });
}

export async function findEmployerJobPostingBySlug(slug: string) {
  return prisma.jobPosting.findUnique({ where: { slug } });
}

export async function createEmployerAccount(data: {
  email: string;
  password: string;
  companyName: string;
  slug: string;
  status: "PENDING";
}) {
  return prisma.employer.create({ data });
}

export async function getEmployerDashboardSnapshot(employerId: number) {
  const employer = await prisma.employer.findUnique({
    where: { id: employerId },
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

  if (!employer) {
    return null;
  }

  const [totalJobs, pendingJobs, approvedJobs, totalApplicants, newApplicants, recentApplications] =
    await Promise.all([
      prisma.jobPosting.count({
        where: { employerId },
      }),
      prisma.jobPosting.count({
        where: { employerId, status: "PENDING" },
      }),
      prisma.jobPosting.count({
        where: { employerId, status: "APPROVED" },
      }),
      prisma.application.count({
        where: { jobPosting: { employerId } },
      }),
      prisma.application.count({
        where: {
          jobPosting: { employerId },
          status: "NEW",
        },
      }),
      prisma.application.findMany({
        where: { jobPosting: { employerId } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          jobPosting: { select: { title: true } },
        },
      }),
    ]);

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

export async function updateEmployerProfileById(
  employerId: number,
  data: {
    companyName: string;
    description: string | null;
    industry: string | null;
    companySize: "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE" | undefined;
    address: string | null;
    website: string | null;
    phone: string | null;
  }
) {
  return prisma.employer.update({
    where: { id: employerId },
    data,
  });
}

export async function getEmployerProfileById(employerId: number) {
  return prisma.employer.findUnique({
    where: { id: employerId },
  });
}

export async function getEmployerSubscriptionSnapshot(employerId: number) {
  return prisma.employer.findUnique({
    where: { id: employerId },
    include: { subscription: true },
  });
}

export async function getEmployerJobPostingsForPortal(
  employerId: number,
  status?: string,
  page = 1
) {
  const take = 10;
  const skip = (page - 1) * take;
  const where: Record<string, unknown> = { employerId };

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

export async function getEmployerOwnedJobPosting(id: number, employerId: number) {
  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: {
      employer: { select: { id: true, companyName: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!job || job.employerId !== employerId) {
    return null;
  }

  return job;
}

export async function getEmployerWithSubscription(employerId: number) {
  return prisma.employer.findUnique({
    where: { id: employerId },
    include: { subscription: true },
  });
}

export async function createEmployerJobPostingAndIncrementQuota(data: {
  employerId: number;
  subscriptionId: number;
  jobPosting: {
    title: string;
    slug: string;
    description: string;
    requirements: string | null;
    benefits: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryDisplay: string | null;
    industry: string | null;
    position: string | null;
    location: string | null;
    workType: string | null;
    quantity: number;
    skills: string[];
    status: "PENDING";
  };
}) {
  return prisma.$transaction([
    prisma.jobPosting.create({
      data: {
        ...data.jobPosting,
        employerId: data.employerId,
      },
    }),
    prisma.subscription.update({
      where: { id: data.subscriptionId },
      data: { jobsUsed: { increment: 1 } },
    }),
  ]);
}

export async function updateEmployerJobPosting(
  id: number,
  data: {
    title: string;
    description: string;
    requirements: string | null;
    benefits: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryDisplay: string | null;
    industry: string | null;
    position: string | null;
    location: string | null;
    workType: string | null;
    quantity: number;
    skills: string[];
    status: JobPostingStatus;
  }
) {
  return prisma.jobPosting.update({
    where: { id },
    data,
  });
}

export async function updateEmployerJobPostingStatus(
  id: number,
  status: "PAUSED" | "APPROVED"
) {
  return prisma.jobPosting.update({
    where: { id },
    data: { status },
  });
}

export async function getEmployerJobApplicants(jobPostingId: number, employerId: number) {
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobPostingId },
    select: { employerId: true, title: true },
  });

  if (!job || job.employerId !== employerId) {
    return null;
  }

  const applicants = await prisma.application.findMany({
    where: { jobPostingId },
    orderBy: { createdAt: "desc" },
  });

  return { jobTitle: job.title, applicants };
}
