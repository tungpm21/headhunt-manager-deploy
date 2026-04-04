"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowUpRight,
  Building2,
  ExternalLink,
  Globe,
  Loader2,
  Send,
} from "lucide-react";
import { publishJobToFdiWorkAction } from "@/lib/job-actions";
import { SerializedJobBridgeSummary } from "@/types/job";

const postingStatusMap = {
  DRAFT: { label: "Nháp", className: "bg-muted/20 text-muted" },
  PENDING: { label: "Chờ duyệt", className: "bg-warning/10 text-warning" },
  APPROVED: { label: "Đã duyệt", className: "bg-success/10 text-success" },
  REJECTED: { label: "Bị từ chối", className: "bg-danger/10 text-danger" },
  EXPIRED: { label: "Hết hạn", className: "bg-muted/20 text-muted" },
  PAUSED: { label: "Tạm ẩn", className: "bg-primary/10 text-primary" },
} as const;

function formatDate(value: string | Date | null) {
  if (!value) {
    return "Chưa cập nhật";
  }

  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function JobBridgeCard({
  bridge,
}: {
  bridge: SerializedJobBridgeSummary;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const employer = bridge.client.employer;
  const hasPosting = bridge.jobPostings.length > 0;

  const bridgeState = useMemo(() => {
    if (!employer) {
      return {
        tone: "warning",
        title: "Chưa có Employer FDIWork",
        description:
          "Client này chưa được link với Employer FDIWork. Nếu tên công ty trùng khớp, hệ thống sẽ thử auto-link khi publish; nếu không, hãy vào Employers để link thủ công.",
      };
    }

    if (employer.status !== "ACTIVE") {
      return {
        tone: "warning",
        title: "Employer chưa hoạt động",
        description:
          "Employer FDIWork đang ở trạng thái chưa kích hoạt. Bạn cần duyệt employer trước khi đăng Job Order lên FDIWork.",
      };
    }

    if (
      !employer.subscription ||
      employer.subscription.status !== "ACTIVE" ||
      new Date(employer.subscription.endDate) < new Date()
    ) {
      return {
        tone: "warning",
        title: "Chưa có gói đăng tin hợp lệ",
        description:
          "Employer FDIWork đã hết hạn gói dịch vụ hoặc chưa được cấp subscription đang hoạt động.",
      };
    }

    return {
      tone: "success",
      title: "Bridge sẵn sàng",
      description:
        "Job Order này có thể publish lên FDIWork. Các thay đổi nội dung và trạng thái đóng job sẽ được đồng bộ sang JobPosting đã link.",
    };
  }, [employer]);

  const canPublish =
    !hasPosting &&
    employer?.status === "ACTIVE" &&
    employer?.subscription?.status === "ACTIVE" &&
    employer?.subscription?.endDate != null &&
    new Date(employer.subscription.endDate) >= new Date();

  const handlePublish = () => {
    setFeedback(null);

    startTransition(async () => {
      const result = await publishJobToFdiWorkAction(bridge.id);

      setFeedback({
        type: result.success ? "success" : "error",
        message: result.message,
      });

      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Globe className="h-4 w-4" />
            FDIWork Bridge
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Đồng bộ Job Order sang FDIWork
            </h2>
            <p className="mt-1 text-sm font-medium text-foreground">
              {bridgeState.title}
            </p>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
              {bridgeState.description}
            </p>
          </div>
        </div>

        {!hasPosting ? (
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPending || !canPublish}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Đăng lên FDIWork
          </button>
        ) : null}
      </div>

      {feedback ? (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${feedback.type === "success"
              ? "border border-success/20 bg-success/10 text-success"
              : "border border-danger/20 bg-danger/10 text-danger"
            }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted" />
            <h3 className="text-sm font-semibold text-foreground">
              Employer liên kết
            </h3>
          </div>

          {employer ? (
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="font-medium text-foreground">{employer.companyName}</p>
                <p className="mt-1 text-muted">Slug public: /cong-ty/{employer.slug}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground">
                  Employer: {employer.status}
                </span>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground">
                  Subscription: {employer.subscription?.status ?? "NONE"}
                </span>
                {employer.subscription ? (
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground">
                    {employer.subscription.tier} • {employer.subscription.jobsUsed}/
                    {employer.subscription.jobQuota}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-muted">
                {employer.subscription ? (
                  <span>Hết hạn: {formatDate(employer.subscription.endDate)}</span>
                ) : null}
                <Link
                  href="/employers"
                  className="inline-flex items-center gap-1 font-medium text-primary transition hover:text-primary-hover"
                >
                  Quản lý Employers
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Chưa tìm thấy Employer FDIWork được link với client này.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              JobPosting đã link
            </h3>
            <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-muted">
              {bridge.jobPostings.length}
            </span>
          </div>

          {bridge.jobPostings.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Chưa có JobPosting nào được tạo từ Job Order này.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {bridge.jobPostings.map((posting) => {
                const meta =
                  postingStatusMap[posting.status as keyof typeof postingStatusMap] ??
                  postingStatusMap.DRAFT;

                return (
                  <div
                    key={posting.id}
                    className="rounded-lg border border-border bg-surface p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium text-foreground">{posting.title}</p>
                        <p className="mt-1 text-xs text-muted">
                          Public slug: /viec-lam/{posting.slug}
                        </p>
                      </div>
                      <span
                        className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span>Đăng ngày: {formatDate(posting.publishedAt)}</span>
                      <span>Hết hạn: {formatDate(posting.expiresAt)}</span>
                      <Link
                        href={`/employers/${posting.employer.id}`}
                        className="inline-flex items-center gap-1 font-medium text-primary transition hover:text-primary-hover"
                      >
                        Xem employer
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      {posting.status === "APPROVED" ? (
                        <Link
                          href={`/viec-lam/${posting.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 font-medium text-primary transition hover:text-primary-hover"
                        >
                          Mo FDIWork
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
