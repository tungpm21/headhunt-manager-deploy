"use client";

import Papa from "papaparse";
import readXlsxFile from "read-excel-file/browser";

export function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function normalizeHeader(value: unknown): string {
  return normalizeText(value)
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function buildHeaderIndexes<TField extends string>(
  headers: unknown[],
  headerAliases: Record<TField, string[]>
): Record<TField, number> {
  const normalizedHeaders = headers.map(normalizeHeader);

  return Object.fromEntries(
    (Object.entries(headerAliases) as Array<[TField, string[]]>).map(
      ([field, aliases]) => {
        const index = normalizedHeaders.findIndex((header) =>
          aliases.some((alias) => header.includes(alias))
        );

        return [field, index];
      }
    )
  ) as Record<TField, number>;
}

function parseCsvFile(file: File): Promise<unknown[][]> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}

export async function parseSpreadsheetFile(file: File): Promise<unknown[][]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".csv")) {
    return parseCsvFile(file);
  }

  if (fileName.endsWith(".xlsx")) {
    const parsed: unknown = await readXlsxFile(file);

    if (Array.isArray(parsed)) {
      return parsed as unknown[][];
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      "data" in parsed &&
      Array.isArray((parsed as { data: unknown }).data)
    ) {
      return (parsed as { data: unknown[][] }).data;
    }

    throw new Error("Khong doc duoc noi dung file Excel.");
  }

  throw new Error("Chi ho tro file .xlsx hoac .csv");
}
