import { ClientStatus, Prisma } from "@prisma/client";
import {
  autoLinkEmployersForImportedClients,
  createImportedCandidates,
  createImportedClients,
  findExistingCandidatesForImport,
  findExistingClientsForImport,
} from "@/lib/imports";
import {
  clientFormSchema,
  getFirstZodErrorMessage,
} from "@/lib/validation/forms";
import type {
  CandidateImportRow,
  ClientImportRow,
  ImportErrorItem,
  ImportResult,
} from "@/types/import";

type ImportCandidateRecord = Partial<CandidateImportRow>;
type ImportClientRecord = Partial<ClientImportRow>;

type NormalizedImportCandidateRecord = {
  rowNumber: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  location: string;
  industry: string;
  currentPosition: string | null;
  currentCompany: string | null;
};

type NormalizedImportClientRecord = {
  rowNumber: number;
  companyName: string;
  industry: string | null;
  companySize: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
};

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function normalizeWebsite(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function normalizeCandidateRecord(
  record: ImportCandidateRecord,
  index: number
): NormalizedImportCandidateRecord {
  const fullName =
    typeof record.fullName === "string" ? record.fullName.trim() : "";

  return {
    rowNumber:
      typeof record.rowNumber === "number" && Number.isFinite(record.rowNumber)
        ? record.rowNumber
        : index + 2,
    fullName,
    email: normalizeEmail(record.email),
    phone: normalizePhone(record.phone),
    location:
      typeof record.location === "string" && record.location.trim()
        ? record.location.trim()
        : "Chua xac dinh",
    industry:
      typeof record.industry === "string" && record.industry.trim()
        ? record.industry.trim()
        : "Khac",
    currentPosition:
      typeof record.currentPosition === "string" && record.currentPosition.trim()
        ? record.currentPosition.trim()
        : null,
    currentCompany:
      typeof record.currentCompany === "string" && record.currentCompany.trim()
        ? record.currentCompany.trim()
        : null,
  };
}

function normalizeClientRecord(
  record: ImportClientRecord,
  index: number
): NormalizedImportClientRecord {
  const companyName =
    typeof record.companyName === "string" ? record.companyName.trim() : "";

  return {
    rowNumber:
      typeof record.rowNumber === "number" && Number.isFinite(record.rowNumber)
        ? record.rowNumber
        : index + 2,
    companyName,
    industry:
      typeof record.industry === "string" && record.industry.trim()
        ? record.industry.trim()
        : null,
    companySize:
      typeof record.companySize === "string" && record.companySize.trim()
        ? record.companySize.trim().toUpperCase()
        : null,
    address:
      typeof record.address === "string" && record.address.trim()
        ? record.address.trim()
        : null,
    website: normalizeWebsite(record.website),
    notes:
      typeof record.notes === "string" && record.notes.trim()
        ? record.notes.trim()
        : null,
  };
}

export async function importCandidatesForUser(
  candidatesArray: ImportCandidateRecord[],
  userId: number
): Promise<ImportResult> {
  const normalizedRecords = candidatesArray.map(normalizeCandidateRecord);
  const importErrors: ImportErrorItem[] = [];
  const validRecords: NormalizedImportCandidateRecord[] = [];

  for (const record of normalizedRecords) {
    if (!record.fullName) {
      importErrors.push({
        rowNumber: record.rowNumber,
        reason: "Thieu ho ten.",
      });
      continue;
    }

    if (!record.email && !record.phone) {
      importErrors.push({
        rowNumber: record.rowNumber,
        fullName: record.fullName,
        reason: "Can co it nhat email hoac SDT.",
      });
      continue;
    }

    validRecords.push(record);
  }

  const emails = validRecords
    .map((record) => record.email)
    .filter((email): email is string => Boolean(email));
  const phones = validRecords
    .map((record) => record.phone)
    .filter((phone): phone is string => Boolean(phone));

  const existingCandidates = await findExistingCandidatesForImport(emails, phones);

  const existingEmails = new Set(
    existingCandidates
      .map((candidate) => candidate.email?.trim().toLowerCase())
      .filter((email): email is string => Boolean(email))
  );
  const existingPhones = new Set(
    existingCandidates
      .map((candidate) => candidate.phone?.trim())
      .filter((phone): phone is string => Boolean(phone))
  );

  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();
  const newRecords: Prisma.CandidateCreateManyInput[] = [];

  for (const record of validRecords) {
    const reasons: string[] = [];

    if (record.email) {
      if (existingEmails.has(record.email)) {
        reasons.push("Trung email voi du lieu hien co.");
      } else if (seenEmails.has(record.email)) {
        reasons.push("Trung email trong file import.");
      }
    }

    if (record.phone) {
      if (existingPhones.has(record.phone)) {
        reasons.push("Trung SDT voi du lieu hien co.");
      } else if (seenPhones.has(record.phone)) {
        reasons.push("Trung SDT trong file import.");
      }
    }

    if (reasons.length > 0) {
      importErrors.push({
        rowNumber: record.rowNumber,
        fullName: record.fullName,
        reason: reasons.join(" "),
      });
      continue;
    }

    if (record.email) {
      seenEmails.add(record.email);
    }

    if (record.phone) {
      seenPhones.add(record.phone);
    }

    newRecords.push({
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      location: record.location,
      industry: record.industry,
      currentPosition: record.currentPosition,
      currentCompany: record.currentCompany,
      status: "AVAILABLE",
      createdById: userId,
      skills: [],
    });
  }

  const created = await createImportedCandidates(newRecords);

  return {
    success: true,
    successCount: created.count,
    errorCount: importErrors.length,
    errors: importErrors.sort((a, b) => a.rowNumber - b.rowNumber),
    message:
      created.count > 0
        ? `Import thanh cong ${created.count} ho so.${importErrors.length > 0 ? ` Co ${importErrors.length} dong can xu ly lai.` : ""}`
        : "Khong co dong hop le de import.",
  };
}

export async function importClientsForUser(
  clientsArray: ImportClientRecord[],
  userId: number
): Promise<ImportResult> {
  const normalizedRecords = clientsArray.map(normalizeClientRecord);
  const importErrors: ImportErrorItem[] = [];
  const validRecords: Array<
    NormalizedImportClientRecord & {
      parsedData: Omit<Prisma.ClientCreateManyInput, "createdById">;
    }
  > = [];

  for (const record of normalizedRecords) {
    const parsedInput = clientFormSchema.safeParse({
      companyName: record.companyName,
      industry: record.industry ?? undefined,
      companySize: record.companySize ?? undefined,
      address: record.address ?? undefined,
      website: record.website ?? undefined,
      notes: record.notes ?? undefined,
      status: ClientStatus.ACTIVE,
    });

    if (!parsedInput.success) {
      importErrors.push({
        rowNumber: record.rowNumber,
        companyName: record.companyName || null,
        reason: getFirstZodErrorMessage(parsedInput.error),
      });
      continue;
    }

    validRecords.push({
      ...record,
      parsedData: {
        companyName: parsedInput.data.companyName,
        industry: parsedInput.data.industry ?? null,
        companySize: parsedInput.data.companySize ?? null,
        address: parsedInput.data.address ?? null,
        website: parsedInput.data.website?.toLowerCase() ?? null,
        notes: parsedInput.data.notes ?? null,
        status: parsedInput.data.status ?? ClientStatus.ACTIVE,
        isDeleted: false,
      },
    });
  }

  const companyNames = validRecords.map((record) => record.parsedData.companyName);
  const websites = validRecords
    .map((record) => record.parsedData.website)
    .filter((website): website is string => Boolean(website));

  const existingClients = await findExistingClientsForImport(companyNames, websites);

  const existingCompanyNames = new Set(
    existingClients
      .map((client) => client.companyName.trim().toLowerCase())
      .filter(Boolean)
  );
  const existingWebsites = new Set(
    existingClients
      .map((client) => client.website?.trim().toLowerCase())
      .filter((website): website is string => Boolean(website))
  );

  const seenCompanyNames = new Set<string>();
  const seenWebsites = new Set<string>();
  const newRecords: Prisma.ClientCreateManyInput[] = [];
  const createdCompanyNames: string[] = [];

  for (const record of validRecords) {
    const reasons: string[] = [];
    const normalizedCompanyName = record.parsedData.companyName.trim().toLowerCase();
    const normalizedWebsite = record.parsedData.website?.trim().toLowerCase() ?? null;

    if (existingCompanyNames.has(normalizedCompanyName)) {
      reasons.push("Trung ten doanh nghiep voi du lieu hien co.");
    } else if (seenCompanyNames.has(normalizedCompanyName)) {
      reasons.push("Trung ten doanh nghiep trong file import.");
    }

    if (normalizedWebsite) {
      if (existingWebsites.has(normalizedWebsite)) {
        reasons.push("Trung website voi du lieu hien co.");
      } else if (seenWebsites.has(normalizedWebsite)) {
        reasons.push("Trung website trong file import.");
      }
    }

    if (reasons.length > 0) {
      importErrors.push({
        rowNumber: record.rowNumber,
        companyName: record.parsedData.companyName,
        reason: reasons.join(" "),
      });
      continue;
    }

    seenCompanyNames.add(normalizedCompanyName);

    if (normalizedWebsite) {
      seenWebsites.add(normalizedWebsite);
    }

    newRecords.push({
      ...record.parsedData,
      createdById: userId,
    });
    createdCompanyNames.push(record.parsedData.companyName);
  }

  const created = await createImportedClients(newRecords);

  if (created.count > 0 && createdCompanyNames.length > 0) {
    await autoLinkEmployersForImportedClients(userId, createdCompanyNames);
  }

  return {
    success: true,
    successCount: created.count,
    errorCount: importErrors.length,
    errors: importErrors.sort((a, b) => a.rowNumber - b.rowNumber),
    message:
      created.count > 0
        ? `Import thanh cong ${created.count} doanh nghiep.${importErrors.length > 0 ? ` Co ${importErrors.length} dong can xu ly lai.` : ""}`
        : "Khong co dong hop le de import.",
  };
}
