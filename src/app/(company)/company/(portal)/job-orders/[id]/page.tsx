import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Users,
} from "lucide-react";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Job Order - Company Portal" };

const statusMeta: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "bg-emerald-100 text-emerald-700" },
  PAUSED: { label: "Paused", className: "bg-amber-100 text-amber-700" },
  FILLED: { label: "Filled", className: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-700" },
};

function formatDate(value: Date | null) {
  if (!value) return "Chua dat";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function formatFee(fee: number | null, feeType: string | null) {
  if (fee == null || !feeType) return "Chua cong bo";
  if (feeType === "PERCENTAGE") return `${fee}%`;
  return new Intl.NumberFormat("vi-VN").format(fee);
}

export default async function CompanyJobOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCompanyPortalSession();
  if (!session.capabilities.client) notFound();

  const { id } = await params;
  const jobOrderId = Number(id);
  if (!Number.isInteger(jobOrderId)) notFound();

  const order = await prisma.jobOrder.findFirst({
    where: {
      id: jobOrderId,
      client: {
        workspace: { id: session.workspaceId },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      industry: true,
      location: true,
      industrialZone: true,
      requiredSkills: true,
      salaryMin: true,
      salaryMax: true,
      quantity: true,
      priority: true,
      deadline: true,
      openDate: true,
      status: true,
      fee: true,
      feeType: true,
      notes: true,
      candidates: {
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 50,
        select: {
          id: true,
          stage: true,
          result: true,
          interviewDate: true,
          updatedAt: true,
          candidate: {
            select: {
              fullName: true,
              email: true,
              phone: true,
              currentPosition: true,
              cvFileUrl: true,
              cvFileName: true,
            },
          },
          feedback: {
            where: { workspaceId: session.workspaceId },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              decision: true,
              message: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!order) notFound();

  const status = statusMeta[order.status] ?? statusMeta.OPEN;

  return (
    <div className="space-y-6">
      <Link
        href="/company/job-orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Job Orders
      </Link>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Briefcase className="h-5 w-5" />
              <p className="text-sm font-semibold uppercase tracking-wide">Job Order</p>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-foreground">{order.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                {status.label}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {order.priority}
              </span>
            </div>
          </div>
        </div>

        {order.description ? (
          <p className="mt-5 whitespace-pre-line text-sm leading-6 text-muted">{order.description}</p>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Info icon={MapPin} label="Location" value={order.location ?? "Chua dat"} />
          <Info icon={Calendar} label="Deadline" value={formatDate(order.deadline)} />
          <Info icon={Users} label="Quantity" value={`${order.quantity} vi tri`} />
          <Info icon={DollarSign} label="Fee" value={formatFee(order.fee, order.feeType)} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">Scope</p>
            <div className="mt-2 space-y-1 text-sm text-muted">
              {order.industry ? <p>Industry: {order.industry}</p> : null}
              {order.industrialZone ? <p>KCN: {order.industrialZone}</p> : null}
              <p>Open date: {formatDate(order.openDate)}</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">Required skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {order.requiredSkills.length > 0 ? (
                order.requiredSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted">Chua co skill.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Submissions ({order.candidates.length})</h2>
          <p className="mt-1 text-sm text-muted">
            View-only candidate list. Feedback cua client duoc luu rieng va khong tu dong doi CRM stage/result.
          </p>
        </div>
        <div className="divide-y divide-border">
          {order.candidates.map((submission) => (
            <div key={submission.id} className="p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-foreground">{submission.candidate.fullName}</p>
                  <p className="mt-1 text-sm text-muted">
                    {submission.candidate.currentPosition ?? "Chua co vi tri hien tai"}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {submission.candidate.email} {submission.candidate.phone ? `- ${submission.candidate.phone}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {submission.stage}
                  </span>
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {submission.result}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {submission.candidate.cvFileUrl ? (
                  <a
                    href={submission.candidate.cvFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {submission.candidate.cvFileName ?? "View CV"}
                  </a>
                ) : null}
                {submission.interviewDate ? (
                  <span className="text-muted">Interview: {formatDate(submission.interviewDate)}</span>
                ) : null}
              </div>
              {submission.feedback[0] ? (
                <div className="mt-3 rounded-lg bg-background px-3 py-2 text-sm text-muted">
                  Latest feedback: {submission.feedback[0].decision ?? "No decision"}
                  {submission.feedback[0].message ? ` - ${submission.feedback[0].message}` : ""}
                </div>
              ) : null}
            </div>
          ))}
          {order.candidates.length === 0 ? (
            <div className="p-10 text-center text-muted">Chua co submission nao cho job order nay.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
