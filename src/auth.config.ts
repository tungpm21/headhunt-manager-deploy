import type { DefaultSession, NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "ADMIN";
      const pathname = nextUrl.pathname;

      const publicPrefixes = ["/viec-lam", "/cong-ty", "/ung-tuyen", "/employer"];
      const isPublicRoute =
        pathname === "/" || publicPrefixes.some((prefix) => pathname.startsWith(prefix));

      if (isPublicRoute) return true;

      const adminPrefixes = ["/moderation", "/employers", "/packages"];
      const isAdminRoute = adminPrefixes.some((prefix) => pathname.startsWith(prefix));

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        if (!isAdmin) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      const isOnLogin = pathname.startsWith("/login");
      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
