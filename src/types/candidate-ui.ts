export type CandidateStatus =
  | "AVAILABLE"
  | "EMPLOYED"
  | "INTERVIEWING"
  | "BLACKLIST";

export type CandidateTag = {
  id: number;
  name: string;
  color: string;
};

export type CandidateTagRelation = {
  tag: CandidateTag;
};

export type CandidateCV = {
  id: number;
  fileName: string;
  fileUrl: string;
  label: string | null;
  isPrimary: boolean;
  uploadedAt: Date | string;
  uploadedBy: {
    id: number;
    name: string;
  };
};

export type CandidateLanguage = {
  id: number;
  language: string;
  level: string | null;
  certificate: string | null;
};

export type CandidateWorkExperience = {
  id: number;
  companyName: string;
  position: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  isCurrent: boolean;
  notes: string | null;
};

export type CandidateJobLink = {
  id: number;
  stage: "SENT_TO_CLIENT" | "CLIENT_REVIEWING" | "INTERVIEW" | "FINAL_INTERVIEW" | "OFFER" | "HIRED" | "REJECTED";
  result: "PENDING" | "HIRED" | "REJECTED" | "WITHDRAWN";
  jobOrder: {
    id: number;
    title: string;
    status: "OPEN" | "PAUSED" | "FILLED" | "CANCELLED";
    client: {
      companyName: string;
    };
  };
};

export type CandidateReminder = {
  id: number;
  title: string;
  note: string | null;
  dueAt: Date | string;
  isCompleted: boolean;
  completedAt: Date | string | null;
  assignedTo: {
    id: number;
    name: string;
  };
  completedBy: {
    id: number;
    name: string;
  } | null;
};

export type CandidateNote = {
  id: number;
  content: string;
  createdAt: Date | string;
  createdBy: {
    id: number;
    name: string;
  };
};

export type CandidateWithTags = {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  cvFileUrl: string | null;
  cvFileName: string | null;
  currentPosition: string | null;
  currentCompany: string | null;
  industry: string | null;
  yearsOfExp: number | null;
  expectedSalary: number | null;
  location: string | null;
  status: CandidateStatus;
  level: string | null;
  skills: string[];
  tags: CandidateTagRelation[];
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

export type CandidateWithRelations = {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
  dateOfBirth: Date | string | null;
  gender: string | null;
  address: string | null;
  currentPosition: string | null;
  currentCompany: string | null;
  industry: string | null;
  yearsOfExp: number | null;
  currentSalary: number | null;
  expectedSalary: number | null;
  location: string | null;
  status: CandidateStatus;
  level: string | null;
  skills: string[];
  source: string | null;
  sourceDetail: string | null;
  avatarUrl: string | null;
  cvFileUrl: string | null;
  cvFileName: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  tags: CandidateTagRelation[];
  notes: CandidateNote[];
  reminders: CandidateReminder[];
  createdBy: {
    id: number;
    name: string;
  };
  cvFiles: CandidateCV[];
  languages: CandidateLanguage[];
  workHistory: CandidateWorkExperience[];
  jobLinks: CandidateJobLink[];
};
