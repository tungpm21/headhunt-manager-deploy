import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateCandidateCV } from "@/lib/candidates";
import { validateFileSignature } from "@/lib/file-signatures";
import { prisma } from "@/lib/prisma";
import { deleteFile, uploadFile } from "@/lib/storage";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const EXTENSION_MAP: Record<(typeof ALLOWED_TYPES)[number], string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: "Không có quyền truy cập" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const candidateId = Number(id);

  if (Number.isNaN(candidateId)) {
    return NextResponse.json({ error: "ID khong hop le" }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("cv") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Chưa chọn file" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return NextResponse.json(
      { error: "Chi chap nhan file PDF hoac Word (.doc, .docx)" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File qua lon. Toi da 10MB." },
      { status: 400 }
    );
  }

  const hasValidSignature = await validateFileSignature(file, ALLOWED_TYPES);
  if (!hasValidSignature) {
    return NextResponse.json(
      { error: "Noi dung file khong khop voi dinh dang PDF hoac Word." },
      { status: 400 }
    );
  }

  const existing = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { cvFileUrl: true },
  });

  const safeExt = EXTENSION_MAP[file.type as (typeof ALLOWED_TYPES)[number]];
  const fileName = `cv-${candidateId}-${Date.now()}.${safeExt}`;
  const { url } = await uploadFile("cvs", fileName, file);

  await updateCandidateCV(candidateId, url, file.name);

  if (existing?.cvFileUrl) {
    await deleteFile(existing.cvFileUrl);
  }

  return NextResponse.json({ url, fileName: file.name });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: "Không có quyền truy cập" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const candidateId = Number(id);

  if (Number.isNaN(candidateId)) {
    return NextResponse.json({ error: "ID khong hop le" }, { status: 400 });
  }

  const existing = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { cvFileUrl: true },
  });

  if (existing?.cvFileUrl) {
    await deleteFile(existing.cvFileUrl);
  }

  await updateCandidateCV(candidateId, null, null);

  return NextResponse.json({ success: true });
}
