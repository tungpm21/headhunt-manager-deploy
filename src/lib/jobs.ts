import {
  CandidateSeniority,
  JobPostingStatus,
  JobStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  JobFilters,
  JobBridgeSummary,
  PaginatedJobs,
  CreateJobInput,
  UpdateJobInput,
  JobOrderWithRelations,
} from "@/types/job";
import { withJobAccess } from "@/lib/access-scope";
import { ViewerScope } from "@/lib/viewer-scope";

const JOB_LIST_INCLUDE = {
  client: { select: { id: true, companyName: true } },
  _count: { select: { candidates: true } },
  jobPostings: {
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      expiresAt: true,
    },
  },
} satisfies Prisma.JobOrderInclude;

const JOB_DETAIL_INCLUDE = {
  client: { select: { id: true, companyName: true } },
  candidates: {
    include: {
      candidate: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          currentPosition: true,
          currentCompany: true,
          status: true,
          level: true,
          skills: true,
          expectedSalary: true,
        },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.JobOrderInclude;

function formatSalaryDisplay(
  salaryMin: number | null | undefined,
  salaryMax: number | null | undefined
) {
  if (salaryMin != null && salaryMax != null) {
    return `${salaryMin} - ${salaryMax} trieu`;
  }

  if (salaryMin != null) {
    return `Tu ${salaryMin} trieu`;
  }

  if (salaryMax != null) {
    return `Den ${salaryMax} trieu`;
  }

  return "Thoa thuan";
}

function buildPublicJobDescription(job: {
  title: string;
  description: string | null;
  client: { companyName: string };
  industry: string | null;
  location: string | null;
  requiredSkills: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  quantity: number;
}) {
  if (job.description?.trim()) {
    return job.description.trim();
  }

  const parts = [`Co hoi ${job.title} tai ${job.client.companyName}.`];

  if (job.industry) {
    parts.push(`Nganh nghe: ${job.industry}.`);
  }

  if (job.location) {
    parts.push(`Dia diem lam viec: ${job.location}.`);
  }

  parts.push(`Muc luong: ${formatSalaryDisplay(job.salaryMin, job.salaryMax)}.`);

  if (job.requiredSkills.length > 0) {
    parts.push(`Ky nang uu tien: ${job.requiredSkills.join(", ")}.`);
  }

  parts.push(`So luong can tuyen: ${job.quantity}.`);

  return parts.join(" ");
}

function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return normalized || `job-${Date.now().toString(36)}`;
}

async function createUniqueJobPostingSlug(title: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.jobPosting.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

async function autoLinkEmployerForClient(clientId: number, companyName: string) {
  const matches = await prisma.employer.findMany({
    where: {
      clientId: null,
      companyName: {
        equals: companyName.trim(),
        mode: "insensitive",
      },
    },
    select: { id: true },
    take: 2,
  });

  if (matches.length !== 1) {
    return null;
  }

  return prisma.employer.update({
    where: { id: matches[0].id },
    data: { clientId },
    select: {
      id: true,
      companyName: true,
      slug: true,
      status: true,
      subscription: {
        select: {
          status: true,
          tier: true,
          endDate: true,
          jobQuota: true,
          jobsUsed: true,
        },
      },
    },
  });
}

async function getJobForBridgeMutation(id: number, scope?: ViewerScope) {
  const job = await prisma.jobOrder.findFirst({
    where: withJobAccess({ id }, scope),
    select: {
      id: true,
      title: true,
      description: true,
      industry: true,
      location: true,
      industrialZone: true,
      requiredSkills: true,
      salaryMin: true,
      salaryMax: true,
      quantity: true,
      status: true,
      clientId: true,
      client: {
        select: {
          id: true,
          companyName: true,
          employer: {
            select: {
              id: true,
              companyName: true,
              slug: true,
              status: true,
              subscription: {
                select: {
                  status: true,
                  tier: true,
                  endDate: true,
                  jobQuota: true,
                  jobsUsed: true,
                },
              },
            },
          },
        },
      },
      jobPostings: {
        select: {
          id: true,
          slug: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job) {
    return null;
  }

  if (!job.client.employer) {
    const linkedEmployer = await autoLinkEmployerForClient(
      job.client.id,
      job.client.companyName
    );

    if (linkedEmployer) {
      return {
        ...job,
        client: {
          ...job.client,
          employer: linkedEmployer,
        },
      };
    }
  }

  return job;
}

function buildWhere(filters: JobFilters): Prisma.JobOrderWhereInput {
  const where: Prisma.JobOrderWhereInput = {};

  if (filters.search) {
    const keyword = filters.search.trim();
    where.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { client: { companyName: { contains: keyword, mode: "insensitive" } } },
    ];
  }

  if (filters.status) where.status = filters.status;
  if (filters.clientId) where.clientId = filters.clientId;

  if (filters.stage) {
    where.candidates = {
      some: { stage: filters.stage },
    };
  }

  return where;
}

export async function getJobs(
  filters: JobFilters = {},
  scope?: ViewerScope
): Promise<PaginatedJobs> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const skip = (page - 1) * pageSize;
  const where = withJobAccess(buildWhere(filters), scope);

  const [jobs, total] = await Promise.all([
    prisma.jobOrder.findMany({
      where,
      include: JOB_LIST_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.jobOrder.count({ where }),
  ]);

  return {
    jobs: jobs as unknown as JobOrderWithRelations[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getJobById(
  id: number,
  scope?: ViewerScope
): Promise<JobOrderWithRelations | null> {
  return prisma.jobOrder.findFirst({
    where: withJobAccess({ id }, scope),
    include: JOB_DETAIL_INCLUDE,
  }) as Promise<JobOrderWithRelations | null>;
}

export async function getJobBridgeSummary(
  id: number,
  scope?: ViewerScope
): Promise<JobBridgeSummary | null> {
  return prisma.jobOrder.findFirst({
    where: withJobAccess({ id }, scope),
    select: {
      id: true,
      title: true,
      status: true,
      client: {
        select: {
          id: true,
          companyName: true,
          employer: {
            select: {
              id: true,
              companyName: true,
              slug: true,
              status: true,
              subscription: {
                select: {
                  status: true,
                  tier: true,
                  endDate: true,
                  jobQuota: true,
                  jobsUsed: true,
                },
              },
            },
          },
        },
      },
      jobPostings: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          publishedAt: true,
          expiresAt: true,
          employer: {
            select: {
              id: true,
              companyName: true,
              slug: true,
              status: true,
            },
          },
        },
      },
    },
  }) as Promise<JobBridgeSummary | null>;
}

export async function createJob(data: CreateJobInput, createdById: number) {
  return prisma.jobOrder.create({
    data: { ...data, createdById },
  });
}

export async function updateJob(
  id: number,
  data: UpdateJobInput,
  scope?: ViewerScope
) {
  const accessibleJob = await prisma.jobOrder.findFirst({
    where: withJobAccess({ id }, scope),
    select: { id: true },
  });

  if (!accessibleJob) {
    throw new Error("FORBIDDEN_JOB");
  }

  return prisma.jobOrder.update({ where: { id }, data });
}

export async function publishJobToFdiWork(id: number, scope?: ViewerScope) {
  const job = await getJobForBridgeMutation(id, scope);

  if (!job) {
    throw new Error("FORBIDDEN_JOB");
  }

  if (job.jobPostings.length > 0) {
    throw new Error("JOB_ALREADY_PUBLISHED");
  }

  const employer = job.client.employer;

  if (!employer) {
    throw new Error("MISSING_EMPLOYER_LINK");
  }

  if (employer.status !== "ACTIVE") {
    throw new Error("EMPLOYER_NOT_ACTIVE");
  }

  const subscription = employer.subscription;

  if (!subscription || subscription.status !== "ACTIVE" || subscription.endDate < new Date()) {
    throw new Error("SUBSCRIPTION_NOT_ACTIVE");
  }

  if (subscription.jobsUsed >= subscription.jobQuota) {
    throw new Error("SUBSCRIPTION_QUOTA_EXCEEDED");
  }

  const slug = await createUniqueJobPostingSlug(job.title);

  const [createdPosting] = await prisma.$transaction([
    prisma.jobPosting.create({
      data: {
        employerId: employer.id,
        jobOrderId: job.id,
        title: job.title,
        slug,
        description: buildPublicJobDescription(job),
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryDisplay: formatSalaryDisplay(job.salaryMin, job.salaryMax),
        industry: job.industry,
        location: job.location,
        industrialZone: job.industrialZone,
        quantity: job.quantity,
        skills: job.requiredSkills,
        status: "PENDING",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
      },
    }),
    prisma.subscription.update({
      where: { employerId: employer.id },
      data: {
        jobsUsed: {
          increment: 1,
        },
      },
    }),
  ]);

  return createdPosting;
}

export async function updateJobStatus(
  id: number,
  status: JobStatus,
  scope?: ViewerScope
) {
  const accessibleJob = await prisma.jobOrder.findFirst({
    where: withJobAccess({ id }, scope),
    select: { id: true },
  });

  if (!accessibleJob) {
    throw new Error("FORBIDDEN_JOB");
  }

  return prisma.jobOrder.update({ where: { id }, data: { status } });
}

export async function syncJobToLinkedJobPostings(id: number, scope?: ViewerScope) {
  const job = await getJobForBridgeMutation(id, scope);

  if (!job || job.jobPostings.length === 0) {
    return 0;
  }

  const result = await prisma.jobPosting.updateMany({
    where: {
      jobOrderId: id,
      status: {
        notIn: [JobPostingStatus.REJECTED, JobPostingStatus.EXPIRED],
      },
    },
    data: {
      title: job.title,
      description: buildPublicJobDescription(job),
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryDisplay: formatSalaryDisplay(job.salaryMin, job.salaryMax),
      industry: job.industry,
      location: job.location,
      industrialZone: job.industrialZone,
      quantity: job.quantity,
      skills: job.requiredSkills,
    },
  });

  return result.count;
}

export async function syncJobStatusToLinkedJobPostings(
  id: number,
  status: JobStatus,
  scope?: ViewerScope
) {
  const job = await getJobForBridgeMutation(id, scope);

  if (!job || job.jobPostings.length === 0) {
    return 0;
  }

  if (status === "PAUSED") {
    const result = await prisma.jobPosting.updateMany({
      where: {
        jobOrderId: id,
        status: JobPostingStatus.APPROVED,
      },
      data: {
        status: JobPostingStatus.PAUSED,
      },
    });

    return result.count;
  }

  if (status === "FILLED" || status === "CANCELLED") {
    const result = await prisma.jobPosting.updateMany({
      where: {
        jobOrderId: id,
        status: {
          in: [
            JobPostingStatus.PENDING,
            JobPostingStatus.APPROVED,
            JobPostingStatus.PAUSED,
          ],
        },
      },
      data: {
        status: JobPostingStatus.EXPIRED,
        expiresAt: new Date(),
      },
    });

    return result.count;
  }

  return 0;
}

export async function getAssignableUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function searchAvailableCandidates(
  jobId: number,
  filters: {
    query?: string;
    level?: CandidateSeniority;
    skills?: string[];
    maxSalary?: number | null;
  } = {},
  scope?: ViewerScope
) {
  const query = filters.query?.trim();
  const normalizedSkills =
    filters.skills
      ?.map((skill) => skill.toLowerCase().trim())
      .filter(Boolean) ?? [];

  const accessibleJob = await prisma.jobOrder.findFirst({
    where: withJobAccess({ id: jobId }, scope),
    select: { id: true },
  });

  if (!accessibleJob) {
    return [];
  }

  return prisma.candidate.findMany({
    where: {
      isDeleted: false,
      ...(!scope || scope.isAdmin ? {} : { createdById: scope.userId }),
      NOT: { jobLinks: { some: { jobOrderId: jobId } } },
      ...(query
        ? {
          OR: [
            { fullName: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
        : {}),
      ...(filters.level ? { level: filters.level } : {}),
      ...(normalizedSkills.length > 0 ? { skills: { hasSome: normalizedSkills } } : {}),
      ...(typeof filters.maxSalary === "number"
        ? { expectedSalary: { lte: filters.maxSalary } }
        : {}),
    },
    take: 20,
    select: {
      id: true,
      fullName: true,
      currentPosition: true,
      currentCompany: true,
      industry: true,
      status: true,
      skills: true,
      level: true,
      expectedSalary: true,
    },
    orderBy: { fullName: "asc" },
  });
}
