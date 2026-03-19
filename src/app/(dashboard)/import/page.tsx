import { FileSpreadsheet, Info } from "lucide-react";
import { ExcelImporter } from "@/components/import/excel-importer";

export const metadata = {
  title: "Import Ứng viên (Excel) — Headhunt Manager",
};

export default function ImportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Import Dữ Liệu Ứng Viên</h1>
          <p className="mt-1 text-sm text-muted">
            Tải lên danh sách ứng viên từ file Excel hoặc CSV để thêm hàng loạt vào hệ thống.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">Hướng dẫn định dạng Cột (Khuyên dùng):</p>
          <ul className="list-disc pl-5 space-y-1 text-blue-800">
            <li><strong>Họ Tên</strong> (Hoặc Name, Họ và tên) - <span className="text-danger italic">Bắt buộc</span></li>
            <li><strong>Email</strong>, <strong>SĐT</strong> (Hoặc Điện thoại, Phone)</li>
            <li><strong>Vị trí</strong> (Hoặc Chức danh), <strong>Công ty</strong> (Hoặc Nơi làm việc)</li>
            <li><strong>Ngành nghề</strong> (Hoặc Lĩnh vực)</li>
          </ul>
        </div>
      </div>

      {/* Main Importer */}
      <ExcelImporter />
    </div>
  );
}
