"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { deleteFile, uploadFile } from "@/lib/storage";

const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

function strVal(value: FormDataEntryValue | null): string | undefined {
  const normalized = value?.toString().trim();
  return normalized || undefined;
}

function strNull(value: FormDataEntryValue | null): string | null {
  const normalized = value?.toString().trim();
  return normalized || null;
}

function normalizeWebsite(value: string | null): string | null {
  if (!value) return null;

  const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(normalized).toString();
  } catch {
    return null;
  }
}

export async function getPendingJobPostings(status = "PENDING", page = 1) {
  await requireAdmin();

  const take = 10;
  const skip = (page - 1) * take;
  const where: Record<string, unknown> = {};

  if (status !== "ALL") {
    where.status = status;
  }

  const [jobs, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        employer: { select: { companyName: true, email: true, logo: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.jobPosting.count({ where }),
  ]);

  return { jobs, total, page, totalPages: Math.ceil(total / take) };
}

export async function approveJobPosting(id: number) {
  await requireAdmin();

  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: { employer: { include: { subscription: true } } },
  });

  if (!job) return { success: false, message: "Khong tim thay tin." };

  const duration = job.employer.subscription?.jobDuration ?? 30;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

  await prisma.jobPosting.update({
    where: { id },
    data: {
      status: "APPROVED",
      publishedAt: now,
      expiresAt,
      rejectReason: null,
    },
  });

  revalidatePath("/moderation");
  revalidatePath("/viec-lam");
  return { success: true, message: "Da duyet tin." };
}

export async function rejectJobPosting(id: number, reason: string) {
  await requireAdmin();

  if (!reason.trim()) {
    return { success: false, message: "Vui long nhap ly do tu choi." };
  }

  await prisma.jobPosting.update({
    where: { id },
    data: { status: "REJECTED", rejectReason: reason.trim() },
  });

  revalidatePath("/moderation");
  return { success: true, message: "Da tu choi tin." };
}

export async function getEmployers(status = "ALL", page = 1) {
  await requireAdmin();

  const take = 10;
  const skip = (page - 1) * take;
  const where: Record<string, unknown> = {};

  if (status !== "ALL") {
    where.status = status;
  }

  const [employers, total] = await Promise.all([
    prisma.employer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        email: true,
        companyName: true,
        industry: true,
        address: true,
        status: true,
        slug: true,
        createdAt: true,
        client: { select: { id: true, companyName: true } },
        subscription: { select: { tier: true, status: true, jobQuota: true, jobsUsed: true } },
        _count: { select: { jobPostings: true } },
      },
    }),
    prisma.employer.count({ where }),
  ]);

  return { employers, total, page, totalPages: Math.ceil(total / take) };
}

export async function updateEmployerStatus(id: number, newStatus: string) {
  await requireAdmin();

  const validStatuses = ["ACTIVE", "PENDING", "SUSPENDED"];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, message: "Trang thai khong hop le." };
  }

  const employer = await prisma.employer.update({
    where: { id },
    data: { status: newStatus as "ACTIVE" | "PENDING" | "SUSPENDED" },
    select: { slug: true },
  });

  revalidatePath("/employers");
  revalidatePath(`/employers/${id}`);
  revalidatePath("/");
  revalidatePath("/cong-ty");
  revalidatePath(`/cong-ty/${employer.slug}`);
  return { success: true, message: `Da cap nhat trang thai: ${newStatus}` };
}

export async function getEmployerById(id: number) {
  await requireAdmin();

  return prisma.employer.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      companyName: true,
      logo: true,
      description: true,
      industry: true,
      companySize: true,
      address: true,
      website: true,
      phone: true,
      status: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      client: {
        select: {
          id: true,
          companyName: true,
          industry: true,
          website: true,
          address: true,
          status: true,
        },
      },
      subscription: {
        select: {
          id: true,
          tier: true,
          status: true,
          jobQuota: true,
          jobsUsed: true,
          jobDuration: true,
          showLogo: true,
          showBanner: true,
          startDate: true,
          endDate: true,
          price: true,
          createdAt: true,
        },
      },
      jobPostings: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          viewCount: true,
          applyCount: true,
          createdAt: true,
          publishedAt: true,
          expiresAt: true,
          location: true,
          workType: true,
        },
      },
      _count: { select: { jobPostings: true } },
    },
  });
}

export async function getEmployerJobPostings(employerId: number, page = 1) {
  await requireAdmin();

  const take = 10;
  const skip = (page - 1) * take;
  const where = { employerId };

  const [jobPostings, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        viewCount: true,
        applyCount: true,
        createdAt: true,
        publishedAt: true,
        expiresAt: true,
        location: true,
        workType: true,
      },
    }),
    prisma.jobPosting.count({ where }),
  ]);

  return { jobPostings, total, page, totalPages: Math.ceil(total / take) };
}

