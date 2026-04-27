import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const POPULAR_KEYWORDS = [
  "Kỹ sư cơ khí",
  "IT / Phần mềm",
  "Kế toán",
  "Nhân sự",
  "Sản xuất",
  "QC / QA",
  "Marketing",
  "Kinh doanh",
  "Logistics",
  "Tài chính",
];

const getCachedTopEmployerSuggestions = unstable_cache(
  async () =>
    prisma.employer.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        companyName: true,
        logo: true,
        slug: true,
        industry: true,
        subscription: { select: { tier: true } },
      },
      orderBy: [{ subscription: { tier: "asc" } }, { companyName: "asc" }],
      take: 5,
    }),
  ["public-search-suggestions-top-employers"],
  { revalidate: 60 }
);

const getCachedRecommendedJobSuggestions = unstable_cache(
  async () =>
    prisma.jobPosting.findMany({
      where: {
        status: "APPROVED",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        salaryDisplay: true,
        location: true,
        employer: {
          select: {
            companyName: true,
            logo: true,
          },
        },
      },
      take: 6,
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    }),
  ["public-search-suggestions-recommended-jobs"],
  { revalidate: 60 }
);

function responseHeaders(start: number, cacheControl: string) {
  return {
    "Cache-Control": cacheControl,
    "Server-Timing": `app;dur=${Math.round(performance.now() - start)}`,
  };
}

export async function GET(req: NextRequest) {
  const start = performance.now();
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const now = new Date();

  if (!q) {
    const [topEmployers, jobs] = await Promise.all([
      getCachedTopEmployerSuggestions(),
      getCachedRecommendedJobSuggestions(),
    ]);

    return NextResponse.json(
      { employers: topEmployers, jobs, popularKeywords: POPULAR_KEYWORDS },
      {
        headers: responseHeaders(
          start,
          "public, s-maxage=60, stale-while-revalidate=120"
        ),
      }
    );
  }

  try {
    const [employers, jobs] = await Promise.all([
      prisma.employer.findMany({
        where: {
          status: "ACTIVE",
          companyName: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          companyName: true,
          logo: true,
          slug: true,
          industry: true,
        },
        take: 3,
        orderBy: { companyName: "asc" },
      }),
      prisma.jobPosting.findMany({
        where: {
          status: "APPROVED",
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          title: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          salaryDisplay: true,
          location: true,
          employer: {
            select: {
              companyName: true,
              logo: true,
            },
          },
        },
        take: 5,
        orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      }),
    ]);

    const popularKeywords = POPULAR_KEYWORDS.filter((kw) =>
      kw.toLowerCase().includes(q.toLowerCase())
    );

    return NextResponse.json(
      { employers, jobs, popularKeywords },
      {
        headers: responseHeaders(
          start,
          "public, s-maxage=30, stale-while-revalidate=60"
        ),
      }
    );
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json(
      { employers: [], jobs: [], popularKeywords: POPULAR_KEYWORDS },
      {
        status: 500,
        headers: responseHeaders(start, "no-store"),
      }
    );
  }
}
