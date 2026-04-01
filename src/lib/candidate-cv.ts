import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";
import { CandidateCVInput } from "@/types/candidate";

async function syncLegacyCandidateCV(
  candidateId: number,
  cv: { fileUrl: string; fileName: string } | null
) {
  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      cvFileUrl: cv?.fileUrl ?? null,
      cvFileName: cv?.fileName ?? null,
    },
  });
}

export async function getCVsByCandidate(candidateId: number) {
  return prisma.candidateCV.findMany({
    where: { candidateId },
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: [{ isPrimary: "desc" }, { uploadedAt: "desc" }],
  });
}

export async function addCandidateCV(data: CandidateCVInput) {
  const existingPrimary = await prisma.candidateCV.findFirst({
    where: { candidateId: data.candidateId, isPrimary: true },
    select: { id: true },
  });

  const shouldBePrimary = data.isPrimary ?? !existingPrimary;

  if (shouldBePrimary) {
    await prisma.candidateCV.updateMany({
      where: { candidateId: data.candidateId },
      data: { isPrimary: false },
    });
  }

  const cv = await prisma.candidateCV.create({
    data: {
      candidateId: data.candidateId,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      label: data.label ?? null,
      isPrimary: shouldBePrimary,
      uploadedById: data.uploadedById,
    },
  });

  if (shouldBePrimary) {
    await syncLegacyCandidateCV(data.candidateId, cv);
  }

  return cv;
}

export async function setPrimaryCV(cvId: number, candidateId: number) {
  const target = await prisma.candidateCV.findFirst({
    where: { id: cvId, candidateId },
  });

  if (!target) {
    return null;
  }

  await prisma.candidateCV.updateMany({
    where: { candidateId },
    data: { isPrimary: false },
  });

  const updated = await prisma.candidateCV.update({
    where: { id: cvId },
    data: { isPrimary: true },
  });

  await syncLegacyCandidateCV(candidateId, updated);
  return updated;
}

export async function deleteCandidateCV(cvId: number) {
  const existing = await prisma.candidateCV.findUnique({
    where: { id: cvId },
  });

  if (!existing) {
    return null;
  }

  await prisma.candidateCV.delete({ where: { id: cvId } });
  // Delete file after DB commit so a DB failure doesn't orphan the storage.
  await deleteFile(existing.fileUrl).catch((err) =>
    console.error("deleteCandidateCV: storage delete failed (non-fatal):", err)
  );

  const nextPrimary = await prisma.candidateCV.findFirst({
    where: { candidateId: existing.candidateId },
    orderBy: [{ isPrimary: "desc" }, { uploadedAt: "desc" }],
  });

  if (nextPrimary) {
    if (!nextPrimary.isPrimary) {
      await prisma.candidateCV.update({
        where: { id: nextPrimary.id },
        data: { isPrimary: true },
      });
      nextPrimary.isPrimary = true;
    }
    await syncLegacyCandidateCV(existing.candidateId, nextPrimary);
  } else {
    await syncLegacyCandidateCV(existing.candidateId, null);
  }

  return existing;
}
