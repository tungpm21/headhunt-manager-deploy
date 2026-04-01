import { Client, ClientContact, CompanySize, ClientStatus } from "@prisma/client";

export type { CompanySize, ClientStatus };

export type ClientWithRelations = Client & {
  contacts: ClientContact[];
  createdBy?: { id: number; name: string };
  _count?: { jobOrders: number; contacts: number };
};

export interface ClientFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  industry?: string;
  companySize?: CompanySize;
}

export interface PaginatedClients {
  clients: ClientWithRelations[];
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
  website?: string;
  notes?: string;
  status?: ClientStatus;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {}

export interface CreateClientContactInput {
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
}
