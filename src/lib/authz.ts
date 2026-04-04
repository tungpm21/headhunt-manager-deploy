import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { buildViewerScope, ViewerScope } from "@/lib/viewer-scope";

export async function requireAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return {
    session,
    userId: Number(session.user.id),
  };
}

export async function requireViewerScope(): Promise<ViewerScope> {
  const { session } = await requireAuthenticatedUser();
  const scope = buildViewerScope(session);

  if (!scope) {
    redirect("/login");
  }

  return scope;
}

export async function requireAdmin() {
  const { session, userId } = await requireAuthenticatedUser();

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return {
    session,
    userId,
  };
}
