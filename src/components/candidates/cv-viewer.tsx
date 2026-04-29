"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, GripVertical, Maximize2, Minimize2 } from "lucide-react";

interface CvViewerProps {
  cvUrl?: string | null;
  fileName?: string | null;
}

type CvType = "pdf" | "word";

function detectCvType(cvUrl?: string | null, fileName?: string | null): CvType {
  const source = (fileName || cvUrl || "").toLowerCase();

  if (source.endsWith(".doc") || source.endsWith(".docx")) {
    return "word";
  }

  return "pdf";
}

function buildAbsoluteCvUrl(cvUrl: string) {
  if (/^https?:\/\//i.test(cvUrl)) {
    return cvUrl;
  }

  if (typeof window !== "undefined") {
    return new URL(cvUrl, window.location.origin).href;
  }

  return cvUrl;
}

function isPublicHttpUrl(cvUrl: string) {
  if (!/^https?:\/\//i.test(cvUrl)) {
    return false;
  }

  try {
    const url = new URL(cvUrl);
    return !["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function buildViewerUrl(cvUrl: string, type: CvType) {
  if (type === "word") {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cvUrl)}`;
  }

  return `${cvUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`;
}

export function CvViewer({ cvUrl, fileName }: CvViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [frameHeight, setFrameHeight] = useState(500);
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      isResizing.current = true;
      startY.current = event.clientY;
      startHeight.current = frameHeight;
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    },
    [frameHeight]
  );

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing.current) return;
      const diff = event.clientY - startY.current;
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
      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border bg-muted/10 p-4 text-sm font-semibold">
          Xem trước CV (Hồ sơ)
        </div>
        <div className="flex h-[300px] flex-col items-center justify-center bg-surface/50 p-10 text-center text-muted">
          <FileText className="mb-3 h-12 w-12 opacity-20" />
          <p className="text-sm font-medium">Chưa có CV</p>
          <p className="mx-auto mt-1 max-w-xs text-xs opacity-70">
            Ứng viên này chưa được cập nhật CV. Vui lòng tải lên ở cột thông tin bên trái.
          </p>
        </div>
      </div>
    );
  }

  const viewerType = detectCvType(cvUrl, fileName);
  const absoluteCvUrl = buildAbsoluteCvUrl(cvUrl);
  const viewerUrl =
    viewerType === "pdf" || isPublicHttpUrl(absoluteCvUrl)
      ? buildViewerUrl(absoluteCvUrl, viewerType)
      : null;

  const fallback = (
    <div className="flex min-h-[360px] flex-col items-center justify-center bg-muted/10 px-8 text-center">
      <FileText className="mb-3 h-12 w-12 text-muted/30" />
      <p className="font-semibold text-foreground">DOC/DOCX preview cần URL public</p>
      <p className="mt-2 max-w-md text-sm text-muted">
        File Word sẽ preview bằng Office viewer khi CV nằm trên URL public. Với file local hoặc
        localhost, hãy mở tab mới để kiểm tra.
      </p>
      <a
        href={cvUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
      >
        Mở CV
      </a>
    </div>
  );

  return (
    <>
      <div ref={containerRef} className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border bg-muted/10 px-4 py-3 text-sm font-semibold">
          <span>Xem trước CV (Hồ sơ)</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-80"
              title="Phóng to toàn màn hình"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Phóng to
            </button>
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-muted transition hover:text-foreground"
            >
              Mở tab mới ↗
            </a>
          </div>
        </div>

        {viewerUrl ? (
          <>
            <div className="w-full bg-muted/20">
              <iframe
                src={viewerUrl}
                style={{ height: `${frameHeight}px` }}
                className="w-full border-none"
                title="CV Preview"
              />
            </div>
            <div
              onMouseDown={handleMouseDown}
              className="group flex cursor-ns-resize select-none items-center justify-center gap-1 border-t border-border bg-muted/10 py-1.5 transition hover:bg-primary/10"
              title="Kéo để thay đổi chiều cao"
            >
              <GripVertical className="h-4 w-4 rotate-90 text-muted/40 transition-colors group-hover:text-primary" />
              <span className="text-[10px] text-muted/40 transition-colors group-hover:text-primary">
                Kéo để thay đổi kích thước
              </span>
            </div>
          </>
        ) : (
          fallback
        )}
      </div>

      {isZoomed ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
            <span className="text-sm font-semibold text-foreground">
              CV Preview - Chế độ toàn màn hình
            </span>
            <div className="flex items-center gap-3">
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-muted transition hover:text-foreground"
              >
                Mở tab mới ↗
              </a>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="flex items-center gap-1 text-xs font-medium text-danger transition hover:opacity-80"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                Đóng
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1">
            {viewerUrl ? (
              <iframe
                src={viewerUrl}
                className="h-full w-full border-none"
                title="CV Preview Fullscreen"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center bg-surface text-center">
                <FileText className="mb-3 h-12 w-12 text-muted/30" />
                <p className="font-semibold text-foreground">Không thể embed file Word local.</p>
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
                >
                  Mở CV
                </a>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
