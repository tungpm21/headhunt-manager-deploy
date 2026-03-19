import { prisma } from "@/lib/prisma";
import {
  ClientFilters,
  PaginatedClients,
  CreateClientInput,
  UpdateClientInput,
  CreateClientContactInput,
  ClientWithRelations,
} from "@/types/client";
import { Prisma } from "@prisma/client";

const CLIENT_LIST_INCLUDE = {
  _count: {
    select: { contacts: true, jobOrders: true },
  },
} satisfies Prisma.ClientInclude;

const CLIENT_DETAIL_INCLUDE = {
  contacts: { orderBy: { id: "asc" as const } },
  createdBy: { select: { id: true, name: true } },
  _count: {
    select: { jobOrders: true },
  },
} satisfies Prisma.ClientInclude;

// ============================================================
// Build WHERE clause from filters
// ============================================================
function buildWhere(filters: ClientFilters): Prisma.ClientWhereInput {
  const where: Prisma.ClientWhereInput = { isDeleted: false };

  if (filters.search) {
    const s = filters.search.trim();
    where.OR = [
      { companyName: { contains: s, mode: "insensitive" } },
      { industry: { contains: s, mode: "insensitive" } },
      { website: { contains: s, mode: "insensitive" } },
    ];
  }

  if (filters.industry)
    where.industry = { contains: filters.industry, mode: "insensitive" };
  
  if (filters.companySize)
    where.companySize = filters.companySize;

  return where;
}

// ============================================================
// List with filters & pagination
// ============================================================
export async function getClients(
  filters: ClientFilters = {}
): Promise<PaginatedClients> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const skip = (page - 1) * pageSize;
  const where = buildWhere(filters);

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: CLIENT_LIST_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.client.count({ where }),
  ]);

  return {
    clients: clients as unknown as ClientWithRelations[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ============================================================
// Get single client with all relations
// ============================================================
export async function getClientById(
  id: number
): Promise<ClientWithRelations | null> {
  return prisma.client.findFirst({
    where: { id, isDeleted: false },
    include: CLIENT_DETAIL_INCLUDE,
  }) as Promise<ClientWithRelations | null>;
}

// ============================================================
// Create Client
// ============================================================
export async function createClient(
  data: CreateClientInput,
  createdById: number
) {
  return prisma.client.create({
    data: {
      ...data,
      createdById,
    },
  });
}

// ============================================================
// Update Client
// ============================================================
export async function updateClient(
  id: number,
  data: UpdateClientInput
) {
  return prisma.client.update({
    where: { id },
    data,
  });
}

// ============================================================
// Soft delete Client
// ============================================================
export async function softDeleteClient(id: number) {
  return prisma.client.update({
    where: { id },
    data: { isDeleted: true },
  });
}

// ============================================================
// Client Contacts
// ============================================================
export async function addClientContact(
  clientId: number,
  data: CreateClientContactInput
) {
  return prisma.clientContact.create({
    data: {
      ...data,
      clientId,
    },
  });
}

export async function deleteClientContact(id: number) {
  return prisma.clientContact.delete({
    where: { id },
  });
}

// ============================================================
// Get all clients for select dropdown (Job Orders)
// ============================================================
export async function getAllClients() {
  return prisma.client.findMany({
    where: { isDeleted: false },
    select: { id: true, companyName: true },
    orderBy: { companyName: "asc" },
  });
}
