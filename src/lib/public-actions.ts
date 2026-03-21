"use server";

import { prisma } from "@/lib/prisma";

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
  slug: string;
  industry: string | null;
  subscription: {
    tier: string;
  } | null;
};

export type IndustryCount = {
  industry: string;
  count: number;
};

export type HomepageData = {
  featuredJobs: HomepageJob[];
  topEmployers: HomepageEmployer[];
  industries: IndustryCount[];
  stats: {
    totalJobs: number;
    totalEmployers: number;
  };
};

export async function getHomepageData(): Promise<HomepageData> {
  const now = new Date();

  const [featuredJobs, topEmployers, industryGroups, totalJobs, totalEmployers] =
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

      // VIP/Premium employers with showLogo
      prisma.employer.findMany({
        where: {
          status: "ACTIVE",
          subscription: {
            status: "ACTIVE",
            showLogo: true,
          },
        },
        select: {
          id: true,
          companyName: true,
          logo: true,
          slug: true,
          industry: true,
          subscription: {
            select: { tier: true },
          },
        },
        take: 12,
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

  return {
    featuredJobs,
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

export async function getPublicJobs(filters: JobFilters = {}): Promise<JobListResult> {
  const now = new Date();
  const page = Math.max(1, filters.page || 1);

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
          { skills: { contains: filters.q, mode: "insensitive" } },
          { employer: { companyName: { contains: filters.q, mode: "insensitive" } } },
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
  skills: string | null;
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
): Promise<{ job: JobDetail; similarJobs: HomepageJob[] } | null> {
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

  // Increment view count (fire and forget)
  prisma.jobPosting
    .update({ where: { id: job.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  // Fetch similar jobs (same industry, excluding current)
  const similarJobs = await prisma.jobPosting.findMany({
    where: {
      status: "APPROVED",
      id: { not: job.id },
      industry: job.industry,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { publishedAt: "desc" },
    take: 4,
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
  });

  return { job, similarJobs };
}

// ==================== COMPANY LISTING ====================

export type PublicCompany = {
  id: number;
  companyName: string;
  logo: string | null;
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
  const page = Math.max(1, filters.page || 1);

  const where: Record<string, unknown> = { status: "ACTIVE" as const };
  if (filters.q) {
    where.companyName = { contains: filters.q, mode: "insensitive" };
  }
  if (filters.industry) where.industry = filters.industry;

  const [companies, total] = await Promise.all([
    prisma.employer.findMany({
      where,
      orderBy: { companyName: "asc" },
      skip: (page - 1) * COMPANIES_PER_PAGE,
      take: COMPANIES_PER_PAGE,
      select: {
        id: true,
        companyName: true,
        logo: true,
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
  const now = new Date();

  const employer = await prisma.employer.findUnique({
    where: { slug },
    select: {
      id: true,
      companyName: true,
      logo: true,
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
