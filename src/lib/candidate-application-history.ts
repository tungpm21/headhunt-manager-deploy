import { prisma } from "@/lib/prisma";

export async function getCandidateApplicationHistory(candidateId: number) {
  const [applications, submissions] = await Promise.all([
    prisma.application.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        cvFileName: true,
        jobPosting: {
          select: {
            id: true,
            title: true,
            slug: true,
            jobOrderId: true,
            employer: { select: { companyName: true } },
          },
        },
      },
    }),
    prisma.jobCandidate.findMany({
      where: { candidateId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        stage: true,
        result: true,
        updatedAt: true,
        jobOrder: {
          select: {
            id: true,
            title: true,
            client: { select: { companyName: true } },
          },
        },
      },
    }),
  ]);

  return { applications, submissions };
}
