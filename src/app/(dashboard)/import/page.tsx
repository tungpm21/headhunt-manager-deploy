import { Building2, Download, FileSpreadsheet, Info, Users } from "lucide-react";
import { ClientSpreadsheetImporter } from "@/components/import/client-spreadsheet-importer";
import { SpreadsheetImporter } from "@/components/import/spreadsheet-importer";

export const metadata = {
  title: "Nhập dữ liệu (XLSX/CSV) - Headhunt Manager",
};

const candidateColumns = [
  ["Full Name", "Bắt buộc. Tên đầy đủ ứng viên."],
  ["Email", "Tùy chọn, dùng để chống trùng."],
  ["Phone", "Tùy chọn, dùng để chống trùng. Cần Email hoặc Phone."],
  ["Location", "Khu vực hiện tại."],
  ["Industry", "Ngành nghề."],
  ["Position", "Chức danh hiện tại."],
  ["Company", "Công ty hiện tại."],
];

const clientColumns = [
  ["Company Name", "Bắt buộc. Tên doanh nghiệp."],
  ["Industry", "Ngành nghề."],
  ["Company Size", "SMALL, MEDIUM, LARGE hoặc ENTERPRISE."],
  ["Address", "Địa chỉ."],
  ["Website", "URL website, dùng để chống trùng."],
  ["Notes", "Ghi chú nội bộ."],
];

function TemplateLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      download
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 text-sm font-semibold text-primary transition hover:bg-primary/15"
    >
      <Download className="h-4 w-4" />
      {label}
    </a>
  );
}

function ColumnGuide({
  title,
  columns,
}: {
  title: string;
  columns: string[][];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border bg-background px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="border-b border-border bg-background text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Cột</th>
              <th className="px-4 py-2 text-left font-semibold">Quy tắc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {columns.map(([name, description]) => (
              <tr key={name}>
                <td className="px-4 py-2 font-mono text-xs font-semibold text-foreground">{name}</td>
                <td className="px-4 py-2 text-muted">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Nhập dữ liệu từ Excel / CSV
          </h1>
          <p className="mt-1 text-sm text-muted">
            Tải file mẫu, giữ nguyên header rồi upload CSV hoặc XLSX để preview và validate trước khi import.
          </p>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div className="text-sm text-blue-900">
          <p className="mb-1 font-medium">Quy trình chuẩn:</p>
          <p className="text-blue-800">
            Tải CSV mẫu, mở bằng Excel/Google Sheets, thay dữ liệu mẫu, xuất lại CSV hoặc XLSX rồi upload.
            Hệ thống sẽ preview, báo dòng lỗi và chỉ import các dòng hợp lệ.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Template ứng viên</h2>
              <p className="mt-1 text-sm text-muted">Dùng cho Talent Pool, chống trùng theo email hoặc số điện thoại.</p>
            </div>
            <TemplateLink href="/import-templates/candidate-import-template.csv" label="Tải CSV mẫu" />
          </div>
          <div className="mt-4">
            <ColumnGuide title="Format bảng ứng viên" columns={candidateColumns} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Template doanh nghiệp</h2>
              <p className="mt-1 text-sm text-muted">Dùng cho CRM client list, chống trùng theo tên công ty hoặc website.</p>
            </div>
            <TemplateLink href="/import-templates/client-import-template.csv" label="Tải CSV mẫu" />
          </div>
          <div className="mt-4">
            <ColumnGuide title="Format bảng doanh nghiệp" columns={clientColumns} />
          </div>
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
                Import ứng viên
              </h2>
              <p className="mt-1 text-sm text-muted">
                Tạo hồ sơ recruiter có thể tìm kiếm và gán vào pipeline ngay.
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
                Import doanh nghiệp
              </h2>
              <p className="mt-1 text-sm text-muted">
                Tạo CRM client list nhanh hơn, tự động skip dòng trùng tên công ty hoặc website.
              </p>
            </div>
          </div>

          <ClientSpreadsheetImporter />
        </section>
      </div>
    </div>
  );
}
