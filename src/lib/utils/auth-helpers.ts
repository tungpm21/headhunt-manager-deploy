import { requireAuthenticatedUser } from "@/lib/authz";

export async function requireUserId(): Promise<number> {
  const { userId } = await requireAuthenticatedUser();
  return userId;
}
