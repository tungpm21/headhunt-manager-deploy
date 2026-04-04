"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { importClientsAction } from "@/lib/import-actions";
import {
  buildHeaderIndexes,
  normalizeText,
  parseSpreadsheetFile,
} from "@/components/import/spreadsheet-import-utils";
import type { ClientImportRow, ImportResult } from "@/types/import";

const PREVIEW_LIMIT = 10;

const HEADER_ALIASES: Record<keyof Omit<ClientImportRow, "rowNumber">, string[]> = {
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

function mapRowsToClients(rows: unknown[][]): ClientImportRow[] {
  if (rows.length < 2) return [];

  const headerIndexes = buildHeaderIndexes(rows[0], HEADER_ALIASES);

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

      const hasContent = Object.entries(mappedRow).some(
        ([key, value]) => key !== "rowNumber" && Boolean(value)
      );

      return hasContent ? mappedRow : null;
    })
    .filter((row): row is ClientImportRow => Boolean(row));
}

async function parseImportFile(file: File): Promise<ClientImportRow[]> {
  const rows = await parseSpreadsheetFile(file);
  return mapRowsToClients(rows);
}

function buildValidationMap(rows: ClientImportRow[]) {
  const issueMap = new Map<number, string[]>();
  const seenCompanyNames = new Map<string, number>();
  const seenWebsites = new Map<string, number>();

  for (const row of rows) {
    const reasons: string[] = [];
    const companyName = row.companyName.trim().toLowerCase();
    const website = row.website.trim().toLowerCase();
    const companySize = row.companySize.trim().toUpperCase();

    if (!companyName) {
      reasons.push("Thieu ten doanh nghiep");
    }

    if (
      companySize &&
      !["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"].includes(companySize)
    ) {
      reasons.push("Quy mo phai la SMALL, MEDIUM, LARGE hoac ENTERPRISE");
    }

    if (website) {
      const firstRow = seenWebsites.get(website);
      if (firstRow) {
        reasons.push(`Trung website voi dong ${firstRow}`);
      } else {
        seenWebsites.set(website, row.rowNumber);
      }

      if (!URL.canParse(website)) {
        reasons.push("Website khong hop le");
      }
    }

    if (companyName) {
      const firstRow = seenCompanyNames.get(companyName);
      if (firstRow) {
        reasons.push(`Trung ten doanh nghiep voi dong ${firstRow}`);
      } else {
        seenCompanyNames.set(companyName, row.rowNumber);
      }
    }

    if (reasons.length > 0) {
      issueMap.set(row.rowNumber, reasons);
    }
  }

  return issueMap;
}

export function ClientSpreadsheetImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ClientImportRow[]>([]);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);

  const validationMap = useMemo(() => buildValidationMap(data), [data]);
  const previewRows = showAllRows ? data : data.slice(0, PREVIEW_LIMIT);
  const invalidRowCount = validationMap.size;
  const validRowCount = data.length - invalidRowCount;

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setResult(null);
    setShowAllRows(false);

    try {
      const parsedRows = await parseImportFile(uploadedFile);
      setData(parsedRows);
    } catch (error) {
      setData([]);
      setResult({
        error:
          error instanceof Error ? error.message : "Khong the doc file import.",
      });
    }
  }

  function handleImport() {
    if (data.length === 0) return;

    startTransition(async () => {
      const response = await importClientsAction(data);
      setResult(response);

      if (response.success && (response.successCount ?? 0) > 0) {
        setFile(null);
        setData([]);
        setShowAllRows(false);
      }
    });
  }

  return (
    <div className="space-y-6">
      {!file && !result?.success ? (
        <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center transition hover:bg-gray-100">
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileUpload}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <UploadCloud className="mb-4 h-12 w-12 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            Keo tha hoac nhan de tai file import client
          </h3>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Ho tro .xlsx va .csv. He thong se preview, validate va bo qua cac
            dong bi trung ten doanh nghiep hoac website.
          </p>
        </div>
      ) : null}

      {result ? (
        <div
          className={`rounded-xl border p-4 ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            )}
            <div>
              <h4
                className={`font-medium ${result.success ? "text-green-900" : "text-red-900"}`}
              >
                {result.success ? "Hoan tat import" : "Co loi xay ra"}
              </h4>
              <p
                className={`mt-1 text-sm ${result.success ? "text-green-700" : "text-red-700"}`}
              >
                {result.message || result.error}
              </p>
            </div>
          </div>

          {result.errors && result.errors.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-lg border border-red-200 bg-white">
              <div className="border-b border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-900">
                  Error report chi tiet ({result.errors.length} dong)
                </p>
                <p className="mt-1 text-xs text-red-700">
                  Cac dong nay bi bo qua khi import. Hay sua file roi import lai.
                </p>
              </div>
              <div className="max-h-72 overflow-auto">
                <table className="min-w-full divide-y divide-red-100 text-sm">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-red-900">
                        Dong
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-red-900">
                        Doanh nghiep
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-red-900">
                        Ly do
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50">
                    {result.errors.map((item) => (
                      <tr key={`${item.rowNumber}-${item.reason}`}>
                        <td className="px-4 py-2 text-gray-700">{item.rowNumber}</td>
                        <td className="px-4 py-2 text-gray-900">
                          {item.companyName || "Khong xac dinh"}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {file && data.length > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b bg-gray-50 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <p className="max-w-[220px] truncate text-sm font-semibold text-gray-900">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  Da nhan dien {data.length} dong va validate toan bo file
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setData([]);
                  setResult(null);
                  setShowAllRows(false);
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
                disabled={isPending}
              >
                Huy / Chon file khac
              </button>
              <button
                onClick={handleImport}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Dang xu ly...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Xac nhan import
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-b bg-surface/60 p-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Tong dong preview
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">{data.length}</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                Hop le trong file
              </p>
              <p className="mt-1 text-2xl font-bold text-green-900">{validRowCount}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                Can xem lai
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-900">{invalidRowCount}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Dong
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Doanh nghiep
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Nganh / Quy mo
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Validate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {previewRows.map((row) => {
                  const reasons = validationMap.get(row.rowNumber) ?? [];

                  return (
                    <tr
                      key={row.rowNumber}
                      className={reasons.length > 0 ? "bg-amber-50/60" : "hover:bg-gray-50"}
                    >
                      <td className="px-6 py-3 text-gray-500">{row.rowNumber}</td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {row.companyName || (
                          <span className="text-xs italic text-danger">
                            Thieu ten doanh nghiep
                          </span>
                        )}
                        <div className="mt-0.5 text-xs text-gray-500">
                          {row.address || "Khong co dia chi"}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        <div className="max-w-[180px] truncate">{row.industry || "-"}</div>
                        <div className="mt-0.5 text-xs">{row.companySize || "-"}</div>
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        <div className="max-w-[220px] truncate">{row.website || "-"}</div>
                      </td>
                      <td className="px-6 py-3">
                        {reasons.length > 0 ? (
                          <div className="space-y-1">
                            {reasons.map((reason) => (
                              <div
                                key={reason}
                                className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"
                              >
                                {reason}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                            Hop le
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {data.length > PREVIEW_LIMIT ? (
              <div className="flex flex-col gap-3 border-t bg-gray-50 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  {showAllRows
                    ? `Dang hien thi toan bo ${data.length} dong preview.`
                    : `Dang hien thi ${PREVIEW_LIMIT}/${data.length} dong dau tien.`}
                </p>
                <button
                  type="button"
                  onClick={() => setShowAllRows((current) => !current)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary-hover"
                >
                  {showAllRows ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Thu gon preview
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Xem toan bo {data.length} dong
                    </>
                  )}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
