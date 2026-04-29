"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  ShieldCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import {
  createCompanyPortalUserAction,
  resetCompanyPortalUserPasswordAction,
  toggleCompanyPortalUserActiveAction,
  updateCompanyPortalUserRoleAction,
  type CompanyPortalUserActionState,
} from "@/lib/company-portal-user-actions";
import { cn } from "@/lib/utils";

type PortalRole = "OWNER" | "MEMBER" | "VIEWER";

export type CompanyPortalUserRow = {
  id: number;
  email: string;
  name: string | null;
  role: PortalRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

const ROLE_OPTIONS: { value: PortalRole; label: string; hint: string }[] = [
  {
    value: "OWNER",
    label: "Owner",
    hint: "Toàn quyền, gồm quản lý người dùng.",
  },
  {
    value: "MEMBER",
    label: "Member",
    hint: "Thao tác nghiệp vụ theo quyền workspace.",
  },
  {
    value: "VIEWER",
    label: "Viewer",
    hint: "Chỉ xem dữ liệu portal.",
  },
];

function formatDateTime(value: string | null) {
  if (!value) return "Chưa đăng nhập";
  return new Date(value).toLocaleString("vi-VN");
}

function RoleBadge({ role }: { role: PortalRole }) {
  const className =
    role === "OWNER"
      ? "bg-primary/10 text-primary"
      : role === "MEMBER"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-slate-100 text-slate-700";

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", className)}>
      {role}
    </span>
  );
}

function ActionMessage({ message }: { message: CompanyPortalUserActionState | undefined }) {
  if (!message?.error && !message?.success) return null;

  const isSuccess = Boolean(message.success);
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md px-3 py-2 text-sm",
        isSuccess ? "bg-emerald-50 text-emerald-700" : "bg-danger/10 text-danger"
      )}
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

export function CompanyPortalUsersManager({
  workspaceName,
  currentUserId,
  users,
}: {
  workspaceName: string;
  currentUserId: number;
  users: CompanyPortalUserRow[];
}) {
  const router = useRouter();
  const [createState, createAction, isCreating] = useActionState(
    createCompanyPortalUserAction,
    undefined
  );
  const [actionMessage, setActionMessage] = useState<CompanyPortalUserActionState>();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function runRowAction(
    key: string,
    action: () => Promise<CompanyPortalUserActionState>
  ) {
    setPendingKey(key);
    setActionMessage(undefined);
    startTransition(() => {
      void action()
        .then((result) => {
          setActionMessage(result);
          router.refresh();
        })
        .catch(() => {
          setActionMessage({ error: "Không thể cập nhật người dùng. Vui lòng thử lại." });
        })
        .finally(() => setPendingKey(null));
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-wider">Người dùng portal</p>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-foreground">{workspaceName}</h1>
          <p className="mt-1 text-sm text-muted">
            Quản lý tài khoản đăng nhập cho cùng một Company Workspace.
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted">
          {users.length} tài khoản
        </div>
      </div>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Thêm người dùng</h2>
        </div>

        <form action={createAction} className="grid gap-4 lg:grid-cols-[1fr_1fr_180px_auto]">
          <div>
            <label htmlFor="portal-user-name" className="mb-1 block text-sm font-medium text-foreground">
              Tên hiển thị
            </label>
            <input
              id="portal-user-name"
              name="name"
              type="text"
              maxLength={120}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="VD: HR Manager"
            />
          </div>

          <div>
            <label htmlFor="portal-user-email" className="mb-1 block text-sm font-medium text-foreground">
              Email đăng nhập
            </label>
            <input
              id="portal-user-email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="hr@company.com"
            />
          </div>

          <div>
            <label htmlFor="portal-user-role" className="mb-1 block text-sm font-medium text-foreground">
              Role
            </label>
            <select
              id="portal-user-role"
              name="role"
              defaultValue="MEMBER"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="portal-user-password" className="mb-1 block text-sm font-medium text-foreground">
              Mật khẩu tạm
            </label>
            <div className="flex gap-2">
              <input
                id="portal-user-password"
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full min-w-[180px] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Ít nhất 8 ký tự"
              />
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Tạo
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4">
          <ActionMessage message={createState} />
        </div>
      </section>

      <ActionMessage message={actionMessage} />

      <div className="space-y-3">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const statusKey = `status-${user.id}`;
          const roleKey = `role-${user.id}`;
          const passwordKey = `password-${user.id}`;
          const isBusy = pendingKey?.endsWith(`-${user.id}`);

          return (
            <article
              key={user.id}
              className="rounded-lg border border-border bg-surface p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-semibold text-foreground">
                      {user.name || user.email}
                    </h2>
                    <RoleBadge role={user.role} />
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        user.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {user.isActive ? "Đang hoạt động" : "Đã khóa"}
                    </span>
                    {isSelf ? (
                      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        Bạn
                      </span>
                    ) : null}
                  </div>

                  <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
                    <p className="break-all">{user.email}</p>
                    <p>Đăng nhập cuối: {formatDateTime(user.lastLoginAt)}</p>
                    <p>Tạo ngày: {formatDateTime(user.createdAt)}</p>
                  </div>
                </div>

                <div className="grid gap-3 xl:w-[560px]">
                  <form
                    className="grid gap-2 sm:grid-cols-[1fr_auto]"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const formData = new FormData(event.currentTarget);
                      const role = formData.get("role")?.toString() ?? user.role;
                      runRowAction(roleKey, () => updateCompanyPortalUserRoleAction(user.id, role));
                    }}
                  >
                    <select
                      name="role"
                      defaultValue={user.role}
                      disabled={isSelf || isBusy}
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={isSelf || isBusy}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15 disabled:opacity-60"
                    >
                      {pendingKey === roleKey ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                      Lưu role
                    </button>
                  </form>

                  <form
                    className="grid gap-2 sm:grid-cols-[1fr_auto]"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const form = event.currentTarget;
                      const formData = new FormData(form);
                      const password = formData.get("password")?.toString() ?? "";
                      runRowAction(passwordKey, async () => {
                        const result = await resetCompanyPortalUserPasswordAction(user.id, password);
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
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
                      placeholder="Mật khẩu mới"
                    />
                    <button
                      type="submit"
                      disabled={isBusy}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-border/50 disabled:opacity-60"
                    >
                      {pendingKey === passwordKey ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <KeyRound className="h-4 w-4" />
                      )}
                      Đổi mật khẩu
                    </button>
                  </form>

                  <button
                    type="button"
                    disabled={isSelf || isBusy}
                    onClick={() =>
                      runRowAction(statusKey, () =>
                        toggleCompanyPortalUserActiveAction(user.id, !user.isActive)
                      )
                    }
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-60",
                      user.isActive
                        ? "border border-danger/20 bg-danger/10 text-danger hover:bg-danger/15"
                        : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    )}
                  >
                    {pendingKey === statusKey ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Ma trận quyền</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {ROLE_OPTIONS.map((option) => (
            <div key={option.value} className="rounded-md border border-border bg-background p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{option.label}</p>
                <RoleBadge role={option.value} />
              </div>
              <p className="text-sm text-muted">{option.hint}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
