import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function findExistingCandidatesForImport(
  emails: string[],
  phones: string[]
) {
  if (emails.length === 0 && phones.length === 0) {
    return [];
  }

  return prisma.candidate.findMany({
    where: {
      isDeleted: false,
      OR: [
        ...(emails.length > 0
          ? [{ email: { in: emails, mode: "insensitive" as const } }]
          : []),
        ...(phones.length > 0 ? [{ phone: { in: phones } }] : []),
      ],
    },
    select: {
      email: true,
      phone: true,
    },
  });
}

export async function createImportedCandidates(
  data: Prisma.CandidateCreateManyInput[]
) {
  if (data.length === 0) {
    return { count: 0 };
  }

  return prisma.candidate.createMany({
    data,
    skipDuplicates: true,
  });
}

export async function findExistingClientsForImport(
  companyNames: string[],
  websites: string[]
) {
  const normalizedCompanyNames = Array.from(
    new Set(
      companyNames
        .map((companyName) => companyName.trim())
        .filter(Boolean)
    )
  );
  const normalizedWebsites = Array.from(
    new Set(
      websites
        .map((website) => website.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (normalizedCompanyNames.length === 0 && normalizedWebsites.length === 0) {
    return [];
  }

  const orConditions: Prisma.ClientWhereInput[] = [
    ...normalizedCompanyNames.map((companyName) => ({
      companyName: {
        equals: companyName,
        mode: "insensitive" as const,
      },
    })),
    ...normalizedWebsites.map((website) => ({
      website: {
        equals: website,
        mode: "insensitive" as const,
      },
    })),
  ];

  return prisma.client.findMany({
    where: {
      isDeleted: false,
      OR: orConditions,
    },
    select: {
      companyName: true,
      website: true,
    },
  });
}

export async function createImportedClients(data: Prisma.ClientCreateManyInput[]) {
  if (data.length === 0) {
    return { count: 0 };
  }

  return prisma.client.createMany({
    data,
  });
}

export async function autoLinkEmployersForImportedClients(
  createdById: number,
  companyNames: string[]
) {
  const normalizedCompanyNames = Array.from(
    new Set(companyNames.map((companyName) => companyName.trim()).filter(Boolean))
  );

  if (normalizedCompanyNames.length === 0) {
    return;
  }

  const clients = await prisma.client.findMany({
    where: {
      createdById,
      isDeleted: false,
      OR: normalizedCompanyNames.map((companyName) => ({
        companyName: {
          equals: companyName,
          mode: "insensitive" as const,
        },
      })),
    },
    select: {
      id: true,
      companyName: true,
    },
  });

  for (const client of clients) {
    const matchedEmployers = await prisma.employer.findMany({
      where: {
        clientId: null,
        companyName: {
          equals: client.companyName.trim(),
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
      take: 2,
    });

    if (matchedEmployers.length !== 1) {
      continue;
    }

    await prisma.employer.update({
      where: {
        id: matchedEmployers[0].id,
      },
      data: {
        clientId: client.id,
      },
    });
  }
}
