import { requireAdmin } from "@/lib/authz";
import { listWorkspaces } from "@/lib/workspace";
import Link from "next/link";
import {
    Building,
    Globe,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

export const metadata = {
    title: "Công ty — Headhunt Manager",
};

const statusMeta: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Hoạt động", className: "bg-emerald-100 text-emerald-700" },
    PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
    SUSPENDED: { label: "Bị khóa", className: "bg-red-100 text-red-700" },
};

interface PageProps {
    searchParams: Promise<{
        page?: string;
        q?: string;
        filter?: string;
    }>;
}

export default async function CompaniesPage({ searchParams }: PageProps) {
    await requireAdmin();
    const sp = await searchParams;
    const page = Number(sp.page ?? 1);

    const result = await listWorkspaces(page, 20);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Công ty</h1>
                    <p className="mt-1 text-sm text-muted">
                        {result.total > 0
                            ? `${result.total} công ty trong hệ thống`
                            : "Chưa có công ty nào. Chạy backfill hoặc tạo workspace mới."}
                    </p>
                </div>
            </div>

            {/* Company List */}
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="px-4 py-3 text-left font-medium text-muted">Công ty</th>
                            <th className="px-4 py-3 text-left font-medium text-muted">Trạng thái</th>
                            <th className="px-4 py-3 text-left font-medium text-muted">Loại</th>
                            <th className="px-4 py-3 text-left font-medium text-muted">Portal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {result.items.map((ws) => {
                            const status = statusMeta[ws.status] ?? statusMeta.ACTIVE;
                            const facets: string[] = [];
                            if (ws.employer) facets.push("FDI Employer");
                            if (ws.client) facets.push("CRM Client");
                            if (facets.length === 0) facets.push("Chưa liên kết");

                            return (
                                <tr key={ws.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/companies/${ws.id}`}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            {ws.displayName}
                                        </Link>
                                        <p className="text-xs text-muted mt-0.5">/{ws.slug}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                                        >
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {facets.map((f) => (
                                                <span
                                                    key={f}
                                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700"
                                                >
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {ws.portalEnabled ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                                <Globe className="h-3.5 w-3.5" />
                                                Bật
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted">Tắt</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {result.items.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-12 text-center text-muted">
                                    <Building className="mx-auto h-10 w-10 mb-2 opacity-40" />
                                    Chưa có workspace nào. Chạy backfill script để tạo.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {result.totalPages > 1 && (
                <Pagination
                    currentPage={result.page}
                    totalPages={result.totalPages}
                    total={result.total}
                    pageSize={result.pageSize}
                />
            )}
        </div>
    );
}
