import { NextResponse } from "next/server";
import { getEmployerNotificationData } from "@/lib/employer-actions";

export async function GET() {
  try {
    const data = await getEmployerNotificationData();
    return NextResponse.json(data);
  } catch (error) {
    // Re-throw Next.js redirect errors so requireEmployerSession() auth gate works correctly.
    // A bare catch would swallow NEXT_REDIRECT and return JSON instead of redirecting.
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("GET /api/employer/notifications error:", error);
    return NextResponse.json({ total: 0, items: [] }, { status: 401 });
  }
}
