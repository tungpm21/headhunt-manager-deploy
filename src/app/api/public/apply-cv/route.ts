import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const EXTENSION_MAP: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

export async function POST(req: NextRequest) {
  const rateLimitKey = buildRateLimitKey("public-upload", req.headers);
  const rateLimit = checkRateLimit(rateLimitKey, 10, 10 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Vui long thu lai sau ${rateLimit.retryAfterSeconds} giay`,
      },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("cv") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Chua chon file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Chi chap nhan file PDF hoac Word (.doc, .docx)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File khong duoc vuot qua 5MB" },
        { status: 400 }
      );
    }

    const safeExt = EXTENSION_MAP[file.type];
    const fileName = `apply-${Date.now()}-${Math.round(Math.random() * 1000)}.${safeExt}`;
    const { url } = await uploadFile("applications", fileName, file);

    return NextResponse.json({ url, fileName: file.name });
  } catch (error) {
    console.error("Public CV upload error:", error);
    return NextResponse.json(
      { error: "Da co loi khi tai file len." },
      { status: 500 }
    );
  }
}
