import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { jwtVerify } from "jose";
import { authConfig } from "./auth.config";
import { getEmployerJwtSecret } from "@/lib/employer-jwt";

const EMPLOYER_COOKIE = "employer-token";
const EMPLOYER_PUBLIC = ["/employer/login", "/employer/register"];
const { auth: nextAuthMiddleware } = NextAuth(authConfig);

async function handleEmployerRoute(
  request: NextRequest
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (EMPLOYER_PUBLIC.some((prefix) => pathname.startsWith(prefix))) {
    const token = request.cookies.get(EMPLOYER_COOKIE)?.value;
    if (token) {
      try {
        await jwtVerify(token, getEmployerJwtSecret());
        return NextResponse.redirect(new URL("/employer/dashboard", request.url));
      } catch {
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  const token = request.cookies.get(EMPLOYER_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/employer/login", request.url));
  }

  try {
    await jwtVerify(token, getEmployerJwtSecret());
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/employer/login", request.url));
    response.cookies.delete(EMPLOYER_COOKIE);
    return response;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/employer" || pathname.startsWith("/employer/")) {
    return handleEmployerRoute(request);
  }

  return (nextAuthMiddleware as unknown as (
    request: NextRequest
  ) => Promise<NextResponse>)(request);
}

export default middleware;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logos|uploads).*)"],
};
