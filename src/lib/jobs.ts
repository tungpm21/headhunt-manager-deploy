import { prisma } from "@/lib/prisma";
import { JobFilters, PaginatedJobs, CreateJobInput, UpdateJobInput, JobOrderWithRelations } from "@/types/job";
import { Prisma, JobStatus } from "@prisma/client";

const JOB_LIST_INCLUDE = {
  client: { select: { id: true, companyName: true } },
  _count: { select: { candidates: true } },
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
        },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.JobOrderInclude;

function buildWhere(filters: JobFilters): Prisma.JobOrderWhereInput {
  const where: Prisma.JobOrderWhereInput = {};
  
  if (filters.search) {
    const s = filters.search.trim();
    where.OR = [
      { title: { contains: s, mode: "insensitive" } },
      { client: { companyName: { contains: s, mode: "insensitive" } } },
    ];
  }
  
  if (filters.status) where.status = filters.status;
  if (filters.clientId) where.clientId = filters.clientId;
  
  return where;
}

export async function getJobs(filters: JobFilters = {}): Promise<PaginatedJobs> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const skip = (page - 1) * pageSize;
  const where = buildWhere(filters);

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

export async function getJobById(id: number): Promise<JobOrderWithRelations | null> {
  return prisma.jobOrder.findUnique({
    where: { id },
    include: JOB_DETAIL_INCLUDE,
  }) as Promise<JobOrderWithRelations | null>;
}

export async function createJob(data: CreateJobInput, createdById: number) {
  return prisma.jobOrder.create({
    data: { ...data, createdById },
  });
}

export async function updateJob(id: number, data: UpdateJobInput) {
  return prisma.jobOrder.update({ where: { id }, data });
}

export async function updateJobStatus(id: number, status: JobStatus) {
  return prisma.jobOrder.update({ where: { id }, data: { status } });
}

export async function searchAvailableCandidates(jobId: number, query: string = "") {
  const q = query.trim();
  return prisma.candidate.findMany({
    where: {
      isDeleted: false,
      NOT: { jobLinks: { some: { jobOrderId: jobId } } },
      ...(q ? { OR: [
        { fullName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ]} : {})
    },
    take: 10,
    select: { id: true, fullName: true, currentPosition: true, currentCompany: true, industry: true, status: true },
    orderBy: { fullName: "asc" }
  });
}
