"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import {
  withWorkspaceApplicationAccess,
  withWorkspaceSubmissionAccess,
} from "@/lib/workspace";

export type CompanyPortalSearchResultType =
  | "job-posting"
  | "application"
  | "job-order"
  | "submission";

export type CompanyPortalSearchResultItem = {
  type: CompanyPortalSearchResultType;
  id: number;
  title: string;
  subtitle: string;
  href: string;
};

function joinMeta(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" / ");
}

export async function companyPortalSearch(
  query: string
): Promise<CompanyPortalSearchResultItem[]> {
  try {
    const session = await requireCompanyPortalSession();
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      return [];
    }

    const workspace = await prisma.companyWorkspace.findUnique({
      where: { id: session.workspaceId },
      select: { employerId: true, clientId: true },
    });

    const applicationWhere: Prisma.ApplicationWhereInput = {
      AND: [
        withWorkspaceApplicationAccess(session.workspaceId),
        {
          OR: [
            { fullName: { contains: normalizedQuery, mode: "insensitive" } },
            { email: { contains: normalizedQuery, mode: "insensitive" } },
            { phone: { contains: normalizedQuery } },
            {
              jobPosting: {
                title: { contains: normalizedQuery, mode: "insensitive" },
              },
            },
          ],
        },
      ],
    };

    const submissionWhere: Prisma.JobCandidateWhereInput = {
      AND: [
        withWorkspaceSubmissionAccess(session.workspaceId),
        {
          OR: [
            {
              candidate: {
                fullName: { contains: normalizedQuery, mode: "insensitive" },
              },
            },
            {
              candidate: {
                email: { contains: normalizedQuery, mode: "insensitive" },
              },
            },
            {
              candidate: {
                phone: { contains: normalizedQuery },
              },
            },
            {
              candidate: {
                currentPosition: {
                  contains: normalizedQuery,
                  mode: "insensitive",
                },
              },
            },
            {
              jobOrder: {
                title: { contains: normalizedQuery, mode: "insensitive" },
              },
            },
          ],
        },
      ],
    };

    const [jobPostings, applications, jobOrders, submissions] = await Promise.all([
      session.capabilities.employer && workspace?.employerId
        ? prisma.jobPosting.findMany({
            where: {
              employerId: workspace.employerId,
              OR: [
                { title: { contains: normalizedQuery, mode: "insensitive" } },
                { industry: { contains: normalizedQuery, mode: "insensitive" } },
                { location: { contains: normalizedQuery, mode: "insensitive" } },
                {
                  industrialZone: {
                    contains: normalizedQuery,
                    mode: "insensitive",
                  },
                },
              ],
            },
            select: {
              id: true,
              title: true,
              status: true,
              industry: true,
              location: true,
            },
            take: 5,
            orderBy: { updatedAt: "desc" },
          })
        : Promise.resolve([]),
      session.capabilities.employer
        ? prisma.application.findMany({
            where: applicationWhere,
            select: {
              id: true,
              fullName: true,
              email: true,
              status: true,
              jobPosting: {
                select: {
                  title: true,
                },
              },
            },
            take: 5,
            orderBy: { updatedAt: "desc" },
          })
        : Promise.resolve([]),
      session.capabilities.client && workspace?.clientId
        ? prisma.jobOrder.findMany({
            where: {
              clientId: workspace.clientId,
              OR: [
                { title: { contains: normalizedQuery, mode: "insensitive" } },
                { industry: { contains: normalizedQuery, mode: "insensitive" } },
                { location: { contains: normalizedQuery, mode: "insensitive" } },
                {
                  industrialZone: {
                    contains: normalizedQuery,
                    mode: "insensitive",
                  },
                },
              ],
            },
            select: {
              id: true,
              title: true,
              status: true,
              industry: true,
              location: true,
            },
            take: 5,
            orderBy: { updatedAt: "desc" },
          })
        : Promise.resolve([]),
      session.capabilities.client
        ? prisma.jobCandidate.findMany({
            where: submissionWhere,
            select: {
              id: true,
              stage: true,
              result: true,
              candidate: {
                select: {
                  fullName: true,
                  email: true,
                  currentPosition: true,
                },
              },
              jobOrder: {
                select: {
                  title: true,
                },
              },
            },
            take: 5,
            orderBy: { updatedAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

    return [
      ...jobPostings.map((job) => ({
        type: "job-posting" as const,
        id: job.id,
        title: job.title,
        subtitle: joinMeta([job.status, job.location, job.industry]),
        href: `/company/job-postings/${job.id}`,
      })),
      ...applications.map((application) => ({
        type: "application" as const,
        id: application.id,
        title: application.fullName || application.email || "Hồ sơ ứng tuyển",
        subtitle: joinMeta([application.jobPosting.title, application.status]),
        href: `/company/applications?selected=${application.id}`,
      })),
      ...jobOrders.map((order) => ({
        type: "job-order" as const,
        id: order.id,
        title: order.title,
        subtitle: joinMeta([order.status, order.location, order.industry]),
        href: `/company/job-orders/${order.id}`,
      })),
      ...submissions.map((submission) => ({
        type: "submission" as const,
        id: submission.id,
        title:
          submission.candidate.fullName ||
          submission.candidate.email ||
          "Submission",
        subtitle: joinMeta([
          submission.jobOrder.title,
          submission.stage,
          submission.result,
          submission.candidate.currentPosition,
        ]),
        href: `/company/submissions?selected=${submission.id}`,
      })),
    ];
  } catch (error) {
    console.error("companyPortalSearch error:", error);
    return [];
  }
}
