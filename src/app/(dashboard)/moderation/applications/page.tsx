import { getApplicationsForImport } from "@/lib/moderation-actions";
import Link from "next/link";
import { FileDown } from "lucide-react";
import { ApplicationTable } from "./application-table";

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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${status === f.value
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
        <ApplicationTable applications={JSON.parse(JSON.stringify(data.applications))} />
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/moderation/applications?status=${status}&page=${p}`}
              className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${p === page
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

