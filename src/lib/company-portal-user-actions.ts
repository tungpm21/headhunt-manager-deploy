"use server";

import { CompanyPortalRole } from "@prisma/client";
import { hash } from "bcrypt-ts";
import { revalidatePath } from "next/cache";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { prisma } from "@/lib/prisma";

export type CompanyPortalUserActionState = {
  error?: string;
  success?: string;
};

const ROLE_VALUES = new Set<string>(Object.values(CompanyPortalRole));

function normalizeEmail(value: FormDataEntryValue | null) {
  return value?.toString().trim().toLowerCase() ?? "";
}

function normalizeText(value: FormDataEntryValue | null, maxLength: number) {
  const normalized = value?.toString().trim() ?? "";
  return normalized ? normalized.slice(0, maxLength) : null;
}

function parseRole(value: unknown): CompanyPortalRole | null {
  const role = typeof value === "string" ? value.trim() : "";
  return ROLE_VALUES.has(role) ? (role as CompanyPortalRole) : null;
}

async function requireOwnerPortalSession() {
  const session = await requireCompanyPortalSession();
  if (!session.capabilities.manageUsers) {
    return { error: "Chỉ Owner mới có quyền quản lý người dùng." } as const;
  }
  return { session } as const;
}

async function ensureAnotherActiveOwner(workspaceId: number, excludedUserId: number) {
  const ownerCount = await prisma.companyPortalUser.count({
    where: {
      workspaceId,
      role: CompanyPortalRole.OWNER,
      isActive: true,
      id: { not: excludedUserId },
    },
  });

  return ownerCount > 0;
}

export async function createCompanyPortalUserAction(
  _prev: CompanyPortalUserActionState | undefined,
  formData: FormData
): Promise<CompanyPortalUserActionState> {
  const owner = await requireOwnerPortalSession();
  if ("error" in owner) return { error: owner.error };

  const email = normalizeEmail(formData.get("email"));
  const name = normalizeText(formData.get("name"), 120);
  const password = formData.get("password")?.toString() ?? "";
  const role = parseRole(formData.get("role")) ?? CompanyPortalRole.MEMBER;

  if (!email || !email.includes("@")) {
    return { error: "Email không hợp lệ." };
  }

  if (password.length < 8) {
    return { error: "Mật khẩu tạm thời cần ít nhất 8 ký tự." };
  }

  const existingUser = await prisma.companyPortalUser.findUnique({
    where: {
      workspaceId_email: {
        workspaceId: owner.session.workspaceId,
        email,
      },
    },
    select: { id: true },
  });

  if (existingUser) {
    return { error: "Email này đã tồn tại trong workspace." };
  }

  await prisma.companyPortalUser.create({
    data: {
      workspaceId: owner.session.workspaceId,
      email,
      name,
      role,
      password: await hash(password, 10),
      isActive: true,
    },
  });

  revalidatePath("/company/users");
  return { success: "Đã tạo người dùng portal." };
}

export async function updateCompanyPortalUserRoleAction(
  userId: number,
  nextRole: string
): Promise<CompanyPortalUserActionState> {
  const owner = await requireOwnerPortalSession();
  if ("error" in owner) return { error: owner.error };

  const role = parseRole(nextRole);
  if (!role) return { error: "Role không hợp lệ." };

  if (!Number.isInteger(userId) || userId <= 0) {
    return { error: "Người dùng không hợp lệ." };
  }

  const targetUser = await prisma.companyPortalUser.findFirst({
    where: {
      id: userId,
      workspaceId: owner.session.workspaceId,
    },
    select: { id: true, role: true, isActive: true },
  });

  if (!targetUser) {
    return { error: "Không tìm thấy người dùng trong workspace." };
  }

  if (targetUser.id === owner.session.portalUserId && role !== CompanyPortalRole.OWNER) {
    return { error: "Bạn không thể tự hạ quyền Owner của mình." };
  }

  if (
    targetUser.role === CompanyPortalRole.OWNER &&
    role !== CompanyPortalRole.OWNER &&
    targetUser.isActive
  ) {
    const hasAnotherOwner = await ensureAnotherActiveOwner(
      owner.session.workspaceId,
      targetUser.id
    );
    if (!hasAnotherOwner) {
      return { error: "Workspace cần ít nhất một Owner đang hoạt động." };
    }
  }

  await prisma.companyPortalUser.update({
    where: { id: targetUser.id },
    data: { role },
  });

  revalidatePath("/company/users");
  return { success: "Đã cập nhật role người dùng." };
}

export async function toggleCompanyPortalUserActiveAction(
  userId: number,
  isActive: boolean
): Promise<CompanyPortalUserActionState> {
  const owner = await requireOwnerPortalSession();
  if ("error" in owner) return { error: owner.error };

  if (!Number.isInteger(userId) || userId <= 0) {
    return { error: "Người dùng không hợp lệ." };
  }

  const targetUser = await prisma.companyPortalUser.findFirst({
    where: {
      id: userId,
      workspaceId: owner.session.workspaceId,
    },
    select: { id: true, role: true, isActive: true },
  });

  if (!targetUser) {
    return { error: "Không tìm thấy người dùng trong workspace." };
  }

  if (targetUser.id === owner.session.portalUserId && !isActive) {
    return { error: "Bạn không thể tự khóa tài khoản đang dùng." };
  }

  if (targetUser.role === CompanyPortalRole.OWNER && targetUser.isActive && !isActive) {
    const hasAnotherOwner = await ensureAnotherActiveOwner(
      owner.session.workspaceId,
      targetUser.id
    );
    if (!hasAnotherOwner) {
      return { error: "Workspace cần ít nhất một Owner đang hoạt động." };
    }
  }

  await prisma.companyPortalUser.update({
    where: { id: targetUser.id },
    data: { isActive },
  });

  revalidatePath("/company/users");
  return {
    success: isActive ? "Đã mở khóa người dùng." : "Đã khóa người dùng.",
  };
}

export async function resetCompanyPortalUserPasswordAction(
  userId: number,
  password: string
): Promise<CompanyPortalUserActionState> {
  const owner = await requireOwnerPortalSession();
  if ("error" in owner) return { error: owner.error };

  const normalizedPassword = password.trim();
  if (normalizedPassword.length < 8) {
    return { error: "Mật khẩu mới cần ít nhất 8 ký tự." };
  }

  const targetUser = await prisma.companyPortalUser.findFirst({
    where: {
      id: userId,
      workspaceId: owner.session.workspaceId,
    },
    select: { id: true },
  });

  if (!targetUser) {
    return { error: "Không tìm thấy người dùng trong workspace." };
  }

  await prisma.companyPortalUser.update({
    where: { id: targetUser.id },
    data: { password: await hash(normalizedPassword, 10) },
  });

  revalidatePath("/company/users");
  return { success: "Đã cập nhật mật khẩu." };
}
