import { NextResponse } from "next/server";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { getCompanyPortalNotificationData } from "@/lib/company-portal-notifications";
import { markCompanyNotificationEventsRead } from "@/lib/notification-events";

function parseIds(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const ids = value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
  return ids.length > 0 ? ids : undefined;
}

export async function GET() {
  const session = await requireCompanyPortalSession();
  const snapshot = await getCompanyPortalNotificationData(session);
  return NextResponse.json(snapshot);
}

export async function PATCH(request: Request) {
  const session = await requireCompanyPortalSession();
  const body = await request.json().catch(() => ({}));

  await markCompanyNotificationEventsRead(
    session.portalUserId,
    session.workspaceId,
    parseIds(body.ids)
  );

  const snapshot = await getCompanyPortalNotificationData(session);
  return NextResponse.json(snapshot);
}
