import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const EMPLOYER_COOKIE = "employer-token";
const { auth: nextAuthMiddleware } = NextAuth(authConfig);

async function handleEmployerRoute(
  request: NextRequest
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const targetUrl = request.nextUrl.clone();

  if (
    pathname === "/employer" ||
    pathname.startsWith("/employer/login") ||
    pathname.startsWith("/employer/register")
  ) {
    targetUrl.pathname = "/company/login";
    targetUrl.search = "";
  } else if (pathname.startsWith("/employer/dashboard")) {
    targetUrl.pathname = "/company/dashboard";
  } else if (pathname.startsWith("/employer/company")) {
    targetUrl.pathname = "/company/profile";
  } else if (pathname.startsWith("/employer/job-postings")) {
    targetUrl.pathname = pathname.replace("/employer/job-postings", "/company/job-postings");
  } else if (pathname.startsWith("/employer/pipeline")) {
    targetUrl.pathname = "/company/pipeline";
  } else if (pathname.startsWith("/employer/subscription")) {
    targetUrl.pathname = "/company/billing";
  } else {
    targetUrl.pathname = "/company/login";
    targetUrl.search = "";
  }

  const response = NextResponse.redirect(targetUrl);
  response.cookies.delete(EMPLOYER_COOKIE);
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/employer" || pathname.startsWith("/employer/")) {
    return handleEmployerRoute(request);
  }

  if (pathname === "/company" || pathname.startsWith("/company/")) {
    return NextResponse.next();
  }

  return (nextAuthMiddleware as unknown as (
    request: NextRequest
  ) => Promise<NextResponse>)(request);
}

export default middleware;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logos|uploads).*)"],
};
