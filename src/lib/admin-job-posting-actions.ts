"use server";

import { JobPostingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  employerJobPostingSchema,
  getFirstZodErrorMessage,
  moderationRejectJobSchema,
} from "@/lib/validation/forms";

function parseJobPostingSkills(value: FormDataEntryValue | null): string[] {
  const raw = value?.toString().trim() ?? "";

  if (!raw) {
    return [];
  }

  return Array.from(
    new Set(
      raw
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    )
  );
}

function parseNullableNumber(value: FormDataEntryValue | null) {
  const normalized = value?.toString().trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function buildJobPostingInput(formData: FormData) {
  return {
    title: formData.get("title")?.toString().trim() ?? "",
    description: formData.get("description")?.toString().trim() ?? "",
    requirements: formData.get("requirements")?.toString().trim() || null,
    benefits: formData.get("benefits")?.toString().trim() || null,
    salaryMin: parseNullableNumber(formData.get("salaryMin")),
    salaryMax: parseNullableNumber(formData.get("salaryMax")),
    salaryDisplay: formData.get("salaryDisplay")?.toString().trim() || null,
    industry: formData.get("industry")?.toString().trim() || null,
    position: formData.get("position")?.toString().trim() || null,
    location: formData.get("location")?.toString().trim() || null,
    workType: formData.get("workType")?.toString().trim() || null,
    quantity: Number(formData.get("quantity")?.toString().trim() || "1"),
    skills: parseJobPostingSkills(formData.get("skills")),
    industrialZone: formData.get("industrialZone")?.toString().trim() || null,
    requiredLanguages: (() => {
      const lang = formData.get("requiredLanguage")?.toString().trim();
      return lang && lang !== "none" ? [lang] : [];
    })(),
    languageProficiency: formData.get("languageProficiency")?.toString().trim() || null,
    shiftType: formData.get("shiftType")?.toString().trim() || null,
  };
}

function buildJobCoverInput(formData: FormData) {
  const coverImage = formData.get("coverImage")?.toString().trim() || null;
  const coverAlt = coverImage ? formData.get("coverAlt")?.toString().trim() || null : null;
  return { coverImage, coverAlt };
}

function revalidateJobPostingSurfaces(job: {
  id: number;
  slug: string;
  jobOrderId: number | null;
  employer: { id: number; slug: string };
}) {
  revalidatePath("/moderation");
  revalidatePath("/jobs");
  revalidatePath(`/moderation/${job.id}/edit`);
  revalidatePath("/employers");
  revalidatePath(`/employers/${job.employer.id}`);
  revalidatePath("/");
  revalidatePath("/cong-ty");
  revalidatePath(`/cong-ty/${job.employer.slug}`);
  revalidatePath("/viec-lam");
  revalidatePath(`/viec-lam/${job.slug}`);
  revalidatePath("/employer/job-postings");
  revalidatePath(`/employer/job-postings/${job.id}`);

  if (job.jobOrderId) {
    revalidatePath(`/jobs/${job.jobOrderId}`);
  }
}

type BulkJobPostingModerationAction =
  | "approve"
  | "reject"
  | "pause"
  | "resume"
  | "delete";

const QUICK_EDIT_JOB_POSTING_STATUSES: JobPostingStatus[] = [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "PAUSED",
  "REJECTED",
  "EXPIRED",
];

function normalizeBulkJobPostingIds(ids: number[]) {
  return Array.from(
    new Set(
      ids
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0)
    )
  ).slice(0, 100);
}

