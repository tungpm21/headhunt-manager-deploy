"use client";

import { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { PackageInlineRow, type PackageSubscriptionRowData } from "./package-inline-row";

type PackageTableMode = "preview" | "edit";

export function PackageSubscriptionTable({
  subscriptions,
}: {
  subscriptions: PackageSubscriptionRowData[];
}) {
  const [mode, setMode] = useState<PackageTableMode>("preview");

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border bg-background px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Danh sách gói đang cấp</h2>
          <p className="mt-1 text-xs text-muted">
            Preview để rà soát nhanh trạng thái gói. Chuyển sang Edit khi cần cập nhật quota, giá, hạn hoặc quyền lợi.
          </p>
        </div>
        <div className="inline-flex w-fit rounded-xl border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
              mode === "preview" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
              mode === "edit" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted">Công ty</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-muted">Gói</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-muted">Quota</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-muted">Giá</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-muted">Ngày/tin</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-muted">Hết hạn</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-muted">Trạng thái</th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase text-muted">Quyền lợi</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted">
                {mode === "edit" ? "Lưu" : "Thao tác"}
              </th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <PackageInlineRow
                key={subscription.id}
                mode={mode}
                subscription={subscription}
                onEditMode={() => setMode("edit")}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
