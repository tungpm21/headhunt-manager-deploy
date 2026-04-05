"use server";

import { Prisma } from "@prisma/client";
import { incrementJobPostingView } from "@/lib/job-posting-view-counter";
import { prisma } from "@/lib/prisma";
import { expireSubscriptionsIfNeeded } from "@/lib/subscriptions";

export type HomepageJob = {
  id: number;
  title: string;
  slug: string;
  salaryDisplay: string | null;
  location: string | null;
  workType: string | null;
  industry: string | null;
  isFeatured: boolean;
  publishedAt: Date | null;
  employer: {
    companyName: string;
    logo: string | null;
    slug: string;
  };
};

export type HomepageEmployer = {
  id: number;
  companyName: string;
  logo: string | null;
  coverImage: string | null;
  slug: string;
  industry: string | null;
  subscription: {
    tier: string;
  } | null;
  _count?: { jobPostings: number };
};

export type IndustryCount = {
  industry: string;
  count: number;
};

export type HomepageData = {
  featuredJobs: HomepageJob[];
  bannerEmployers: HomepageEmployer[];
  topEmployers: HomepageEmployer[];
  industries: IndustryCount[];
  stats: {
    totalJobs: number;
    totalEmployers: number;
  };
};

export async function getHomepageData(): Promise<HomepageData> {
  await expireSubscriptionsIfNeeded();
  const now = new Date();

  const [featuredJobs, bannerEmployers, allActiveEmployers, industryGroups, totalJobs, totalEmployers] =
    await Promise.all([
      // 8 latest APPROVED jobs not expired
      prisma.jobPosting.findMany({
        where: {
          status: "APPROVED",
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
        take: 8,
        select: {
          id: true,
          title: true,
          slug: true,
          salaryDisplay: true,
          location: true,
          workType: true,
          industry: true,
          isFeatured: true,
          publishedAt: true,
          employer: {
            select: {
              companyName: true,
              logo: true,
              slug: true,
            },
          },
        },
      }),

      // Banner employers — showBanner=true (VIP campaign banners)
      prisma.employer.findMany({
        where: {
          status: "ACTIVE",
          subscription: {
            status: "ACTIVE",
            showBanner: true,
          },
        },
        select: {
          id: true,
          companyName: true,
          logo: true,
          coverImage: true,
          slug: true,
          industry: true,
          subscription: {
            select: { tier: true },
          },
          _count: {
            select: {
              jobPostings: {
                where: {
                  status: "APPROVED",
                  OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
                },
              },
            },
          },
        },
      }),

      // All active employers — sorted by tier in JS, shown in TopEmployers grid
      prisma.employer.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true,
          companyName: true,
          logo: true,
          coverImage: true,
          slug: true,
          industry: true,
          subscription: {
            select: { tier: true },
          },
          _count: {
            select: {
              jobPostings: {
                where: {
                  status: "APPROVED",
                  OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
                },
              },
            },
          },
        },
      }),

      // Industry counts for approved jobs
      prisma.jobPosting.groupBy({
        by: ["industry"],
        where: {
          status: "APPROVED",
          industry: { not: null },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 8,
      }),

      // Stats
      prisma.jobPosting.count({
        where: {
          status: "APPROVED",
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      }),
      prisma.employer.count({ where: { status: "ACTIVE" } }),
    ]);

  const industries: IndustryCount[] = industryGroups
    .filter((g) => g.industry !== null)
    .map((g) => ({
      industry: g.industry as string,
      count: g._count.id,
    }));

  // Sort all active employers by subscription tier: VIP → PREMIUM → STANDARD → BASIC → none
  const TIER_ORDER: Record<string, number> = {
    VIP: 0,
    PREMIUM: 1,
    STANDARD: 2,
    BASIC: 3,
  };
  const topEmployers = allActiveEmployers
    .slice()
    .sort((a, b) => {
      const aT = a.subscription?.tier ? (TIER_ORDER[a.subscription.tier] ?? 4) : 4;
      const bT = b.subscription?.tier ? (TIER_ORDER[b.subscription.tier] ?? 4) : 4;
      if (aT !== bT) return aT - bT;
      return a.companyName.localeCompare(b.companyName);
    })
    .slice(0, 24);

  return {
    featuredJobs,
    bannerEmployers,
    topEmployers,
    industries,
    stats: { totalJobs, totalEmployers },
  };
}

