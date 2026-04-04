import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  Briefcase,
  Building2,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { requireViewerScope } from "@/lib/authz";
import { FeeType, JobPriority, JobStatus } from "@/types/client";
import { getClientById } from "@/lib/clients";
import { ClientForm } from "@/components/clients/client-form";
import { ClientContacts } from "@/components/clients/client-contacts";
import { DeleteClientButton } from "@/components/clients/delete-client-button";
import { getClientRevenueSummary } from "@/lib/revenue";
import { formatDate, formatVnd } from "@/lib/utils";

export const metadata = { title: "Chi tiết Doanh nghiệp — Headhunt Manager" };

interface PageProps { params: Promise<{ id: string }> }

const jobStatusMeta: Record<JobStatus, { label: string; className: string }> = {
  OPEN: { label: "Đang tuyển", className: "bg-success/10 text-success" },
  PAUSED: { label: "Tạm dừng", className: "bg-warning/10 text-warning" },
  FILLED: { label: "Đã tuyển xong", className: "bg-primary/10 text-primary" },
  CANCELLED: { label: "Đã hủy", className: "bg-danger/10 text-danger" },
};

const jobPriorityMeta: Record<JobPriority, { label: string; className: string }> = {
  LOW: { label: "Ưu tiên thấp", className: "bg-muted/20 text-muted" },
  MEDIUM: { label: "Ưu tiên vừa", className: "bg-primary/10 text-primary" },
  HIGH: { label: "Ưu tiên cao", className: "bg-warning/10 text-warning" },
  URGENT: { label: "Khẩn cấp", className: "bg-danger/10 text-danger" },
};

function formatJobFee(value: number | null, feeType: FeeType | null) {
  if (value == null) {
    return "Chưa cấu hình phí";
  }

  if (feeType === "PERCENTAGE") {
    return `${value}% phí`;
  }

  return formatVnd(value);
}

export default async function ClientDetailPage({ params }: PageProps) {
  const scope = await requireViewerScope();
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (isNaN(id)) notFound();

  const client = await getClientById(id, scope);
  if (!client) notFound();
  const revenueSummary = await getClientRevenueSummary(id, new Date(), scope);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link href="/clients" className="inline-flex items-center text-sm font-medium text-muted hover:text-foreground transition mb-4">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Danh sách doanh nghiệp
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{client.companyName}</h1>
              <p className="mt-1 text-sm text-muted">
                Tạo ngày {client.createdAt.toLocaleDateString("vi-VN")}
                {client.createdBy && ` bởi ${client.createdBy.name}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 sm:mt-0 pt-8 sm:pt-4">
          <DeleteClientButton id={client.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <BadgeDollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-foreground">
                {formatVnd(revenueSummary.totalRevenue)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Gồm headhunt revenue đã chốt và revenue subscription liên kết.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Job Orders</p>
              <p className="text-2xl font-bold text-foreground">{revenueSummary.totalJobs}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            {revenueSummary.openJobs} job đang mở cho client này.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Headhunt revenue</p>
              <p className="text-2xl font-bold text-foreground">
                {formatVnd(revenueSummary.headhuntRevenueTotal)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            {revenueSummary.placementCount} placements, {revenueSummary.placementsThisMonth} placements trong tháng này.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Subscription revenue</p>
              <p className="text-2xl font-bold text-foreground">
                {formatVnd(revenueSummary.subscriptionRevenue)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            {revenueSummary.linkedSubscription
              ? `Linked với ${revenueSummary.linkedSubscription.employerName}`
              : "Chưa linked employer có subscription active."}
          </p>
        </div>
      </div>

      {revenueSummary.linkedSubscription ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">
            Subscription linked: {revenueSummary.linkedSubscription.tier}
          </p>
          <p className="mt-1 text-sm text-muted">
            Employer: {revenueSummary.linkedSubscription.employerName} • Hết hạn{" "}
            {formatDate(revenueSummary.linkedSubscription.endDate)} • Giá trị{" "}
            {formatVnd(revenueSummary.linkedSubscription.price)}
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Job Orders của client</h2>
            <p className="mt-1 text-sm text-muted">
              Xem nhanh các vị trí đang chạy cho {client.companyName}.
            </p>
          </div>
          <Link
            href={`/jobs?clientId=${client.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary-hover"
          >
            Xem trong danh sách jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {client.jobOrders && client.jobOrders.length > 0 ? (
          <div className="mt-4 space-y-3">
            {client.jobOrders.map((job) => {
              const statusMeta = jobStatusMeta[job.status];
              const priorityMeta = jobPriorityMeta[job.priority];

              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block rounded-xl border border-border bg-background px-4 py-4 transition hover:border-primary/30 hover:bg-surface"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-semibold text-foreground">
                          {job.title}
                        </p>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityMeta.className}`}
                        >
                          {priorityMeta.label}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                        <span>{job._count?.candidates ?? 0} ứng viên trong pipeline</span>
                        <span>Deadline: {job.deadline ? formatDate(job.deadline) : "Chưa cập nhật"}</span>
                        <span>Phí: {formatJobFee(job.fee, job.feeType ?? null)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted">
                      Tạo ngày {formatDate(job.createdAt)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted">
            Client này chưa có Job Order nào.
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: General Info */}
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-surface shadow-sm p-6">
            <ClientForm initialData={client} />
          </div>
        </div>

        {/* Right: Contacts */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface shadow-sm p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h2 className="text-base font-semibold text-foreground">Người liên hệ</h2>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {client.contacts.length}
              </span>
            </div>
            <ClientContacts
              clientId={client.id}
              contacts={client.contacts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
