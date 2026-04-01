"use client";

import { useState, useTransition } from "react";
import Papa from "papaparse";
import readXlsxFile from "read-excel-file/browser";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { importCandidatesAction } from "@/lib/import-actions";

type CandidateImportRow = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  industry: string;
  currentPosition: string;
  currentCompany: string;
};

type ImportResult = {
  success?: boolean;
  successCount?: number;
  errorCount?: number;
  message?: string;
  error?: string;
};

const HEADER_ALIASES: Record<keyof CandidateImportRow, string[]> = {
  fullName: ["ho ten", "ten", "name", "ho va ten", "full name"],
  email: ["email", "thu", "mail"],
  phone: ["sdt", "dien thoai", "phone", "so dien thoai"],
  location: ["dia diem", "location", "noi song", "khu vuc"],
  industry: ["nganh", "industry", "linh vuc", "nganh nghe"],
  currentPosition: ["vi tri", "chuc danh", "title", "position", "job"],
  currentCompany: ["cong ty", "company", "cty", "doanh nghiep", "noi lam viec"],
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeHeader(value: unknown): string {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mapRowsToCandidates(rows: unknown[][]): CandidateImportRow[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);
  const headerIndexes = Object.fromEntries(
    Object.entries(HEADER_ALIASES).map(([field, aliases]) => {
      const index = headers.findIndex((header) =>
        aliases.some((alias) => header.includes(alias))
      );
      return [field, index];
    })
  ) as Record<keyof CandidateImportRow, number>;

  return rows
    .slice(1)
    .map((row) => {
      const getCell = (field: keyof CandidateImportRow) => {
        const index = headerIndexes[field];
        return index >= 0 ? normalizeText(row[index]) : "";
      };

      return {
        fullName: getCell("fullName"),
        email: getCell("email"),
        phone: getCell("phone"),
        location: getCell("location"),
        industry: getCell("industry"),
        currentPosition: getCell("currentPosition"),
        currentCompany: getCell("currentCompany"),
      };
    })
    .filter((row) => row.fullName);
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

async function parseImportFile(file: File): Promise<CandidateImportRow[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".csv")) {
    const rows = await parseCsvFile(file);
    return mapRowsToCandidates(rows);
  }

  if (fileName.endsWith(".xlsx")) {
    const sheets = await readXlsxFile(file);
    const firstSheet = sheets[0]?.data ?? [];
    return mapRowsToCandidates(firstSheet);
  }

  throw new Error("Chi ho tro file .xlsx hoac .csv");
}

export function SpreadsheetImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<CandidateImportRow[]>([]);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setResult(null);

    try {
      const parsedRows = await parseImportFile(uploadedFile);
      setData(parsedRows);
    } catch (error) {
      setData([]);
      setResult({
        error:
          error instanceof Error
            ? error.message
            : "Khong the doc file import.",
      });
    }
  }

  function handleImport() {
    if (data.length === 0) return;

    startTransition(async () => {
      const response = await importCandidatesAction(data);
      setResult(response);

      if (response.success) {
        setFile(null);
        setData([]);
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
            Keo tha hoac nhan de tai file import
          </h3>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Ho tro dinh dang .xlsx va .csv. He thong tu nhan dien cac cot:
            Ho ten, Email, SDT, Vi tri, Cong ty.
          </p>
        </div>
      ) : null}

      {result ? (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            result.success
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
          )}
          <div>
            <h4
              className={`font-medium ${
                result.success ? "text-green-900" : "text-red-900"
              }`}
            >
              {result.success ? "Hoan tat import" : "Co loi xay ra"}
            </h4>
            <p
              className={`mt-1 text-sm ${
                result.success ? "text-green-700" : "text-red-700"
              }`}
            >
              {result.message || result.error}
            </p>
          </div>
        </div>
      ) : null}

      {file && data.length > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b bg-gray-50 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <p className="max-w-[200px] truncate text-sm font-semibold text-gray-900">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  Da nhan dien {data.length} ung vien
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setData([]);
                  setResult(null);
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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    #
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Ho va ten
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Email & SDT
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Nganh & Vi tri
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Cong ty hien tai
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.slice(0, 5).map((row, index) => (
                  <tr
                    key={`${row.fullName}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {row.fullName || (
                        <span className="text-xs italic text-danger">
                          Thieu ten
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      <div className="max-w-[150px] truncate">
                        {row.email || "—"}
                      </div>
                      <div className="mt-0.5 text-xs">{row.phone || "—"}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      <div className="max-w-[150px] truncate">
                        {row.industry || "—"}
                      </div>
                      <div className="mt-0.5 text-xs">
                        {row.currentPosition || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {row.currentCompany || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.length > 5 ? (
              <div className="flex items-center justify-center gap-1 border-t bg-gray-50 px-6 py-3 text-center text-sm text-gray-500">
                Hien thi 5 dong dau tien
                <ArrowRight className="h-3.5 w-3.5" />
                Con {data.length - 5} dong nua
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
