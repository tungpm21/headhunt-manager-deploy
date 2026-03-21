import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "employer-token";
const SECRET = new TextEncoder().encode(
  process.env.EMPLOYER_JWT_SECRET || "employer-jwt-secret-change-in-production"
);

export interface EmployerPayload {
  employerId: number;
  email: string;
  companyName: string;
  status: string;
}

export async function signEmployerToken(payload: EmployerPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyEmployerToken(token: string): Promise<EmployerPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
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
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearEmployerCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Verify token for Edge middleware (no cookies() API) */
export async function verifyEmployerTokenEdge(token: string): Promise<EmployerPayload | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.EMPLOYER_JWT_SECRET || "employer-jwt-secret-change-in-production"
    );
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as EmployerPayload;
  } catch {
    return null;
  }
}
