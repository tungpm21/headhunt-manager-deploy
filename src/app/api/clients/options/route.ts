import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllClients } from "@/lib/clients";
import { buildViewerScope } from "@/lib/viewer-scope";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Ban can dang nhap de tim client." },
      { status: 401 }
    );
  }

  const scope = buildViewerScope(session);

  if (!scope) {
    return NextResponse.json(
      { error: "Ban can dang nhap de tim client." },
      { status: 401 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("q") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  const includeIds = searchParams
    .getAll("includeId")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  const result = await getAllClients({
    search,
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 10,
    includeIds,
  }, scope);

  return NextResponse.json(result);
}
