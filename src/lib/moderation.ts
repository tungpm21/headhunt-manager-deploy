import { prisma } from "@/lib/prisma";

export async function getPendingJobPostingsData(status = "PENDING", page = 1) {
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

export async function getJobPostingForModeration(id: number) {
  return prisma.jobPosting.findUnique({
    where: { id },
    include: { employer: { include: { subscription: true } } },
  });
}

export async function updateJobPostingModeration(
  id: number,
  data: {
    status: "APPROVED" | "REJECTED";
    publishedAt?: Date;
    expiresAt?: Date;
    rejectReason?: string | null;
  }
) {
  return prisma.jobPosting.update({
    where: { id },
    data,
  });
}

export async function getEmployersData(status = "ALL", page = 1) {
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
      select: {
        id: true,
        email: true,
        companyName: true,
        industry: true,
        address: true,
        status: true,
        slug: true,
        createdAt: true,
        client: { select: { id: true, companyName: true } },
        subscription: {
          select: { tier: true, status: true, jobQuota: true, jobsUsed: true },
        },
        _count: { select: { jobPostings: true } },
      },
    }),
    prisma.employer.count({ where }),
  ]);

  return { employers, total, page, totalPages: Math.ceil(total / take) };
}

export async function updateEmployerModerationStatus(id: number, newStatus: string) {
  return prisma.employer.update({
    where: { id },
    data: { status: newStatus as "ACTIVE" | "PENDING" | "SUSPENDED" },
    select: { slug: true },
  });
}

export async function getEmployerModerationById(id: number) {
  return prisma.employer.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      companyName: true,
      logo: true,
      coverImage: true,
      coverPositionX: true,
      coverPositionY: true,
      coverZoom: true,
      description: true,
      industry: true,
      companySize: true,
      address: true,
      website: true,
      phone: true,
      status: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      client: {
        select: {
          id: true,
          companyName: true,
          industry: true,
          website: true,
          address: true,
          status: true,
        },
      },
      subscription: {
        select: {
          id: true,
          tier: true,
          status: true,
          jobQuota: true,
          jobsUsed: true,
          jobDuration: true,
          showLogo: true,
          showBanner: true,
          startDate: true,
          endDate: true,
          price: true,
          createdAt: true,
        },
      },
      jobPostings: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          viewCount: true,
          applyCount: true,
          createdAt: true,
          publishedAt: true,
          expiresAt: true,
          location: true,
          workType: true,
        },
      },
      _count: { select: { jobPostings: true } },
    },
  });
}

export async function getEmployerJobPostingsForModeration(employerId: number, page = 1) {
  const take = 10;
  const skip = (page - 1) * take;
  const where = { employerId };

  const [jobPostings, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        viewCount: true,
        applyCount: true,
        createdAt: true,
        publishedAt: true,
        expiresAt: true,
        location: true,
        workType: true,
      },
    }),
    prisma.jobPosting.count({ where }),
  ]);

  return { jobPostings, total, page, totalPages: Math.ceil(total / take) };
}

export async function getEmployerForInfoUpdate(employerId: number) {
  return prisma.employer.findUnique({
    where: { id: employerId },
    select: {
      id: true,
      slug: true,
      logo: true,
      coverImage: true,
      jobPostings: { select: { slug: true } },
    },
  });
}

