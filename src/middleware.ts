import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Match all routes except static files and API auth routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
