"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X, Loader2, Download } from "lucide-react";
import { useRouter } from "next/navigation";

interface CvUploadProps {
  candidateId: number;
  currentCvUrl?: string | null;
  currentCvFileName?: string | null;
  onSuccess?: (url: string, fileName: string) => void;
}

export function CvUpload({
  candidateId,
  currentCvUrl,
  currentCvFileName,
  onSuccess,
}: CvUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvUrl, setCvUrl] = useState(currentCvUrl);
  const [cvFileName, setCvFileName] = useState(currentCvFileName);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate client-side first
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      setError("Chỉ chấp nhận file PDF hoặc Word (.doc, .docx)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File quá lớn. Tối đa 10MB.");
      return;
    }

    setIsUploading(true);
    const fd = new FormData();
    fd.append("cv", file);

    try {
      const res = await fetch(`/api/candidates/${candidateId}/cv`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload thất bại.");
      } else {
        setCvUrl(data.url);
        setCvFileName(data.fileName);
        onSuccess?.(data.url, data.fileName);
        router.refresh();
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setIsUploading(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/cv`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Xóa thất bại.");
      } else {
        setCvUrl(null);
        setCvFileName(null);
        router.refresh();
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      {/* Current CV */}
      {cvUrl && cvFileName && (
        <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 px-4 py-3">
          <FileText className="h-8 w-8 text-success flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{cvFileName}</p>
            <p className="text-xs text-muted mt-0.5">CV hiện tại</p>
          </div>
          <a
            href={cvUrl}
            download={cvFileName}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface transition"
          >
            <Download className="h-3.5 w-3.5" />
            Tải
          </a>
          <button
            type="button"
            onClick={handleDelete}
            className="text-muted hover:text-danger transition"
            title="Xóa CV hiện tại"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-surface/50"
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted">Đang upload...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted/50" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {cvUrl ? "Thay thế CV" : "Upload CV"}
              </p>
              <p className="text-xs text-muted mt-1">Kéo thả hoặc click để chọn • PDF, Word • Tối đa 10MB</p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
