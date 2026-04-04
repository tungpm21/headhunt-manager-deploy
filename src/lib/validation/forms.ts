import {
  CandidateSeniority,
  CandidateSource,
  CandidateStatus,
  ClientStatus,
  CompanySize,
  EmployerStatus,
  FeeType,
  Gender,
  JobStatus,
  SubscriptionTier,
} from "@prisma/client";
import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();
const nullableOptionalText = z.string().trim().min(1).nullish();
const optionalEmail = z.string().trim().email("Email khong hop le.").optional();

export const authLoginSchema = z.object({
  email: z.string().trim().email("Email khong hop le."),
  password: z.string().min(1, "Vui long nhap mat khau."),
});

export const publicApplicationSchema = z.object({
  jobPostingId: z
    .number()
    .int("Tin tuyen dung khong hop le.")
    .positive("Tin tuyen dung khong hop le."),
  fullName: z.string().trim().min(1, "Vui long nhap ho ten."),
  email: z.string().trim().email("Email khong hop le."),
  phone: optionalText,
  coverLetter: optionalText,
  cvFileUrl: optionalText,
  cvFileName: optionalText,
});

export const clientFormSchema = z.object({
  companyName: z.string().trim().min(1, "Ten doanh nghiep khong duoc de trong."),
  industry: optionalText,
  companySize: z.nativeEnum(CompanySize).optional(),
  address: optionalText,
  website: optionalText,
  notes: optionalText,
  status: z.nativeEnum(ClientStatus).optional(),
});

export const jobFormSchema = z
  .object({
    title: z.string().trim().min(1, "Vi tri tuyen dung khong duoc de trong."),
    clientId: z
      .number()
      .int("Doanh nghiep la bat buoc.")
      .positive("Doanh nghiep la bat buoc."),
    description: optionalText,
    industry: optionalText,
    location: optionalText,
    requiredSkills: z.array(z.string().trim().min(1)).default([]),
    salaryMin: z.number().nonnegative("Luong toi thieu khong hop le.").optional(),
    salaryMax: z.number().nonnegative("Luong toi da khong hop le.").optional(),
    quantity: z.number().int().positive("So luong can tuyen phai lon hon 0.").default(1),
    deadline: z.date().optional(),
    status: z.nativeEnum(JobStatus).default(JobStatus.OPEN),
    assignedToId: z.number().int().positive().optional(),
    fee: z.number().nonnegative("Phi dich vu khong hop le.").optional(),
    feeType: z.nativeEnum(FeeType).optional(),
    notes: optionalText,
  })
  .superRefine((data, ctx) => {
    if (
      data.salaryMin !== undefined &&
      data.salaryMax !== undefined &&
      data.salaryMax < data.salaryMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Luong toi da phai lon hon hoac bang luong toi thieu.",
        path: ["salaryMax"],
      });
    }
  });

export const candidateFormSchema = z
  .object({
    fullName: z.string().trim().min(1, "Ho va ten khong duoc de trong."),
    phone: optionalText,
    email: optionalEmail,
    dateOfBirth: z.date().optional(),
    gender: z.nativeEnum(Gender).optional(),
    address: optionalText,
    currentPosition: optionalText,
    currentCompany: optionalText,
    industry: z.string().trim().min(1, "Nganh nghe la bat buoc."),
    yearsOfExp: z.number().int().nonnegative("So nam kinh nghiem khong hop le.").optional(),
    currentSalary: z.number().nonnegative("Luong hien tai khong hop le.").optional(),
    expectedSalary: z.number().nonnegative("Luong mong muon khong hop le.").optional(),
    location: z.string().trim().min(1, "Khu vuc la bat buoc."),
    status: z.nativeEnum(CandidateStatus, {
      error: "Trang thai la bat buoc.",
    }),
    level: z.nativeEnum(CandidateSeniority).optional(),
    skills: z.array(z.string().trim().min(1)).default([]),
    source: z.nativeEnum(CandidateSource).optional(),
    sourceDetail: optionalText,
    avatarUrl: z.string().trim().nullable().optional(),
    tagIds: z.array(z.number().int().positive()).default([]),
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui long nhap Email hoac So dien thoai.",
        path: ["email"],
      });
    }
  });

export const candidateReminderSchema = z.object({
  title: z.string().trim().min(1, "Tieu de nhac viec khong duoc de trong."),
  note: optionalText,
  dueAt: z.date({
    error: "Thoi gian nhac viec khong hop le.",
  }),
});

