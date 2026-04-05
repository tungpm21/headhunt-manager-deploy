import { NextRequest, NextResponse } from "next/server";
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

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const now = new Date();

  if (!q) {
    return NextResponse.json(
      { employers: [], jobs: [], popularKeywords: POPULAR_KEYWORDS },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
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
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json(
      { employers: [], jobs: [], popularKeywords: POPULAR_KEYWORDS },
      { status: 500 }
    );
  }
}
