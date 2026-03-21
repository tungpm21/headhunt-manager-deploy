import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const EMPLOYER_COOKIE = "employer-token";
const SECRET = new TextEncoder().encode(
  process.env.EMPLOYER_JWT_SECRET || "employer-jwt-secret-change-in-production"
);

const EMPLOYER_PUBLIC = ["/employer/login", "/employer/register"];

const { auth: nextAuthMiddleware } = NextAuth(authConfig);

// Employer JWT route handler
async function handleEmployerRoute(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Public employer pages (login, register)
  if (EMPLOYER_PUBLIC.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get(EMPLOYER_COOKIE)?.value;
    if (token) {
      try {
        await jwtVerify(token, SECRET);
        return NextResponse.redirect(
          new URL("/employer/dashboard", request.url)
        );
      } catch {
        // Invalid token — let them through
      }
    }
    return NextResponse.next();
  }

  // Protected employer pages — require valid JWT
  const token = request.cookies.get(EMPLOYER_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/employer/login", request.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(
      new URL("/employer/login", request.url)
    );
    response.cookies.delete(EMPLOYER_COOKIE);
    return response;
  }
}

// Combined proxy: employer JWT + NextAuth CRM
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Employer portal routes → custom JWT (must NOT match /employers which is CRM)
  if (pathname === "/employer" || pathname.startsWith("/employer/")) {
    return handleEmployerRoute(request);
  }

  // All other routes → NextAuth (CRM auth via auth.config.ts authorized callback)
  return (nextAuthMiddleware as any)(request);
}

export default middleware;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logos).*)"],
};
