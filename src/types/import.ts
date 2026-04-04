export type CandidateImportRow = {
  rowNumber: number;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  industry: string;
  currentPosition: string;
  currentCompany: string;
};

export type ClientImportRow = {
  rowNumber: number;
  companyName: string;
  industry: string;
  companySize: string;
  address: string;
  website: string;
  notes: string;
};

export type ImportErrorItem = {
  rowNumber: number;
  reason: string;
  fullName?: string | null;
  companyName?: string | null;
};

export type ImportResult = {
  success?: boolean;
  successCount?: number;
  errorCount?: number;
  message?: string;
  error?: string;
  errors?: ImportErrorItem[];
};