export async function updateEmployerModerationInfo(
  employerId: number,
  data: {
    companyName: string;
    description: string | null;
    logo: string | null;
    coverImage?: string | null;
    coverPositionX?: number;
    coverPositionY?: number;
    coverZoom?: number;
    industry: string | null;
    companySize: "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE" | null;
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

export async function getSubscriptionsData(page = 1) {
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

export async function getEmployerSimpleById(employerId: number) {
  return prisma.employer.findUnique({ where: { id: employerId } });
}

export async function getEmployerSubscriptionByEmployerId(employerId: number) {
  return prisma.subscription.findUnique({ where: { employerId } });
}

export async function updateEmployerSubscription(
  subscriptionId: number,
  data: {
    tier: "BASIC" | "STANDARD" | "PREMIUM" | "VIP";
    jobQuota: number;
    jobDuration: number;
    startDate: Date;
    endDate: Date;
    status: "ACTIVE";
    showLogo: boolean;
    showBanner: boolean;
  }
) {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data,
  });
}

export async function createEmployerSubscription(data: {
  employerId: number;
  tier: "BASIC" | "STANDARD" | "PREMIUM" | "VIP";
  jobQuota: number;
  jobsUsed: number;
  jobDuration: number;
  price: number;
  startDate: Date;
  endDate: Date;
  status: "ACTIVE";
  showLogo: boolean;
  showBanner: boolean;
}) {
  return prisma.subscription.create({ data });
}

export async function activateEmployerIfPending(employerId: number, status: string) {
  if (status !== "PENDING") {
    return null;
  }

  return prisma.employer.update({
    where: { id: employerId },
    data: { status: "ACTIVE" },
  });
}

export async function getApplicationsForImportData(status = "NEW", page = 1) {
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
            slug: true,
            industry: true,
            location: true,
            salaryDisplay: true,
            workType: true,
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

export async function getApplicationForImportById(applicationId: number) {
  return prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      jobPosting: {
        select: {
          id: true,
          jobOrderId: true,
          title: true,
          industry: true,
          location: true,
          employer: { select: { companyName: true } },
        },
      },
    },
  });
}

export async function findCandidateForImportedApplication(normalizedEmail: string) {
  if (!normalizedEmail) {
    return null;
  }

  return prisma.candidate.findFirst({
    where: { email: normalizedEmail, isDeleted: false },
  });
}

export async function updateCandidateCvIfMissing(
  candidateId: number,
  cvFileUrl: string | null,
  cvFileName: string | null
) {
  return prisma.candidate.update({
    where: { id: candidateId },
    data: {
      cvFileUrl,
      cvFileName,
    },
  });
}

export async function createCandidateFromImportedApplication(data: {
  fullName: string;
  email: string;
  phone: string | null;
  cvFileUrl: string | null;
  cvFileName: string | null;
  sourceDetail: string;
  industry: string | null;
  location: string | null;
  createdById: number;
}) {
  return prisma.candidate.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      cvFileUrl: data.cvFileUrl,
      cvFileName: data.cvFileName,
      source: "FDIWORK",
      sourceDetail: data.sourceDetail,
      industry: data.industry,
      location: data.location,
      status: "AVAILABLE",
      createdById: data.createdById,
    },
  });
}

export async function markApplicationImported(applicationId: number, candidateId: number) {
  return prisma.application.update({
    where: { id: applicationId },
    data: { status: "IMPORTED", candidateId },
  });
}

export async function upsertImportedApplicationJobLink(
  jobOrderId: number,
  candidateId: number
) {
  return prisma.jobCandidate.upsert({
    where: {
      jobOrderId_candidateId: {
        jobOrderId,
        candidateId,
      },
    },
    create: {
      jobOrderId,
      candidateId,
      stage: "SOURCED",
      result: "PENDING",
    },
    update: {},
  });
}

export async function getEmployerForClientLinking(employerId: number) {
  return prisma.employer.findUnique({ where: { id: employerId } });
}

export async function getClientForEmployerLinking(clientId: number, employerId: number) {
  return prisma.client.findFirst({
    where: {
      id: clientId,
      OR: [{ isDeleted: false }, { employer: { is: { id: employerId } } }],
    },
    select: {
      id: true,
      employer: { select: { id: true } },
    },
  });
}

export async function updateEmployerClientLink(
  employerId: number,
  clientId: number | null
) {
  return prisma.employer.update({
    where: { id: employerId },
    data: { clientId },
  });
}

export async function countNewApplicationsForModeration() {
  return prisma.application.count({ where: { status: "NEW" } });
}

export async function getRecentApplicationsForModeration(take = 5) {
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

export async function getClientsForEmployerLinkingData(employerId: number) {
  return prisma.client.findMany({
    where: {
      OR: [
        { isDeleted: false, employer: { is: null } },
        { employer: { is: { id: employerId } } },
      ],
    },
    select: { id: true, companyName: true },
    orderBy: { companyName: "asc" },
  });
}
