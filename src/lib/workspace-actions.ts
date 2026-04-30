"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CompanyDraftStatus, CompanyPortalRole, CompanySize, Prisma } from "@prisma/client";
import { hash } from "bcrypt-ts";
import { requireAdmin } from "@/lib/authz";
import { logActivity } from "@/lib/activity-log";
import { OPTION_GROUPS } from "@/lib/config-option-definitions";
import { resolveConfigOptionValue } from "@/lib/config-options";
import {
    DEFAULT_COMPANY_CAPABILITIES,
    DEFAULT_COMPANY_THEME,
    countBlockImages,
    normalizeCompanyCapabilities,
    normalizeCompanyTheme,
    normalizeContentBlocks,
    parseJson,
} from "@/lib/content-blocks";
import { normalizeCompanyMediaSettings } from "@/lib/company-media-settings";
import {
    getMediaFileExtension,
    type MediaUploadKind,
    validateMediaImageFile,
} from "@/lib/media-validation";
import { prisma } from "@/lib/prisma";
import {
    PUBLIC_COMPANY_PROFILE_CACHE_TAG,
    PUBLIC_HOMEPAGE_CACHE_TAG,
} from "@/lib/public-cache-tags";
import { deleteFile, uploadFile } from "@/lib/storage";
import {
    employerProfileSchema,
    getFirstZodErrorMessage,
} from "@/lib/validation/forms";

const COMPANY_SIZE_VALUES = new Set<string>(Object.values(CompanySize));
const COMPANY_PORTAL_ROLE_VALUES = new Set<string>(Object.values(CompanyPortalRole));

export type AdminPortalUserActionState = {
    success?: string;
    error?: string;
};

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

function revalidatePublicCompanyCache() {
    revalidateTag(PUBLIC_HOMEPAGE_CACHE_TAG, { expire: 0 });
    revalidateTag(PUBLIC_COMPANY_PROFILE_CACHE_TAG, { expire: 0 });
}

function normalizeWebsite(value: string | null) {
    if (!value) return null;
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;

    try {
        return new URL(normalized).toString();
    } catch {
        return null;
    }
}

