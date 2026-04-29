import Link from "next/link";
import { JobStatus, Prisma } from "@prisma/client";
import {
  Briefcase,
  Calendar,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Job Orders - Company Portal" };

const PAGE_SIZE = 25;
const STATUS_VALUES = new Set<string>(Object.values(JobStatus));

const statusMeta: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "bg-emerald-100 text-emerald-700" },
  PAUSED: { label: "Paused", className: "bg-amber-100 text-amber-700" },
  FILLED: { label: "Filled", className: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-700" },
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
  }>;
}

function parsePositiveInt(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeStatus(value: string | undefined) {
  return value && STATUS_VALUES.has(value) ? value : "ALL";
}

function formatDate(value: Date | null) {
  if (!value) return "Chua dat";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

export default async function CompanyJobOrdersPage({ searchParams }: PageProps) {
  const session = await requireCompanyPortalSession();

  if (!session.capabilities.client) {
    return (
      <div className="rounded-xl border border-border bg-surface p-12 text-center text-muted">
        <Briefcase className="mx-auto mb-3 h-10 w-10 opacity-40" />
        <p className="text-lg font-medium text-foreground">Workspace chua lien ket Client</p>
        <p className="mt-1 text-sm">Lien he admin de bat tinh nang Job Orders.</p>
      </div>
    );
  }

  const params = await searchParams;
  const page = Math.max(1, parsePositiveInt(params.page) ?? 1);
  const status = normalizeStatus(params.status);
  const keyword = params.q?.trim() ?? "";

  const where: Prisma.JobOrderWhereInput = {
    client: {
      workspace: { id: session.workspaceId },
    },
    ...(status !== "ALL" ? { status: status as JobStatus } : {}),
    ...(keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { industry: { contains: keyword, mode: "insensitive" } },
            { location: { contains: keyword, mode: "insensitive" } },
            { industrialZone: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [orders, total, groupedStatuses] = await Promise.all([
    prisma.jobOrder.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        industry: true,
        location: true,
        industrialZone: true,
        quantity: true,
        deadline: true,
        feeType: true,
        fee: true,
        _count: { select: { candidates: true } },
      },
    }),
    prisma.jobOrder.count({ where }),
    prisma.jobOrder.groupBy({
      by: ["status"],
      where: {
        client: {
          workspace: { id: session.workspaceId },
        },
      },
      _count: { _all: true },
    }),
  ]);

  const statusCounts = Object.fromEntries(
    groupedStatuses.map((item) => [item.status, item._count._all])
  );
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
          <Briefcase className="h-7 w-7 text-primary" />
          Job Orders
        </h1>
        <p className="mt-1 text-sm text-muted">
          View-only danh sach job orders dang duoc FDIWork xu ly cho cong ty.
        </p>
      </div>

      <form className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              defaultValue={keyword}
              placeholder="Tim title, industry, location, KCN"
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <select
            name="status"
            defaultValue={status}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="ALL">All status</option>
            {Object.keys(statusMeta).map((value) => (
              <option key={value} value={value}>
                {statusMeta[value].label} ({statusCounts[value] ?? 0})
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            Loc
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted">Order</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Deadline</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Submissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => {
              const meta = statusMeta[order.status] ?? statusMeta.OPEN;
              return (
                <tr key={order.id} className="transition hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <Link
                      href={`/company/job-orders/${order.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {order.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
                      {order.industry ? <span>{order.industry}</span> : null}
                      {order.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {order.location}
                        </span>
                      ) : null}
                      {order.industrialZone ? <span>{order.industrialZone}</span> : null}
                      <span>{order.quantity} vi tri</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                      {meta.label}
                    </span>
                    <p className="mt-1 text-xs text-muted">{order.priority}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(order.deadline)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-muted">
                      <Users className="h-3.5 w-3.5" />
                      {order._count.candidates}
                    </span>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted">
                  <Briefcase className="mx-auto mb-2 h-10 w-10 opacity-40" />
                  Chua co job order nao.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
        />
      ) : null}
    </div>
  );
}
