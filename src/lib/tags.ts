import { prisma } from "@/lib/prisma";

// ============================================================
// List all tags (for tag selector)
// ============================================================
export async function getAllTags() {
  return prisma.tag.findMany({ orderBy: { name: "asc" } });
}

// ============================================================
// Create a new tag
// ============================================================
export async function createTag(name: string, color?: string) {
  return prisma.tag.upsert({
    where: { name },
    create: { name, color: color ?? "#6B7280" },
    update: {},
  });
}

// ============================================================
// Get popular tags (most used) for suggestions
// ============================================================
export async function getPopularTags(limit = 20) {
  return prisma.tag.findMany({
    orderBy: { candidates: { _count: "desc" } },
    take: limit,
  });
}
