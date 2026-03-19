"use client";

import { useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { importCandidatesAction } from "@/lib/import-actions";

export function ExcelImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; successCount?: number; errorCount?: number; message?: string; error?: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonStr = XLSX.utils.sheet_to_json(ws);
      
      // Normalize columns loosely
      const normalized = jsonStr.map((row: any) => {
        const getVal = (keys: string[]) => {
          const foundKey = Object.keys(row).find(k => keys.some(match => k.toLowerCase().includes(match.toLowerCase())));
          return foundKey ? row[foundKey] : "";
        };

        return {
          fullName: getVal(["Họ Tên", "Tên", "Name", "Họ và tên", "Full Name"]),
          email: getVal(["Email", "Thư", "Mail"]),
          phone: getVal(["SĐT", "Điện thoại", "Phone"]),
          location: getVal(["Địa điểm", "Location", "Nơi sống", "Khu vực"]),
          industry: getVal(["Ngành", "Industry", "Lĩnh vực"]),
          currentPosition: getVal(["Vị trí", "Chức danh", "Title", "Position", "Job"]),
          currentCompany: getVal(["Công ty", "Company", "Cty", "Doanh nghiệp", "Nơi làm việc"])
        };
      }).filter(r => r.fullName); // remove empty rows without name

      setData(normalized);
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleImport = () => {
    if (data.length === 0) return;
    startTransition(async () => {
      const res = await importCandidatesAction(data);
      setResult(res);
      if (res.success) {
        setFile(null);
        setData([]); // Clear after success
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!file && !result?.success && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition relative">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <UploadCloud className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Kéo thả hoặc Nhấn để tải file Excel</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-md">
            Hỗ trợ định dạng .xlsx, .xls, .csv. Hệ thống sẽ tự động tự nhận diện các cột: Họ tên, Email, SĐT, Vị trí, Công ty...
          </p>
        </div>
      )}

      {/* Result Alert */}
      {result && (
        <div className={`p-4 rounded-xl flex items-start gap-3 ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          {result.success ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> : <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />}
          <div>
            <h4 className={`font-medium ${result.success ? "text-green-900" : "text-red-900"}`}>
              {result.success ? "Hoàn tất Import!" : "Có lỗi xảy ra"}
            </h4>
            <p className={`text-sm mt-1 ${result.success ? "text-green-700" : "text-red-700"}`}>
              {result.message || result.error}
            </p>
          </div>
        </div>
      )}

      {/* Preview Zone */}
      {file && data.length > 0 && (
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900 text-sm truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-gray-500">Đã nhận diện {data.length} ứng viên</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setFile(null); setData([]); setResult(null); }}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5"
                disabled={isPending}
              >
                Hủy / Chọn file khác
              </button>
              <button 
                onClick={handleImport}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-60"
              >
                {isPending ? <><Loader2 className="h-4 w-4 animate-spin"/> Đang xử lý...</> : <><UploadCloud className="h-4 w-4"/> Xác nhận Import</>}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">#</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Họ và tên</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Email & SĐT</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Ngành & Vị trí</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Công ty hiện tại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{row.fullName || <span className="text-danger text-xs italic">Thiếu tên</span>}</td>
                    <td className="px-6 py-3 text-gray-500">
                      <div className="truncate max-w-[150px]">{row.email || '—'}</div>
                      <div className="text-xs mt-0.5">{row.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      <div className="truncate max-w-[150px]">{row.industry || '—'}</div>
                      <div className="text-xs mt-0.5">{row.currentPosition || '—'}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{row.currentCompany || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 5 && (
              <div className="py-3 px-6 text-center text-sm text-gray-500 border-t bg-gray-50 flex items-center justify-center gap-1">
                Hiển thị 5 dòng đầu tiên <ArrowRight className="h-3.5 w-3.5" /> Còn {data.length - 5} dòng nữa
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
