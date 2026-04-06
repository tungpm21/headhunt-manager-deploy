import { FeeType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withJobAccess, withSubscriptionAccess } from "@/lib/access-scope";
import { expireSubscriptionsIfNeeded } from "@/lib/subscriptions";
import { ViewerScope } from "@/lib/viewer-scope";

type PlacementRevenueInput = {
  fee: number | null;
  feeType: FeeType | null;
  candidateExpectedSalary: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
};

export type DashboardRevenueSummary = {
  headhuntRevenueTotal: number;
  headhuntRevenueThisMonth: number;
  subscriptionRevenueActive: number;
  subscriptionRevenueThisMonth: number;
  totalRevenue: number;
  subscriptionsSoldThisMonthCount: number;
  activeSubscriptionCount: number;
};

export type ClientRevenueSummary = {
  totalJobs: number;
  openJobs: number;
  placementCount: number;
  placementsThisMonth: number;
  headhuntRevenueTotal: number;
  headhuntRevenueThisMonth: number;
  subscriptionRevenue: number;
  totalRevenue: number;
  linkedSubscription: {
    employerId: number;
    employerName: string;
    tier: string;
    endDate: Date;
    price: number;
  } | null;
};

export function calculatePlacementRevenue({
  fee,
  feeType,
  candidateExpectedSalary,
  salaryMin,
  salaryMax,
}: PlacementRevenueInput): number {
  if (!fee || !feeType) {
    return 0;
  }

  if (feeType === "FIXED") {
    return fee;
  }

  const salaryBase = candidateExpectedSalary ?? salaryMax ?? salaryMin ?? 0;

  if (salaryBase <= 0) {
    return 0;
  }

  return salaryBase * 1_000_000 * (fee / 100);
}

export async function getDashboardRevenueSummary(
  referenceDate: Date = new Date(),
  scope?: ViewerScope
): Promise<DashboardRevenueSummary> {
  await expireSubscriptionsIfNeeded();
  const startOfMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1
  );

  const [placedCandidates, activeSubscriptions, subscriptionsSoldThisMonth] =
    await Promise.all([
      prisma.jobCandidate.findMany({
        where: {
          stage: "HIRED",
          jobOrder: withJobAccess({}, scope),
        },
        select: {
          updatedAt: true,
          candidate: {
            select: {
              expectedSalary: true,
            },
          },
          jobOrder: {
            select: {
              fee: true,
              feeType: true,
              salaryMin: true,
              salaryMax: true,
            },
          },
        },
      }),
      prisma.subscription.findMany({
        where: withSubscriptionAccess(
          {
            status: "ACTIVE",
          },
          scope
        ),
        select: {
          price: true,
        },
      }),
      prisma.subscription.findMany({
        where: withSubscriptionAccess(
          {
            createdAt: {
              gte: startOfMonth,
            },
          },
          scope
        ),
        select: {
          price: true,
        },
      }),
    ]);

  const headhuntRevenueTotal = placedCandidates.reduce(
    (sum, item) =>
      sum +
      calculatePlacementRevenue({
        fee: item.jobOrder.fee,
        feeType: item.jobOrder.feeType,
        candidateExpectedSalary: item.candidate.expectedSalary,
        salaryMin: item.jobOrder.salaryMin,
        salaryMax: item.jobOrder.salaryMax,
      }),
    0
  );

  const headhuntRevenueThisMonth = placedCandidates.reduce((sum, item) => {
    if (item.updatedAt < startOfMonth) {
      return sum;
    }

    return (
      sum +
      calculatePlacementRevenue({
        fee: item.jobOrder.fee,
        feeType: item.jobOrder.feeType,
        candidateExpectedSalary: item.candidate.expectedSalary,
        salaryMin: item.jobOrder.salaryMin,
        salaryMax: item.jobOrder.salaryMax,
      })
    );
  }, 0);

  const subscriptionRevenueActive = activeSubscriptions.reduce(
    (sum, subscription) => sum + subscription.price,
    0
  );

  const subscriptionRevenueThisMonth = subscriptionsSoldThisMonth.reduce(
    (sum, subscription) => sum + subscription.price,
    0
  );

  return {
    headhuntRevenueTotal,
    headhuntRevenueThisMonth,
    subscriptionRevenueActive,
    subscriptionRevenueThisMonth,
    totalRevenue: headhuntRevenueTotal + subscriptionRevenueActive,
    subscriptionsSoldThisMonthCount: subscriptionsSoldThisMonth.length,
    activeSubscriptionCount: activeSubscriptions.length,
  };
}

export async function getClientRevenueSummary(
  clientId: number,
  referenceDate: Date = new Date(),
  scope?: ViewerScope
): Promise<ClientRevenueSummary> {
  await expireSubscriptionsIfNeeded();
  const startOfMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1
  );

  const [jobOrders, placedCandidates, linkedSubscription] = await Promise.all([
    prisma.jobOrder.findMany({
      where: withJobAccess(
        {
          clientId,
        },
        scope
      ),
      select: {
        id: true,
        status: true,
      },
    }),
    prisma.jobCandidate.findMany({
      where: {
        stage: "HIRED",
        jobOrder: withJobAccess(
          {
            clientId,
          },
          scope
        ),
      },
      select: {
        updatedAt: true,
        candidate: {
          select: {
            expectedSalary: true,
          },
        },
        jobOrder: {
          select: {
            fee: true,
            feeType: true,
            salaryMin: true,
            salaryMax: true,
          },
        },
      },
    }),
    prisma.subscription.findFirst({
      where: withSubscriptionAccess(
        {
          employer: {
            clientId,
          },
          status: "ACTIVE",
        },
        scope
      ),
      select: {
        price: true,
        tier: true,
        endDate: true,
        employer: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    }),
  ]);

  const headhuntRevenueTotal = placedCandidates.reduce(
    (sum, item) =>
      sum +
      calculatePlacementRevenue({
        fee: item.jobOrder.fee,
        feeType: item.jobOrder.feeType,
        candidateExpectedSalary: item.candidate.expectedSalary,
        salaryMin: item.jobOrder.salaryMin,
        salaryMax: item.jobOrder.salaryMax,
      }),
    0
  );

  const headhuntRevenueThisMonth = placedCandidates.reduce((sum, item) => {
    if (item.updatedAt < startOfMonth) {
      return sum;
    }

    return (
      sum +
      calculatePlacementRevenue({
        fee: item.jobOrder.fee,
        feeType: item.jobOrder.feeType,
        candidateExpectedSalary: item.candidate.expectedSalary,
        salaryMin: item.jobOrder.salaryMin,
        salaryMax: item.jobOrder.salaryMax,
      })
    );
  }, 0);

  const subscriptionRevenue = linkedSubscription?.price ?? 0;

  return {
    totalJobs: jobOrders.length,
    openJobs: jobOrders.filter((job) => job.status === "OPEN").length,
    placementCount: placedCandidates.length,
    placementsThisMonth: placedCandidates.filter(
      (candidate) => candidate.updatedAt >= startOfMonth
    ).length,
    headhuntRevenueTotal,
    headhuntRevenueThisMonth,
    subscriptionRevenue,
    totalRevenue: headhuntRevenueTotal + subscriptionRevenue,
    linkedSubscription: linkedSubscription
      ? {
        employerId: linkedSubscription.employer.id,
        employerName: linkedSubscription.employer.companyName,
        tier: linkedSubscription.tier,
        endDate: linkedSubscription.endDate,
        price: linkedSubscription.price,
      }
      : null,
  };
}
