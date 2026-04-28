import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ==================== WORKSPACE LOOKUPS ====================

const workspaceInclude = {
    employer: { select: { id: true, companyName: true, slug: true, status: true, email: true } },
    client: { select: { id: true, companyName: true, status: true, isDeleted: true } },
} satisfies Prisma.CompanyWorkspaceInclude;

export async function getCompanyWorkspaceById(id: number) {
    return prisma.companyWorkspace.findUnique({
        where: { id },
        include: workspaceInclude,
    });
}

export async function getWorkspaceForEmployer(employerId: number) {
    return prisma.companyWorkspace.findUnique({
        where: { employerId },
        include: workspaceInclude,
    });
}

export async function getWorkspaceForClient(clientId: number) {
    return prisma.companyWorkspace.findUnique({
        where: { clientId },
        include: workspaceInclude,
    });
}

export async function getWorkspaceBySlug(slug: string) {
    return prisma.companyWorkspace.findUnique({
        where: { slug },
        include: workspaceInclude,
    });
}

// ==================== ACCESS HELPERS ====================

/**
 * Check if a workspace exists and is active.
 * Returns the workspace or null.
 */
export async function getActiveWorkspace(workspaceId: number) {
    return prisma.companyWorkspace.findFirst({
        where: { id: workspaceId, status: "ACTIVE" },
        include: workspaceInclude,
    });
}

/**
 * Check whether a portal user can access the given workspace.
 * Returns true only if the user belongs to the workspace and is active.
 */
export async function canAccessWorkspace(
    portalUserId: number,
    workspaceId: number
): Promise<boolean> {
    const user = await prisma.companyPortalUser.findFirst({
        where: {
            id: portalUserId,
            workspaceId,
            isActive: true,
        },
    });
    return !!user;
}

// ==================== PRISMA WHERE CLAUSE HELPERS ====================

/**
 * Returns a Prisma where clause that constrains Application queries
 * to those belonging to the workspace's employer job postings.
 */
export function withWorkspaceApplicationAccess(workspaceId: number) {
    return {
        jobPosting: {
            employer: {
                workspace: { id: workspaceId },
            },
        },
    } satisfies Prisma.ApplicationWhereInput;
}

/**
 * Returns a Prisma where clause that constrains JobCandidate (submission) queries
 * to those belonging to the workspace's client job orders.
 */
export function withWorkspaceSubmissionAccess(workspaceId: number) {
    return {
        jobOrder: {
            client: {
                workspace: { id: workspaceId },
            },
        },
    } satisfies Prisma.JobCandidateWhereInput;
}

// ==================== ADMIN HELPERS ====================

/**
 * List all workspaces for admin with pagination.
 */
export async function listWorkspaces(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
        prisma.companyWorkspace.findMany({
            skip,
            take: pageSize,
            orderBy: { displayName: "asc" },
            include: workspaceInclude,
        }),
        prisma.companyWorkspace.count(),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
