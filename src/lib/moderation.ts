import { EmployerStatus, JobPostingStatus, Prisma, SubscriptionStatus, SubscriptionTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type JobPostingLinkState = "ALL" | "LINKED" | "UNLINKED";

export type JobPostingModerationFilters = {
  status?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  linkState?: JobPostingLinkState;
};

const JOB_POSTING_STATUSES: JobPostingStatus[] = [
  "PENDING",
  "APPROVED",
  "PAUSED",
  "REJECTED",
  "EXPIRED",
  "DRAFT",
];

function normalizeJobPostingModerationFilters(
  statusOrFilters: string | JobPostingModerationFilters = "PENDING",
  page = 1
): Required<Pick<JobPostingModerationFilters, "status" | "page" | "pageSize">> &
  Pick<JobPostingModerationFilters, "search" | "linkState"> {
  if (typeof statusOrFilters === "string") {
    return {
      status: statusOrFilters || "ALL",
      page,
      pageSize: 25,
      search: "",
      linkState: "ALL",
    };
  }

  return {
    status: statusOrFilters.status || "ALL",
    page: statusOrFilters.page && statusOrFilters.page > 0 ? statusOrFilters.page : 1,
    pageSize:
      statusOrFilters.pageSize && statusOrFilters.pageSize > 0
        ? statusOrFilters.pageSize
        : 25,
    search: statusOrFilters.search?.trim() ?? "",
    linkState: statusOrFilters.linkState ?? "ALL",
  };
}

function buildJobPostingModerationWhere(
  filters: ReturnType<typeof normalizeJobPostingModerationFilters>,
  includeStatus: boolean
): Prisma.JobPostingWhereInput {
  const where: Prisma.JobPostingWhereInput = {};

  if (includeStatus && filters.status !== "ALL") {
    where.status = filters.status as JobPostingStatus;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { slug: { contains: filters.search, mode: "insensitive" } },
      { employer: { companyName: { contains: filters.search, mode: "insensitive" } } },
      { employer: { email: { contains: filters.search, mode: "insensitive" } } },
      { jobOrder: { title: { contains: filters.search, mode: "insensitive" } } },
      { jobOrder: { client: { companyName: { contains: filters.search, mode: "insensitive" } } } },
    ];
  }

  if (filters.linkState === "LINKED") {
    where.jobOrderId = { not: null };
  } else if (filters.linkState === "UNLINKED") {
    where.jobOrderId = null;
  }

  return where;
}

export async function getPendingJobPostingsData(
  statusOrFilters: string | JobPostingModerationFilters = "PENDING",
  legacyPage = 1
) {
  const filters = normalizeJobPostingModerationFilters(statusOrFilters, legacyPage);
  const take = filters.pageSize;
  const skip = (filters.page - 1) * take;
  const where = buildJobPostingModerationWhere(filters, true);
  const statsWhere = buildJobPostingModerationWhere(filters, false);

  const [jobs, total, totalMatching, statusGroups, aggregate] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        employer: {
          select: {
            id: true,
            slug: true,
            companyName: true,
            email: true,
            logo: true,
            workspace: { select: { id: true } },
          },
        },
        jobOrder: {
          select: {
            id: true,
            title: true,
            client: { select: { companyName: true } },
          },
        },
        _count: { select: { applications: true } },
      },
    }),
    prisma.jobPosting.count({ where }),
    prisma.jobPosting.count({ where: statsWhere }),
    prisma.jobPosting.groupBy({
      by: ["status"],
      where: statsWhere,
      _count: { _all: true },
    }),
    prisma.jobPosting.aggregate({
      where: statsWhere,
      _sum: {
        viewCount: true,
        applyCount: true,
      },
    }),
  ]);

  const byStatus = JOB_POSTING_STATUSES.reduce<Record<string, number>>((acc, item) => {
    acc[item] = 0;
    return acc;
  }, {});

  statusGroups.forEach((item) => {
    byStatus[item.status] = item._count._all;
  });

  return {
    jobs,
    total,
    page: filters.page,
    pageSize: take,
    totalPages: Math.ceil(total / take),
    stats: {
      total: totalMatching,
      byStatus,
      views: aggregate._sum.viewCount ?? 0,
      applications: aggregate._sum.applyCount ?? 0,
    },
  };
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

export async function getEmployersData(status = "ALL", page = 1, query = "") {
  const take = 10;
  const skip = (page - 1) * take;
  const filters: Prisma.EmployerWhereInput[] = [];

  if (status !== "ALL") {
    filters.push({ status: status as EmployerStatus });
  }

  const normalizedQuery = query.trim();
  if (normalizedQuery) {
    const numericId = Number.parseInt(normalizedQuery.replace(/^#/, ""), 10);
    const searchFilters: Prisma.EmployerWhereInput[] = [
      { companyName: { contains: normalizedQuery, mode: "insensitive" } },
      { email: { contains: normalizedQuery, mode: "insensitive" } },
    ];

    if (Number.isFinite(numericId)) {
      searchFilters.push({ id: numericId });
    }

    filters.push({ OR: searchFilters });
  }

  const where: Prisma.EmployerWhereInput =
    filters.length > 0 ? { AND: filters } : {};

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
        location: true,
        industrialZone: true,
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
      location: true,
      industrialZone: true,
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
          location: true,
          industrialZone: true,
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
      profileConfig: {
        select: {
          theme: true,
          capabilities: true,
          sections: true,
          primaryVideoUrl: true,
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
    location: string | null;
    industrialZone: string | null;
    website: string | null;
    phone: string | null;
  }
) {
  return prisma.employer.update({
    where: { id: employerId },
    data,
  });
}

export async function upsertEmployerProfileConfig(
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

export async function getSubscriptionsData(page = 1) {
  const take = 10;
  const skip = (page - 1) * take;

  const [subs, total] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        employer: { select: { id: true, companyName: true, email: true, slug: true } },
      },
    }),
    prisma.subscription.count(),
  ]);

  return { subs, total, page, totalPages: Math.ceil(total / take) };
}

