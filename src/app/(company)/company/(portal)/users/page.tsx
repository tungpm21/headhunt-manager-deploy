import { ShieldAlert } from "lucide-react";
import {
  CompanyPortalUsersManager,
  type CompanyPortalUserRow,
} from "@/components/company/CompanyPortalUsersManager";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Người dùng - Company Portal" };

export default async function CompanyUsersPage() {
  const session = await requireCompanyPortalSession();

  if (!session.capabilities.manageUsers) {
    return (
      <div className="rounded-lg border border-border bg-surface px-6 py-12 text-center text-muted shadow-sm">
        <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-warning" />
        <p className="text-base font-semibold text-foreground">Chỉ Owner mới có quyền quản lý người dùng.</p>
        <p className="mt-1 text-sm">Tài khoản hiện tại vẫn có thể sử dụng các tab được cấp quyền trong portal.</p>
      </div>
    );
  }

  const [workspace, users] = await Promise.all([
    prisma.companyWorkspace.findUnique({
      where: { id: session.workspaceId },
      select: { id: true, displayName: true },
    }),
    prisma.companyPortalUser.findMany({
      where: { workspaceId: session.workspaceId },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
  ]);

  const serializedUsers: CompanyPortalUserRow[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <CompanyPortalUsersManager
      workspaceName={workspace?.displayName ?? `Workspace #${session.workspaceId}`}
      currentUserId={session.portalUserId}
      users={serializedUsers}
    />
  );
}