export async function bulkAdminJobPostingModeration(
  ids: number[],
  action: BulkJobPostingModerationAction,
  rejectReason?: string
) {
  await requireAdmin();

  const safeIds = normalizeBulkJobPostingIds(ids);
  if (safeIds.length === 0) {
    return { success: false, message: "Chưa chọn bài đăng nào." };
  }

  if (action === "reject") {
    const parsedReason = moderationRejectJobSchema.safeParse({
      reason: rejectReason ?? "",
    });

    if (!parsedReason.success) {
      return {
        success: false,
        message: getFirstZodErrorMessage(parsedReason.error),
      };
    }
  }

  const jobs = await prisma.jobPosting.findMany({
    where: { id: { in: safeIds } },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      expiresAt: true,
      jobOrderId: true,
      employer: {
        select: {
          id: true,
          slug: true,
          subscription: { select: { jobDuration: true } },
        },
      },
      _count: { select: { applications: true } },
    },
  });

  let changed = 0;
  const skipped: string[] = [];
  const now = new Date();

  for (const job of jobs) {
    try {
      if (action === "approve") {
        if (!["PENDING", "REJECTED", "EXPIRED"].includes(job.status)) {
          skipped.push(`#${job.id} không ở trạng thái có thể duyệt.`);
          continue;
        }

        const duration = job.employer.subscription?.jobDuration ?? 30;
        const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
        await prisma.jobPosting.update({
          where: { id: job.id },
          data: {
            status: "APPROVED",
            publishedAt: now,
            expiresAt,
            rejectReason: null,
          },
        });
      } else if (action === "reject") {
        if (job.status !== "PENDING") {
          skipped.push(`#${job.id} chỉ có thể từ chối khi đang chờ duyệt.`);
          continue;
        }

        await prisma.jobPosting.update({
          where: { id: job.id },
          data: {
            status: "REJECTED",
            rejectReason: rejectReason?.trim() ?? "",
          },
        });
      } else if (action === "pause") {
        if (job.status !== "APPROVED") {
          skipped.push(`#${job.id} chưa public nên không thể tạm ẩn.`);
          continue;
        }

        await prisma.jobPosting.update({
          where: { id: job.id },
          data: { status: "PAUSED" },
        });
      } else if (action === "resume") {
        if (job.status !== "PAUSED") {
          skipped.push(`#${job.id} không ở trạng thái tạm ẩn.`);
          continue;
        }
        if (job.expiresAt && job.expiresAt < now) {
          skipped.push(`#${job.id} đã hết hạn, không thể hiện lại.`);
          continue;
        }

        await prisma.jobPosting.update({
          where: { id: job.id },
          data: { status: "APPROVED" },
        });
      } else if (action === "delete") {
        if (job.jobOrderId) {
          skipped.push(`#${job.id} đang link JobOrder.`);
          continue;
        }
        if (job._count.applications > 0) {
          skipped.push(`#${job.id} đã có ứng viên.`);
          continue;
        }

        await prisma.jobPosting.delete({ where: { id: job.id } });
      }

      changed += 1;
      revalidateJobPostingSurfaces(job);
    } catch (error) {
      console.error("bulkAdminJobPostingModeration error:", error);
      skipped.push(`#${job.id} không thể cập nhật.`);
    }
  }

  revalidatePath("/jobs");
  revalidatePath("/moderation");
  revalidatePath("/viec-lam");

  const skippedSuffix =
    skipped.length > 0 ? ` Bỏ qua ${skipped.length} bài: ${skipped.slice(0, 3).join(" ")}` : "";

  return {
    success: changed > 0,
    message:
      changed > 0
        ? `Đã cập nhật ${changed}/${safeIds.length} bài đăng.${skippedSuffix}`
        : `Không có bài đăng nào được cập nhật.${skippedSuffix}`,
  };
}

export async function updateAdminJobPostingStatus(id: number, statusValue: string) {
  await requireAdmin();

  const status = statusValue as JobPostingStatus;
  if (!QUICK_EDIT_JOB_POSTING_STATUSES.includes(status)) {
    return { success: false, message: "Trạng thái bài đăng không hợp lệ." };
  }

  const job = await prisma.jobPosting.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      status: true,
      rejectReason: true,
      jobOrderId: true,
      employer: {
        select: {
          id: true,
          slug: true,
          subscription: { select: { jobDuration: true } },
        },
      },
    },
  });

  if (!job) {
    return { success: false, message: "Không tìm thấy bài đăng." };
  }

  const now = new Date();
  const data: {
    status: JobPostingStatus;
    publishedAt?: Date | null;
    expiresAt?: Date | null;
    rejectReason?: string | null;
  } = { status };

  if (status === "APPROVED") {
    const duration = job.employer.subscription?.jobDuration ?? 30;
    data.publishedAt = job.status === "APPROVED" ? undefined : now;
    data.expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
    data.rejectReason = null;
  } else if (status === "REJECTED") {
    data.rejectReason = job.rejectReason ?? "Từ chối nhanh từ Admin CRM.";
  } else if (status === "EXPIRED") {
    data.expiresAt = now;
  } else if (status === "PENDING" || status === "DRAFT") {
    data.rejectReason = null;
  }

  await prisma.jobPosting.update({
    where: { id },
    data,
  });

  revalidateJobPostingSurfaces(job);
  return { success: true, message: "Đã cập nhật trạng thái bài đăng." };
}

export async function linkAdminJobPostingJobOrder(
  jobPostingId: number,
  jobOrderId: number | null
) {
  await requireAdmin();

  const job = await prisma.jobPosting.findUnique({
    where: { id: jobPostingId },
    select: {
      id: true,
      slug: true,
      jobOrderId: true,
      employer: { select: { id: true, slug: true } },
    },
  });

  if (!job) {
    return { success: false, message: "Không tìm thấy bài đăng." };
  }

  if (jobOrderId) {
    const jobOrder = await prisma.jobOrder.findUnique({
      where: { id: jobOrderId },
      select: { id: true },
    });

    if (!jobOrder) {
      return { success: false, message: "Không tìm thấy JobOrder." };
    }
  }

  await prisma.jobPosting.update({
    where: { id: jobPostingId },
    data: { jobOrderId },
  });

  revalidateJobPostingSurfaces({ ...job, jobOrderId });
  if (job.jobOrderId) {
    revalidatePath(`/jobs/${job.jobOrderId}`);
  }
  if (jobOrderId) {
    revalidatePath(`/jobs/${jobOrderId}`);
  }

  return {
    success: true,
    message: jobOrderId ? "Đã link JobOrder." : "Đã bỏ link JobOrder.",
  };
}

