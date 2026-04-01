"use server";

import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";
import {
  buildServerActionRateLimitKey,
  checkRateLimit,
} from "@/lib/rate-limit";

export type SubmitApplicationInput = {
  jobPostingId: number;
  fullName: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  cvFileUrl?: string;
  cvFileName?: string;
};

export type SubmitApplicationResult = {
  success: boolean;
  error?: string;
};

export async function submitApplication(
  input: SubmitApplicationInput
): Promise<SubmitApplicationResult> {
  const normalizedEmail = input.email?.trim().toLowerCase();
  const rateLimitKey = await buildServerActionRateLimitKey(
    "public-apply",
    normalizedEmail
  );
  const rateLimit = checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);

  const cleanupUploadedCv = async () => {
    if (input.cvFileUrl) {
      await deleteFile(input.cvFileUrl);
    }
  };

  if (!rateLimit.allowed) {
    await cleanupUploadedCv();
    return {
      success: false,
      error: `Vui long thu lai sau ${rateLimit.retryAfterSeconds} giay`,
    };
  }

  if (!input.fullName?.trim()) {
    await cleanupUploadedCv();
    return { success: false, error: "Vui long nhap ho ten" };
  }
  if (!normalizedEmail) {
    await cleanupUploadedCv();
    return { success: false, error: "Vui long nhap email" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    await cleanupUploadedCv();
    return { success: false, error: "Email khong hop le" };
  }

  const job = await prisma.jobPosting.findUnique({
    where: { id: input.jobPostingId },
    select: { id: true, status: true, expiresAt: true },
  });

  if (!job || job.status !== "APPROVED") {
    await cleanupUploadedCv();
    return { success: false, error: "Tin tuyen dung khong ton tai hoac da het han" };
  }
  if (job.expiresAt && job.expiresAt < new Date()) {
    await cleanupUploadedCv();
    return { success: false, error: "Tin tuyen dung da het han" };
  }

  const existing = await prisma.application.findFirst({
    where: { jobPostingId: input.jobPostingId, email: normalizedEmail },
  });
  if (existing) {
    await cleanupUploadedCv();
    return { success: false, error: "Ban da ung tuyen vi tri nay roi" };
  }

  try {
    await prisma.$transaction([
      prisma.application.create({
        data: {
          jobPostingId: input.jobPostingId,
          fullName: input.fullName.trim(),
          email: normalizedEmail,
          phone: input.phone?.trim() || null,
          coverLetter: input.coverLetter?.trim() || null,
          cvFileUrl: input.cvFileUrl || null,
          cvFileName: input.cvFileName || null,
        },
      }),
      prisma.jobPosting.update({
        where: { id: input.jobPostingId },
        data: { applyCount: { increment: 1 } },
      }),
    ]);

    return { success: true };
  } catch (error) {
    await cleanupUploadedCv();

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { success: false, error: "Ban da ung tuyen vi tri nay roi" };
    }

    return { success: false, error: "Khong the nop ho so luc nay" };
  }
}
