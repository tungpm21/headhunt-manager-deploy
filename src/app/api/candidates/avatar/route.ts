import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateFileSignature } from "@/lib/file-signatures";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const EXTENSION_MAP: Record<(typeof ALLOWED_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: "Không có quyền truy cập" },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    const candidateIdRaw = formData.get("candidateId")?.toString().trim();
    const userId = Number(session.user.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Không xác định được người dùng." },
        { status: 401 }
      );
    }

    if (candidateIdRaw) {
      const candidateId = Number(candidateIdRaw);

      if (!Number.isInteger(candidateId) || candidateId <= 0) {
        return NextResponse.json(
          { error: "Mã ứng viên không hợp lệ." },
          { status: 400 }
        );
      }

      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        select: { createdById: true, isDeleted: true },
      });

      if (!candidate || candidate.isDeleted) {
        return NextResponse.json(
          { error: "Không tìm thấy ứng viên." },
          { status: 404 }
        );
      }

      const canUpload =
        session.user.role === "ADMIN" || candidate.createdById === userId;

      if (!canUpload) {
        return NextResponse.json(
          { error: "Bạn không có quyền tải avatar cho ứng viên này." },
          { status: 403 }
        );
      }
    } else if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bạn không có quyền tải avatar tạm." },
        { status: 403 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "Chưa chọn file ảnh" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: "Chi chap nhan file anh (JPG, PNG, WebP)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File qua lon. Toi da 5MB." },
        { status: 400 }
      );
    }

    const hasValidSignature = await validateFileSignature(file, ALLOWED_TYPES);
    if (!hasValidSignature) {
      return NextResponse.json(
        { error: "Noi dung file khong khop voi dinh dang anh hop le." },
        { status: 400 }
      );
    }

    const safeExt = EXTENSION_MAP[file.type as (typeof ALLOWED_TYPES)[number]];
    const fileScope = candidateIdRaw ? `candidate-${candidateIdRaw}` : `draft-${userId}`;
    const fileName = `avatar-${fileScope}-${Date.now()}-${Math.round(Math.random() * 1000)}.${safeExt}`;
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
