import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function logActivity(
  type: string,
  entityType: string,
  entityId: number,
  userId: number,
  metadata?: Prisma.InputJsonValue
) {
  try {
    return await prisma.activityLog.create({
      data: {
        type,
        entityType,
        entityId,
        userId,
        metadata,
      },
    });
  } catch (error) {
    console.error("logActivity error:", error);
    return null;
  }
}
