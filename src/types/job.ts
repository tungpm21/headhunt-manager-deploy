import { JobOrder, JobCandidate, JobStatus, FeeType, JobCandidateStage, SubmissionResult, Candidate, Client } from "@prisma/client";

export type { JobStatus, FeeType, JobCandidateStage, SubmissionResult };

export type JobCandidateWithRelations = JobCandidate & {
  candidate: Pick<Candidate, "id" | "fullName" | "phone" | "email" | "currentPosition" | "currentCompany" | "status" | "level" | "skills">;
};

export type JobOrderWithRelations = JobOrder & {
  client: Pick<Client, "id" | "companyName">;
  _count?: { candidates: number };
  candidates?: JobCandidateWithRelations[];
};

export interface JobFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: JobStatus;
  clientId?: number;
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
  salaryMin?: number;
  salaryMax?: number;
  quantity?: number;
  deadline?: Date;
  status?: JobStatus;
  fee?: number;
  feeType?: FeeType;
  notes?: string;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {}
