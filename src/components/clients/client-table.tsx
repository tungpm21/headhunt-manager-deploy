import Link from "next/link";
import { Building2, Globe, Users, ChevronRight } from "lucide-react";
import { ClientWithRelations, CompanySize, ClientStatus } from "@/types/client";

const SIZE_LABELS: Record<CompanySize, string> = {
  SMALL: "Nhỏ",
  MEDIUM: "Vừa",
  LARGE: "Lớn",
  ENTERPRISE: "Tập đoàn",
};

const STATUS_CONFIG: Record<ClientStatus, { label: string; cls: string }> = {
  ACTIVE:      { label: "Hoạt động",  cls: "bg-success/10 text-success border-success/20" },
  INACTIVE:    { label: "Tạm ngừng", cls: "bg-muted/20 text-muted border-border" },
  BLACKLISTED: { label: "Blacklisted", cls: "bg-danger/10 text-danger border-danger/20" },
};

export function ClientTable({ clients }: { clients: ClientWithRelations[] }) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl border border-dashed">
        <Building2 className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">Không tìm thấy doanh nghiệp nào</p>
        <p className="text-sm text-gray-400 mt-1">Điều chỉnh bộ lọc hoặc thêm mới.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-900">
                Doanh nghiệp
              </th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-900">
                Lĩnh vực / Website
              </th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-900">
                Quy mô
              </th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-900">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-4 text-center font-semibold text-gray-900">
                Liên hệ
              </th>
              <th scope="col" className="relative px-6 py-4">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{client.companyName}</div>
                      <div className="text-gray-500 text-xs mt-0.5 max-w-[200px] truncate">
                        {client.address || "Chưa cập nhật địa chỉ"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-gray-900">{client.industry || "—"}</div>
                  {client.website && (
                    <div className="flex items-center text-xs text-blue-600 mt-0.5 hover:underline">
                      <Globe className="h-3 w-3 mr-1" />
                      <a href={client.website.startsWith("http") ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer">
                        {client.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {client.companySize ? (
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      {SIZE_LABELS[client.companySize]}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                {/* Status badge */}
                <td className="whitespace-nowrap px-6 py-4">
                  {(() => {
                    const cfg = STATUS_CONFIG[client.status];
                    return (
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    );
                  })()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full text-xs font-medium border">
                    <Users className="h-3.5 w-3.5" />
                    {client._count?.contacts || 0}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <Link
                    href={`/clients/${client.id}`}
                    className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition"
                  >
                    Chi tiết <ChevronRight className="h-4 w-4 ml-1 -mr-1 text-gray-400" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
