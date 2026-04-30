"use server";

import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { incrementJobPostingView } from "@/lib/job-posting-view-counter";
import { OPTION_GROUPS } from "@/lib/config-option-definitions";
import {
  CONFIG_OPTIONS_CACHE_TAG,
  formatConfigOptionLabel,
  formatOptionValuesForDisplay,
  getOptionFilterValues,
  getPublicOptionsWithUsage,
  type OptionChoice,
} from "@/lib/config-options";
import { prisma } from "@/lib/prisma";
import type {
  CompanyProfileCapabilities,
  CompanyProfileTheme,
  ContentBlock,
} from "@/lib/content-blocks";
import {
  normalizeCompanyCapabilities,
  normalizeCompanyTheme,
  normalizeContentBlocks,
} from "@/lib/content-blocks";
import { normalizeCompanyMediaSettings, type CompanyMediaSettings } from "@/lib/company-media-settings";
import {
  PUBLIC_COMPANY_PROFILE_CACHE_TAG,
  PUBLIC_HOMEPAGE_CACHE_TAG,
} from "@/lib/public-cache-tags";

export type HomepageJob = {
  id: number;
  title: string;
  slug: string;
  salaryDisplay: string | null;
  location: string | null;
  workType: string | null;
  industry: string | null;
  requiredLanguages: string[];
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
  bannerImage?: string | null;
  bannerPositionX?: number;
  bannerPositionY?: number;
  bannerZoom?: number;
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

const EMPTY_HOMEPAGE_DATA: HomepageData = {
  featuredJobs: [],
  bannerEmployers: [],
  topEmployers: [],
  industries: [],
  stats: {
    totalJobs: 0,
    totalEmployers: 0,
  },
};

export const getHomepageData = unstable_cache(
  async (): Promise<HomepageData> => {
    const now = new Date();

    const homepageQueries =
      await Promise.all([
        // 18 latest APPROVED jobs (9 per carousel page)
        prisma.jobPosting.findMany({
          where: {
            status: "APPROVED",
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
          orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
          take: 18,
          select: {
            id: true,
            title: true,
            slug: true,
            salaryDisplay: true,
            location: true,
            workType: true,
            industry: true,
            requiredLanguages: true,
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
            coverPositionX: true,
            coverPositionY: true,
            coverZoom: true,
            slug: true,
            industry: true,
            profileConfig: {
              select: {
                theme: true,
              },
            },
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
      ]).catch((error) => {
        console.error("Failed to load homepage data", error);
        return null;
      });

    if (!homepageQueries) return EMPTY_HOMEPAGE_DATA;

    const [featuredJobs, bannerEmployers, allActiveEmployers, industryGroups, totalJobs, totalEmployers] =
      homepageQueries;

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
    const bannerEmployersWithMedia: HomepageEmployer[] = bannerEmployers.map((employer) => {
      const media = normalizeCompanyMediaSettings(employer.profileConfig?.theme);
      const usesCustomBanner = Boolean(media.bannerImageUrl);

      return {
        id: employer.id,
        companyName: employer.companyName,
        logo: employer.logo,
        coverImage: employer.coverImage,
        bannerImage: media.bannerImageUrl ?? employer.coverImage,
        bannerPositionX: usesCustomBanner ? media.bannerPositionX : employer.coverPositionX,
        bannerPositionY: usesCustomBanner ? media.bannerPositionY : employer.coverPositionY,
        bannerZoom: usesCustomBanner ? media.bannerZoom : employer.coverZoom,
        slug: employer.slug,
        industry: employer.industry,
        subscription: employer.subscription,
        _count: employer._count,
      };
    });

    return {
      featuredJobs,
      bannerEmployers: bannerEmployersWithMedia,
      topEmployers,
      industries,
      stats: { totalJobs, totalEmployers },
    };
  },
  ["homepage-data"],
  { revalidate: 60, tags: [PUBLIC_HOMEPAGE_CACHE_TAG, CONFIG_OPTIONS_CACHE_TAG] }
);

// ==================== JOB LISTING ====================

export type JobFilters = {
  q?: string;
  industry?: string;
  location?: string;
  workType?: string;
  salaryMin?: number;
  language?: string;
  industrialZone?: string;
  shiftType?: string;
  company?: string;
  sort?: "newest" | "oldest" | "salary_high" | "salary_low";
  page?: number;
};

export type JobListResult = {
  jobs: HomepageJob[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    industries: OptionChoice[];
    locations: OptionChoice[];
    workTypes: OptionChoice[];
    languages: OptionChoice[];
    industrialZones: OptionChoice[];
    shiftTypes: OptionChoice[];
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
  const [
    industryValues,
    locationValues,
    workTypeValues,
    languageValues,
    industrialZoneValues,
    shiftTypeValues,
  ] = await Promise.all([
    getOptionFilterValues(OPTION_GROUPS.industry, filters.industry),
    getOptionFilterValues(OPTION_GROUPS.location, filters.location),
    getOptionFilterValues(OPTION_GROUPS.workType, filters.workType),
    getOptionFilterValues(OPTION_GROUPS.requiredLanguage, filters.language),
    getOptionFilterValues(OPTION_GROUPS.industrialZone, filters.industrialZone),
    getOptionFilterValues(OPTION_GROUPS.shiftType, filters.shiftType),
  ]);

  // Build where clause
  const where: Prisma.JobPostingWhereInput = {
    status: "APPROVED" as const,
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };
  const andFilters: Prisma.JobPostingWhereInput[] = [];

  if (filters.q) {
    andFilters.push({
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
        { employer: { companyName: { contains: filters.q, mode: "insensitive" } } },
        ...(skillMatchedIds.length > 0 ? [{ id: { in: skillMatchedIds } }] : []),
      ],
    });
  }
  if (industryValues.length > 0) where.industry = { in: industryValues };
  if (locationValues.length > 0) where.location = { in: locationValues };
  if (workTypeValues.length > 0) where.workType = { in: workTypeValues };
  if (filters.salaryMin) where.salaryMin = { gte: filters.salaryMin };
  if (languageValues.length > 0) where.requiredLanguages = { hasSome: languageValues };
  if (industrialZoneValues.length > 0) {
    andFilters.push({
      OR: [
        { industrialZone: { in: industrialZoneValues } },
        {
          AND: [
            { industrialZone: null },
            { employer: { industrialZone: { in: industrialZoneValues } } },
          ],
        },
      ],
    });
  }
  if (shiftTypeValues.length > 0) where.shiftType = { in: shiftTypeValues };
  if (filters.company) where.employer = { slug: filters.company };
  if (andFilters.length > 0) where.AND = andFilters;

  // Build orderBy
  type OrderBy = Record<string, "asc" | "desc">;
  let orderBy: OrderBy[] = [{ isFeatured: "desc" }, { publishedAt: "desc" }];
  if (filters.sort === "oldest") orderBy = [{ publishedAt: "asc" }];
  if (filters.sort === "salary_high") orderBy = [{ salaryMax: "desc" }];
  if (filters.sort === "salary_low") orderBy = [{ salaryMin: "asc" }];

  const getCachedFilterOptions = unstable_cache(
    async () => Promise.all([
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
      prisma.jobPosting.findMany({
        where: { status: "APPROVED", industrialZone: { not: null } },
        select: { industrialZone: true },
        distinct: ["industrialZone"],
      }),
      prisma.employer.findMany({
        where: {
          status: "ACTIVE",
          industrialZone: { not: null },
          jobPostings: {
            some: {
              status: "APPROVED",
              OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            },
          },
        },
        select: { industrialZone: true },
        distinct: ["industrialZone"],
      }),
      prisma.$queryRaw<Array<{ lang: string }>>(Prisma.sql`
        SELECT DISTINCT unnest("requiredLanguages") AS lang
        FROM "JobPosting"
        WHERE status = 'APPROVED' AND array_length("requiredLanguages", 1) > 0
        ORDER BY lang
      `),
      prisma.jobPosting.findMany({
        where: { status: "APPROVED", shiftType: { not: null } },
        select: { shiftType: true },
        distinct: ["shiftType"],
      }),
    ]),
    ["job-filter-options"],
    { revalidate: 60 }
  );

  const [
    jobs,
    total,
    distinctIndustries,
    distinctLocations,
    distinctWorkTypes,
    distinctZones,
    distinctEmployerZones,
    distinctLanguages,
    distinctShiftTypes,
  ] =
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
          requiredLanguages: true,
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
      ...await getCachedFilterOptions(),
    ]);
  const [
    industryOptions,
    locationOptions,
    workTypeOptions,
    languageOptions,
    industrialZoneOptions,
    shiftTypeOptions,
    formattedJobs,
  ] = await Promise.all([
    getPublicOptionsWithUsage(OPTION_GROUPS.industry, distinctIndustries.map((d) => d.industry)),
    getPublicOptionsWithUsage(OPTION_GROUPS.location, distinctLocations.map((d) => d.location)),
    getPublicOptionsWithUsage(OPTION_GROUPS.workType, distinctWorkTypes.map((d) => d.workType)),
    getPublicOptionsWithUsage(OPTION_GROUPS.requiredLanguage, (distinctLanguages as Array<{ lang: string }>).map((d) => d.lang)),
    getPublicOptionsWithUsage(OPTION_GROUPS.industrialZone, [
      ...(distinctZones as Array<{ industrialZone: string | null }>).map((d) => d.industrialZone),
      ...(distinctEmployerZones as Array<{ industrialZone: string | null }>).map((d) => d.industrialZone),
    ]),
    getPublicOptionsWithUsage(OPTION_GROUPS.shiftType, (distinctShiftTypes as Array<{ shiftType: string | null }>).map((d) => d.shiftType)),
    formatOptionValuesForDisplay(jobs, {
      industry: OPTION_GROUPS.industry,
      location: OPTION_GROUPS.location,
      workType: OPTION_GROUPS.workType,
    }),
  ]);
  const jobsWithLanguageLabels = await Promise.all(
    formattedJobs.map(async (job) => ({
      ...job,
      requiredLanguages: await Promise.all(
        job.requiredLanguages.map((language) =>
          formatConfigOptionLabel(OPTION_GROUPS.requiredLanguage, language)
        )
      ),
    }))
  );

  return {
    jobs: jobsWithLanguageLabels,
    total,
    page,
    totalPages: Math.ceil(total / JOBS_PER_PAGE),
    filters: {
      industries: industryOptions,
      locations: locationOptions,
      workTypes: workTypeOptions,
      industrialZones: industrialZoneOptions,
      languages: languageOptions,
      shiftTypes: shiftTypeOptions,
    },
  };
}

// ==================== JOB DETAIL ====================

export type JobDetail = {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  coverAlt: string | null;
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
  industrialZone: string | null;
  requiredLanguages: string[];
  languageProficiency: string | null;
  shiftType: string | null;
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
      coverImage: true,
      coverAlt: true,
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
      industrialZone: true,
      requiredLanguages: true,
      languageProficiency: true,
      shiftType: true,
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
    location: true, workType: true, industry: true, requiredLanguages: true, isFeatured: true,
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
  location: string | null;
  industrialZone: string | null;
  address: string | null;
  description: string | null;
  subscription: { tier: string } | null;
  _count: { jobPostings: number };
};

export type CompanySort = "priority" | "jobs" | "name";

export type CompanyFilters = {
  q?: string;
  industry?: string;
  location?: string;
  industrialZone?: string;
  priority?: boolean;
  hiring?: boolean;
  sort?: CompanySort;
  page?: number;
};

export type CompanyListResult = {
  companies: PublicCompany[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    industries: OptionChoice[];
    locations: OptionChoice[];
    industrialZones: OptionChoice[];
  };
};

const COMPANIES_PER_PAGE = 12;

const getCachedPublicCompanies = unstable_cache(
  async (
    q: string,
    industry: string,
    location: string,
    industrialZone: string,
    priorityOnly: boolean,
    hiringOnly: boolean,
    sort: CompanySort,
    page: number
  ): Promise<CompanyListResult> => {
    const now = new Date();
    const [industryValues, locationValues, industrialZoneValues] = await Promise.all([
      getOptionFilterValues(OPTION_GROUPS.industry, industry),
      getOptionFilterValues(OPTION_GROUPS.location, location),
      getOptionFilterValues(OPTION_GROUPS.industrialZone, industrialZone),
    ]);
    const activeSubscriptionWhere = {
      status: "ACTIVE" as const,
      startDate: { lte: now },
      endDate: { gte: now },
    };
    const activeJobWhere = {
      status: "APPROVED" as const,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    };

    const eligibleCompanyWhere = {
      status: "ACTIVE" as const,
      OR: [
        { subscription: { is: activeSubscriptionWhere } },
        { jobPostings: { some: activeJobWhere } },
      ],
    };

    const qFilter = q
      ? Prisma.sql`AND e."companyName" ILIKE ${`%${q}%`}`
      : Prisma.empty;
    const industryFilter = industry
      ? Prisma.sql`AND e."industry" IN (${Prisma.join(industryValues)})`
      : Prisma.empty;
    const locationFilter = location
      ? Prisma.sql`AND e."location" IN (${Prisma.join(locationValues)})`
      : Prisma.empty;
    const industrialZoneFilter = industrialZone
      ? Prisma.sql`AND e."industrialZone" IN (${Prisma.join(industrialZoneValues)})`
      : Prisma.empty;
    const priorityFilter = priorityOnly
      ? Prisma.sql`AND s."tier" IN ('VIP', 'PREMIUM')`
      : Prisma.empty;
    const hiringFilter = hiringOnly
      ? Prisma.sql`AND jobs."activeJobCount" > 0`
      : Prisma.empty;
    const sortOrder =
      sort === "jobs"
        ? Prisma.sql`
          jobs."activeJobCount" DESC,
          CASE s."tier"
            WHEN 'VIP' THEN 0
            WHEN 'PREMIUM' THEN 1
            WHEN 'STANDARD' THEN 2
            WHEN 'BASIC' THEN 3
            ELSE 4
          END,
          e."companyName" ASC
        `
        : sort === "name"
          ? Prisma.sql`e."companyName" ASC`
          : Prisma.sql`
          CASE s."tier"
            WHEN 'VIP' THEN 0
            WHEN 'PREMIUM' THEN 1
            WHEN 'STANDARD' THEN 2
            WHEN 'BASIC' THEN 3
            ELSE 4
          END,
          jobs."activeJobCount" DESC,
          e."companyName" ASC
        `;
    const offset = (page - 1) * COMPANIES_PER_PAGE;

    const [idRows, totalRows, industryRows, locationRows, industrialZoneRows] = await Promise.all([
      prisma.$queryRaw<Array<{ id: number }>>(Prisma.sql`
        SELECT e."id"
        FROM "Employer" e
        LEFT JOIN "Subscription" s
          ON s."employerId" = e."id"
          AND s."status" = 'ACTIVE'
          AND s."startDate" <= ${now}
          AND s."endDate" >= ${now}
        LEFT JOIN LATERAL (
          SELECT COUNT(*)::int AS "activeJobCount"
          FROM "JobPosting" jp
          WHERE jp."employerId" = e."id"
            AND jp."status" = 'APPROVED'
            AND (jp."expiresAt" IS NULL OR jp."expiresAt" > ${now})
        ) jobs ON true
        WHERE e."status" = 'ACTIVE'
          AND (s."id" IS NOT NULL OR jobs."activeJobCount" > 0)
          ${qFilter}
          ${industryFilter}
          ${locationFilter}
          ${industrialZoneFilter}
          ${priorityFilter}
          ${hiringFilter}
        ORDER BY ${sortOrder}
        LIMIT ${COMPANIES_PER_PAGE}
        OFFSET ${offset}
      `),
      prisma.$queryRaw<Array<{ total: number }>>(Prisma.sql`
        SELECT COUNT(*)::int AS "total"
        FROM "Employer" e
        LEFT JOIN "Subscription" s
          ON s."employerId" = e."id"
          AND s."status" = 'ACTIVE'
          AND s."startDate" <= ${now}
          AND s."endDate" >= ${now}
        LEFT JOIN LATERAL (
          SELECT COUNT(*)::int AS "activeJobCount"
          FROM "JobPosting" jp
          WHERE jp."employerId" = e."id"
            AND jp."status" = 'APPROVED'
            AND (jp."expiresAt" IS NULL OR jp."expiresAt" > ${now})
        ) jobs ON true
        WHERE e."status" = 'ACTIVE'
          AND (s."id" IS NOT NULL OR jobs."activeJobCount" > 0)
          ${qFilter}
          ${industryFilter}
          ${locationFilter}
          ${industrialZoneFilter}
          ${priorityFilter}
          ${hiringFilter}
      `),
      prisma.employer.findMany({
        where: {
          ...eligibleCompanyWhere,
          industry: { not: null },
        },
        select: { industry: true },
        distinct: ["industry"],
        orderBy: { industry: "asc" },
      }),
      prisma.employer.findMany({
        where: {
          ...eligibleCompanyWhere,
          location: { not: null },
        },
        select: { location: true },
        distinct: ["location"],
        orderBy: { location: "asc" },
      }),
      prisma.employer.findMany({
        where: {
          ...eligibleCompanyWhere,
          industrialZone: { not: null },
        },
        select: { industrialZone: true },
        distinct: ["industrialZone"],
        orderBy: { industrialZone: "asc" },
      }),
    ]);

    const ids = idRows.map((row) => row.id);
    const unorderedCompanies = ids.length > 0
      ? await prisma.employer.findMany({
          where: { id: { in: ids } },
          select: {
            id: true,
            companyName: true,
            logo: true,
            coverImage: true,
            slug: true,
            industry: true,
            companySize: true,
            location: true,
            industrialZone: true,
            address: true,
            description: true,
            subscription: {
              select: {
                tier: true,
                status: true,
                startDate: true,
                endDate: true,
              },
            },
            _count: {
              select: {
                jobPostings: {
                  where: activeJobWhere,
                },
              },
            },
          },
        })
      : [];

    const companyById = new Map(unorderedCompanies.map((company) => [company.id, company]));
    const companies = ids.reduce<PublicCompany[]>((ordered, id) => {
      const company = companyById.get(id);
      if (company) {
        const subscription = company.subscription;
        const activeSubscription =
          subscription &&
          subscription.status === "ACTIVE" &&
          subscription.startDate <= now &&
          subscription.endDate >= now
            ? { tier: subscription.tier }
            : null;

        ordered.push({
          ...company,
          subscription: activeSubscription,
        });
      }
      return ordered;
    }, []);
    const total = totalRows[0]?.total ?? 0;
    const [industryOptions, locationOptions, industrialZoneOptions, formattedCompanies] = await Promise.all([
      getPublicOptionsWithUsage(OPTION_GROUPS.industry, industryRows.map((d) => d.industry)),
      getPublicOptionsWithUsage(OPTION_GROUPS.location, locationRows.map((d) => d.location)),
      getPublicOptionsWithUsage(OPTION_GROUPS.industrialZone, industrialZoneRows.map((d) => d.industrialZone)),
      formatOptionValuesForDisplay(companies, {
        industry: OPTION_GROUPS.industry,
        companySize: OPTION_GROUPS.companySize,
        location: OPTION_GROUPS.location,
        industrialZone: OPTION_GROUPS.industrialZone,
      }),
    ]);

    return {
      companies: formattedCompanies,
      total,
      page,
      totalPages: Math.ceil(total / COMPANIES_PER_PAGE),
      filters: {
        industries: industryOptions,
        locations: locationOptions,
        industrialZones: industrialZoneOptions,
      },
    };
  },
  ["public-companies"],
  { revalidate: 60, tags: [PUBLIC_COMPANY_PROFILE_CACHE_TAG, CONFIG_OPTIONS_CACHE_TAG] }
);

function normalizeCompanySort(sort: CompanySort | undefined): CompanySort {
  if (sort === "jobs" || sort === "name") return sort;
  return "priority";
}

export async function getPublicCompanies(filters: CompanyFilters = {}): Promise<CompanyListResult> {
  const page = Number.isFinite(filters.page) ? Math.max(1, Math.floor(filters.page || 1)) : 1;

  return getCachedPublicCompanies(
    filters.q?.trim() ?? "",
    filters.industry?.trim() ?? "",
    filters.location?.trim() ?? "",
    filters.industrialZone?.trim() ?? "",
    Boolean(filters.priority),
    Boolean(filters.hiring),
    normalizeCompanySort(filters.sort),
    page
  );
}

// ==================== COMPANY PROFILE ====================

export type CompanyProfile = {
  id: number;
  companyName: string;
  logo: string | null;
  coverImage: string | null;
  coverPositionX: number;
  coverPositionY: number;
  coverZoom: number;
  slug: string;
  description: string | null;
  industry: string | null;
  companySize: string | null;
  location: string | null;
  industrialZone: string | null;
  address: string | null;
  website: string | null;
  phone: string | null;
  subscription: { tier: string } | null;
  profileConfig: {
    theme: (CompanyProfileTheme & { media?: CompanyMediaSettings }) | null;
    capabilities: CompanyProfileCapabilities | null;
    sections: ContentBlock[] | null;
    primaryVideoUrl: string | null;
  } | null;
  jobPostings: HomepageJob[];
};

const getCachedCompanyBySlug = unstable_cache(
  async (slug: string): Promise<CompanyProfile | null> => {
    const now = new Date();

    const employer = await prisma.employer.findUnique({
      where: { slug },
      select: {
        id: true,
        companyName: true,
        logo: true,
        coverImage: true,
        coverPositionX: true,
        coverPositionY: true,
        coverZoom: true,
        slug: true,
        description: true,
        industry: true,
        companySize: true,
        location: true,
        industrialZone: true,
        address: true,
        website: true,
        phone: true,
        status: true,
        subscription: { select: { tier: true } },
        profileConfig: {
          select: {
            theme: true,
            capabilities: true,
            sections: true,
            primaryVideoUrl: true,
          },
        },
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
            requiredLanguages: true,
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
    const [industryLabel, companySizeLabel, locationLabel, industrialZoneLabel] = await Promise.all([
      formatConfigOptionLabel(OPTION_GROUPS.industry, employer.industry),
      formatConfigOptionLabel(OPTION_GROUPS.companySize, employer.companySize),
      formatConfigOptionLabel(OPTION_GROUPS.location, employer.location),
      formatConfigOptionLabel(OPTION_GROUPS.industrialZone, employer.industrialZone),
    ]);

    return {
      ...employer,
      industry: industryLabel || employer.industry,
      companySize: companySizeLabel || employer.companySize,
      location: locationLabel || employer.location,
      industrialZone: industrialZoneLabel || employer.industrialZone,
      profileConfig: employer.profileConfig
        ? {
            theme: {
              ...normalizeCompanyTheme(employer.profileConfig.theme),
              media: normalizeCompanyMediaSettings(employer.profileConfig.theme),
            },
            capabilities: normalizeCompanyCapabilities(employer.profileConfig.capabilities),
            sections: normalizeContentBlocks(employer.profileConfig.sections),
            primaryVideoUrl: employer.profileConfig.primaryVideoUrl,
          }
        : null,
    };
  },
  ["company-profile"],
  { revalidate: 60, tags: [PUBLIC_COMPANY_PROFILE_CACHE_TAG, CONFIG_OPTIONS_CACHE_TAG] }
);

export async function getCompanyBySlug(slug: string): Promise<CompanyProfile | null> {
  return getCachedCompanyBySlug(slug);
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
