import {
  Candidate,
  CandidateCV,
  CandidateLanguage,
  WorkExperience,
  CandidateStatus,
  CandidateSource,
  CandidateSeniority,
  Gender,
  Tag,
  CandidateNote,
  CandidateReminder,
  User,
  JobCandidate,
  JobCandidateStage,
  SubmissionResult,
  JobStatus,
} from "@prisma/client";

// ============================================================
// Full candidate with all relations (for detail view)
// ============================================================
export type CandidateJobLink = JobCandidate & {
  jobOrder: {
    id: number;
    title: string;
    status: JobStatus;
    client: {
      companyName: string;
    };
  };
};

export type CandidateReminderItem = CandidateReminder & {
  assignedTo: Pick<User, "id" | "name">;
  completedBy: Pick<User, "id" | "name"> | null;
};

export type CandidateWithRelations = Candidate & {
  tags: { tag: Tag }[];
  notes: (CandidateNote & { createdBy: Pick<User, "id" | "name"> })[];
  reminders: CandidateReminderItem[];
  createdBy: Pick<User, "id" | "name">;
  cvFiles: (CandidateCV & { uploadedBy: Pick<User, "id" | "name"> })[];
  languages: CandidateLanguage[];
  workHistory: WorkExperience[];
  jobLinks: CandidateJobLink[];
};

// Candidate with only tags (for list view)
export type CandidateWithTags = Candidate & {
  tags: { tag: Tag }[];
  cvFiles: Pick<CandidateCV, "id" | "fileName" | "fileUrl" | "label">[];
  languages: Pick<CandidateLanguage, "id" | "language" | "level">[];
  duplicateMatches?: CandidateDuplicateMatch[];
};

export type CandidateDuplicateMatch = {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  matchBy: Array<"email" | "phone">;
};

// ============================================================
// Sort
// ============================================================
export type CandidateSortBy =
  | "createdAt"
  | "fullName"
  | "expectedSalary"
  | "updatedAt";

export type SortOrder = "asc" | "desc";

// ============================================================
// Filters
// ============================================================
export interface CandidateFilters {
  search?: string;           // name, phone, email
  language?: string;
  industry?: string;
  location?: string;
  status?: CandidateStatus;
  level?: CandidateSeniority; // Filter theo cấp bậc
  skills?: string[];          // Filter theo skill (hasSome)
  minSalary?: number;
  maxSalary?: number;
  tagIds?: number[];
  sortBy?: CandidateSortBy;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

// ============================================================
// Form inputs
// ============================================================
export interface CreateCandidateInput {
  fullName: string;
  phone?: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  address?: string;
  currentPosition?: string;
  currentCompany?: string;
  industry?: string;
  yearsOfExp?: number;
  currentSalary?: number;
  expectedSalary?: number;
  location?: string;
  status?: CandidateStatus;
  level?: CandidateSeniority; // Cấp bậc
  skills?: string[];          // Danh sách kỹ năng
  source?: CandidateSource;
  sourceDetail?: string;
  avatarUrl?: string | null;
  tagIds?: number[];
}

export type UpdateCandidateInput = Partial<CreateCandidateInput>;

export interface CandidateCVInput {
  candidateId: number;
  fileUrl: string;
  fileName: string;
  label?: string | null;
  uploadedById: number;
  isPrimary?: boolean;
}

export interface CandidateLanguageInput {
  candidateId: number;
  language: string;
  level?: string | null;
  certificate?: string | null;
}

export interface WorkExperienceInput {
  candidateId: number;
  companyName: string;
  position: string;
  startDate?: Date | null;
  endDate?: Date | null;
  isCurrent?: boolean;
  notes?: string | null;
}

// ============================================================
// Paginated result
// ============================================================
export interface PaginatedCandidates {
  candidates: CandidateWithTags[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================
// Re-exports for convenience
// ============================================================
export { CandidateStatus, CandidateSource, CandidateSeniority, Gender };
export type { JobCandidateStage, SubmissionResult };
