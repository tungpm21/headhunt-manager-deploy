import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { getEmployerJwtSecret } from "@/lib/employer-jwt";
import { prisma } from "@/lib/prisma";
import { expireSubscriptionsIfNeeded } from "@/lib/subscriptions";

const COOKIE_NAME = "employer-token";
const EMPLOYER_SESSION_TTL = "1d";
const EMPLOYER_SESSION_MAX_AGE = 60 * 60 * 24;

export interface EmployerPayload {
  employerId: number;
  email: string;
  companyName: string;
  status: string;
}

async function redirectToEmployerLogin(): Promise<never> {
  await clearEmployerCookie();
  redirect("/employer/login");
}

function redirectToEmployerSubscription(): never {
  redirect("/employer/subscription?expired=1");
}

export async function signEmployerToken(
  payload: EmployerPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EMPLOYER_SESSION_TTL)
    .sign(getEmployerJwtSecret());
}

export async function verifyEmployerToken(
  token: string
): Promise<EmployerPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getEmployerJwtSecret());
    return payload as unknown as EmployerPayload;
  } catch {
    return null;
  }
}

export async function getEmployerSession(): Promise<EmployerPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyEmployerToken(token);
}

export async function requireEmployerSession(options?: {
  allowExpiredSubscription?: boolean;
}): Promise<EmployerPayload> {
  const session = await getEmployerSession();

  if (!session) {
    return redirectToEmployerLogin();
  }

  await expireSubscriptionsIfNeeded();

  const employer = await prisma.employer.findUnique({
    where: { id: session.employerId },
    select: {
      status: true,
      subscription: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!employer || employer.status !== "ACTIVE") {
    return redirectToEmployerLogin();
  }

  if (
    !options?.allowExpiredSubscription &&
    (!employer.subscription || employer.subscription.status !== "ACTIVE")
  ) {
    return redirectToEmployerSubscription();
  }

  return session;
}

export async function setEmployerCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: EMPLOYER_SESSION_MAX_AGE,
  });
}

export async function clearEmployerCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifyEmployerTokenEdge(
  token: string
): Promise<EmployerPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getEmployerJwtSecret());
    return payload as unknown as EmployerPayload;
  } catch {
    return null;
  }
}