export async function getAdminJobOrderLinkOptions() {
  await requireAdmin();

  return prisma.jobOrder.findMany({
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: 200,
    select: {
      id: true,
      title: true,
      status: true,
      client: { select: { companyName: true } },
    },
  });
}

export async function getAdminJobPostingById(id: number) {
  await requireAdmin();

  return prisma.jobPosting.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      coverAlt: true,
      description: true,
      requirements: true,
      benefits: true,
      salaryMin: true,
      salaryMax: true,
      salaryDisplay: true,
      industry: true,
      position: true,
      location: true,
      workType: true,
      quantity: true,
      skills: true,
      industrialZone: true,
      requiredLanguages: true,
      languageProficiency: true,
      shiftType: true,
      status: true,
      rejectReason: true,
      viewCount: true,
      applyCount: true,
      jobOrderId: true,
      employer: {
        select: {
          id: true,
          slug: true,
          companyName: true,
          email: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });
}

export async function updateAdminJobPosting(id: number, formData: FormData) {
  await requireAdmin();

  const existingJob = await prisma.jobPosting.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      jobOrderId: true,
      employer: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  });

  if (!existingJob) {
    return { success: false, message: "Không tìm thấy bài đăng." };
  }

  const parsedInput = employerJobPostingSchema.safeParse(
    buildJobPostingInput(formData)
  );
  const coverInput = buildJobCoverInput(formData);

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }
  if (coverInput.coverImage && !coverInput.coverAlt) {
    return { success: false, message: "Vui long nhap alt text cho anh cover." };
  }

  await prisma.jobPosting.update({
    where: { id },
    data: {
      title: parsedInput.data.title,
      coverImage: coverInput.coverImage,
      coverAlt: coverInput.coverAlt,
      description: parsedInput.data.description,
      requirements: parsedInput.data.requirements || null,
      benefits: parsedInput.data.benefits || null,
      salaryMin: parsedInput.data.salaryMin ?? null,
      salaryMax: parsedInput.data.salaryMax ?? null,
      salaryDisplay: parsedInput.data.salaryDisplay || null,
      industry: parsedInput.data.industry || null,
      position: parsedInput.data.position || null,
      location: parsedInput.data.location || null,
      workType: parsedInput.data.workType || null,
      quantity: parsedInput.data.quantity,
      skills: parsedInput.data.skills,
      industrialZone: parsedInput.data.industrialZone || null,
      requiredLanguages: parsedInput.data.requiredLanguages,
      languageProficiency: parsedInput.data.languageProficiency || null,
      shiftType: parsedInput.data.shiftType || null,
    },
  });

  revalidateJobPostingSurfaces(existingJob);

  return {
    success: true,
    message: "Đã cập nhật bài đăng tuyển dụng.",
  };
}

export async function toggleAdminJobPostingVisibility(id: number) {
  await requireAdmin();

  const job = await prisma.jobPosting.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      status: true,
      expiresAt: true,
      jobOrderId: true,
      employer: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  });

  if (!job) {
    return { success: false, message: "Không tìm thấy bài đăng." };
  }

  if (job.status === "APPROVED") {
    await prisma.jobPosting.update({
      where: { id },
      data: { status: "PAUSED" },
    });

    revalidateJobPostingSurfaces(job);

    return { success: true, message: "Đã tạm ẩn bài đăng." };
  }

  if (job.status === "PAUSED") {
    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      return {
        success: false,
        message: "Tin đã hết hạn, không thể bật lại.",
      };
    }

    await prisma.jobPosting.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    revalidateJobPostingSurfaces(job);

    return { success: true, message: "Đã bật lại bài đăng." };
  }

  return {
    success: false,
    message: "Chỉ có thể bật/tắt các tin đang hiển thị hoặc tạm ẩn.",
  };
}

