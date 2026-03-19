"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { FileText, Maximize2, Minimize2, GripVertical } from "lucide-react";

interface CvViewerProps {
  cvUrl?: string | null;
}

export function CvViewer({ cvUrl }: CvViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [frameHeight, setFrameHeight] = useState(500);
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    startY.current = e.clientY;
    startHeight.current = frameHeight;
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  }, [frameHeight]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const diff = e.clientY - startY.current;
      const newHeight = Math.max(250, Math.min(startHeight.current + diff, 1200));
      setFrameHeight(newHeight);
    };
    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (!cvUrl) {
    return (
      <div className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-muted/10 font-semibold text-sm">
          Xem trước CV (Hồ sơ)
        </div>
        <div className="p-10 flex flex-col items-center justify-center text-center h-[300px] text-muted bg-surface/50">
          <FileText className="h-12 w-12 mb-3 opacity-20" />
          <p className="text-sm font-medium">Chưa có CV</p>
          <p className="text-xs mt-1 opacity-70 max-w-xs mx-auto">
            Ứng viên này chưa được cập nhật CV. Vui lòng tải lên ở cột thông tin bên trái.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Normal embedded viewer */}
      <div ref={containerRef} className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border bg-muted/10 font-semibold text-sm flex justify-between items-center">
          <span>Xem trước CV (Hồ sơ)</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity font-medium"
              title="Phóng to toàn màn hình"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Phóng to
            </button>
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-foreground transition font-medium"
            >
              Mở tab mới ↗
            </a>
          </div>
        </div>
        <div className="w-full bg-muted/20">
          <iframe
            src={`${cvUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
            style={{ height: `${frameHeight}px` }}
            className="w-full border-none"
            title="CV Preview"
          />
        </div>
        {/* Resize handle */}
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center justify-center gap-1 py-1.5 cursor-ns-resize bg-muted/10 hover:bg-primary/10 border-t border-border transition select-none group"
          title="Kéo để thay đổi chiều cao"
        >
          <GripVertical className="h-4 w-4 text-muted/40 group-hover:text-primary rotate-90 transition-colors" />
          <span className="text-[10px] text-muted/40 group-hover:text-primary transition-colors">
            Kéo để thay đổi kích thước
          </span>
        </div>
      </div>

      {/* Fullscreen zoom modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-6 py-3 bg-surface border-b border-border">
            <span className="text-sm font-semibold text-foreground">CV Preview — Chế độ toàn màn hình</span>
            <div className="flex items-center gap-3">
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted hover:text-foreground transition font-medium"
              >
                Mở tab mới ↗
              </a>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="flex items-center gap-1 text-xs text-danger hover:opacity-80 transition font-medium"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                Đóng
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <iframe
              src={`${cvUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
              className="w-full h-full border-none"
              title="CV Preview Fullscreen"
            />
          </div>
        </div>
      )}
    </>
  );
}
