"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  employerJobPostingSchema,
  getFirstZodErrorMessage,
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

function revalidateJobPostingSurfaces(job: {
  id: number;
  slug: string;
  jobOrderId: number | null;
  employer: { id: number; slug: string };
}) {
  revalidatePath("/moderation");
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
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${job.jobOrderId}`);
  }
}

export async function getAdminJobPostingById(id: number) {
  await requireAdmin();

  return prisma.jobPosting.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
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

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
  }

  await prisma.jobPosting.update({
    where: { id },
    data: {
      title: parsedInput.data.title,
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

  if (!parsedInput.success) {
    return {
      success: false,
      message: getFirstZodErrorMessage(parsedInput.error),
    };
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
