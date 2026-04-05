import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Get distinct locations from active job postings
        const jobs = await prisma.jobPosting.findMany({
            where: {
                status: "APPROVED",
                location: { not: null },
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            select: { location: true },
            distinct: ["location"],
            orderBy: { location: "asc" },
        });

        const locations = jobs
            .map((j) => j.location)
            .filter((loc): loc is string => Boolean(loc && loc.trim()));

        return NextResponse.json(
            { locations },
            { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
        );
    } catch (error) {
        console.error("Locations API error:", error);
        return NextResponse.json({ locations: [] }, { status: 500 });
    }
}
