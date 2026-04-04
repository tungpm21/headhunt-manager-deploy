import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { config } from "dotenv";

config({ path: ".env", quiet: true });
config({ path: ".env.local", override: true, quiet: true });

type CandidateImportRow = {
  rowNumber: number;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  industry: string;
  currentPosition: string;
  currentCompany: string;
};

type ClientImportRow = {
  rowNumber: number;
  companyName: string;
  industry: string;
  companySize: string;
  address: string;
  website: string;
  notes: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeHeader(value: unknown): string {
  return normalizeText(value)
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildHeaderIndexes<TField extends string>(
  headers: unknown[],
  aliases: Record<TField, string[]>
): Record<TField, number> {
  const normalizedHeaders = headers.map(normalizeHeader);

  return Object.fromEntries(
    (Object.entries(aliases) as Array<[TField, string[]]>).map(
      ([field, fieldAliases]) => [
        field,
        normalizedHeaders.findIndex((header) =>
          fieldAliases.some((alias) => header.includes(alias))
        ),
      ]
    )
  ) as Record<TField, number>;
}

function parseCsvRows(filePath: string): unknown[][] {
  const content = fs.readFileSync(filePath, "utf8");
  const result = Papa.parse<string[]>(content, {
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(
      `Khong the parse file CSV ${path.basename(filePath)}: ${result.errors[0].message}`
    );
  }

  return result.data;
}

function unwrapModule<T>(moduleValue: unknown): T {
  if (
    moduleValue &&
    typeof moduleValue === "object" &&
    "default" in moduleValue &&
    (moduleValue as { default?: unknown }).default
  ) {
    return (moduleValue as { default: T }).default;
  }

  return moduleValue as T;
}

function mapCandidateRows(rows: unknown[][]): CandidateImportRow[] {
  const aliases: Record<keyof Omit<CandidateImportRow, "rowNumber">, string[]> = {
    fullName: ["ho ten", "ten", "name", "ho va ten", "full name"],
    email: ["email", "thu", "mail"],
    phone: ["sdt", "dien thoai", "phone", "so dien thoai"],
    location: ["dia diem", "location", "noi song", "khu vuc"],
    industry: ["nganh", "industry", "linh vuc", "nganh nghe"],
    currentPosition: ["vi tri", "chuc danh", "title", "position", "job"],
    currentCompany: ["cong ty", "company", "cty", "doanh nghiep", "noi lam viec"],
  };

  const headerIndexes = buildHeaderIndexes(rows[0] ?? [], aliases);

  return rows
    .slice(1)
    .map((row, index) => {
      const getCell = (field: keyof Omit<CandidateImportRow, "rowNumber">) => {
        const cellIndex = headerIndexes[field];
        return cellIndex >= 0 ? normalizeText(row[cellIndex]) : "";
      };

      const mappedRow: CandidateImportRow = {
        rowNumber: index + 2,
        fullName: getCell("fullName"),
        email: getCell("email"),
        phone: getCell("phone"),
        location: getCell("location"),
        industry: getCell("industry"),
        currentPosition: getCell("currentPosition"),
        currentCompany: getCell("currentCompany"),
      };

      return Object.entries(mappedRow).some(
        ([key, value]) => key !== "rowNumber" && Boolean(value)
      )
        ? mappedRow
        : null;
    })
    .filter((row): row is CandidateImportRow => Boolean(row));
}

function mapClientRows(rows: unknown[][]): ClientImportRow[] {
  const aliases: Record<keyof Omit<ClientImportRow, "rowNumber">, string[]> = {
    companyName: [
      "ten cong ty",
      "cong ty",
      "company name",
      "company",
      "ten doanh nghiep",
      "doanh nghiep",
    ],
    industry: ["nganh", "industry", "linh vuc", "nganh nghe"],
    companySize: ["quy mo", "company size", "size", "quy mo cong ty"],
    address: ["dia chi", "address", "dia chi tru so", "tru so"],
    website: ["website", "web", "url", "trang web"],
    notes: ["ghi chu", "notes", "note"],
  };

  const headerIndexes = buildHeaderIndexes(rows[0] ?? [], aliases);

  return rows
    .slice(1)
    .map((row, index) => {
      const getCell = (field: keyof Omit<ClientImportRow, "rowNumber">) => {
        const cellIndex = headerIndexes[field];
        return cellIndex >= 0 ? normalizeText(row[cellIndex]) : "";
      };

      const mappedRow: ClientImportRow = {
        rowNumber: index + 2,
        companyName: getCell("companyName"),
        industry: getCell("industry"),
        companySize: getCell("companySize"),
        address: getCell("address"),
        website: getCell("website"),
        notes: getCell("notes"),
      };

      return Object.entries(mappedRow).some(
        ([key, value]) => key !== "rowNumber" && Boolean(value)
      )
        ? mappedRow
        : null;
    })
    .filter((row): row is ClientImportRow => Boolean(row));
}

async function repairTemplateCandidates(
  prisma: Awaited<typeof import("../src/lib/prisma.ts")>["default"]["prisma"],
  rows: CandidateImportRow[],
  userId: number
) {
  for (const row of rows) {
    const email = row.email.trim().toLowerCase();
    const phone = row.phone.trim();

    if (!email || !phone) {
      continue;
    }

    await prisma.candidate.updateMany({
      where: {
        createdById: userId,
        email,
        phone: null,
      },
      data: {
        phone,
      },
    });
  }
}

async function repairTemplateClients(
  prisma: Awaited<typeof import("../src/lib/prisma.ts")>["default"]["prisma"],
  rows: ClientImportRow[],
  userId: number
) {
  for (const row of rows) {
    const address = row.address.trim();

    if (!address) {
      continue;
    }

    await prisma.client.updateMany({
      where: {
        createdById: userId,
        companyName: row.companyName.trim(),
        address: null,
      },
      data: {
        address,
      },
    });
  }
}

async function main() {
  const prismaModule = await import("../src/lib/prisma.ts");
  const importServiceModule = await import("../src/lib/import-service.ts");
  const prisma = unwrapModule<{ prisma: { user: unknown; $disconnect: () => Promise<void> } }>(
    prismaModule
  ).prisma as Awaited<typeof import("../src/lib/prisma.ts")>["default"]["prisma"];
  const { importCandidatesForUser, importClientsForUser } = unwrapModule<{
    importCandidatesForUser: typeof import("../src/lib/import-service.ts")["importCandidatesForUser"];
    importClientsForUser: typeof import("../src/lib/import-service.ts")["importClientsForUser"];
  }>(importServiceModule);

  const adminUser =
    (await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, email: true, name: true },
      orderBy: { id: "asc" },
    })) ??
    (await prisma.user.findFirst({
      select: { id: true, email: true, name: true },
      orderBy: { id: "asc" },
    }));

  if (!adminUser) {
    throw new Error("Khong tim thay user noi bo de gan createdById khi import.");
  }

  const candidateTemplatePath = path.join(
    process.cwd(),
    "docs",
    "templates",
    "import-candidates-template.csv"
  );
  const clientTemplatePath = path.join(
    process.cwd(),
    "docs",
    "templates",
    "import-clients-template.csv"
  );

  const candidateRows = mapCandidateRows(parseCsvRows(candidateTemplatePath));
  const clientRows = mapClientRows(parseCsvRows(clientTemplatePath));

  const candidateResult = await importCandidatesForUser(candidateRows, adminUser.id);
  const clientResult = await importClientsForUser(clientRows, adminUser.id);
  await repairTemplateCandidates(prisma, candidateRows, adminUser.id);
  await repairTemplateClients(prisma, clientRows, adminUser.id);

  console.log(
    JSON.stringify(
      {
        importedBy: adminUser,
        candidateTemplate: {
          file: path.relative(process.cwd(), candidateTemplatePath),
          rowCount: candidateRows.length,
          result: candidateResult,
        },
        clientTemplate: {
          file: path.relative(process.cwd(), clientTemplatePath),
          rowCount: clientRows.length,
          result: clientResult,
        },
      },
      null,
      2
    )
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
