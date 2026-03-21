"use client";

import { updateEmployerStatus } from "@/lib/moderation-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EmployerStatusActions({
  employerId,
  currentStatus,
}: {
  employerId: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpdate(newStatus: string) {
    setLoading(true);
    const result = await updateEmployerStatus(employerId, newStatus);
    if (!result.success) alert(result.message);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {currentStatus === "PENDING" && (
        <button
          onClick={() => handleUpdate("ACTIVE")}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all"
        >
          Duyệt
        </button>
      )}
      {currentStatus === "ACTIVE" && (
        <button
          onClick={() => handleUpdate("SUSPENDED")}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-all"
        >
          Khóa
        </button>
      )}
      {currentStatus === "SUSPENDED" && (
        <button
          onClick={() => handleUpdate("ACTIVE")}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all"
        >
          Mở khóa
        </button>
      )}
    </div>
  );
}
