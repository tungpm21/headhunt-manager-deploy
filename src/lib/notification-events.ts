import {
  CompanyPortalRole,
  NotificationEventType,
  NotificationRecipientKind,
  NotificationSeverity,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

type NotificationEventInput = {
  type: NotificationEventType;
  entityType: string;
  entityId: number;
  title: string;
  body?: string | null;
  href: string;
  severity?: NotificationSeverity;
};

const COMPANY_NOTIFICATION_ROLES: CompanyPortalRole[] = [
  CompanyPortalRole.OWNER,
  CompanyPortalRole.MEMBER,
];

export async function createAdminNotificationEventForAllAdmins(
  input: NotificationEventInput
) {
  try {
    if (!prisma.notificationEvent) return;

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (admins.length === 0) return;

    await prisma.notificationEvent.createMany({
      data: admins.map((admin) => ({
        recipientKind: NotificationRecipientKind.ADMIN,
        adminUserId: admin.id,
        type: input.type,
        entityType: input.entityType,
        entityId: input.entityId,
        title: input.title,
        body: input.body ?? null,
        href: input.href,
        severity: input.severity ?? NotificationSeverity.INFO,
      })),
      skipDuplicates: true,
    });
  } catch (error) {
    console.error("createAdminNotificationEventForAllAdmins error:", error);
  }
}

export async function createCompanyNotificationEventForWorkspace(
  workspaceId: number,
  input: NotificationEventInput
) {
  try {
    if (!prisma.notificationEvent) return;

    const portalUsers = await prisma.companyPortalUser.findMany({
      where: {
        workspaceId,
        isActive: true,
        role: { in: COMPANY_NOTIFICATION_ROLES },
      },
      select: { id: true },
    });

    if (portalUsers.length === 0) return;

    await prisma.notificationEvent.createMany({
      data: portalUsers.map((portalUser) => ({
        recipientKind: NotificationRecipientKind.COMPANY,
        portalUserId: portalUser.id,
        workspaceId,
        type: input.type,
        entityType: input.entityType,
        entityId: input.entityId,
        title: input.title,
        body: input.body ?? null,
        href: input.href,
        severity: input.severity ?? NotificationSeverity.INFO,
      })),
      skipDuplicates: true,
    });
  } catch (error) {
    console.error("createCompanyNotificationEventForWorkspace error:", error);
  }
}

export async function createCompanyNotificationEventForEmployer(
  employerId: number,
  input: NotificationEventInput
) {
  const workspace = await prisma.companyWorkspace.findUnique({
    where: { employerId },
    select: { id: true },
  });

  if (!workspace) return;

  await createCompanyNotificationEventForWorkspace(workspace.id, input);
}

export async function markAdminNotificationEventsRead(
  adminUserId: number,
  ids?: number[]
) {
  if (!prisma.notificationEvent) return;

  await prisma.notificationEvent.updateMany({
    where: {
      recipientKind: NotificationRecipientKind.ADMIN,
      adminUserId,
      readAt: null,
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
    data: { readAt: new Date() },
  });
}

export async function markCompanyNotificationEventsRead(
  portalUserId: number,
  workspaceId: number,
  ids?: number[]
) {
  if (!prisma.notificationEvent) return;

  await prisma.notificationEvent.updateMany({
    where: {
      recipientKind: NotificationRecipientKind.COMPANY,
      portalUserId,
      workspaceId,
      readAt: null,
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
    data: { readAt: new Date() },
  });
}
