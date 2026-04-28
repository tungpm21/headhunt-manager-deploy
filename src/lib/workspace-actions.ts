"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { logActivity } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";

/**
 * Link an existing Client to a CompanyWorkspace.
 */
export async function linkWorkspaceToClient(
    workspaceId: number,
    clientId: number
): Promise<{ error?: string; success?: boolean }> {
    const { userId } = await requireAdmin();

    const workspace = await prisma.companyWorkspace.findUnique({
        where: { id: workspaceId },
        select: { id: true, clientId: true, employerId: true, displayName: true },
    });
    if (!workspace) return { error: "Workspace không tồn tại." };
    if (workspace.clientId) return { error: "Workspace đã có Client được liên kết." };

    const existingLink = await prisma.companyWorkspace.findUnique({
        where: { clientId },
        select: { id: true, displayName: true },
    });
    if (existingLink) {
        return { error: `Client đã thuộc workspace "${existingLink.displayName}".` };
    }

    await prisma.companyWorkspace.update({
        where: { id: workspaceId },
        data: { clientId },
    });

    // Sync legacy Employer.clientId during transition
    if (workspace.employerId) {
        await prisma.employer.update({
            where: { id: workspace.employerId },
            data: { clientId },
        });
    }

    await logActivity("WORKSPACE_LINK_CLIENT", "CompanyWorkspace", workspaceId, userId, {
        clientId,
    });

    revalidatePath("/companies");
    revalidatePath(`/companies/${workspaceId}`);
    return { success: true };
}

/**
 * Link an existing Employer to a CompanyWorkspace.
 */
export async function linkWorkspaceToEmployer(
    workspaceId: number,
    employerId: number
): Promise<{ error?: string; success?: boolean }> {
    const { userId } = await requireAdmin();

    const workspace = await prisma.companyWorkspace.findUnique({
        where: { id: workspaceId },
        select: { id: true, employerId: true, clientId: true, displayName: true },
    });
    if (!workspace) return { error: "Workspace không tồn tại." };
    if (workspace.employerId) return { error: "Workspace đã có Employer được liên kết." };

    const existingLink = await prisma.companyWorkspace.findUnique({
        where: { employerId },
        select: { id: true, displayName: true },
    });
    if (existingLink) {
        return { error: `Employer đã thuộc workspace "${existingLink.displayName}".` };
    }

    await prisma.companyWorkspace.update({
        where: { id: workspaceId },
        data: { employerId },
    });

    // Sync legacy Employer.clientId during transition
    if (workspace.clientId) {
        await prisma.employer.update({
            where: { id: employerId },
            data: { clientId: workspace.clientId },
        });
    }

    await logActivity("WORKSPACE_LINK_EMPLOYER", "CompanyWorkspace", workspaceId, userId, {
        employerId,
    });

    revalidatePath("/companies");
    revalidatePath(`/companies/${workspaceId}`);
    return { success: true };
}

/**
 * Unlink Client from workspace.
 */
export async function unlinkWorkspaceClient(
    workspaceId: number
): Promise<{ error?: string; success?: boolean }> {
    const { userId } = await requireAdmin();

    const workspace = await prisma.companyWorkspace.findUnique({
        where: { id: workspaceId },
        select: { id: true, clientId: true, employerId: true },
    });
    if (!workspace) return { error: "Workspace không tồn tại." };
    if (!workspace.clientId) return { error: "Workspace chưa có Client để gỡ." };

    await prisma.companyWorkspace.update({
        where: { id: workspaceId },
        data: { clientId: null },
    });

    // Sync legacy Employer.clientId during transition
    if (workspace.employerId) {
        await prisma.employer.update({
            where: { id: workspace.employerId },
            data: { clientId: null },
        });
    }

    await logActivity("WORKSPACE_UNLINK_CLIENT", "CompanyWorkspace", workspaceId, userId, {
        previousClientId: workspace.clientId,
    });

    revalidatePath("/companies");
    revalidatePath(`/companies/${workspaceId}`);
    return { success: true };
}

/**
 * Unlink Employer from workspace.
 */
export async function unlinkWorkspaceEmployer(
    workspaceId: number
): Promise<{ error?: string; success?: boolean }> {
    const { userId } = await requireAdmin();

    const workspace = await prisma.companyWorkspace.findUnique({
        where: { id: workspaceId },
        select: { id: true, employerId: true },
    });
    if (!workspace) return { error: "Workspace không tồn tại." };
    if (!workspace.employerId) return { error: "Workspace chưa có Employer để gỡ." };

    await prisma.$transaction([
        prisma.companyWorkspace.update({
            where: { id: workspaceId },
            data: { employerId: null },
        }),
        prisma.employer.update({
            where: { id: workspace.employerId },
            data: { clientId: null },
        }),
    ]);

    await logActivity("WORKSPACE_UNLINK_EMPLOYER", "CompanyWorkspace", workspaceId, userId, {
        previousEmployerId: workspace.employerId,
    });

    revalidatePath("/companies");
    revalidatePath(`/companies/${workspaceId}`);
    return { success: true };
}

/**
 * Toggle portal enabled/disabled for a workspace.
 */
export async function toggleWorkspacePortal(
    workspaceId: number,
    enabled: boolean
): Promise<{ error?: string; success?: boolean }> {
    const { userId } = await requireAdmin();

    const workspace = await prisma.companyWorkspace.findUnique({
        where: { id: workspaceId },
        select: { id: true },
    });
    if (!workspace) return { error: "Workspace không tồn tại." };

    await prisma.companyWorkspace.update({
        where: { id: workspaceId },
        data: { portalEnabled: enabled },
    });

    await logActivity(
        enabled ? "WORKSPACE_PORTAL_ENABLED" : "WORKSPACE_PORTAL_DISABLED",
        "CompanyWorkspace",
        workspaceId,
        userId,
        {}
    );

    revalidatePath("/companies");
    revalidatePath(`/companies/${workspaceId}`);
    return { success: true };
}
