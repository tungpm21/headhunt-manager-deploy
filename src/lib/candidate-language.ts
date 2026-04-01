import { prisma } from "@/lib/prisma";
import { CandidateLanguageInput } from "@/types/candidate";

export async function getLanguagesByCandidate(candidateId: number) {
  return prisma.candidateLanguage.findMany({
    where: { candidateId },
    orderBy: [{ language: "asc" }, { id: "asc" }],
  });
}

export async function addLanguage(data: CandidateLanguageInput) {
  return prisma.candidateLanguage.create({
    data: {
      candidateId: data.candidateId,
      language: data.language,
      level: data.level ?? null,
      certificate: data.certificate ?? null,
    },
  });
}

export async function updateLanguage(
  id: number,
  data: Omit<CandidateLanguageInput, "candidateId">
) {
  return prisma.candidateLanguage.update({
    where: { id },
    data: {
      language: data.language,
      level: data.level ?? null,
      certificate: data.certificate ?? null,
    },
  });
}

export async function deleteLanguage(id: number, candidateId: number) {
  return prisma.candidateLanguage.deleteMany({
    where: { id, candidateId },
  });
}
