/**
 * Shared access-control filters for Prisma queries.
 *
 * These helpers add row-level scope filtering based on the current viewer:
 * - Admin: no filter (sees everything)
 * - Member: only sees records they created (or are assigned to for JobOrder)
 *
 * Previously duplicated in candidates.ts, clients.ts, jobs.ts,
 * global-search.ts, revenue.ts, and dashboard/page.tsx.
 */

import { Prisma } from "@prisma/client";
import { ViewerScope } from "@/lib/viewer-scope";

export function withCandidateAccess(
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

export function withClientAccess(
    where: Prisma.ClientWhereInput,
    scope?: ViewerScope
): Prisma.ClientWhereInput {
    if (!scope || scope.isAdmin) {
        return where;
    }

    return {
        AND: [where, { createdById: scope.userId }],
    };
}

export function withJobAccess(
    where: Prisma.JobOrderWhereInput,
    scope?: ViewerScope
): Prisma.JobOrderWhereInput {
    if (!scope || scope.isAdmin) {
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

/**
 * Filters subscriptions to only the employer linked to a client
 * the current member created. Admins see all subscriptions.
 */
export function withSubscriptionAccess(
    where: Prisma.SubscriptionWhereInput,
    scope?: ViewerScope
): Prisma.SubscriptionWhereInput {
    if (!scope || scope.isAdmin) {
        return where;
    }

    return {
        AND: [
            where,
            {
                employer: {
                    client: {
                        createdById: scope.userId,
                    },
                },
            },
        ],
    };
}
