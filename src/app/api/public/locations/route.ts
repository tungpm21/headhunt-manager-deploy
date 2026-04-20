import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const getCachedLocations = unstable_cache(
    async () => {
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

        return jobs
            .map((j) => j.location)
            .filter((loc): loc is string => Boolean(loc && loc.trim()));
    },
    ["public-locations"],
    { revalidate: 300 }
);

function responseHeaders(start: number, cacheControl: string) {
    return {
        "Cache-Control": cacheControl,
        "Server-Timing": `app;dur=${Math.round(performance.now() - start)}`,
    };
}

export async function GET() {
    const start = performance.now();
    try {
        const locations = await getCachedLocations();

        return NextResponse.json(
            { locations },
            {
                headers: responseHeaders(
                    start,
                    "public, s-maxage=300, stale-while-revalidate=600"
                ),
            }
        );
    } catch (error) {
        console.error("Locations API error:", error);
        return NextResponse.json(
            { locations: [] },
            { status: 500, headers: responseHeaders(start, "no-store") }
        );
    }
}
