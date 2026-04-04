"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { linkEmployerToClient } from "@/lib/moderation-actions";
import { Link2, Loader2, X } from "lucide-react";

type ClientOption = { id: number; companyName: string };

export function LinkEmployerForm({
  employerId,
  currentClientId,
  clients,
}: {
  employerId: number;
  currentClientId: number | null;
  clients: ClientOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>(
    currentClientId?.toString() || ""
  );
  const [message, setMessage] = useState("");
  const linkTitle = currentClientId
    ? `Đã liên kết với Client #${currentClientId}. Dùng để track hợp đồng headhunt trong CRM.`
    : "Liên kết với Khách hàng trong CRM để track hợp đồng headhunt.";

  useEffect(() => {
    setSelectedClientId(currentClientId?.toString() || "");
  }, [currentClientId]);

  async function handleSubmit() {
    setLoading(true);
    setMessage("");
    const clientId = selectedClientId ? parseInt(selectedClientId) : null;
    const res = await linkEmployerToClient(employerId, clientId);
    setMessage(res.message);
    setLoading(false);
    if (res.success) {
      setTimeout(() => {
        setOpen(false);
        setMessage("");
        router.refresh();
      }, 800);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
        title={linkTitle}
      >
        <Link2 className="h-3.5 w-3.5" />
        {currentClientId ? "Đổi Client" : "Link Client"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedClientId}
        onChange={(e) => setSelectedClientId(e.target.value)}
        className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground max-w-[140px]"
      >
        <option value="">-- Bỏ link --</option>
        {clients.length === 0 && (
          <option value="" disabled>
            Khong co client kha dung
          </option>
        )}
        {clients.map((c) => (
          <option key={c.id} value={c.id.toString()}>
            {c.companyName}
          </option>
        ))}
      </select>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-xs font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "OK"}
      </button>
      <button
        onClick={() => setOpen(false)}
        className="text-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {message && (
        <span
          className={`text-xs ${
            message.toLowerCase().includes("khong")
              ? "text-red-600"
              : "text-emerald-600"
          }`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
