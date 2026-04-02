import { prisma } from "@/lib/prisma";
import {
  CandidateFilters,
  PaginatedCandidates,
  CreateCandidateInput,
  UpdateCandidateInput,
  CandidateWithRelations,
} from "@/types/candidate";
import { Prisma } from "@prisma/client";

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
} satisfies Prisma.CandidateInclude;

// ============================================================
// Build WHERE clause from filters
// ============================================================
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
    where.skills = { hasSome: filters.skills };
  }
  if (filters.industry)
    where.industry = { contains: filters.industry, mode: "insensitive" };
  if (filters.location)
    where.location = { contains: filters.location, mode: "insensitive" };

  if (filters.minSalary !== undefined || filters.maxSalary !== undefined) {
    where.expectedSalary = {};
    if (filters.minSalary !== undefined)
      where.expectedSalary.gte = filters.minSalary;
    if (filters.maxSalary !== undefined)
      where.expectedSalary.lte = filters.maxSalary;
  }

  if (filters.tagIds && filters.tagIds.length > 0) {
    where.tags = {
      some: { tagId: { in: filters.tagIds } },
    };
  }

  return where;
}

// ============================================================
// List with filters & pagination
// ============================================================
export async function getCandidates(
  filters: CandidateFilters = {}
): Promise<PaginatedCandidates> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const skip = (page - 1) * pageSize;
  const where = buildWhere(filters);

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      include: CANDIDATE_LIST_INCLUDE,
      orderBy: { createdAt: "desc" },
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

// ============================================================
// Get single candidate with all relations
// ============================================================
export async function getCandidateById(
  id: number
): Promise<CandidateWithRelations | null> {
  return prisma.candidate.findFirst({
    where: { id, isDeleted: false },
    include: CANDIDATE_DETAIL_INCLUDE,
  }) as Promise<CandidateWithRelations | null>;
}

// ============================================================
// Create
// ============================================================
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

// ============================================================
// Update
// ============================================================
export async function updateCandidate(
  id: number,
  data: UpdateCandidateInput
) {
  const { tagIds, ...rest } = data;

  // Note: Không dùng interactive $transaction vì gây lỗi P2028 
  // với driver adapter @prisma/adapter-pg (Prisma 7).
  const candidate = await prisma.candidate.update({
    where: { id },
    data: rest,
  });

  if (tagIds !== undefined) {
    await prisma.candidateTag.deleteMany({ where: { candidateId: id } });
    if (tagIds.length > 0) {
      await prisma.candidateTag.createMany({
        data: tagIds.map((tagId) => ({ candidateId: id, tagId })),
      });
    }
  }

  return candidate;
}

// ============================================================
// Soft delete
// ============================================================
export async function softDeleteCandidate(id: number) {
  return prisma.candidate.update({
    where: { id },
    data: { isDeleted: true },
  });
}

// ============================================================
// Add note
// ============================================================
export async function addCandidateNote(
  candidateId: number,
  content: string,
  createdById: number
) {
  return prisma.candidateNote.create({
    data: { candidateId, content, createdById },
    include: { createdBy: { select: { id: true, name: true } } },
  });
}

// ============================================================
// Update CV
// ============================================================
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

// ============================================================
// Quick Toggle Tags
// ============================================================
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
