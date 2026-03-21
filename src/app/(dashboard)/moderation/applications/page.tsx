import { getApplicationsForImport } from "@/lib/moderation-actions";
import Link from "next/link";
import { FileDown, Clock, User, Mail, Phone, Briefcase, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ImportButton } from "./import-button";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  NEW: { label: "Mới", className: "bg-blue-100 text-blue-700" },
  REVIEWED: { label: "Đã xem", className: "bg-amber-100 text-amber-700" },
  SHORTLISTED: { label: "Chọn lọc", className: "bg-purple-100 text-purple-700" },
  REJECTED: { label: "Từ chối", className: "bg-red-100 text-red-700" },
  IMPORTED: { label: "Đã import", className: "bg-emerald-100 text-emerald-700" },
};

export const metadata = { title: "Applications — CRM Integration" };

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "NEW";
  const page = parseInt(params.page || "1");
  const data = await getApplicationsForImport(status, page);

  const filters = [
    { value: "NEW", label: "Mới" },
    { value: "REVIEWED", label: "Đã xem" },
    { value: "SHORTLISTED", label: "Chọn lọc" },
    { value: "IMPORTED", label: "Đã import" },
    { value: "ALL", label: "Tất cả" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <FileDown className="h-7 w-7 text-primary" />
          Import Applications → CRM
        </h1>
        <p className="text-muted mt-1">
          {data.total} đơn ứng tuyển từ FDIWork. Import vào CRM Candidates để quản lý.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={`/moderation/applications?status=${f.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              status === f.value
                ? "bg-primary text-white shadow-sm"
                : "bg-surface text-muted border border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      {data.applications.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <FileDown className="h-12 w-12 text-muted/30 mx-auto mb-4" />
          <p className="text-muted">Không có đơn ứng tuyển nào ở trạng thái này.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">
                    <User className="h-3.5 w-3.5 inline mr-1" />Ứng viên
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">
                    <Briefcase className="h-3.5 w-3.5 inline mr-1" />Vị trí ứng tuyển
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">
                    <Building2 className="h-3.5 w-3.5 inline mr-1" />Công ty
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Trạng thái</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">
                    <Clock className="h-3.5 w-3.5 inline mr-1" />Ngày nộp
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.applications.map((app) => {
                  const statusCfg = STATUS_CONFIG[app.status] ?? { label: app.status, className: "bg-gray-100 text-gray-600" };
                  return (
                    <tr key={app.id} className="border-b border-border/50 hover:bg-background/50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{app.fullName}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted">
                          {app.email && (
                            <span className="flex items-center gap-0.5">
                              <Mail className="h-3 w-3" />{app.email}
                            </span>
                          )}
                          {app.phone && (
                            <span className="flex items-center gap-0.5">
                              <Phone className="h-3 w-3" />{app.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">{app.jobPosting.title}</td>
                      <td className="py-3 px-4 text-muted">{app.jobPosting.employer.companyName}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted">
                        {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true, locale: vi })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {app.status === "IMPORTED" && app.candidate ? (
                          <Link
                            href={`/candidates/${app.candidate.id}`}
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline font-medium"
                          >
                            UV #{app.candidate.id}
                          </Link>
                        ) : app.status !== "REJECTED" ? (
                          <ImportButton applicationId={app.id} />
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/moderation/applications?status=${status}&page=${p}`}
              className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                p === page
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-muted hover:border-primary/30"
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