export async function getEmployersForSubscriptionSelectData() {
  return prisma.employer.findMany({
    orderBy: { companyName: "asc" },
    take: 200,
    select: {
      id: true,
      companyName: true,
      email: true,
      status: true,
      subscription: {
        select: {
          tier: true,
          status: true,
          jobQuota: true,
          jobsUsed: true,
          jobDuration: true,
          endDate: true,
          price: true,
          showLogo: true,
          showBanner: true,
        },
      },
    },
  });
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
    tier: SubscriptionTier;
    jobQuota: number;
    jobDuration: number;
    price: number;
    startDate: Date;
    endDate: Date;
    status: SubscriptionStatus;
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
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        cvFileUrl: true,
        cvFileName: true,
        status: true,
        createdAt: true,
        jobPosting: {
          select: {
            title: true,
            slug: true,
            industry: true,
            location: true,
            salaryDisplay: true,
            workType: true,
            jobOrderId: true,
            employer: { select: { companyName: true } },
          },
        },
        candidate: { select: { id: true, fullName: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);

  const emails = Array.from(
    new Set(
      applications
        .map((application) => application.email?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value))
    )
  );
  const phones = Array.from(
    new Set(
      applications
        .map((application) => application.phone?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );
  const duplicateWhere: Prisma.CandidateWhereInput[] = [
    ...emails.map((email) => ({
      email: { equals: email, mode: "insensitive" as const },
    })),
    ...phones.map((phone) => ({ phone })),
  ];
  const candidates =
    duplicateWhere.length > 0
      ? await prisma.candidate.findMany({
          where: {
            isDeleted: false,
            OR: duplicateWhere,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        })
      : [];
  const applicationsWithDuplicates = applications.map((application) => {
    const email = application.email?.trim().toLowerCase();
    const phone = application.phone?.trim();
    const duplicateMatches = candidates.flatMap((candidate) => {
        const matchBy: Array<"email" | "phone"> = [];
        if (email && candidate.email?.trim().toLowerCase() === email) {
          matchBy.push("email");
        }
        if (phone && candidate.phone?.trim() === phone) {
          matchBy.push("phone");
        }

        return matchBy.length > 0 ? [{ ...candidate, matchBy }] : [];
      });

    return { ...application, duplicateMatches };
  });

  return {
    applications: applicationsWithDuplicates,
    total,
    page,
    totalPages: Math.ceil(total / take),
  };
}

export async function getApplicationForImportById(applicationId: number) {
  return prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      jobPosting: {
        select: {
          id: true,
          employerId: true,
          jobOrderId: true,
          title: true,
          industry: true,
          location: true,
          employer: { select: { id: true, companyName: true } },
        },
      },
    },
  });
}

export async function findCandidateForImportedApplication(
  normalizedEmail: string,
  phone?: string | null
) {
  const orConditions: { email?: string; phone?: string }[] = [];

  if (normalizedEmail) {
    orConditions.push({ email: normalizedEmail });
  }

  if (phone?.trim()) {
    orConditions.push({ phone: phone.trim() });
  }

  if (orConditions.length === 0) {
    return null;
  }

  return prisma.candidate.findFirst({
    where: { OR: orConditions, isDeleted: false },
  });
}

export async function updateCandidateCvIfMissing(
  candidateId: number,
  cvFileUrl: string | null,
  cvFileName: string | null,
  uploadedById?: number
) {
  const currentCandidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { id: true, cvFileUrl: true },
  });

  if (!currentCandidate || !cvFileUrl) {
    return currentCandidate;
  }

  const existingCvFile = await prisma.candidateCV.findFirst({
    where: { candidateId, fileUrl: cvFileUrl },
    select: { id: true },
  });

  const data: Prisma.CandidateUpdateInput = {};
  if (!currentCandidate.cvFileUrl) {
    data.cvFileUrl = cvFileUrl;
    data.cvFileName = cvFileName;
  }

  if (!existingCvFile && uploadedById) {
    data.cvFiles = {
      create: {
        fileUrl: cvFileUrl,
        fileName: cvFileName || `FDIWork-CV-${candidateId}`,
        label: "FDIWork apply",
        isPrimary: !currentCandidate.cvFileUrl,
        uploadedById,
      },
    };
  }

  if (Object.keys(data).length === 0) {
    return currentCandidate;
  }

  return prisma.candidate.update({
    where: { id: candidateId },
    data,
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
      ...(data.cvFileUrl
        ? {
            cvFiles: {
              create: {
                fileUrl: data.cvFileUrl,
                fileName: data.cvFileName || `FDIWork-CV-${Date.now()}`,
                label: "FDIWork apply",
                isPrimary: true,
                uploadedById: data.createdById,
              },
            },
          }
        : {}),
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
      stage: "SENT_TO_CLIENT",
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
