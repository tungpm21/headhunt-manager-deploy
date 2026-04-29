import { requireAdmin } from "@/lib/authz";
import {
    listWorkspaces,
    type WorkspacePortalFilter,
    type WorkspaceRoleFilter,
} from "@/lib/workspace";
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
        role?: string;
        portal?: string;
        missing?: string;
    }>;
}

const roleFilters: Array<{ value: WorkspaceRoleFilter; label: string }> = [
    { value: "all", label: "Tất cả" },
    { value: "employer", label: "Nhà tuyển dụng" },
    { value: "client", label: "Đối tác CRM" },
    { value: "both", label: "Cả hai" },
    { value: "unlinked", label: "Chưa liên kết" },
];

const portalFilters: Array<{ value: WorkspacePortalFilter; label: string }> = [
    { value: "all", label: "Tất cả portal" },
    { value: "enabled", label: "Đã bật portal" },
    { value: "disabled", label: "Chưa bật portal" },
];

function normalizeRole(value: string | undefined): WorkspaceRoleFilter {
    return roleFilters.some((item) => item.value === value)
        ? (value as WorkspaceRoleFilter)
        : "all";
}

function normalizePortal(value: string | undefined): WorkspacePortalFilter {
    return portalFilters.some((item) => item.value === value)
        ? (value as WorkspacePortalFilter)
        : "all";
}

function filterHref(params: {
    role?: WorkspaceRoleFilter;
    portal?: WorkspacePortalFilter;
    q?: string;
}) {
    const query = new URLSearchParams();
    if (params.role && params.role !== "all") query.set("role", params.role);
    if (params.portal && params.portal !== "all") query.set("portal", params.portal);
    if (params.q) query.set("q", params.q);
    const suffix = query.toString();
    return `/companies${suffix ? `?${suffix}` : ""}`;
}

export default async function CompaniesPage({ searchParams }: PageProps) {
    await requireAdmin();
    const sp = await searchParams;
    const page = Math.max(1, Number(sp.page ?? 1) || 1);
    const role = normalizeRole(sp.role);
    const portal = normalizePortal(sp.portal);
    const q = sp.q?.trim() ?? "";

    const result = await listWorkspaces(page, 20, { q, role, portal });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground">Công ty</h1>
                        <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted">
                            Company Workspace
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                        {result.total > 0
                            ? `${result.total} công ty trong hệ thống`
                            : "Chưa có công ty nào khớp bộ lọc hiện tại."}
                    </p>
                </div>
            </div>

            {sp.missing ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Không tìm thấy Company Workspace cho bản ghi cũ: {sp.missing}. Hãy kiểm tra lại backfill hoặc liên kết workspace.
                </div>
            ) : null}

            <form className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Tìm theo tên công ty, slug, nhà tuyển dụng hoặc đối tác CRM"
                        className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <select
                        name="role"
                        defaultValue={role}
                        className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                        {roleFilters.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                    <select
                        name="portal"
                        defaultValue={portal}
                        className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                        {portalFilters.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary-hover"
                    >
                        Lọc
                    </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {roleFilters.map((item) => (
                        <Link
                            key={item.value}
                            href={filterHref({ role: item.value, portal, q })}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                role === item.value
                                    ? "border-primary bg-primary text-white"
                                    : "border-border text-muted hover:text-foreground"
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </form>

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
                            if (ws.employer) facets.push("Nhà tuyển dụng FDIWork");
                            if (ws.client) facets.push("Đối tác CRM");
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
                                    Chưa có công ty nào. Chạy backfill script để tạo workspace từ dữ liệu cũ.
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
