import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ViewerScope } from "@/lib/viewer-scope";
import {
  CandidateFilters,
  PaginatedCandidates,
  CreateCandidateInput,
  UpdateCandidateInput,
  CandidateWithRelations,
} from "@/types/candidate";

function withCandidateAccess(
  where: Prisma.CandidateWhereInput,
  scope?: ViewerScope
): Prisma.CandidateWhereInput {
  if (!scope || scope.isAdmin) {
    return where;
  }

  return {
    AND: [where, { createdById: scope.userId }],
  };
}

const CANDIDATE_LIST_INCLUDE = {
  tags: { include: { tag: true } },
  cvFiles: {
    select: {
      id: true,
      fileName: true,
      fileUrl: true,
      label: true,
    },
    take: 3,
    orderBy: [{ isPrimary: "desc" as const }, { uploadedAt: "desc" as const }],
  },
  languages: {
    select: {
      id: true,
      language: true,
      level: true,
    },
    orderBy: [{ language: "asc" as const }, { id: "asc" as const }],
  },
} satisfies Prisma.CandidateInclude;

const CANDIDATE_DETAIL_INCLUDE = {
  tags: { include: { tag: true } },
  notes: {
    include: { createdBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" as const },
  },
  reminders: {
    include: {
      assignedTo: { select: { id: true, name: true } },
      completedBy: { select: { id: true, name: true } },
    },
    orderBy: [
      { isCompleted: "asc" as const },
      { dueAt: "asc" as const },
      { createdAt: "desc" as const },
    ],
  },
  createdBy: { select: { id: true, name: true } },
  cvFiles: {
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: [{ isPrimary: "desc" as const }, { uploadedAt: "desc" as const }],
  },
  languages: {
    orderBy: [{ language: "asc" as const }, { id: "asc" as const }],
  },
  workHistory: {
    orderBy: [
      { isCurrent: "desc" as const },
      { endDate: "desc" as const },
      { startDate: "desc" as const },
    ],
  },
  jobLinks: {
    include: {
      jobOrder: {
        select: {
          id: true,
          title: true,
          status: true,
          client: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.CandidateInclude;

function buildWhere(filters: CandidateFilters): Prisma.CandidateWhereInput {
  const where: Prisma.CandidateWhereInput = { isDeleted: false };

  if (filters.search) {
    const s = filters.search.trim();
    where.OR = [
      { fullName: { contains: s, mode: "insensitive" } },
      { phone: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
    ];
  }

  if (filters.status) where.status = filters.status;
  if (filters.level) where.level = filters.level;

  if (filters.language) {
    where.languages = {
      some: {
        language: { equals: filters.language, mode: "insensitive" },
      },
    };
  }

  if (filters.skills && filters.skills.length > 0) {
    where.skills = {
      hasSome: filters.skills.map((skill) => skill.toLowerCase().trim()),
    };
  }

  if (filters.industry) {
    where.industry = { contains: filters.industry, mode: "insensitive" };
  }

  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }

  if (filters.minSalary !== undefined || filters.maxSalary !== undefined) {
    where.expectedSalary = {};

    if (filters.minSalary !== undefined) {
      where.expectedSalary.gte = filters.minSalary;
    }

    if (filters.maxSalary !== undefined) {
      where.expectedSalary.lte = filters.maxSalary;
    }
  }

  if (filters.tagIds && filters.tagIds.length > 0) {
    where.tags = {
      some: { tagId: { in: filters.tagIds } },
    };
  }

  return where;
}

function buildTrashWhere(search?: string): Prisma.CandidateWhereInput {
  const where: Prisma.CandidateWhereInput = { isDeleted: true };

  if (!search?.trim()) {
    return where;
  }

  const normalizedSearch = search.trim();
  where.OR = [
    { fullName: { contains: normalizedSearch, mode: "insensitive" } },
    { phone: { contains: normalizedSearch, mode: "insensitive" } },
    { email: { contains: normalizedSearch, mode: "insensitive" } },
  ];

  return where;
}

export async function getCandidates(
  filters: CandidateFilters = {},
  scope?: ViewerScope
): Promise<PaginatedCandidates> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const skip = (page - 1) * pageSize;
  const where = withCandidateAccess(buildWhere(filters), scope);

  const sortBy = filters.sortBy ?? "createdAt";
  const sortOrder = filters.sortOrder ?? "desc";
  const orderBy: Prisma.CandidateOrderByWithRelationInput =
    sortBy === "fullName" ? { fullName: sortOrder }
      : sortBy === "expectedSalary" ? { expectedSalary: sortOrder }
        : sortBy === "updatedAt" ? { updatedAt: sortOrder }
          : { createdAt: sortOrder };

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      include: CANDIDATE_LIST_INCLUDE,
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.candidate.count({ where }),
  ]);

  return {
    candidates,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getDeletedCandidates(filters: {
  search?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<PaginatedCandidates> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const skip = (page - 1) * pageSize;
  const where = buildTrashWhere(filters.search);

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      include: CANDIDATE_LIST_INCLUDE,
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.candidate.count({ where }),
  ]);

  return {
    candidates,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

function normalizeDistinctValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => a.localeCompare(b, "vi"));
}

export async function getCandidateFilterOptions(scope?: ViewerScope) {
  const baseWhere = withCandidateAccess({ isDeleted: false }, scope);
  const [locations, industries, allSkillRows] = await Promise.all([
    prisma.candidate.findMany({
      where: {
        ...baseWhere,
        location: { not: null },
      },
      select: { location: true },
      distinct: ["location"],
      orderBy: { location: "asc" },
    }),
    prisma.candidate.findMany({
      where: {
        ...baseWhere,
        industry: { not: null },
      },
      select: { industry: true },
      distinct: ["industry"],
      orderBy: { industry: "asc" },
    }),
    prisma.candidate.findMany({
      where: { ...baseWhere, skills: { isEmpty: false } },
      select: { skills: true },
    }),
  ]);

  const skills = Array.from(
    new Set(
      allSkillRows
        .flatMap((c) => c.skills)
        .map((s) => s.toLowerCase().trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, "vi"));

  return {
    locations: normalizeDistinctValues(locations.map((item) => item.location)),
    industries: normalizeDistinctValues(industries.map((item) => item.industry)),
    skills,
  };
}

export async function getCandidateById(
  id: number,
  scope?: ViewerScope
): Promise<CandidateWithRelations | null> {
  return prisma.candidate.findFirst({
    where: withCandidateAccess({ id, isDeleted: false }, scope),
    include: CANDIDATE_DETAIL_INCLUDE,
  }) as Promise<CandidateWithRelations | null>;
}

export async function checkDuplicate(
  email?: string,
  phone?: string,
  excludeId?: number
) {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedPhone = phone?.trim();

  if (!normalizedEmail && !normalizedPhone) {
    return null;
  }

  return prisma.candidate.findFirst({
    where: {
      isDeleted: false,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [
        ...(normalizedEmail
          ? [{ email: { equals: normalizedEmail, mode: "insensitive" as const } }]
          : []),
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
      ],
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
    },
  });
}

export async function createCandidate(
  data: CreateCandidateInput,
  createdById: number
) {
  const { tagIds, ...rest } = data;

  return prisma.candidate.create({
    data: {
      ...rest,
      createdById,
      ...(tagIds && tagIds.length > 0
        ? {
          tags: {
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }
        : {}),
    },
    include: CANDIDATE_LIST_INCLUDE,
  });
}

export async function updateCandidate(
  id: number,
  data: UpdateCandidateInput,
  scope?: ViewerScope
) {
  const accessibleCandidate = await prisma.candidate.findFirst({
    where: withCandidateAccess({ id, isDeleted: false }, scope),
    select: { id: true },
  });

  if (!accessibleCandidate) {
    throw new Error("FORBIDDEN_CANDIDATE");
  }

  const { tagIds, ...rest } = data;

  if (tagIds === undefined) {
    return prisma.candidate.update({
      where: { id },
      data: rest,
    });
  }

  const operations: Prisma.PrismaPromise<unknown>[] = [
    prisma.candidate.update({
      where: { id },
      data: rest,
    }),
    prisma.candidateTag.deleteMany({ where: { candidateId: id } }),
  ];

  if (tagIds.length > 0) {
    operations.push(
      prisma.candidateTag.createMany({
        data: tagIds.map((tagId) => ({ candidateId: id, tagId })),
      })
    );
  }

  const [candidate] = await prisma.$transaction(operations);
  return candidate as Awaited<ReturnType<typeof prisma.candidate.update>>;
}

export async function softDeleteCandidate(id: number, scope?: ViewerScope) {
  const accessibleCandidate = await prisma.candidate.findFirst({
    where: withCandidateAccess({ id, isDeleted: false }, scope),
    select: { id: true },
  });

  if (!accessibleCandidate) {
    throw new Error("FORBIDDEN_CANDIDATE");
  }

  return prisma.candidate.update({
    where: { id },
    data: { isDeleted: true },
  });
}

export async function restoreCandidate(id: number) {
  return prisma.candidate.update({
    where: { id },
    data: { isDeleted: false },
  });
}

export async function addCandidateNote(
  candidateId: number,
  content: string,
  createdById: number,
  scope?: ViewerScope
) {
  const accessibleCandidate = await prisma.candidate.findFirst({
    where: withCandidateAccess({ id: candidateId, isDeleted: false }, scope),
    select: { id: true },
  });

  if (!accessibleCandidate) {
    throw new Error("FORBIDDEN_CANDIDATE");
  }

  return prisma.candidateNote.create({
    data: { candidateId, content, createdById },
    include: { createdBy: { select: { id: true, name: true } } },
  });
}

export async function updateCandidateCV(
  id: number,
  cvFileUrl: string | null,
  cvFileName: string | null
) {
  return prisma.candidate.update({
    where: { id },
    data: { cvFileUrl, cvFileName },
  });
}

export async function addTagToCandidate(candidateId: number, tagId: number) {
  return prisma.candidateTag.upsert({
    where: { candidateId_tagId: { candidateId, tagId } },
    create: { candidateId, tagId },
    update: {},
  });
}

export async function removeTagFromCandidate(candidateId: number, tagId: number) {
  return prisma.candidateTag.delete({
    where: { candidateId_tagId: { candidateId, tagId } },
  });
}
