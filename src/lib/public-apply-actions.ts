"use server";

import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";
import {
  getFirstZodErrorMessage,
  publicApplicationSchema,
} from "@/lib/validation/forms";
import {
  buildServerActionRateLimitKey,
  checkRateLimit,
} from "@/lib/rate-limit-redis";

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
  const parsedInput = publicApplicationSchema.safeParse({
    ...input,
    fullName: input.fullName?.trim(),
    email: input.email?.trim().toLowerCase(),
    phone: input.phone?.trim() || undefined,
    coverLetter: input.coverLetter?.trim() || undefined,
    cvFileUrl: input.cvFileUrl || undefined,
    cvFileName: input.cvFileName || undefined,
  });

  const normalizedEmail = parsedInput.success
    ? parsedInput.data.email
    : input.email?.trim().toLowerCase();

  const rateLimitKey = await buildServerActionRateLimitKey(
    "public-apply",
    normalizedEmail
  );
  const rateLimit = await checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);

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

  if (!parsedInput.success) {
    await cleanupUploadedCv();
    return {
      success: false,
      error: getFirstZodErrorMessage(parsedInput.error),
    };
  }

  const validatedInput = parsedInput.data;

  const job = await prisma.jobPosting.findUnique({
    where: { id: validatedInput.jobPostingId },
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
    where: {
      jobPostingId: validatedInput.jobPostingId,
      email: validatedInput.email,
    },
  });

  if (existing) {
    await cleanupUploadedCv();
    return { success: false, error: "Ban da ung tuyen vi tri nay roi" };
  }

  try {
    await prisma.$transaction([
      prisma.application.create({
        data: {
          jobPostingId: validatedInput.jobPostingId,
          fullName: validatedInput.fullName,
          email: validatedInput.email,
          phone: validatedInput.phone || null,
          coverLetter: validatedInput.coverLetter || null,
          cvFileUrl: validatedInput.cvFileUrl || null,
          cvFileName: validatedInput.cvFileName || null,
        },
      }),
      prisma.jobPosting.update({
        where: { id: validatedInput.jobPostingId },
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
