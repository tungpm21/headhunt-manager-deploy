import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
