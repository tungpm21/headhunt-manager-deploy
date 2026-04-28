"use server";

import { revalidatePath } from "next/cache";
import { CompanyDraftStatus, CompanySize, Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/authz";
import { logActivity } from "@/lib/activity-log";
import { prisma } from "@/lib/prisma";

const COMPANY_SIZE_VALUES = new Set<string>(Object.values(CompanySize));

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringOrNull(value: unknown) {
    const normalized = typeof value === "string" ? value.trim() : "";
    return normalized || null;
}

function numberOrDefault(value: unknown, fallback: number) {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function inputJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

function parseProfileDraftPayload(payload: Prisma.JsonValue) {
    const source = isRecord(payload) ? payload : {};
    const profileConfig = isRecord(source.profileConfig) ? source.profileConfig : {};
    const companySize = stringOrNull(source.companySize);

    return {
        profile: {
            companyName: stringOrNull(source.companyName) ?? "",
            description: stringOrNull(source.description),
            logo: stringOrNull(source.logo),
            coverImage: stringOrNull(source.coverImage),
            industry: stringOrNull(source.industry),
            companySize:
                companySize && COMPANY_SIZE_VALUES.has(companySize)
                    ? (companySize as CompanySize)
                    : null,
            address: stringOrNull(source.address),
            location: stringOrNull(source.location),
            industrialZone: stringOrNull(source.industrialZone),
            website: stringOrNull(source.website),
            phone: stringOrNull(source.phone),
            coverPositionX: numberOrDefault(source.coverPositionX, 50),
            coverPositionY: numberOrDefault(source.coverPositionY, 50),
            coverZoom: numberOrDefault(source.coverZoom, 100),
        },
        profileConfig: {
            theme: inputJson(profileConfig.theme ?? {}),
            capabilities: inputJson(profileConfig.capabilities ?? {}),
            sections: inputJson(profileConfig.sections ?? []),
            primaryVideoUrl: stringOrNull(profileConfig.primaryVideoUrl),
        },
    };
}

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

export async function approveCompanyProfileDraftAction(
    formData: FormData
): Promise<void> {
    const { userId } = await requireAdmin();
    const draftId = Number(formData.get("draftId"));

    if (!Number.isInteger(draftId) || draftId <= 0) {
        return;
    }

    const draft = await prisma.companyProfileDraft.findUnique({
        where: { id: draftId },
        include: {
            workspace: {
                select: {
                    id: true,
                    employer: {
                        select: {
                            id: true,
                            slug: true,
                            jobPostings: { select: { slug: true } },
                        },
                    },
                },
            },
        },
    });

    if (!draft) return;
    if (draft.status !== CompanyDraftStatus.SUBMITTED) {
        return;
    }
    if (!draft.workspace.employer) {
        return;
    }

    const parsed = parseProfileDraftPayload(draft.payload);

    await prisma.$transaction([
        prisma.employer.update({
            where: { id: draft.workspace.employer.id },
            data: parsed.profile,
        }),
        prisma.employerProfileConfig.upsert({
            where: { employerId: draft.workspace.employer.id },
            create: {
                employerId: draft.workspace.employer.id,
                ...parsed.profileConfig,
            },
            update: parsed.profileConfig,
        }),
        prisma.companyProfileDraft.update({
            where: { id: draft.id },
            data: {
                status: CompanyDraftStatus.APPROVED,
                reviewedAt: new Date(),
                reviewedById: userId,
                rejectReason: null,
            },
        }),
    ]);

    await logActivity("COMPANY_PROFILE_DRAFT_APPROVED", "CompanyProfileDraft", draft.id, userId, {
        workspaceId: draft.workspace.id,
    });

    revalidatePath("/companies");
    revalidatePath(`/companies/${draft.workspace.id}`);
    revalidatePath("/employer/company");
    revalidatePath("/cong-ty");
    revalidatePath(`/cong-ty/${draft.workspace.employer.slug}`);
    revalidatePath("/viec-lam");
    draft.workspace.employer.jobPostings.forEach((job) => {
        revalidatePath(`/viec-lam/${job.slug}`);
    });

    return;
}

export async function rejectCompanyProfileDraftAction(
    formData: FormData
): Promise<void> {
    const { userId } = await requireAdmin();
    const draftId = Number(formData.get("draftId"));
    const reason = formData.get("reason")?.toString().trim().slice(0, 1000) || null;

    if (!Number.isInteger(draftId) || draftId <= 0) {
        return;
    }

    const draft = await prisma.companyProfileDraft.findUnique({
        where: { id: draftId },
        select: {
            id: true,
            status: true,
            workspaceId: true,
        },
    });

    if (!draft) return;
    if (draft.status !== CompanyDraftStatus.SUBMITTED) {
        return;
    }

    await prisma.companyProfileDraft.update({
        where: { id: draft.id },
        data: {
            status: CompanyDraftStatus.REJECTED,
            reviewedAt: new Date(),
            reviewedById: userId,
            rejectReason: reason,
        },
    });

    await logActivity("COMPANY_PROFILE_DRAFT_REJECTED", "CompanyProfileDraft", draft.id, userId, {
        workspaceId: draft.workspaceId,
        reason,
    });

    revalidatePath("/companies");
    revalidatePath(`/companies/${draft.workspaceId}`);
    revalidatePath("/employer/company");

    return;
}
