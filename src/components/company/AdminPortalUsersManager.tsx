"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound, Loader2, ShieldCheck, UserPlus, XCircle } from "lucide-react";
import {
  createAdminCompanyPortalUserAction,
  resetAdminCompanyPortalUserPasswordAction,
  toggleAdminCompanyPortalUserActiveAction,
  updateAdminCompanyPortalUserRoleAction,
  type AdminPortalUserActionState,
} from "@/lib/workspace-actions";

type PortalRole = "OWNER" | "MEMBER" | "VIEWER";

export type AdminPortalUserRow = {
  id: number;
  email: string;
  name: string | null;
  role: PortalRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const ROLE_OPTIONS: Array<{ value: PortalRole; label: string }> = [
  { value: "OWNER", label: "Owner" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

function formatDateTime(value: string | null) {
  if (!value) return "Chưa đăng nhập";
  return new Date(value).toLocaleString("vi-VN");
}

function ActionMessage({ message }: { message: AdminPortalUserActionState | undefined }) {
  if (!message?.error && !message?.success) return null;

  const isSuccess = Boolean(message.success);
  return (
    <div
      className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
        isSuccess ? "bg-emerald-50 text-emerald-700" : "bg-danger/10 text-danger"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <p>{message.success ?? message.error}</p>
    </div>
  );
}

export function AdminPortalUsersManager({
  workspaceId,
  users,
}: {
  workspaceId: number;
  users: AdminPortalUserRow[];
}) {
  const router = useRouter();
  const [createState, createAction, isCreating] = useActionState(
    createAdminCompanyPortalUserAction,
    undefined
  );
  const [rowMessage, setRowMessage] = useState<AdminPortalUserActionState>();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function runRowAction(key: string, action: () => Promise<AdminPortalUserActionState>) {
    setPendingKey(key);
    setRowMessage(undefined);
    startTransition(() => {
      void action()
        .then((result) => {
          setRowMessage(result);
          router.refresh();
        })
        .catch(() => {
          setRowMessage({ error: "Không thể cập nhật portal user." });
        })
        .finally(() => setPendingKey(null));
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Tạo portal user từ Admin CRM</h3>
        </div>
        <form action={createAction} className="grid gap-3 lg:grid-cols-[1fr_1fr_140px_1fr_auto]">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input
            name="name"
            type="text"
            placeholder="Tên hiển thị"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="email@company.com"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <select
            name="role"
            defaultValue="MEMBER"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <input
            name="password"
            type="password"
            minLength={8}
            required
            placeholder="Mật khẩu tạm"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Tạo
          </button>
        </form>
        <div className="mt-4">
          <ActionMessage message={createState} />
        </div>
      </section>

      <ActionMessage message={rowMessage} />

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-4 py-3 font-medium text-muted">Portal user</th>
              <th className="px-4 py-3 font-medium text-muted">Role</th>
              <th className="px-4 py-3 font-medium text-muted">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-muted">Mật khẩu</th>
              <th className="px-4 py-3 text-right font-medium text-muted">Hoạt động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => {
              const roleKey = `role-${user.id}`;
              const statusKey = `status-${user.id}`;
              const passwordKey = `password-${user.id}`;
              const isBusy = pendingKey?.endsWith(`-${user.id}`);

              return (
                <tr key={user.id} className="transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{user.name || user.email}</p>
                    <p className="mt-0.5 text-xs text-muted">{user.email}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      Login: {formatDateTime(user.lastLoginAt)} · Updated: {formatDateTime(user.updatedAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <form
                      className="flex items-center gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const role = new FormData(event.currentTarget).get("role")?.toString() ?? user.role;
                        runRowAction(roleKey, () => updateAdminCompanyPortalUserRoleAction(user.id, role));
                      }}
                    >
                      <select
                        name="role"
                        defaultValue={user.role}
                        disabled={isBusy}
                        className="h-9 rounded-md border border-border bg-background px-2 text-xs font-semibold outline-none focus:border-primary"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={isBusy}
                        className="inline-flex h-9 items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-3 text-xs font-semibold text-primary disabled:opacity-60"
                      >
                        {pendingKey === roleKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        Lưu
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        runRowAction(statusKey, () =>
                          toggleAdminCompanyPortalUserActiveAction(user.id, !user.isActive)
                        )
                      }
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-60 ${
                        user.isActive
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {pendingKey === statusKey ? "Đang lưu..." : user.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <form
                      className="flex items-center gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const form = event.currentTarget;
                        const password = new FormData(form).get("password")?.toString() ?? "";
                        runRowAction(passwordKey, async () => {
                          const result = await resetAdminCompanyPortalUserPasswordAction(user.id, password);
                          if (result.success) form.reset();
                          return result;
                        });
                      }}
                    >
                      <input
                        name="password"
                        type="password"
                        minLength={8}
                        disabled={isBusy}
                        placeholder="Mật khẩu mới"
                        className="h-9 w-44 rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        disabled={isBusy}
                        className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground disabled:opacity-60"
                      >
                        {pendingKey === passwordKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                        Reset
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted">
                    Tạo: {formatDateTime(user.createdAt)}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  Chưa có portal user. Admin có thể tạo Owner hoặc Member đầu tiên tại đây.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