function boundedInt(value: FormDataEntryValue | null, fallback: number, min: number, max: number) {
    const parsed = Number(value?.toString());
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

function parsePortalRole(value: unknown) {
    const role = typeof value === "string" ? value.trim() : "";
    return COMPANY_PORTAL_ROLE_VALUES.has(role) ? (role as CompanyPortalRole) : null;
}

async function countActiveOwners(workspaceId: number) {
    return prisma.companyPortalUser.count({
        where: {
            workspaceId,
            role: CompanyPortalRole.OWNER,
            isActive: true,
        },
    });
}

async function uploadAdminEmployerImageFile(
    folder: string,
    prefix: string,
    file: File,
    kind: MediaUploadKind
): Promise<{ url: string } | { error: string }> {
    const validationError = validateMediaImageFile(file, kind);
    if (validationError) return { error: validationError };

    const extension = getMediaFileExtension(file.type);
    const fileName = `${prefix}-${Date.now()}.${extension}`;
    const result = await uploadFile(folder, fileName, file);
    return { url: result.url };
}

function parseProfileDraftPayload(payload: Prisma.JsonValue, currentTheme?: Prisma.JsonValue | null) {
    const source = isRecord(payload) ? payload : {};
    const profileConfig = isRecord(source.profileConfig) ? source.profileConfig : {};
    const draftTheme = isRecord(profileConfig.theme) ? profileConfig.theme : {};
    const mediaSettings = isRecord(draftTheme.media)
        ? normalizeCompanyMediaSettings(draftTheme)
        : normalizeCompanyMediaSettings(currentTheme);
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
            theme: inputJson({ ...draftTheme, media: mediaSettings }),
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

export async function createAdminCompanyPortalUserAction(
    _prev: AdminPortalUserActionState | undefined,
    formData: FormData
): Promise<AdminPortalUserActionState> {
    const { userId } = await requireAdmin();
    const workspaceId = Number(formData.get("workspaceId"));
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const name = stringOrNull(formData.get("name"));
    const role = parsePortalRole(formData.get("role")) ?? CompanyPortalRole.MEMBER;
    const password = formData.get("password")?.toString() ?? "";

    if (!Number.isInteger(workspaceId) || workspaceId <= 0) {
        return { error: "Workspace không hợp lệ." };
    }
    if (!email || !email.includes("@")) {
        return { error: "Email đăng nhập không hợp lệ." };
    }
    if (password.length < 8) {
        return { error: "Mật khẩu tạm phải có ít nhất 8 ký tự." };
    }

    const workspace = await prisma.companyWorkspace.findUnique({
        where: { id: workspaceId },
        select: { id: true },
    });
    if (!workspace) {
        return { error: "Không tìm thấy workspace." };
    }

    const existing = await prisma.companyPortalUser.findUnique({
        where: { workspaceId_email: { workspaceId, email } },
        select: { id: true },
    });
    if (existing) {
        return { error: "Email này đã có tài khoản trong workspace." };
    }

    await prisma.companyPortalUser.create({
        data: {
            workspaceId,
            email,
            name,
            role,
            password: await hash(password, 10),
            isActive: true,
        },
    });

    await logActivity("WORKSPACE_PORTAL_USER_CREATED", "CompanyWorkspace", workspaceId, userId, {
        email,
        role,
    });

    revalidatePath(`/companies/${workspaceId}`);
    revalidatePath("/companies");
    return { success: "Đã tạo portal user." };
}

export async function updateAdminCompanyPortalUserRoleAction(
    userId: number,
    roleValue: string
): Promise<AdminPortalUserActionState> {
    const { userId: adminUserId } = await requireAdmin();
    const role = parsePortalRole(roleValue);
    if (!role) {
        return { error: "Role không hợp lệ." };
    }

    const targetUser = await prisma.companyPortalUser.findUnique({
        where: { id: userId },
        select: { id: true, workspaceId: true, role: true, isActive: true, email: true },
    });
    if (!targetUser) {
        return { error: "Không tìm thấy portal user." };
    }

    if (
        targetUser.role === CompanyPortalRole.OWNER &&
        targetUser.isActive &&
        role !== CompanyPortalRole.OWNER &&
        (await countActiveOwners(targetUser.workspaceId)) <= 1
    ) {
        return { error: "Workspace cần giữ ít nhất một Owner đang hoạt động." };
    }

    await prisma.companyPortalUser.update({
        where: { id: userId },
        data: { role },
    });

    await logActivity("WORKSPACE_PORTAL_USER_ROLE_UPDATED", "CompanyWorkspace", targetUser.workspaceId, adminUserId, {
        portalUserId: userId,
        role,
    });

    revalidatePath(`/companies/${targetUser.workspaceId}`);
    return { success: "Đã cập nhật role portal user." };
}

export async function toggleAdminCompanyPortalUserActiveAction(
    userId: number,
    isActive: boolean
): Promise<AdminPortalUserActionState> {
    const { userId: adminUserId } = await requireAdmin();
    const targetUser = await prisma.companyPortalUser.findUnique({
        where: { id: userId },
        select: { id: true, workspaceId: true, role: true, isActive: true, email: true },
    });
    if (!targetUser) {
        return { error: "Không tìm thấy portal user." };
    }

    if (
        targetUser.role === CompanyPortalRole.OWNER &&
        targetUser.isActive &&
        !isActive &&
        (await countActiveOwners(targetUser.workspaceId)) <= 1
    ) {
        return { error: "Không thể khóa Owner cuối cùng của workspace." };
    }

    await prisma.companyPortalUser.update({
        where: { id: userId },
        data: { isActive },
    });

    await logActivity("WORKSPACE_PORTAL_USER_STATUS_UPDATED", "CompanyWorkspace", targetUser.workspaceId, adminUserId, {
        portalUserId: userId,
        isActive,
    });

    revalidatePath(`/companies/${targetUser.workspaceId}`);
    return { success: isActive ? "Đã mở khóa portal user." : "Đã khóa portal user." };
}

export async function resetAdminCompanyPortalUserPasswordAction(
    userId: number,
    password: string
): Promise<AdminPortalUserActionState> {
    const { userId: adminUserId } = await requireAdmin();
    if (password.length < 8) {
        return { error: "Mật khẩu mới phải có ít nhất 8 ký tự." };
    }

    const targetUser = await prisma.companyPortalUser.findUnique({
        where: { id: userId },
        select: { id: true, workspaceId: true, email: true },
    });
    if (!targetUser) {
        return { error: "Không tìm thấy portal user." };
    }

    await prisma.companyPortalUser.update({
        where: { id: userId },
        data: { password: await hash(password, 10) },
    });

    await logActivity("WORKSPACE_PORTAL_USER_PASSWORD_RESET", "CompanyWorkspace", targetUser.workspaceId, adminUserId, {
        portalUserId: userId,
    });

    revalidatePath(`/companies/${targetUser.workspaceId}`);
    return { success: "Đã đặt lại mật khẩu portal user." };
}

export async function updateAdminCompanyProfileAction(
    workspaceId: number,
    formData: FormData
): Promise<{ success: boolean; message: string }> {
    const { userId } = await requireAdmin();

    const workspace = await prisma.companyWorkspace.findUnique({
        where: { id: workspaceId },
        select: {
            id: true,
            displayName: true,
            employer: {
                include: {
                    profileConfig: true,
                    jobPostings: { select: { slug: true } },
                },
            },
        },
    });

    if (!workspace?.employer) {
        return { success: false, message: "Workspace chưa liên kết Employer để chỉnh profile." };
    }

    const employer = workspace.employer;
    const websiteInput = stringOrNull(formData.get("website"));
    const normalizedWebsite = normalizeWebsite(websiteInput);
    const [industry, companySize, location, industrialZone] = await Promise.all([
        resolveConfigOptionValue(OPTION_GROUPS.industry, stringOrNull(formData.get("industry"))),
        resolveConfigOptionValue(OPTION_GROUPS.companySize, stringOrNull(formData.get("companySize"))),
        resolveConfigOptionValue(OPTION_GROUPS.location, stringOrNull(formData.get("location"))),
        resolveConfigOptionValue(OPTION_GROUPS.industrialZone, stringOrNull(formData.get("industrialZone"))),
    ]);

    const parsedInput = employerProfileSchema.safeParse({
        companyName: formData.get("companyName")?.toString().trim() ?? "",
        description: stringOrNull(formData.get("description")),
        industry,
        companySize,
        address: stringOrNull(formData.get("address")),
        location,
        industrialZone,
        website: websiteInput ? normalizedWebsite ?? websiteInput : null,
        phone: stringOrNull(formData.get("phone")),
    });

    if (!parsedInput.success) {
        return { success: false, message: getFirstZodErrorMessage(parsedInput.error) };
    }

    const currentCapabilities = normalizeCompanyCapabilities(
        employer.profileConfig?.capabilities ?? DEFAULT_COMPANY_CAPABILITIES
    );
    const rawProfileTheme = parseJson(formData.get("profileTheme")?.toString() ?? "") || DEFAULT_COMPANY_THEME;
    const profileTheme = normalizeCompanyTheme(rawProfileTheme);
    const profileMediaSettings = normalizeCompanyMediaSettings(
        parseJson(formData.get("profileMediaSettings")?.toString() ?? "") || rawProfileTheme
    );
    const profileSections = normalizeContentBlocks(
        formData.get("profileSections")?.toString() ?? "[]"
    );
    const primaryVideoUrl = stringOrNull(formData.get("primaryVideoUrl"));

    if (countBlockImages(profileSections) > currentCapabilities.maxImages) {
        return {
            success: false,
            message: `Profile builder đang dùng quá ${currentCapabilities.maxImages} ảnh cho gói hiện tại.`,
        };
    }

    const logoFile = formData.get("logo");
    const nextLogo = logoFile instanceof File && logoFile.size > 0 ? logoFile : null;
    let uploadedLogoUrl: string | null = null;

    if (nextLogo) {
        const result = await uploadAdminEmployerImageFile(
            "logos",
            `employer-logo-${employer.id}`,
            nextLogo,
            "profileLogo"
        );
        if ("error" in result) return { success: false, message: result.error };
        uploadedLogoUrl = result.url;
    }

    const coverFile = formData.get("coverImage");
    const nextCover = coverFile instanceof File && coverFile.size > 0 ? coverFile : null;
    let uploadedCoverUrl: string | null = null;

    if (nextCover) {
        const result = await uploadAdminEmployerImageFile(
            "covers",
            `employer-cover-${employer.id}`,
            nextCover,
            "profileCover"
        );
        if ("error" in result) {
            if (uploadedLogoUrl) await deleteFile(uploadedLogoUrl);
            return { success: false, message: result.error };
        }
        uploadedCoverUrl = result.url;
    }

    const bannerFile = formData.get("bannerImage");
    const nextBanner = bannerFile instanceof File && bannerFile.size > 0 ? bannerFile : null;
    let uploadedBannerUrl: string | null = null;

    if (nextBanner) {
        const result = await uploadAdminEmployerImageFile(
            "banners",
            `employer-homepage-banner-${employer.id}`,
            nextBanner,
            "profileCover"
        );
        if ("error" in result) {
            if (uploadedLogoUrl) await deleteFile(uploadedLogoUrl);
            if (uploadedCoverUrl) await deleteFile(uploadedCoverUrl);
            return { success: false, message: result.error };
        }
        uploadedBannerUrl = result.url;
    }

    const logoUrlInput =
        typeof formData.get("logoUrl") === "string"
            ? stringOrNull(formData.get("logoUrl"))
            : employer.logo;
    const coverImageUrlInput =
        typeof formData.get("coverImageUrl") === "string"
            ? stringOrNull(formData.get("coverImageUrl"))
            : employer.coverImage;
    const nextProfileMediaSettings = uploadedBannerUrl
        ? { ...profileMediaSettings, bannerImageUrl: uploadedBannerUrl }
        : profileMediaSettings;

    try {
        await prisma.$transaction([
            prisma.employer.update({
                where: { id: employer.id },
                data: {
                    ...parsedInput.data,
                    logo: uploadedLogoUrl ?? logoUrlInput,
                    coverImage: uploadedCoverUrl ?? coverImageUrlInput,
                    coverPositionX: boundedInt(formData.get("coverPositionX"), 50, 0, 100),
                    coverPositionY: boundedInt(formData.get("coverPositionY"), 50, 0, 100),
                    coverZoom: boundedInt(formData.get("coverZoom"), 100, 100, 200),
                },
            }),
            prisma.employerProfileConfig.upsert({
                where: { employerId: employer.id },
                create: {
                    employerId: employer.id,
                    theme: inputJson({ ...profileTheme, media: nextProfileMediaSettings }),
                    capabilities: inputJson(currentCapabilities),
                    sections: inputJson(profileSections),
                    primaryVideoUrl,
                },
                update: {
                    theme: inputJson({ ...profileTheme, media: nextProfileMediaSettings }),
                    capabilities: inputJson(currentCapabilities),
                    sections: inputJson(profileSections),
                    primaryVideoUrl,
                },
            }),
        ]);

        await logActivity("COMPANY_PROFILE_ADMIN_UPDATED", "CompanyWorkspace", workspace.id, userId, {
            employerId: employer.id,
        });

        revalidatePath("/companies");
        revalidatePath(`/companies/${workspace.id}`);
        revalidatePath("/company/profile");
        revalidatePath("/employer/company");
        revalidatePath("/cong-ty");
        revalidatePath(`/cong-ty/${employer.slug}`);
        revalidatePath("/viec-lam");
        revalidatePublicCompanyCache();
        employer.jobPostings.forEach((job) => {
            revalidatePath(`/viec-lam/${job.slug}`);
        });

        return { success: true, message: "Đã cập nhật profile công ty và publish trực tiếp." };
    } catch (error) {
        if (uploadedLogoUrl) await deleteFile(uploadedLogoUrl);
        if (uploadedCoverUrl) await deleteFile(uploadedCoverUrl);
        if (uploadedBannerUrl) await deleteFile(uploadedBannerUrl);
        console.error("updateAdminCompanyProfileAction error:", error);
        return { success: false, message: "Không thể cập nhật profile công ty." };
    }
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
                            profileConfig: {
                                select: {
                                    theme: true,
                                },
                            },
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

    const parsed = parseProfileDraftPayload(
        draft.payload,
        draft.workspace.employer.profileConfig?.theme ?? null
    );

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
    revalidatePublicCompanyCache();
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
