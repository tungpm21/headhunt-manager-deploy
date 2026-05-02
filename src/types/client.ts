import {
  Client,
  ClientContact,
  CompanySize,
  ClientStatus,
  FeeType,
  JobOrder,
  JobPriority,
  JobStatus,
} from "@prisma/client";

export type { CompanySize, ClientStatus };

export type ClientWithRelations = Client & {
  contacts: ClientContact[];
  createdBy?: { id: number; name: string };
  _count?: { jobOrders: number; contacts: number };
  jobOrders?: Array<
    Pick<JobOrder, "id" | "title" | "status" | "priority" | "deadline" | "fee" | "feeType" | "createdAt"> & {
      _count?: { candidates: number };
    }
  >;
};

export type { FeeType, JobPriority, JobStatus };

export interface ClientFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  industry?: string;
  companySize?: CompanySize;
  location?: string;
  industrialZone?: string;
}

export interface PaginatedClients {
  clients: ClientWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ClientSelectOption {
  id: number;
  companyName: string;
}

export interface PaginatedClientOptions {
  clients: ClientSelectOption[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateClientInput {
  companyName: string;
  industry?: string;
  companySize?: CompanySize;
  address?: string;
  location?: string;
  industrialZone?: string;
  website?: string;
  notes?: string;
  status?: ClientStatus;
}

export type UpdateClientInput = Partial<CreateClientInput>;

export interface CreateClientContactInput {
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
}