export async function updateEmployerInfo(
  employerId: number,
  _prevState: { success?: boolean; message?: string; logoUrl?: string | null } | undefined,
  formData: FormData
) {
  await requireAdmin();

  const employer = await prisma.employer.findUnique({
    where: { id: employerId },
    select: {
      id: true,
      slug: true,
      logo: true,
      jobPostings: { select: { slug: true } },
    },
  });

  if (!employer) {
    return { success: false, message: "Khong tim thay employer." };
  }

  const companyName = strVal(formData.get("companyName"));
  const description = strNull(formData.get("description"));
  const industry = strNull(formData.get("industry"));
  const address = strNull(formData.get("address"));
  const phone = strNull(formData.get("phone"));
  const websiteInput = strNull(formData.get("website"));
  const companySizeValue = strVal(formData.get("companySize"));
  const website = normalizeWebsite(websiteInput);

  if (!companyName) {
    return { success: false, message: "Ten cong ty khong duoc de trong." };
  }

  if (websiteInput && !website) {
    return { success: false, message: "Website khong hop le." };
  }

  const validSizes = ["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"];
  if (companySizeValue && !validSizes.includes(companySizeValue)) {
    return { success: false, message: "Quy mo cong ty khong hop le." };
  }

  const logoFile = formData.get("logo");
  const nextLogo =
    logoFile instanceof File && logoFile.size > 0 ? logoFile : null;

  let uploadedLogoUrl: string | null = null;

  if (nextLogo) {
    if (!ALLOWED_LOGO_TYPES.includes(nextLogo.type)) {
      return {
        success: false,
        message: "Chi chap nhan logo JPG, PNG hoac WebP.",
      };
    }

    if (nextLogo.size > MAX_LOGO_SIZE_BYTES) {
      return {
        success: false,
        message: "Logo qua lon. Toi da 2MB.",
      };
    }

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const safeExt = extensionMap[nextLogo.type] ?? "tmp";
    const fileName = `employer-logo-${employerId}-${Date.now()}.${safeExt}`;

    try {
      const uploadResult = await uploadFile("logos", fileName, nextLogo);
      uploadedLogoUrl = uploadResult.url;
    } catch (error) {
      console.error("Employer logo upload error:", error);
      return {
        success: false,
        message: "Khong the tai logo len. Vui long thu lai.",
      };
    }
  }

  try {
    await prisma.employer.update({
      where: { id: employerId },
      data: {
        companyName,
        description,
        logo: uploadedLogoUrl ?? employer.logo,
        industry,
        companySize: companySizeValue
          ? (companySizeValue as "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE")
          : null,
        address,
        website,
        phone,
      },
    });
  } catch (error) {
    if (uploadedLogoUrl) {
      await deleteFile(uploadedLogoUrl);
    }

    console.error("updateEmployerInfo error:", error);
    return {
      success: false,
      message: "Khong the cap nhat thong tin employer.",
    };
  }

  if (uploadedLogoUrl && employer.logo && employer.logo !== uploadedLogoUrl) {
    await deleteFile(employer.logo);
  }

  // Revalidate only paths that display employer company info
  revalidatePath("/employers");
  revalidatePath(`/employers/${employerId}`);
  revalidatePath(`/employers/${employerId}/edit`);
  revalidatePath(`/cong-ty/${employer.slug}`);
  revalidatePath("/cong-ty");
  // Job posting pages show employer name/logo
  revalidatePath("/viec-lam");
  employer.jobPostings.forEach((job) => {
    revalidatePath(`/viec-lam/${job.slug}`);
  });


  return {
    success: true,
    message: "Da cap nhat thong tin cong ty.",
    logoUrl: uploadedLogoUrl ?? employer.logo,
  };
}

export async function getSubscriptions(page = 1) {
  await requireAdmin();

  const take = 10;
  const skip = (page - 1) * take;

  const [subs, total] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        employer: { select: { companyName: true, email: true } },
      },
    }),
    prisma.subscription.count(),
  ]);

  return { subs, total, page, totalPages: Math.ceil(total / take) };
}

export async function assignSubscription(formData: FormData) {
  await requireAdmin();

  const employerId = parseInt(formData.get("employerId") as string, 10);
  const tier = formData.get("tier") as string;
  const jobQuota = parseInt(formData.get("jobQuota") as string, 10);
  const jobDuration = parseInt(formData.get("jobDuration") as string, 10) || 30;
  const durationMonths =
    parseInt(formData.get("durationMonths") as string, 10) || 12;
  const showLogo = formData.get("showLogo") === "true";
  const showBanner = formData.get("showBanner") === "true";

  if (!employerId || !tier || !jobQuota) {
    return { success: false, message: "Vui long dien day du thong tin." };
  }

  const employer = await prisma.employer.findUnique({ where: { id: employerId } });
  if (!employer) {
    return { success: false, message: "Khong tim thay employer." };
  }

  const now = new Date();
  const endDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);
  const existingSub = await prisma.subscription.findUnique({ where: { employerId } });

  if (existingSub) {
    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        tier: tier as "BASIC" | "STANDARD" | "PREMIUM" | "VIP",
        jobQuota,
        jobDuration,
        startDate: now,
        endDate,
        status: "ACTIVE",
        showLogo,
        showBanner,
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        employerId,
        tier: tier as "BASIC" | "STANDARD" | "PREMIUM" | "VIP",
        jobQuota,
        jobsUsed: 0,
        jobDuration,
        price: 0,
        startDate: now,
        endDate,
        status: "ACTIVE",
        showLogo,
        showBanner,
      },
    });
  }

  if (employer.status === "PENDING") {
    await prisma.employer.update({
      where: { id: employerId },
      data: { status: "ACTIVE" },
    });
  }

  revalidatePath("/packages");
  revalidatePath("/employers");
  return { success: true, message: `Da cap goi ${tier} cho ${employer.companyName}.` };
}

