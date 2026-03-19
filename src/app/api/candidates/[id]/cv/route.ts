import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateCandidateCV } from "@/lib/candidates";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const candidateId = Number(id);
  if (isNaN(candidateId))
    return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });

  const formData = await req.formData();
  const file = formData.get("cv") as File | null;

  if (!file) return NextResponse.json({ error: "Chưa chọn file" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json(
      { error: "Chỉ chấp nhận file PDF hoặc Word (.doc, .docx)" },
      { status: 400 }
    );
  if (file.size > MAX_SIZE_BYTES)
    return NextResponse.json(
      { error: "File quá lớn. Tối đa 10MB." },
      { status: 400 }
    );

  // Delete old file if exists
  const existing = await prisma.candidate.findUnique({ where: { id: candidateId }, select: { cvFileUrl: true } });
  if (existing?.cvFileUrl) {
    try { await unlink(path.join(process.cwd(), "public", existing.cvFileUrl)); } catch {}
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save to public/uploads/cvs/
  const ext = file.name.split(".").pop();
  const fileName = `cv-${candidateId}-${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "cvs");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  const cvFileUrl = `/uploads/cvs/${fileName}`;
  await updateCandidateCV(candidateId, cvFileUrl, file.name);

  return NextResponse.json({ url: cvFileUrl, fileName: file.name });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const candidateId = Number(id);
  if (isNaN(candidateId))
    return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });

  // Delete physical file before clearing DB
  const existing = await prisma.candidate.findUnique({ where: { id: candidateId }, select: { cvFileUrl: true } });
  if (existing?.cvFileUrl) {
    try { await unlink(path.join(process.cwd(), "public", existing.cvFileUrl)); } catch {}
  }

  await updateCandidateCV(candidateId, null, null);

  return NextResponse.json({ success: true });
}
