import { NextResponse } from "next/server";
import { getEmployerNotificationData } from "@/lib/employer-actions";

export async function GET() {
  try {
    const data = await getEmployerNotificationData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/employer/notifications error:", error);
    return NextResponse.json(
      { total: 0, items: [] },
      { status: 401 }
    );
  }
}
