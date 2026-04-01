import { FileSpreadsheet, Info } from "lucide-react";
import { SpreadsheetImporter } from "@/components/import/spreadsheet-importer";

export const metadata = {
  title: "Import ung vien (XLSX/CSV) - Headhunt Manager",
};

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Import du lieu ung vien
          </h1>
          <p className="mt-1 text-sm text-muted">
            Tai len danh sach ung vien tu file Excel (.xlsx) hoac CSV de them
            hang loat vao he thong.
          </p>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div className="text-sm text-blue-900">
          <p className="mb-1 font-medium">Huong dan dinh dang cot:</p>
          <ul className="list-disc space-y-1 pl-5 text-blue-800">
            <li>
              <strong>Ho Ten</strong> (hoac Name, Ho va ten) -
              <span className="italic text-danger"> bat buoc</span>
            </li>
            <li>
              <strong>Email</strong>, <strong>SDT</strong> (hoac Dien thoai,
              Phone)
            </li>
            <li>
              <strong>Vi tri</strong> (hoac Chuc danh), <strong>Cong ty</strong>{" "}
              (hoac Noi lam viec)
            </li>
            <li>
              <strong>Nganh nghe</strong> (hoac Linh vuc)
            </li>
          </ul>
        </div>
      </div>

      <SpreadsheetImporter />
    </div>
  );
}
