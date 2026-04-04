import { Building2, FileSpreadsheet, Info, Users } from "lucide-react";
import { ClientSpreadsheetImporter } from "@/components/import/client-spreadsheet-importer";
import { SpreadsheetImporter } from "@/components/import/spreadsheet-importer";

export const metadata = {
  title: "Import du lieu (XLSX/CSV) - Headhunt Manager",
};

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Import du lieu tu Excel / CSV
          </h1>
          <p className="mt-1 text-sm text-muted">
            Tai len file mau de them hang loat ung vien va doanh nghiep vao he
            thong.
          </p>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div className="text-sm text-blue-900">
          <p className="mb-1 font-medium">Huong dan nhanh:</p>
          <ul className="list-disc space-y-1 pl-5 text-blue-800">
            <li>
              Candidate import: can cot <strong>Ho va Ten</strong>, va moi dong
              phai co it nhat <strong>Email</strong> hoac <strong>SDT</strong>.
            </li>
            <li>
              Client import: can cot <strong>Ten Cong Ty</strong>; cot{" "}
              <strong>Quy Mo</strong> chi nhan `SMALL`, `MEDIUM`, `LARGE`,
              `ENTERPRISE`.
            </li>
            <li>
              He thong ho tro file <strong>.csv</strong> va <strong>.xlsx</strong>,
              preview 10 dong dau truoc khi import.
            </li>
          </ul>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-border bg-background p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Import ung vien
              </h2>
              <p className="mt-1 text-sm text-muted">
                Dung template candidate de tao ho so recruiter co the tim kiem
                va gan vao pipeline ngay.
              </p>
            </div>
          </div>

          <SpreadsheetImporter />
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-background p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Import doanh nghiep
              </h2>
              <p className="mt-1 text-sm text-muted">
                Dung template client de tao CRM client list nhanh hon, tu dong
                skip dong trung ten cong ty hoac website.
              </p>
            </div>
          </div>

          <ClientSpreadsheetImporter />
        </section>
      </div>
    </div>
  );
}
