"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireViewerScope } from "@/lib/authz";
import { ViewerScope } from "@/lib/viewer-scope";

export type SearchResultItem = {
  type: "candidate" | "client" | "job" | "employer";
  id: number;
  title: string;
  subtitle: string;
  href: string;
};

function withCandidateAccess(
  where: Prisma.CandidateWhereInput,
  scope: ViewerScope
): Prisma.CandidateWhereInput {
  if (scope.isAdmin) {
    return where;
  }

  return {
    AND: [where, { createdById: scope.userId }],
  };
}

function withClientAccess(
  where: Prisma.ClientWhereInput,
  scope: ViewerScope
): Prisma.ClientWhereInput {
  if (scope.isAdmin) {
    return where;
  }

  return {
    AND: [where, { createdById: scope.userId }],
  };
}

function withJobAccess(
  where: Prisma.JobOrderWhereInput,
  scope: ViewerScope
): Prisma.JobOrderWhereInput {
  if (scope.isAdmin) {
    return where;
  }

  return {
    AND: [
      where,
      {
        OR: [{ createdById: scope.userId }, { assignedToId: scope.userId }],
      },
    ],
  };
}

export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  try {
    const scope = await requireViewerScope();

    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      return [];
    }

    const [candidates, clients, jobs, employers] = await Promise.all([
      prisma.candidate.findMany({
        where: withCandidateAccess(
          {
            isDeleted: false,
            OR: [
              { fullName: { contains: normalizedQuery, mode: "insensitive" } },
              { email: { contains: normalizedQuery, mode: "insensitive" } },
              { phone: { contains: normalizedQuery } },
            ],
          },
          scope
        ),
        select: {
          id: true,
          fullName: true,
          currentPosition: true,
          currentCompany: true,
        },
        take: 5,
        orderBy: { fullName: "asc" },
      }),
      prisma.client.findMany({
        where: withClientAccess(
          {
            isDeleted: false,
            OR: [
              { companyName: { contains: normalizedQuery, mode: "insensitive" } },
              { industry: { contains: normalizedQuery, mode: "insensitive" } },
            ],
          },
          scope
        ),
        select: {
          id: true,
          companyName: true,
          industry: true,
        },
        take: 4,
        orderBy: { companyName: "asc" },
      }),
      prisma.jobOrder.findMany({
        where: withJobAccess(
          {
            OR: [
              { title: { contains: normalizedQuery, mode: "insensitive" } },
              { client: { companyName: { contains: normalizedQuery, mode: "insensitive" } } },
            ],
          },
          scope
        ),
        select: {
          id: true,
          title: true,
          status: true,
          client: {
            select: { companyName: true },
          },
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
      scope.isAdmin
        ? prisma.employer.findMany({
            where: {
              OR: [
                { companyName: { contains: normalizedQuery, mode: "insensitive" } },
                { email: { contains: normalizedQuery, mode: "insensitive" } },
              ],
            },
            select: {
              id: true,
              companyName: true,
              email: true,
            },
            take: 4,
            orderBy: { updatedAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

    return [
      ...candidates.map((candidate) => ({
        type: "candidate" as const,
        id: candidate.id,
        title: candidate.fullName,
        subtitle: [candidate.currentPosition, candidate.currentCompany]
          .filter(Boolean)
          .join(" • "),
        href: `/candidates/${candidate.id}`,
      })),
      ...clients.map((client) => ({
        type: "client" as const,
        id: client.id,
        title: client.companyName,
        subtitle: client.industry || "Khách hàng CRM",
        href: `/clients/${client.id}`,
      })),
      ...jobs.map((job) => ({
        type: "job" as const,
        id: job.id,
        title: job.title,
        subtitle: `${job.client.companyName} (${job.status})`,
        href: `/jobs/${job.id}`,
      })),
      ...employers.map((employer) => ({
        type: "employer" as const,
        id: employer.id,
        title: employer.companyName,
        subtitle: employer.email,
        href: `/employers/${employer.id}`,
      })),
    ];
  } catch (error) {
    console.error("globalSearch error:", error);
    return [];
  }
}
