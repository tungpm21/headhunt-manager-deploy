"use server";

import { redirect } from "next/navigation";
import { compare } from "bcrypt-ts";
import { prisma } from "@/lib/prisma";
import {
    buildCapabilities,
    clearCompanyPortalCookie,
    setCompanyPortalCookie,
    signCompanyPortalToken,
} from "@/lib/company-portal-auth";
import {
    buildServerActionRateLimitKey,
    checkRateLimit,
} from "@/lib/rate-limit-redis";

export async function companyPortalLogin(
    _prev: { error?: string } | undefined,
    formData: FormData
): Promise<{ error?: string }> {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Vui lòng nhập email và mật khẩu." };
    }

    const rateLimitKey = await buildServerActionRateLimitKey("company-portal-login", email);
    const rateLimit = await checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
        return { error: `Thu lai sau ${rateLimit.retryAfterSeconds} giay.` };
    }

    const candidates = await prisma.companyPortalUser.findMany({
        where: {
            email,
            isActive: true,
            workspace: { status: "ACTIVE", portalEnabled: true },
        },
        include: {
            workspace: {
                select: {
                    id: true,
                    status: true,
                    portalEnabled: true,
                },
            },
        },
    });

    if (candidates.length === 0) {
        return { error: "Email hoặc mật khẩu không đúng." };
    }

    // If multiple workspaces share this email, require admin disambiguation
    if (candidates.length > 1) {
        return { error: "Email này thuộc nhiều công ty. Vui lòng liên hệ admin để chọn tài khoản." };
    }

    const user = candidates[0];

    if (!user || !user.password) {
        return { error: "Email hoặc mật khẩu không đúng." };
    }

    const valid = await compare(password, user.password);
    if (!valid) {
        return { error: "Email hoặc mật khẩu không đúng." };
    }

    if (user.workspace.status !== "ACTIVE" || !user.workspace.portalEnabled) {
        return { error: "Tài khoản công ty hiện không khả dụng. Vui lòng liên hệ admin." };
    }

    const capabilities = await buildCapabilities(user.workspaceId, user.role);

    const token = await signCompanyPortalToken({
        portalUserId: user.id,
        workspaceId: user.workspaceId,
        email: user.email,
        role: user.role as "OWNER" | "MEMBER" | "VIEWER",
        capabilities,
    });

    await setCompanyPortalCookie(token);

    // Update lastLoginAt
    await prisma.companyPortalUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });

    redirect("/company/dashboard");
}

export async function companyPortalLogout() {
    await clearCompanyPortalCookie();
    redirect("/company/login");
}
