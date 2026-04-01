import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadFile } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) return NextResponse.json({ error: "Chưa chọn file ảnh" }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Chỉ chấp nhận file ảnh (JPG, PNG, WebP)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File quá lớn. Tối đa 5MB." },
        { status: 400 }
      );
    }

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const safeExt = extensionMap[file.type] || "tmp";
    const fileName = `avatar-${Date.now()}-${Math.round(Math.random() * 1000)}.${safeExt}`;

    const { url } = await uploadFile("avatars", fileName, file);

    return NextResponse.json({ url, fileName: file.name });
  } catch (error) {
    console.error("Avatar upload API error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra khi tải ảnh lên." },
      { status: 500 }
    );
  }
}
