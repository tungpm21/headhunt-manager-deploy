import { getEmployers } from "@/lib/moderation-actions";
import Link from "next/link";
import { UserCog, MapPin, Globe, Info, Search } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { EmployerStatusActions } from "./employer-status-actions";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Hoạt động", className: "bg-emerald-100 text-emerald-700" },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  SUSPENDED: { label: "Bị khóa", className: "bg-red-100 text-red-700" },
};

export default async function EmployersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "ALL";
  const query = params.q?.trim() || "";
  const page = parseInt(params.page || "1");
  const data = await getEmployers(status, page, query);

  const filters = [
    { value: "ALL", label: "Tất cả" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "SUSPENDED", label: "Bị khóa" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <UserCog className="h-7 w-7 text-primary" />
          Quản lý Nhà tuyển dụng
        </h1>
        <p className="text-muted mt-1">{data.total} nhà tuyển dụng</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <Link
              key={f.value}
              href={`/employers?status=${f.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${status === f.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface text-muted border border-border hover:border-primary/30 hover:text-foreground"
                }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <form action="/employers" className="relative w-full lg:w-96">
          <input type="hidden" name="status" value={status} />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Tìm tên, email hoặc #ID employer"
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="bg-background border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Công ty</th>
                <th className="hidden py-3 px-4 text-left text-xs font-medium uppercase text-muted lg:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Gói</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Tin đăng</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">
                  <span
                    className="inline-flex items-center gap-1"
                    title="Liên kết với Khách hàng trong CRM để track hợp đồng headhunt"
                  >
                    Link Client
                    <Info className="h-3.5 w-3.5 normal-case" />
                  </span>
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Trạng thái</th>
                <th className="hidden py-3 px-4 text-left text-xs font-medium uppercase text-muted xl:table-cell">Ngày tạo</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.employers.map((emp: {
                id: number;
                companyName: string;
                slug: string;
                status: string;
                industry: string | null;
                address: string | null;
                email: string;
                createdAt: Date;
                subscription: {
                  tier: string;
                  jobsUsed: number;
                  jobQuota: number;
                } | null;
                client: {
                  id: number;
                  companyName: string;
                } | null;
                _count: {
                  jobPostings: number;
                };
              }) => {
                const statusCfg = STATUS_CONFIG[emp.status] ?? { label: emp.status, className: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={emp.id} className="border-b border-border/50 hover:bg-background/50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            #{emp.id}
                          </span>
                          <Link
                            href={`/employers/${emp.id}`}
                            className="font-medium text-foreground transition hover:text-primary"
                          >
                            {emp.companyName}
                          </Link>
                          {emp.status === "ACTIVE" && (
                            <Link
                              href={`/cong-ty/${emp.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary transition hover:text-primary/80"
                              title="Xem trang công ty trên FDIWork"
                            >
                              <Globe className="h-3.5 w-3.5" />
                              <span className="sr-only">Xem trang công ty</span>
                            </Link>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted">
                          {emp.industry && <span>{emp.industry}</span>}
                          {emp.address && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />
                              {emp.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted lg:table-cell">{emp.email}</td>
                    <td className="py-3 px-4">
                      {emp.subscription ? (
                        <span className="text-xs font-medium text-primary">
                          {emp.subscription.tier} ({emp.subscription.jobsUsed}/{emp.subscription.jobQuota})
                        </span>
                      ) : (
                        <span className="text-xs text-muted">Chưa có</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{emp._count.jobPostings}</td>
                    <td className="py-3 px-4 text-sm">
                      {emp.client ? (
                        <Link
                          href={`/clients/${emp.client.id}`}
                          className="font-medium text-primary transition hover:text-primary/80 hover:underline"
                        >
                          {emp.client.companyName}
                        </Link>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted xl:table-cell">
                      {format(new Date(emp.createdAt), "dd/MM/yyyy", { locale: vi })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <EmployerStatusActions employerId={emp.id} currentStatus={emp.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/employers?status=${status}&page=${p}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${p === page ? "bg-primary text-white" : "bg-surface border border-border text-muted hover:border-primary/30"
                }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