export const candidateLanguageSchema = z.object({
  candidateId: z.number().int().positive("Ung vien khong hop le."),
  language: z.string().trim().min(1, "Ngon ngu la bat buoc."),
  level: optionalText,
  certificate: optionalText,
});

export const workExperienceSchema = z
  .object({
    candidateId: z.number().int().positive("Ung vien khong hop le."),
    companyName: z.string().trim().min(1, "Ten cong ty la bat buoc."),
    position: z.string().trim().min(1, "Vi tri la bat buoc."),
    startDate: z.date().nullable().optional(),
    endDate: z.date().nullable().optional(),
    isCurrent: z.boolean().default(false),
    notes: optionalText,
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngay bat dau khong duoc sau ngay ket thuc.",
        path: ["endDate"],
      });
    }
  });

export const employerRegisterSchema = z
  .object({
    email: z.string().trim().email("Email khong hop le."),
    password: z.string().min(8, "Mat khau phai co it nhat 8 ky tu."),
    confirmPassword: z.string().min(1, "Vui long nhap lai mat khau."),
    companyName: z.string().trim().min(1, "Ten cong ty khong duoc de trong."),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mat khau xac nhan khong khop.",
        path: ["confirmPassword"],
      });
    }
  });

export const employerLoginSchema = authLoginSchema;

export const employerProfileSchema = z.object({
  companyName: z.string().trim().min(1, "Ten cong ty khong duoc de trong."),
  description: nullableOptionalText,
  industry: nullableOptionalText,
  companySize: z.nativeEnum(CompanySize).nullish(),
  address: nullableOptionalText,
  website: z.string().trim().url("Website khong hop le.").nullish(),
  phone: nullableOptionalText,
});

export const employerJobPostingSchema = z
  .object({
    title: z.string().trim().min(1, "Tieu de va mo ta khong duoc de trong."),
    description: z.string().trim().min(1, "Tieu de va mo ta khong duoc de trong."),
    requirements: nullableOptionalText,
    benefits: nullableOptionalText,
    salaryMin: z.number().nonnegative("Luong toi thieu khong hop le.").nullable().optional(),
    salaryMax: z.number().nonnegative("Luong toi da khong hop le.").nullable().optional(),
    salaryDisplay: nullableOptionalText,
    industry: nullableOptionalText,
    position: nullableOptionalText,
    location: nullableOptionalText,
    workType: nullableOptionalText,
    quantity: z.number().int().positive("So luong can tuyen phai lon hon 0.").default(1),
    skills: z.array(z.string().trim().min(1)).default([]),
  })
  .superRefine((data, ctx) => {
    if (
      data.salaryMin != null &&
      data.salaryMax != null &&
      data.salaryMax < data.salaryMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Luong toi da phai lon hon hoac bang luong toi thieu.",
        path: ["salaryMax"],
      });
    }
  });

export const moderationRejectJobSchema = z.object({
  reason: z.string().trim().min(1, "Vui long nhap ly do tu choi."),
});

export const moderationEmployerStatusSchema = z.object({
  newStatus: z.nativeEnum(EmployerStatus, {
    error: "Trang thai khong hop le.",
  }),
});

export const moderationEmployerInfoSchema = z.object({
  companyName: z.string().trim().min(1, "Ten cong ty khong duoc de trong."),
  description: nullableOptionalText,
  industry: nullableOptionalText,
  address: nullableOptionalText,
  phone: nullableOptionalText,
  website: z.string().trim().url("Website khong hop le.").nullish(),
  companySize: z.nativeEnum(CompanySize).nullish(),
});

export const moderationSubscriptionSchema = z.object({
  employerId: z.number().int().positive("Employer khong hop le."),
  tier: z.nativeEnum(SubscriptionTier, {
    error: "Goi dich vu khong hop le.",
  }),
  jobQuota: z.number().int().positive("Job quota phai lon hon 0."),
  jobDuration: z.number().int().positive("Thoi han tin phai lon hon 0."),
  durationMonths: z.number().int().positive("So thang su dung phai lon hon 0."),
  showLogo: z.boolean(),
  showBanner: z.boolean(),
});

export const employerClientLinkSchema = z.object({
  employerId: z.number().int().positive("Employer khong hop le."),
  clientId: z.number().int().positive("Client khong hop le.").nullable(),
});

export function getFirstZodErrorMessage(error: z.ZodError) {
  const message = error.issues[0]?.message;

  if (!message || /^Invalid input/i.test(message) || /\bexpected\b/i.test(message)) {
    return "Du lieu khong hop le.";
  }

  return message;
}
