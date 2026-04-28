// Type definitions for the Headhunt Manager app
// These types mirror the Prisma schema for frontend usage

export type UserRole = "ADMIN" | "MEMBER";

export type CandidateStatus =
  | "AVAILABLE"
  | "EMPLOYED"
  | "INTERVIEWING"
  | "BLACKLIST";

export type CandidateSource =
  | "LINKEDIN"
  | "TOPCV"
  | "REFERRAL"
  | "FACEBOOK"
  | "VIETNAMWORKS"
  | "OTHER";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type CompanySize = "SMALL" | "MEDIUM" | "LARGE" | "ENTERPRISE";

export type JobStatus = "OPEN" | "PAUSED" | "FILLED" | "CANCELLED";

export type FeeType = "PERCENTAGE" | "FIXED";

export type JobCandidateStage =
  | "SENT_TO_CLIENT"
  | "CLIENT_REVIEWING"
  | "INTERVIEW"
  | "FINAL_INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

// Frontend-friendly interfaces
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Candidate {
  id: number;
  fullName: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  currentPosition?: string;
  currentCompany?: string;
  industry?: string;
  yearsOfExp?: number;
  currentSalary?: number;
  expectedSalary?: number;
  location?: string;
  status: CandidateStatus;
  source?: CandidateSource;
  sourceDetail?: string;
  cvFileUrl?: string;
  cvFileName?: string;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
  notes?: CandidateNote[];
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface CandidateNote {
  id: number;
  content: string;
  candidateId: number;
  createdBy: User;
  createdAt: string;
}

export interface Client {
  id: number;
  companyName: string;
  industry?: string;
  companySize?: CompanySize;
  address?: string;
  website?: string;
  notes?: string;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  contacts?: ClientContact[];
}

export interface ClientContact {
  id: number;
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
  clientId: number;
}

export interface JobOrder {
  id: number;
  title: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
  quantity: number;
  deadline?: string;
  status: JobStatus;
  fee?: number;
  feeType?: FeeType;
  notes?: string;
  clientId: number;
  client?: Client;
  assignedToId?: number;
  assignedTo?: User;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  candidates?: JobCandidate[];
}

export interface JobCandidate {
  id: number;
  stage: JobCandidateStage;
  notes?: string;
  jobOrderId: number;
  candidateId: number;
  candidate?: Candidate;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Company Workspace types
export type CompanyWorkspaceStatus = "ACTIVE" | "PENDING" | "SUSPENDED";
export type CompanyPortalRole = "OWNER" | "MEMBER" | "VIEWER";
export type SubmissionFeedbackDecision =
  | "INTERESTED"
  | "NEED_MORE_INFO"
  | "INTERVIEW"
  | "REJECTED";

export interface CompanyWorkspace {
  id: number;
  displayName: string;
  slug: string;
  status: CompanyWorkspaceStatus;
  portalEnabled: boolean;
  employerId?: number;
  clientId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyPortalUser {
  id: number;
  workspaceId: number;
  email: string;
  name?: string;
  role: CompanyPortalRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionFeedback {
  id: number;
  workspaceId: number;
  jobCandidateId: number;
  authorPortalUserId?: number;
  decision?: SubmissionFeedbackDecision;
  message?: string;
  createdAt: string;
}
