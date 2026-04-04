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
import { importCandidatesAction } from "@/lib/import-actions";
import {
  buildHeaderIndexes,
  normalizeText,
  parseSpreadsheetFile,
} from "@/components/import/spreadsheet-import-utils";
import type { CandidateImportRow, ImportResult } from "@/types/import";

const PREVIEW_LIMIT = 10;

const HEADER_ALIASES: Record<keyof Omit<CandidateImportRow, "rowNumber">, string[]> = {
  fullName: ["ho ten", "ten", "name", "ho va ten", "full name"],
  email: ["email", "thu", "mail"],
  phone: ["sdt", "dien thoai", "phone", "so dien thoai"],
  location: ["dia diem", "location", "noi song", "khu vuc"],
  industry: ["nganh", "industry", "linh vuc", "nganh nghe"],
  currentPosition: ["vi tri", "chuc danh", "title", "position", "job"],
  currentCompany: ["cong ty", "company", "cty", "doanh nghiep", "noi lam viec"],
};

function mapRowsToCandidates(rows: unknown[][]): CandidateImportRow[] {
  if (rows.length < 2) return [];

  const headerIndexes = buildHeaderIndexes(rows[0], HEADER_ALIASES);

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

      const hasContent = Object.entries(mappedRow).some(
        ([key, value]) => key !== "rowNumber" && Boolean(value)
      );

      return hasContent ? mappedRow : null;
    })
    .filter((row): row is CandidateImportRow => Boolean(row));
}

async function parseImportFile(file: File): Promise<CandidateImportRow[]> {
  const rows = await parseSpreadsheetFile(file);
  return mapRowsToCandidates(rows);
}

function buildValidationMap(rows: CandidateImportRow[]) {
  const issueMap = new Map<number, string[]>();
  const seenEmails = new Map<string, number>();
  const seenPhones = new Map<string, number>();

  for (const row of rows) {
    const reasons: string[] = [];
    const email = row.email.trim().toLowerCase();
    const phone = row.phone.trim();

    if (!row.fullName.trim()) {
      reasons.push("Đưa họ tên");
    }

    if (!email && !phone) {
      reasons.push("Cần có ít nhất email hoặc SĐT");
    }

    if (email) {
      const firstRow = seenEmails.get(email);
      if (firstRow) {
        reasons.push(`Trùng email với dòng ${firstRow}`);
      } else {
        seenEmails.set(email, row.rowNumber);
      }
    }

    if (phone) {
      const firstRow = seenPhones.get(phone);
      if (firstRow) {
        reasons.push(`Trùng SĐT với dòng ${firstRow}`);
      } else {
        seenPhones.set(phone, row.rowNumber);
      }
    }

    if (reasons.length > 0) {
      issueMap.set(row.rowNumber, reasons);
    }
  }

  return issueMap;
}

export function SpreadsheetImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<CandidateImportRow[]>([]);
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
          error instanceof Error ? error.message : "Kh\u00f4ng th\u1ec3 \u0111\u1ecdc file import.",
      });
    }
  }

  function handleImport() {
    if (data.length === 0) return;

    startTransition(async () => {
      const response = await importCandidatesAction(data);
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
            Kéo thả hoặc nhấn để tải file import
          </h3>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Hỗ trợ định dạng .xlsx và .csv. Hệ thống sẽ preview và validate toàn
            bộ dòng trước khi import.
          </p>
        </div>
      ) : null}

      {result ? (
        <div
          className={`rounded-xl border p-4 ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            )}
            <div>
              <h4
                className={`font-medium ${result.success ? "text-green-900" : "text-red-900"
                  }`}
              >
                {result.success ? "Hoàn tất import" : "Có lỗi xảy ra"}
              </h4>
              <p
                className={`mt-1 text-sm ${result.success ? "text-green-700" : "text-red-700"
                  }`}
              >
                {result.message || result.error}
              </p>
            </div>
          </div>

          {result.errors && result.errors.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-lg border border-red-200 bg-white">
              <div className="border-b border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-900">
                  Error report chi tiết ({result.errors.length} dòng)
                </p>
                <p className="mt-1 text-xs text-red-700">
                  Các dòng này bị bỏ qua khi import. Hãy sửa file rồi import lại.
                </p>
              </div>
              <div className="max-h-72 overflow-auto">
                <table className="min-w-full divide-y divide-red-100 text-sm">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-red-900">
                        Dòng
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-red-900">
                        Ứng viên
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-red-900">
                        Lý do
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50">
                    {result.errors.map((item) => (
                      <tr key={`${item.rowNumber}-${item.reason}`}>
                        <td className="px-4 py-2 text-gray-700">{item.rowNumber}</td>
                        <td className="px-4 py-2 text-gray-900">
                          {item.fullName || "Không xác định"}
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
                  Đã nhận diện {data.length} dòng và validate toàn bộ file
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
                Huỷ / Chọn file khác
              </button>
              <button
                onClick={handleImport}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Xác nhận import
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-b bg-surface/60 p-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Tổng dòng preview
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">{data.length}</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                Hợp lệ trong file
              </p>
              <p className="mt-1 text-2xl font-bold text-green-900">{validRowCount}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                Cần xem lại
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-900">{invalidRowCount}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Dòng
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Họ và tên
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Email / SDT
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Ngành / Vị trí
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">
                    Công ty hiện tại
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
                        {row.fullName || (
                          <span className="text-xs italic text-danger">Thiếu tên</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        <div className="max-w-[180px] truncate">{row.email || "—"}</div>
                        <div className="mt-0.5 text-xs">{row.phone || "—"}</div>
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        <div className="max-w-[180px] truncate">{row.industry || "—"}</div>
                        <div className="mt-0.5 text-xs">{row.currentPosition || "—"}</div>
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {row.currentCompany || "—"}
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
                            Hợp lệ
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
                    ? `Đang hiển thị toàn bộ ${data.length} dòng preview.`
                    : `Đang hiển thị ${PREVIEW_LIMIT}/${data.length} dòng đầu tiên.`}
                </p>
                <button
                  type="button"
                  onClick={() => setShowAllRows((current) => !current)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary-hover"
                >
                  {showAllRows ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Thu gọn preview
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Xem toàn bộ {data.length} dòng
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
