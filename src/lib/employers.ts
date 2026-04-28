import { ApplicationStatus, JobPostingStatus, Prisma } from "@prisma/client";
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
    },
  });

  if (!employer) {
    return null;
  }

  const [jobStatusCounts, applicationStatusCounts, recentJobs, recentApplications] =
    await Promise.all([
      prisma.jobPosting.groupBy({
        by: ["status"],
        where: { employerId },
        _count: { _all: true },
      }),
      prisma.application.groupBy({
        by: ["status"],
        where: { jobPosting: { employerId } },
        _count: { _all: true },
      }),
      prisma.jobPosting.findMany({
        where: { employerId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { applications: true } },
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

  const jobCounts = new Map(jobStatusCounts.map((item) => [item.status, item._count._all]));
  const applicationCounts = new Map(
    applicationStatusCounts.map((item) => [item.status, item._count._all])
  );
  const totalJobs = jobStatusCounts.reduce((sum, item) => sum + item._count._all, 0);
  const totalApplicants = applicationStatusCounts.reduce((sum, item) => sum + item._count._all, 0);

  return {
    employer,
    stats: {
      totalJobs,
      pendingJobs: jobCounts.get(JobPostingStatus.PENDING) ?? 0,
      approvedJobs: jobCounts.get(JobPostingStatus.APPROVED) ?? 0,
      totalApplicants,
      newApplicants: applicationCounts.get(ApplicationStatus.NEW) ?? 0,
      quotaTotal: employer.subscription?.jobQuota ?? 0,
      quotaUsed: employer.subscription?.jobsUsed ?? 0,
    },
    recentJobs,
    recentApplications,
  };
}

export async function updateEmployerProfileById(
  employerId: number,
  data: {
    companyName: string;
    description: string | null;
    industry: string | null;
    companySize: "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE" | null | undefined;
    address: string | null;
    location: string | null;
    industrialZone: string | null;
    website: string | null;
    phone: string | null;
    logo?: string | null;
    coverImage?: string | null;
    coverPositionX?: number;
    coverPositionY?: number;
    coverZoom?: number;
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

export async function getEmployerProfileForPortalById(employerId: number) {
  return prisma.employer.findUnique({
    where: { id: employerId },
    include: {
      profileConfig: true,
      jobPostings: {
        select: {
          slug: true,
        },
      },
    },
  });
}

export async function upsertEmployerProfileConfigForPortal(
  employerId: number,
  data: {
    theme: unknown;
    capabilities: unknown;
    sections: unknown;
    primaryVideoUrl: string | null;
  }
) {
  const jsonData = {
    theme: JSON.parse(JSON.stringify(data.theme ?? {})) as Prisma.InputJsonValue,
    capabilities: JSON.parse(JSON.stringify(data.capabilities ?? {})) as Prisma.InputJsonValue,
    sections: JSON.parse(JSON.stringify(data.sections ?? [])) as Prisma.InputJsonValue,
    primaryVideoUrl: data.primaryVideoUrl,
  };

  return prisma.employerProfileConfig.upsert({
    where: { employerId },
    create: {
      employerId,
      ...jsonData,
    },
    update: jsonData,
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

export async function findRecentEmployerJobPostingDuplicate(
  employerId: number,
  title: string,
  description: string
) {
  const recentWindowStart = new Date(Date.now() - 60 * 1000);

  return prisma.jobPosting.findFirst({
    where: {
      employerId,
      title,
      description,
      createdAt: { gte: recentWindowStart },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true },
  });
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
    coverImage: string | null;
    coverAlt: string | null;
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
    industrialZone: string | null;
    requiredLanguages: string[];
    languageProficiency: string | null;
    shiftType: string | null;
    status: "PENDING";
  };
}) {
  return prisma.$transaction(async (tx) => {
    const quotaRows = await tx.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      UPDATE "Subscription"
      SET "jobsUsed" = "jobsUsed" + 1
      WHERE "id" = ${data.subscriptionId}
        AND "employerId" = ${data.employerId}
        AND "status" = 'ACTIVE'
        AND "jobsUsed" < "jobQuota"
      RETURNING "id"
    `);

    if (quotaRows.length === 0) {
      throw new Error("QUOTA_EXHAUSTED");
    }

    return tx.jobPosting.create({
      data: {
        ...data.jobPosting,
        employerId: data.employerId,
      },
    });
  });
}

export async function updateEmployerJobPosting(
  id: number,
  data: {
    title: string;
    coverImage: string | null;
    coverAlt: string | null;
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
    industrialZone: string | null;
    requiredLanguages: string[];
    languageProficiency: string | null;
    shiftType: string | null;
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

export async function deleteEmployerJobPostingWithQuotaPolicy(
  id: number,
  employerId: number
) {
  return prisma.$transaction(async (tx) => {
    const job = await tx.jobPosting.findUnique({
      where: { id },
      include: { _count: { select: { applications: true } } },
    });

    if (!job || job.employerId !== employerId) {
      return null;
    }

    const refundableStatuses = new Set<JobPostingStatus>([
      JobPostingStatus.DRAFT,
      JobPostingStatus.PENDING,
      JobPostingStatus.REJECTED,
    ]);
    const canDeleteAndRefund =
      refundableStatuses.has(job.status) || job._count.applications === 0;

    if (canDeleteAndRefund) {
      await tx.jobPosting.delete({ where: { id } });
      const refund = await tx.subscription.updateMany({
        where: {
          employerId,
          jobsUsed: { gt: 0 },
        },
        data: { jobsUsed: { decrement: 1 } },
      });

      return {
        mode: "deleted" as const,
        refunded: refund.count > 0,
        slug: job.slug,
        status: job.status,
      };
    }

    await tx.jobPosting.update({
      where: { id },
      data: { status: JobPostingStatus.PAUSED },
    });

    return {
      mode: "paused" as const,
      refunded: false,
      slug: job.slug,
      status: job.status,
    };
  });
}

export type EmployerNotificationItem = {
  key: string;
  label: string;
  count: number;
  href: string;
  tone: "blue" | "amber" | "red" | "emerald";
};

export type EmployerNotificationData = {
  total: number;
  items: EmployerNotificationItem[];
};

export async function getEmployerNotificationSnapshot(
  employerId: number
): Promise<EmployerNotificationData> {
  const now = new Date();
  const [newApplications, rejectedJobs, pendingJobs, subscription] =
    await Promise.all([
      prisma.application.count({
        where: {
          status: ApplicationStatus.NEW,
          jobPosting: { employerId },
        },
      }),
      prisma.jobPosting.count({
        where: { employerId, status: JobPostingStatus.REJECTED },
      }),
      prisma.jobPosting.count({
        where: { employerId, status: JobPostingStatus.PENDING },
      }),
      prisma.subscription.findUnique({
        where: { employerId },
        select: {
          status: true,
          jobQuota: true,
          jobsUsed: true,
          endDate: true,
        },
      }),
    ]);

  const items: EmployerNotificationItem[] = [];

  if (newApplications > 0) {
    items.push({
      key: "new-applications",
      label: `${newApplications} hồ sơ mới cần xem`,
      count: newApplications,
      href: "/employer/job-postings",
      tone: "blue",
    });
  }

  if (rejectedJobs > 0) {
    items.push({
      key: "rejected-jobs",
      label: `${rejectedJobs} tin bị từ chối`,
      count: rejectedJobs,
      href: "/employer/job-postings?status=REJECTED",
      tone: "red",
    });
  }

  if (pendingJobs > 0) {
    items.push({
      key: "pending-jobs",
      label: `${pendingJobs} tin đang chờ duyệt`,
      count: pendingJobs,
      href: "/employer/job-postings?status=PENDING",
      tone: "amber",
    });
  }

  if (!subscription || subscription.status !== "ACTIVE" || subscription.endDate < now) {
    items.push({
      key: "subscription-expired",
      label: "Gói dịch vụ đã hết hạn",
      count: 1,
      href: "/employer/subscription",
      tone: "red",
    });
  } else {
    const remainingQuota = Math.max(subscription.jobQuota - subscription.jobsUsed, 0);
    if (remainingQuota === 0) {
      items.push({
        key: "quota-empty",
        label: "Đã hết lượt đăng tin",
        count: 1,
        href: "/employer/subscription",
        tone: "red",
      });
    } else if (remainingQuota <= 1) {
      items.push({
        key: "quota-low",
        label: `Chỉ còn ${remainingQuota} lượt đăng tin`,
        count: remainingQuota,
        href: "/employer/subscription",
        tone: "amber",
      });
    }
  }

  return {
    total: items.reduce((sum, item) => sum + item.count, 0),
    items,
  };
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

export async function getEmployerApplicationPipelineData(
  employerId: number,
  jobPostingId?: number
) {
  const applicationQuery = jobPostingId
    ? prisma.application.findMany({
        where: {
          jobPosting: { employerId },
          jobPostingId,
        },
        orderBy: [
          { updatedAt: "desc" },
          { createdAt: "desc" },
        ],
        include: {
          jobPosting: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
            },
          },
        },
      })
    : Promise.resolve([]);

  const [applications, jobs] = await Promise.all([
    applicationQuery,
    prisma.jobPosting.findMany({
      where: { employerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
    }),
  ]);

  return { applications, jobs };
}

export async function updateEmployerApplicationStatus(
  employerId: number,
  applicationId: number,
  status: ApplicationStatus
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      jobPosting: {
        select: {
          employerId: true,
        },
      },
    },
  });

  if (!application || application.jobPosting.employerId !== employerId) {
    return null;
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: { status },
    include: {
      jobPosting: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
        },
      },
    },
  });
}
