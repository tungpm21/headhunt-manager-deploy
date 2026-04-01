import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { getEmployerJwtSecret } from "@/lib/employer-jwt";

const COOKIE_NAME = "employer-token";

export interface EmployerPayload {
  employerId: number;
  email: string;
  companyName: string;
  status: string;
}

export async function signEmployerToken(
  payload: EmployerPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
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

  if (!token) return null;
  return verifyEmployerToken(token);
}

export async function requireEmployerSession(): Promise<EmployerPayload> {
  const session = await getEmployerSession();
  if (!session) redirect("/employer/login");
  return session;
}

export async function setEmployerCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
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
