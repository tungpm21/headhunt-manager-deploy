import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { markAdminNotificationEventsRead } from "@/lib/notification-events";
import { getAdminNotificationSnapshot } from "@/lib/notifications";

async function getAdminUserId() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return Number(session.user.id);
}

function parseIds(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const ids = value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
  return ids.length > 0 ? ids : undefined;
}

export async function GET() {
  const adminUserId = await getAdminUserId();
  if (!adminUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getAdminNotificationSnapshot(true, adminUserId);
  return NextResponse.json(snapshot);
}

export async function PATCH(request: Request) {
  const adminUserId = await getAdminUserId();
  if (!adminUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  await markAdminNotificationEventsRead(adminUserId, parseIds(body.ids));

  const snapshot = await getAdminNotificationSnapshot(true, adminUserId);
  return NextResponse.json(snapshot);
}
