import {
  Candidate,
  Client,
  EmployerStatus,
  FeeType,
  JobCandidate,
  JobCandidateStage,
  JobOrder,
  JobPostingStatus,
  JobStatus,
  SubmissionResult,
  SubscriptionStatus,
  SubscriptionTier,
} from "@prisma/client";

export type { JobStatus, FeeType, JobCandidateStage, SubmissionResult };

export type JobCandidateWithRelations = JobCandidate & {
  candidate: Pick<
    Candidate,
    | "id"
    | "fullName"
    | "phone"
    | "email"
    | "currentPosition"
    | "currentCompany"
    | "status"
    | "level"
    | "skills"
    | "expectedSalary"
  >;
};

export type JobOrderWithRelations = JobOrder & {
  client: Pick<Client, "id" | "companyName">;
  _count?: { candidates: number };
  candidates?: JobCandidateWithRelations[];
};

export type SerializedJobCandidateWithRelations = Omit<
  JobCandidateWithRelations,
  "interviewDate" | "createdAt" | "updatedAt"
> & {
  interviewDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SerializedJobOrderWithRelations = Omit<
  JobOrderWithRelations,
  "deadline" | "openDate" | "createdAt" | "updatedAt" | "candidates"
> & {
  deadline: string | null;
  openDate: string | null;
  createdAt: string;
  updatedAt: string;
  candidates?: SerializedJobCandidateWithRelations[];
};

export type JobBridgePosting = {
  id: number;
  title: string;
  slug: string;
  status: JobPostingStatus;
  publishedAt: Date | null;
  expiresAt: Date | null;
  employer: {
    id: number;
    companyName: string;
    slug: string;
    status: EmployerStatus;
  };
};

export type JobBridgeSummary = {
  id: number;
  title: string;
  status: JobStatus;
  client: {
    id: number;
    companyName: string;
    employer: {
      id: number;
      companyName: string;
      slug: string;
      status: EmployerStatus;
      subscription: {
        status: SubscriptionStatus;
        tier: SubscriptionTier;
        endDate: Date;
        jobQuota: number;
        jobsUsed: number;
      } | null;
    } | null;
  };
  jobPostings: JobBridgePosting[];
};

export type SerializedJobBridgePosting = Omit<
  JobBridgePosting,
  "publishedAt" | "expiresAt"
> & {
  publishedAt: string | null;
  expiresAt: string | null;
};

export type SerializedJobBridgeSummary = Omit<JobBridgeSummary, "client" | "jobPostings"> & {
  client: Omit<JobBridgeSummary["client"], "employer"> & {
    employer: JobBridgeSummary["client"]["employer"] extends infer Employer
      ? Employer extends {
          subscription: infer Subscription;
        } | null
        ? Employer extends null
          ? null
          : Omit<Exclude<Employer, null>, "subscription"> & {
              subscription: Subscription extends {
                endDate: Date;
              } | null
                ? Subscription extends null
                  ? null
                  : Omit<Exclude<Subscription, null>, "endDate"> & {
                      endDate: string;
                    }
                : never;
            }
        : never
      : never;
  };
  jobPostings: SerializedJobBridgePosting[];
};

export interface JobFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: JobStatus;
  clientId?: number;
  stage?: JobCandidateStage;
}

export interface PaginatedJobs {
  jobs: JobOrderWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateJobInput {
  title: string;
  clientId: number;
  description?: string;
  industry?: string;
  location?: string;
  requiredSkills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  quantity?: number;
  deadline?: Date;
  status?: JobStatus;
  assignedToId?: number;
  fee?: number;
  feeType?: FeeType;
  notes?: string;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {}
