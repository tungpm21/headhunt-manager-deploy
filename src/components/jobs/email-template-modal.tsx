"use client";

import { useState } from "react";
import { Copy, Mail, X } from "lucide-react";
import {
  buildEmailTemplate,
  EmailTemplateStage,
} from "@/lib/email-templates";

export function EmailTemplateModal({
  candidateName,
  candidateEmail,
  jobTitle,
  companyName,
  stage,
  interviewDate,
  onClose,
}: {
  candidateName: string;
  candidateEmail: string | null;
  jobTitle: string;
  companyName: string;
  stage: EmailTemplateStage;
  interviewDate?: string | null;
  onClose: () => void;
}) {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const template = buildEmailTemplate(stage, {
    candidateName,
    jobTitle,
    companyName,
    interviewDate,
  });

  const mailtoHref = `mailto:${candidateEmail ?? ""}?subject=${encodeURIComponent(
    template.subject
  )}&body=${encodeURIComponent(template.body)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `Subject: ${template.subject}\n\n${template.body}`
      );
      setCopyMessage("Đã sao chép nội dung email.");
    } catch {
      setCopyMessage("Không thể sao chép. Bạn hãy copy thủ công trong modal.");
    }

    window.setTimeout(() => setCopyMessage(null), 2000);
  };

  const handleOpenMailClient = () => {
    window.open(mailtoHref, "_self");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="text-sm font-medium text-primary">{template.heading}</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">
              Gửi email cho {candidateName}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {candidateEmail || "Chưa có email của ứng viên trong hồ sơ."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-foreground"
            title="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="rounded-xl border border-border bg-background px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Subject
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{template.subject}</p>
          </div>

          <div className="rounded-xl border border-border bg-background px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Nội dung
            </p>
            <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
              {template.body}
            </pre>
          </div>

          {copyMessage ? (
            <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
              {copyMessage}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
          <button
            type="button"
            onClick={handleOpenMailClient}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            <Mail className="h-4 w-4" />
            Mở Mail Client
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
          >
            Bỏ qua
          </button>
        </div>
      </div>
    </div>
  );
}