// ==================== JOB LISTING ====================

export type JobFilters = {
  q?: string;
  industry?: string;
  location?: string;
  workType?: string;
  salaryMin?: number;
  sort?: "newest" | "oldest" | "salary_high" | "salary_low";
  page?: number;
};

export type JobListResult = {
  jobs: HomepageJob[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    industries: string[];
    locations: string[];
    workTypes: string[];
  };
};

const JOBS_PER_PAGE = 12;

async function findJobPostingIdsBySkillKeyword(query: string): Promise<number[]> {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const rows = await prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
    SELECT "id"
    FROM "JobPosting"
    WHERE EXISTS (
      SELECT 1
      FROM unnest("skills") AS skill
      WHERE lower(skill) LIKE ${`%${normalizedQuery}%`}
    )
  `);

  return rows.map((row) => row.id);
}

export async function getPublicJobs(filters: JobFilters = {}): Promise<JobListResult> {
  const now = new Date();
  const page = Math.max(1, filters.page || 1);
  const skillMatchedIds = filters.q
    ? await findJobPostingIdsBySkillKeyword(filters.q)
    : [];

  // Build where clause
  const where: Record<string, unknown> = {
    status: "APPROVED" as const,
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };

  if (filters.q) {
    where.AND = [
      {
        OR: [
          { title: { contains: filters.q, mode: "insensitive" } },
          { description: { contains: filters.q, mode: "insensitive" } },
          { employer: { companyName: { contains: filters.q, mode: "insensitive" } } },
          ...(skillMatchedIds.length > 0 ? [{ id: { in: skillMatchedIds } }] : []),
        ],
      },
    ];
  }
  if (filters.industry) where.industry = filters.industry;
  if (filters.location) where.location = filters.location;
  if (filters.workType) where.workType = filters.workType;
  if (filters.salaryMin) where.salaryMin = { gte: filters.salaryMin };

  // Build orderBy
  type OrderBy = Record<string, "asc" | "desc">;
  let orderBy: OrderBy[] = [{ isFeatured: "desc" }, { publishedAt: "desc" }];
  if (filters.sort === "oldest") orderBy = [{ publishedAt: "asc" }];
  if (filters.sort === "salary_high") orderBy = [{ salaryMax: "desc" }];
  if (filters.sort === "salary_low") orderBy = [{ salaryMin: "asc" }];

  const [jobs, total, distinctIndustries, distinctLocations, distinctWorkTypes] =
    await Promise.all([
      prisma.jobPosting.findMany({
        where,
        orderBy,
        skip: (page - 1) * JOBS_PER_PAGE,
        take: JOBS_PER_PAGE,
        select: {
          id: true,
          title: true,
          slug: true,
          salaryDisplay: true,
          location: true,
          workType: true,
          industry: true,
          isFeatured: true,
          publishedAt: true,
          employer: {
            select: {
              companyName: true,
              logo: true,
              slug: true,
            },
          },
        },
      }),
      prisma.jobPosting.count({ where }),
      prisma.jobPosting.findMany({
        where: { status: "APPROVED", industry: { not: null } },
        select: { industry: true },
        distinct: ["industry"],
      }),
      prisma.jobPosting.findMany({
        where: { status: "APPROVED", location: { not: null } },
        select: { location: true },
        distinct: ["location"],
      }),
      prisma.jobPosting.findMany({
        where: { status: "APPROVED", workType: { not: null } },
        select: { workType: true },
        distinct: ["workType"],
      }),
    ]);

  return {
    jobs,
    total,
    page,
    totalPages: Math.ceil(total / JOBS_PER_PAGE),
    filters: {
      industries: distinctIndustries.map((d) => d.industry).filter(Boolean) as string[],
      locations: distinctLocations.map((d) => d.location).filter(Boolean) as string[],
      workTypes: distinctWorkTypes.map((d) => d.workType).filter(Boolean) as string[],
    },
  };
}

// ==================== JOB DETAIL ====================

export type JobDetail = {
  id: number;
  title: string;
  slug: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryDisplay: string | null;
  industry: string | null;
  position: string | null;
  location: string | null;
  workType: string | null;
  quantity: number;
  skills: string[];
  publishedAt: Date | null;
  expiresAt: Date | null;
  viewCount: number;
  applyCount: number;
  employer: {
    id: number;
    companyName: string;
    logo: string | null;
    slug: string;
    industry: string | null;
    companySize: string | null;
    address: string | null;
    website: string | null;
  };
};

export async function getPublicJobBySlug(
  slug: string
): Promise<{ job: JobDetail; similarJobs: HomepageJob[]; sameEmployerJobs: HomepageJob[]; suggestedJobs: HomepageJob[] } | null> {
  const now = new Date();

  const job = await prisma.jobPosting.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      requirements: true,
      benefits: true,
      salaryMin: true,
      salaryMax: true,
      salaryDisplay: true,
      industry: true,
      position: true,
      location: true,
      workType: true,
      quantity: true,
      skills: true,
      status: true,
      publishedAt: true,
      expiresAt: true,
      viewCount: true,
      applyCount: true,
      employer: {
        select: {
          id: true,
          companyName: true,
          logo: true,
          slug: true,
          industry: true,
          companySize: true,
          address: true,
          website: true,
        },
      },
    },
  });

  if (!job || job.status !== "APPROVED") return null;
  if (job.expiresAt && job.expiresAt < now) return null;

  incrementJobPostingView(job.id);

  const jobSelect = {
    id: true, title: true, slug: true, salaryDisplay: true,
    location: true, workType: true, industry: true, isFeatured: true,
    publishedAt: true,
    employer: { select: { companyName: true, logo: true, slug: true } },
  } as const;

  const activeWhere = {
    status: "APPROVED" as const,
    id: { not: job.id },
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };

  const [similarJobs, sameEmployerJobs, suggestedJobs] = await Promise.all([
    // Similar jobs (same industry, for bottom section)
    prisma.jobPosting.findMany({
      where: { ...activeWhere, industry: job.industry },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      take: 4,
      select: jobSelect,
    }),
    // Same employer jobs (for "Việc làm khác cùng DN" section)
    prisma.jobPosting.findMany({
      where: { ...activeWhere, employerId: job.employer.id },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      take: 3,
      select: jobSelect,
    }),
    // Suggested jobs for sidebar (same industry, featured first)
    prisma.jobPosting.findMany({
      where: { ...activeWhere, industry: job.industry },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      take: 5,
      select: jobSelect,
    }),
  ]);

  return { job, similarJobs, sameEmployerJobs, suggestedJobs };
}

// ==================== COMPANY LISTING ====================

export type PublicCompany = {
  id: number;
  companyName: string;
  logo: string | null;
  coverImage: string | null;
  slug: string;
  industry: string | null;
  companySize: string | null;
  address: string | null;
  description: string | null;
  subscription: { tier: string } | null;
  _count: { jobPostings: number };
};

export type CompanyListResult = {
  companies: PublicCompany[];
  total: number;
  page: number;
  totalPages: number;
};

const COMPANIES_PER_PAGE = 12;

export async function getPublicCompanies(
  filters: { q?: string; industry?: string; page?: number } = {}
): Promise<CompanyListResult> {
  await expireSubscriptionsIfNeeded();
  const page = Math.max(1, filters.page || 1);

  const where: Record<string, unknown> = { status: "ACTIVE" as const };
  if (filters.q) {
    where.companyName = { contains: filters.q, mode: "insensitive" };
  }
  if (filters.industry) where.industry = filters.industry;

  const [companies, total] = await Promise.all([
    prisma.employer.findMany({
      where,
      orderBy: [{ subscription: { tier: "asc" } }, { companyName: "asc" }],
      skip: (page - 1) * COMPANIES_PER_PAGE,
      take: COMPANIES_PER_PAGE,
      select: {
        id: true,
        companyName: true,
        logo: true,
        coverImage: true,
        slug: true,
        industry: true,
        companySize: true,
        address: true,
        description: true,
        subscription: { select: { tier: true } },
        _count: {
          select: {
            jobPostings: {
              where: {
                status: "APPROVED",
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
              },
            },
          },
        },
      },
    }),
    prisma.employer.count({ where }),
  ]);

  return {
    companies,
    total,
    page,
    totalPages: Math.ceil(total / COMPANIES_PER_PAGE),
  };
}

// ==================== COMPANY PROFILE ====================

export type CompanyProfile = {
  id: number;
  companyName: string;
  logo: string | null;
  coverImage: string | null;
  slug: string;
  description: string | null;
  industry: string | null;
  companySize: string | null;
  address: string | null;
  website: string | null;
  phone: string | null;
  subscription: { tier: string } | null;
  jobPostings: HomepageJob[];
};

export async function getCompanyBySlug(slug: string): Promise<CompanyProfile | null> {
  await expireSubscriptionsIfNeeded();
  const now = new Date();

  const employer = await prisma.employer.findUnique({
    where: { slug },
    select: {
      id: true,
      companyName: true,
      logo: true,
      coverImage: true,
      slug: true,
      description: true,
      industry: true,
      companySize: true,
      address: true,
      website: true,
      phone: true,
      status: true,
      subscription: { select: { tier: true } },
      jobPostings: {
        where: {
          status: "APPROVED",
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          salaryDisplay: true,
          location: true,
          workType: true,
          industry: true,
          isFeatured: true,
          publishedAt: true,
          employer: {
            select: { companyName: true, logo: true, slug: true },
          },
        },
      },
    },
  });

  if (!employer || employer.status !== "ACTIVE") return null;
  return employer;
}

// ==================== APPLICATION FORM ====================

export type SubmitApplicationInput = {
  jobPostingId: number;
  fullName: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  cvFileUrl?: string;
  cvFileName?: string;
};

export type SubmitApplicationResult = {
  success: boolean;
  error?: string;
};

export async function submitApplication(
  input: SubmitApplicationInput
): Promise<SubmitApplicationResult> {
  // Validate required fields
  if (!input.fullName?.trim()) return { success: false, error: "Vui lòng nhập họ tên" };
  if (!input.email?.trim()) return { success: false, error: "Vui lòng nhập email" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
    return { success: false, error: "Email không hợp lệ" };

  // Verify job exists and is active
  const job = await prisma.jobPosting.findUnique({
    where: { id: input.jobPostingId },
    select: { id: true, status: true, expiresAt: true },
  });

  if (!job || job.status !== "APPROVED")
    return { success: false, error: "Tin tuyển dụng không tồn tại hoặc đã hết hạn" };
  if (job.expiresAt && job.expiresAt < new Date())
    return { success: false, error: "Tin tuyển dụng đã hết hạn" };

  // Check duplicate application
  const existing = await prisma.application.findFirst({
    where: { jobPostingId: input.jobPostingId, email: input.email },
  });
  if (existing)
    return { success: false, error: "Bạn đã ứng tuyển vị trí này rồi" };

  // Create application & increment applyCount
  await prisma.$transaction([
    prisma.application.create({
      data: {
        jobPostingId: input.jobPostingId,
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone?.trim() || null,
        coverLetter: input.coverLetter?.trim() || null,
        cvFileUrl: input.cvFileUrl || null,
        cvFileName: input.cvFileName || null,
      },
    }),
    prisma.jobPosting.update({
      where: { id: input.jobPostingId },
      data: { applyCount: { increment: 1 } },
    }),
  ]);

  return { success: true };
}
