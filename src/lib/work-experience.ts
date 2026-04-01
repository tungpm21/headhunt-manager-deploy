import { prisma } from "@/lib/prisma";
import { WorkExperienceInput } from "@/types/candidate";

export async function getExperiencesByCandidate(candidateId: number) {
  return prisma.workExperience.findMany({
    where: { candidateId },
    orderBy: [
      { isCurrent: "desc" },
      { endDate: "desc" },
      { startDate: "desc" },
    ],
  });
}

export async function addExperience(data: WorkExperienceInput) {
  return prisma.workExperience.create({
    data: {
      candidateId: data.candidateId,
      companyName: data.companyName,
      position: data.position,
      startDate: data.startDate ?? null,
      endDate: data.isCurrent ? null : data.endDate ?? null,
      isCurrent: data.isCurrent ?? false,
      notes: data.notes ?? null,
    },
  });
}

export async function updateExperience(
  id: number,
  data: Omit<WorkExperienceInput, "candidateId">
) {
  return prisma.workExperience.update({
    where: { id },
    data: {
      companyName: data.companyName,
      position: data.position,
      startDate: data.startDate ?? null,
      endDate: data.isCurrent ? null : data.endDate ?? null,
      isCurrent: data.isCurrent ?? false,
      notes: data.notes ?? null,
    },
  });
}

export async function deleteExperience(id: number) {
  return prisma.workExperience.delete({
    where: { id },
  });
}
