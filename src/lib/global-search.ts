"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export type SearchResultItem = {
  type: "candidate" | "client" | "job" | "employer";
  id: number;
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  try {
    await requireAdmin();

    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      return [];
    }

    const [candidates, clients, jobs, employers] = await Promise.all([
      prisma.candidate.findMany({
        where: {
          isDeleted: false,
          OR: [
            { fullName: { contains: normalizedQuery, mode: "insensitive" } },
            { email: { contains: normalizedQuery, mode: "insensitive" } },
            { phone: { contains: normalizedQuery } },
          ],
        },
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
        where: {
          isDeleted: false,
          OR: [
            { companyName: { contains: normalizedQuery, mode: "insensitive" } },
            { industry: { contains: normalizedQuery, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          companyName: true,
          industry: true,
        },
        take: 4,
        orderBy: { companyName: "asc" },
      }),
      prisma.jobOrder.findMany({
        where: {
          OR: [
            { title: { contains: normalizedQuery, mode: "insensitive" } },
            { client: { companyName: { contains: normalizedQuery, mode: "insensitive" } } },
          ],
        },
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
      prisma.employer.findMany({
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
      }),
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