export async function deleteAdminJobPosting(id: number) {
  await requireAdmin();

  const job = await prisma.jobPosting.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      jobOrderId: true,
      employer: {
        select: {
          id: true,
          slug: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  if (!job) {
    return { success: false, message: "Không tìm thấy bài đăng." };
  }

  if (job.jobOrderId) {
    return {
      success: false,
      message:
        "Tin này đang được link với Job Order trong CRM. Hãy quản lý từ Job Order để tránh mất đồng bộ.",
    };
  }

  if (job._count.applications > 0) {
    return {
      success: false,
      message:
        "Tin này đã có ứng viên nộp hồ sơ, không thể xóa để tránh mất dữ liệu.",
    };
  }

  await prisma.jobPosting.delete({
    where: { id },
  });

  revalidateJobPostingSurfaces(job);

  return {
    success: true,
    message: `Đã xóa bài đăng "${job.title}".`,
  };
}

function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  return normalized || `job-posting-${Date.now()}`;
}

async function createUniqueJobPostingSlug(title: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.jobPosting.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

export async function getAdminEmployerOptions() {
  await requireAdmin();

  return prisma.employer.findMany({
    where: {
      status: "ACTIVE",
      subscription: {
        is: {
          status: "ACTIVE",
          endDate: {
            gte: new Date(),
          },
        },
      },
    },
    orderBy: { companyName: "asc" },
    select: {
      id: true,
      companyName: true,
      email: true,
      slug: true,
      subscription: {
        select: {
          tier: true,
          jobQuota: true,
          jobsUsed: true,
          jobDuration: true,
          endDate: true,
        },
      },
    },
  });
}

export async function createAdminJobPosting(formData: FormData) {
  await requireAdmin();

  const employerId = Number.parseInt(formData.get("employerId")?.toString() ?? "", 10);

  if (!Number.isInteger(employerId) || employerId <= 0) {
    return {
      success: false,
      message: "Vui lòng chọn nhà tuyển dụng.",
    };
  }

  const employer = await prisma.employer.findUnique({
    where: { id: employerId },
    include: { subscription: true },
  });

  if (!employer || employer.status !== "ACTIVE") {
    return {
      success: false,
      message: "Nhà tuyển dụng không hợp lệ hoặc chưa hoạt động.",
    };
  }

  const subscription = employer.subscription;

  if (!subscription || subscription.status !== "ACTIVE" || subscription.endDate < new Date()) {
    return {
      success: false,
      message: "Nhà tuyển dụng này chưa có gói dịch vụ đang hoạt động.",
    };
  }

  if (subscription.jobsUsed >= subscription.jobQuota) {
    return {
      success: false,
      message: "Nhà tuyển dụng này đã hết quota đăng tin.",
    };
  }

  const parsedInput = employerJobPostingSchema.safeParse(
    buildJobPostingInput(formData)
  );
  const coverInput = buildJobCoverInput(formData);

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }
  if (coverInput.coverImage && !coverInput.coverAlt) {
    return { success: false, message: "Vui long nhap alt text cho anh cover." };
  }

  const slug = await createUniqueJobPostingSlug(parsedInput.data.title);
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + subscription.jobDuration * 24 * 60 * 60 * 1000
  );

  const [jobPosting] = await prisma.$transaction([
    prisma.jobPosting.create({
      data: {
        employerId,
        title: parsedInput.data.title,
        slug,
        coverImage: coverInput.coverImage,
        coverAlt: coverInput.coverAlt,
        description: parsedInput.data.description,
        requirements: parsedInput.data.requirements || null,
        benefits: parsedInput.data.benefits || null,
        salaryMin: parsedInput.data.salaryMin ?? null,
        salaryMax: parsedInput.data.salaryMax ?? null,
        salaryDisplay: parsedInput.data.salaryDisplay || null,
        industry: parsedInput.data.industry || null,
        position: parsedInput.data.position || null,
        location: parsedInput.data.location || null,
        workType: parsedInput.data.workType || null,
        quantity: parsedInput.data.quantity,
        skills: parsedInput.data.skills,
        industrialZone: parsedInput.data.industrialZone || null,
        requiredLanguages: parsedInput.data.requiredLanguages,
        languageProficiency: parsedInput.data.languageProficiency || null,
        shiftType: parsedInput.data.shiftType || null,
        status: "APPROVED",
        publishedAt: now,
        expiresAt,
      },
      select: {
        id: true,
        slug: true,
      },
    }),
    prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        jobsUsed: {
          increment: 1,
        },
      },
    }),
  ]);

  revalidatePath("/moderation");
  revalidatePath("/jobs");
  revalidatePath("/moderation/new");
  revalidatePath("/employers");
  revalidatePath(`/employers/${employer.id}`);
  revalidatePath("/");
  revalidatePath("/cong-ty");
  revalidatePath(`/cong-ty/${employer.slug}`);
  revalidatePath("/viec-lam");
  revalidatePath(`/viec-lam/${jobPosting.slug}`);
  revalidatePath("/employer/job-postings");

  return {
    success: true,
    message: "Đã tạo bài đăng mới.",
    id: jobPosting.id,
  };
}