export async function getApplicationsForImport(status = "NEW", page = 1) {
  await requireAdmin();

  const take = 15;
  const skip = (page - 1) * take;
  const where: Record<string, unknown> = {};

  if (status !== "ALL") {
    where.status = status;
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        jobPosting: {
          select: {
            title: true,
            slug: true,
            industry: true,
            location: true,
            salaryDisplay: true,
            workType: true,
            employer: { select: { companyName: true } },
          },
        },
        candidate: { select: { id: true, fullName: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);


  return { applications, total, page, totalPages: Math.ceil(total / take) };
}

export async function importApplicationToCRM(applicationId: number) {
  const { userId } = await requireAdmin();

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      jobPosting: {
        select: {
          title: true,
          industry: true,
          location: true,
          employer: { select: { companyName: true } },
        },
      },
    },
  });

  if (!application) {
    return { success: false, message: "Khong tim thay don ung tuyen." };
  }
  if (application.status === "IMPORTED") {
    return { success: false, message: "Don nay da duoc import truoc do." };
  }

  let candidateId: number;
  const normalizedEmail = application.email.trim().toLowerCase();
  const existingCandidate = normalizedEmail
    ? await prisma.candidate.findFirst({
      where: { email: normalizedEmail, isDeleted: false },
    })
    : null;

  if (existingCandidate) {
    candidateId = existingCandidate.id;
    if (!existingCandidate.cvFileUrl && application.cvFileUrl) {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          cvFileUrl: application.cvFileUrl,
          cvFileName: application.cvFileName,
        },
      });
    }
  } else {
    const newCandidate = await prisma.candidate.create({
      data: {
        fullName: application.fullName,
        email: normalizedEmail,
        phone: application.phone,
        cvFileUrl: application.cvFileUrl,
        cvFileName: application.cvFileName,
        source: "FDIWORK",
        sourceDetail: `${application.jobPosting.employer.companyName} - ${application.jobPosting.title}`,
        industry: application.jobPosting.industry,
        location: application.jobPosting.location,
        status: "AVAILABLE",
        createdById: userId,
      },
    });
    candidateId = newCandidate.id;
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "IMPORTED", candidateId },
  });

  revalidatePath("/moderation/applications");
  revalidatePath("/candidates");
  revalidatePath("/dashboard");
  return {
    success: true,
    message: existingCandidate
      ? `Da link vao ung vien #${candidateId} (${existingCandidate.fullName}).`
      : `Da tao ung vien moi #${candidateId} trong CRM.`,
    candidateId,
  };
}

export async function linkEmployerToClient(
  employerId: number,
  clientId: number | null
) {
  await requireAdmin();

  const employer = await prisma.employer.findUnique({ where: { id: employerId } });
  if (!employer) {
    return { success: false, message: "Khong tim thay employer." };
  }

  if (clientId) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        OR: [
          { isDeleted: false },
          { employer: { is: { id: employerId } } },
        ],
      },
      select: {
        id: true,
        employer: { select: { id: true } },
      },
    });
    if (!client) {
      return { success: false, message: "Khong tim thay client." };
    }

    if (client.employer && client.employer.id !== employerId) {
      return {
        success: false,
        message: "Client nay da duoc link voi employer khac.",
      };
    }
  }

  try {
    await prisma.employer.update({
      where: { id: employerId },
      data: { clientId },
    });
  } catch (error) {
    console.error("linkEmployerToClient error:", error);
    return {
      success: false,
      message: "Khong the cap nhat lien ket Client.",
    };
  }

  revalidatePath("/employers");
  revalidatePath(`/employers/${employerId}`);
  return {
    success: true,
    message: clientId ? "Da link Employer voi Client." : "Da bo link Client.",
  };
}

export async function getNewApplicationsCount() {
  await requireAdmin();
  return prisma.application.count({ where: { status: "NEW" } });
}

export async function getRecentApplications(take = 5) {
  await requireAdmin();

  return prisma.application.findMany({
    where: { status: { in: ["NEW", "REVIEWED", "SHORTLISTED"] } },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      jobPosting: {
        select: { title: true, employer: { select: { companyName: true } } },
      },
    },
  });
}

export async function getClientsForEmployerLinking(employerId: number) {
  await requireAdmin();

  return prisma.client.findMany({
    where: {
      OR: [
        { isDeleted: false, employer: { is: null } },
        { employer: { is: { id: employerId } } },
      ],
    },
    select: { id: true, companyName: true },
    orderBy: { companyName: "asc" },
  });
}
