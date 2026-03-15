export { auth as middleware } from "@/auth";

export const config = {
  // Protect all routes except auth routes, static files, and images
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
