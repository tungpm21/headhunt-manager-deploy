"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Globe,
  Loader2,
  Shield,
  Unlink,
} from "lucide-react";
import {
  linkWorkspaceToClient,
  linkWorkspaceToEmployer,
  toggleWorkspacePortal,
  unlinkWorkspaceClient,
  unlinkWorkspaceEmployer,
} from "@/lib/workspace-actions";

type WorkspaceSummary = {
  id: number;
  displayName: string;
  portalEnabled: boolean;
  employer: {
    id: number;
    companyName: string;
    email: string;
    slug: string;
    status: string;
  } | null;
  client: {
    id: number;
    companyName: string;
    status: string;
    isDeleted: boolean;
  } | null;
};

export type MappingEmployerOption = {
  id: number;
  companyName: string;
  email: string;
  status: string;
  linkedWorkspaceId: number | null;
  linkedWorkspaceName: string | null;
  legacyClientId: number | null;
};

export type MappingClientOption = {
  id: number;
  companyName: string;
  status: string;
  linkedWorkspaceId: number | null;
  linkedWorkspaceName: string | null;
  legacyEmployerId: number | null;
  legacyEmployerName: string | null;
};

type ActionMessage = {
  tone: "success" | "error";
  text: string;
} | null;

function isBusy(pendingKey: string | null, key: string) {
  return pendingKey === key;
}

export function CompanyWorkspaceMappingPanel({
  workspace,
  employerOptions,
  clientOptions,
}: {
  workspace: WorkspaceSummary;
  employerOptions: MappingEmployerOption[];
  clientOptions: MappingClientOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<ActionMessage>(null);
  const [selectedEmployerId, setSelectedEmployerId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  const availableEmployerCount = useMemo(
    () =>
      employerOptions.filter(
        (option) =>
          !option.linkedWorkspaceId || option.linkedWorkspaceId === workspace.id
      ).length,
    [employerOptions, workspace.id]
  );
  const availableClientCount = useMemo(
    () =>
      clientOptions.filter(
        (option) =>
          !option.linkedWorkspaceId || option.linkedWorkspaceId === workspace.id
      ).length,
    [clientOptions, workspace.id]
  );

  function runAction(key: string, action: () => Promise<{ error?: string; success?: boolean }>) {
    setMessage(null);
    setPendingKey(key);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
      } else {
        setMessage({ tone: "success", text: "Đã cập nhật mapping workspace." });
        router.refresh();
      }
      setPendingKey(null);
    });
  }

  function linkEmployer() {
    const employerId = Number(selectedEmployerId);
    if (!Number.isInteger(employerId) || employerId <= 0) {
      setMessage({ tone: "error", text: "Chọn Employer trước khi liên kết." });
      return;
    }
    runAction("link-employer", () => linkWorkspaceToEmployer(workspace.id, employerId));
  }

  function linkClient() {
    const clientId = Number(selectedClientId);
    if (!Number.isInteger(clientId) || clientId <= 0) {
      setMessage({ tone: "error", text: "Chọn CRM Client trước khi liên kết." });
      return;
    }
    runAction("link-client", () => linkWorkspaceToClient(workspace.id, clientId));
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            message.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.tone === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Building2 className="h-5 w-5 text-blue-500" />
                FDI Employer
              </h3>
              <p className="mt-1 text-sm text-muted">
                Nguồn dữ liệu cho tin tuyển dụng, ứng tuyển và hồ sơ công ty public.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {availableEmployerCount} khả dụng
            </span>
          </div>

          {workspace.employer ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="font-semibold text-foreground">
                  {workspace.employer.companyName}
                </p>
                <p className="mt-1 text-sm text-muted">{workspace.employer.email}</p>
                <p className="mt-1 text-xs text-muted">/{workspace.employer.slug}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/employers/${workspace.employer.id}`}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  Mở Employer
                </Link>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction("unlink-employer", () =>
                      unlinkWorkspaceEmployer(workspace.id)
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                >
                  {isBusy(pendingKey, "unlink-employer") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="h-4 w-4" />
                  )}
                  Gỡ Employer
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <select
                value={selectedEmployerId}
                onChange={(event) => setSelectedEmployerId(event.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
              >
                <option value="">Chọn Employer để liên kết</option>
                {employerOptions.map((option) => {
                  const linkedElsewhere =
                    option.linkedWorkspaceId &&
                    option.linkedWorkspaceId !== workspace.id;
                  return (
                    <option
                      key={option.id}
                      value={option.id}
                      disabled={Boolean(linkedElsewhere)}
                    >
                      {option.companyName} · {option.email}
                      {linkedElsewhere
                        ? ` · đang thuộc ${option.linkedWorkspaceName}`
                        : ""}
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                disabled={isPending}
                onClick={linkEmployer}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
              >
                {isBusy(pendingKey, "link-employer") ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Liên kết Employer
              </button>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Shield className="h-5 w-5 text-purple-500" />
                CRM Client
              </h3>
              <p className="mt-1 text-sm text-muted">
                Nguồn dữ liệu cho job order, submission, hợp đồng và doanh thu CRM.
              </p>
            </div>
            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
              {availableClientCount} khả dụng
            </span>
          </div>

          {workspace.client ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="font-semibold text-foreground">
                  {workspace.client.companyName}
                </p>
                <p className="mt-1 text-sm text-muted">{workspace.client.status}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/clients/${workspace.client.id}`}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  Mở Client
                </Link>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction("unlink-client", () => unlinkWorkspaceClient(workspace.id))
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                >
                  {isBusy(pendingKey, "unlink-client") ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="h-4 w-4" />
                  )}
                  Gỡ Client
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <select
                value={selectedClientId}
                onChange={(event) => setSelectedClientId(event.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
              >
                <option value="">Chọn CRM Client để liên kết</option>
                {clientOptions.map((option) => {
                  const linkedElsewhere =
                    option.linkedWorkspaceId &&
                    option.linkedWorkspaceId !== workspace.id;
                  return (
                    <option
                      key={option.id}
                      value={option.id}
                      disabled={Boolean(linkedElsewhere)}
                    >
                      {option.companyName}
                      {linkedElsewhere
                        ? ` · đang thuộc ${option.linkedWorkspaceName}`
                        : ""}
                      {option.legacyEmployerName
                        ? ` · legacy: ${option.legacyEmployerName}`
                        : ""}
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                disabled={isPending}
                onClick={linkClient}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
              >
                {isBusy(pendingKey, "link-client") ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Liên kết Client
              </button>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Globe className="h-5 w-5 text-emerald-500" />
              Company Portal
            </h3>
            <p className="mt-1 text-sm text-muted">
              Bật portal sau khi mapping đúng Employer/Client để công ty đăng nhập và quản lý workflow tương ứng.
            </p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              runAction("toggle-portal", () =>
                toggleWorkspacePortal(workspace.id, !workspace.portalEnabled)
              )
            }
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
              workspace.portalEnabled
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {isBusy(pendingKey, "toggle-portal") ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {workspace.portalEnabled ? "Portal đang bật" : "Bật portal"}
          </button>
        </div>
      </section>
    </div>
  );
}
