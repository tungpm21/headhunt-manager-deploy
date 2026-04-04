import { UserRole } from "@prisma/client";
import type { Session } from "next-auth";

export type ViewerScope = {
  userId: number;
  role: UserRole;
  isAdmin: boolean;
};

export function buildViewerScope(session: Session | null): ViewerScope | null {
  const rawUserId = session?.user?.id;

  if (!rawUserId) {
    return null;
  }

  const userId = Number(rawUserId);

  if (!Number.isFinite(userId) || userId <= 0) {
    return null;
  }

  const role =
    session.user.role === "ADMIN" ? UserRole.ADMIN : UserRole.MEMBER;

  return {
    userId,
    role,
    isAdmin: role === UserRole.ADMIN,
  };
}
