import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { getEmployerJwtSecret } from "@/lib/employer-jwt";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "company-portal-token";
const SESSION_TTL = "1d";
const SESSION_MAX_AGE = 60 * 60 * 24;

export interface CompanyPortalSession {
    portalUserId: number;
    workspaceId: number;
    email: string;
    role: "OWNER" | "MEMBER" | "VIEWER";
    capabilities: {
        employer: boolean;
        client: boolean;
        billing: boolean;
        manageUsers: boolean;
    };
}

function redirectToCompanyLogin(): never {
    redirect("/company/login");
}

// Reuse the same JWT secret as employers (single env var)
function getSecret(): Uint8Array {
    return getEmployerJwtSecret();
}

export async function signCompanyPortalToken(
    payload: CompanyPortalSession
): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(SESSION_TTL)
        .sign(getSecret());
}

export async function verifyCompanyPortalToken(
    token: string
): Promise<CompanyPortalSession | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload as unknown as CompanyPortalSession;
    } catch {
        return null;
    }
}

export async function getCompanyPortalSession(): Promise<CompanyPortalSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyCompanyPortalToken(token);
}

export async function requireCompanyPortalSession(): Promise<CompanyPortalSession> {
    const session = await getCompanyPortalSession();
    if (!session) redirectToCompanyLogin();

    // Verify workspace and user are still active
    const [workspace, portalUser] = await Promise.all([
        prisma.companyWorkspace.findUnique({
            where: { id: session.workspaceId },
            select: {
                status: true,
                portalEnabled: true,
                employerId: true,
                clientId: true,
            },
        }),
        prisma.companyPortalUser.findUnique({
            where: { id: session.portalUserId },
            select: {
                email: true,
                role: true,
                workspaceId: true,
                isActive: true,
            },
        }),
    ]);

    if (
        !workspace ||
        workspace.status !== "ACTIVE" ||
        !workspace.portalEnabled ||
        !portalUser ||
        portalUser.workspaceId !== session.workspaceId ||
        !portalUser.isActive
    ) {
        await clearCompanyPortalCookie();
        redirectToCompanyLogin();
    }

    const role = portalUser.role as CompanyPortalSession["role"];
    return {
        ...session,
        email: portalUser.email,
        role,
        capabilities: {
            employer: !!workspace.employerId,
            client: !!workspace.clientId,
            billing: !!workspace.employerId,
            manageUsers: role === "OWNER",
        },
    };
}

export async function setCompanyPortalCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
    });
}

export async function clearCompanyPortalCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

/**
 * Build capabilities from workspace facets.
 */
export async function buildCapabilities(workspaceId: number, role: string) {
    const workspace = await prisma.companyWorkspace.findUnique({
        where: { id: workspaceId },
        select: { employerId: true, clientId: true },
    });

    return {
        employer: !!workspace?.employerId,
        client: !!workspace?.clientId,
        billing: !!workspace?.employerId,
        manageUsers: role === "OWNER",
    };
}
