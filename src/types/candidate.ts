import {
  Candidate,
  CandidateStatus,
  CandidateSource,
  Gender,
  Tag,
  CandidateNote,
  User,
} from "@prisma/client";

// ============================================================
// Full candidate with all relations (for detail view)
// ============================================================
export type CandidateWithRelations = Candidate & {
  tags: { tag: Tag }[];
  notes: (CandidateNote & { createdBy: Pick<User, "id" | "name"> })[];
  createdBy: Pick<User, "id" | "name">;
};

// Candidate with only tags (for list view)
export type CandidateWithTags = Candidate & {
  tags: { tag: Tag }[];
};

// ============================================================
// Filters
// ============================================================
export interface CandidateFilters {
  search?: string;           // name, phone, email
  industry?: string;
  location?: string;
  status?: CandidateStatus;
  minSalary?: number;
  maxSalary?: number;
  tagIds?: number[];
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
  source?: CandidateSource;
  sourceDetail?: string;
  avatarUrl?: string | null; // Bổ sung upload ảnh đại diện
  tagIds?: number[];
}

export type UpdateCandidateInput = Partial<CreateCandidateInput>;

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
export { CandidateStatus, CandidateSource, Gender };
