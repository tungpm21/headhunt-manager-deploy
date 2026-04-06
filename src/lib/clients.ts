import { prisma } from "@/lib/prisma";
import {
  ClientFilters,
  PaginatedClients,
  PaginatedClientOptions,
  ClientSelectOption,
  CreateClientInput,
  UpdateClientInput,
  CreateClientContactInput,
  ClientWithRelations,
} from "@/types/client";
import { Prisma } from "@prisma/client";
import { withClientAccess } from "@/lib/access-scope";
import { ViewerScope } from "@/lib/viewer-scope";

const CLIENT_LIST_INCLUDE = {
  _count: {
    select: { contacts: true, jobOrders: true },
  },
} satisfies Prisma.ClientInclude;

function getClientDetailInclude(scope?: ViewerScope): Prisma.ClientInclude {
  const jobOrderWhere =
    !scope || scope.isAdmin
      ? undefined
      : {
        OR: [{ createdById: scope.userId }, { assignedToId: scope.userId }],
      };

  return {
    contacts: { orderBy: { id: "asc" as const } },
    createdBy: { select: { id: true, name: true } },
    jobOrders: {
      where: jobOrderWhere,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        deadline: true,
        fee: true,
        feeType: true,
        createdAt: true,
        _count: {
          select: { candidates: true },
        },
      },
      orderBy: [
        { updatedAt: "desc" as const },
        { createdAt: "desc" as const },
      ],
    },
    _count: {
      select: { jobOrders: true },
    },
  };
}

async function autoLinkEmployerForClientByName(
  clientId: number,
  companyName: string
) {
  const normalizedName = companyName.trim();

  if (!normalizedName) {
    return null;
  }

  const matchedEmployers = await prisma.employer.findMany({
    where: {
      clientId: null,
      companyName: {
        equals: normalizedName,
        mode: "insensitive",
      },
    },
    select: { id: true },
    take: 2,
  });

  if (matchedEmployers.length !== 1) {
    return null;
  }

  return prisma.employer.update({
    where: { id: matchedEmployers[0].id },
    data: { clientId },
  });
}

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
  filters: ClientFilters = {},
  scope?: ViewerScope
): Promise<PaginatedClients> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const skip = (page - 1) * pageSize;
  const where = withClientAccess(buildWhere(filters), scope);

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
  id: number,
  scope?: ViewerScope
): Promise<ClientWithRelations | null> {
  return prisma.client.findFirst({
    where: withClientAccess({ id, isDeleted: false }, scope),
    include: getClientDetailInclude(scope),
  }) as Promise<ClientWithRelations | null>;
}

// ============================================================
// Create Client
// ============================================================
export async function createClient(
  data: CreateClientInput,
  createdById: number
) {
  const client = await prisma.client.create({
    data: {
      ...data,
      createdById,
    },
  });

  await autoLinkEmployerForClientByName(client.id, client.companyName);

  return client;
}

// ============================================================
// Update Client
// ============================================================
export async function updateClient(
  id: number,
  data: UpdateClientInput,
  scope?: ViewerScope
) {
  const accessibleClient = await prisma.client.findFirst({
    where: withClientAccess({ id, isDeleted: false }, scope),
    select: { id: true },
  });

  if (!accessibleClient) {
    throw new Error("FORBIDDEN_CLIENT");
  }

  const client = await prisma.client.update({
    where: { id },
    data,
  });

  await autoLinkEmployerForClientByName(client.id, client.companyName);

  return client;
}

// ============================================================
// Soft delete Client
// ============================================================
export async function softDeleteClient(id: number, scope?: ViewerScope) {
  const accessibleClient = await prisma.client.findFirst({
    where: withClientAccess({ id, isDeleted: false }, scope),
    select: { id: true },
  });

  if (!accessibleClient) {
    throw new Error("FORBIDDEN_CLIENT");
  }

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
  data: CreateClientContactInput,
  scope?: ViewerScope
) {
  const accessibleClient = await prisma.client.findFirst({
    where: withClientAccess({ id: clientId, isDeleted: false }, scope),
    select: { id: true },
  });

  if (!accessibleClient) {
    throw new Error("FORBIDDEN_CLIENT");
  }

  return prisma.clientContact.create({
    data: {
      ...data,
      clientId,
    },
  });
}

export async function deleteClientContact(
  id: number,
  clientId: number,
  scope?: ViewerScope
) {
  const accessibleClient = await prisma.client.findFirst({
    where: withClientAccess({ id: clientId, isDeleted: false }, scope),
    select: { id: true },
  });

  if (!accessibleClient) {
    throw new Error("FORBIDDEN_CLIENT");
  }

  return prisma.clientContact.delete({
    where: { id },
  });
}

// ============================================================
// Get all clients for select dropdown (Job Orders)
// ============================================================
export async function getAllClients(filters: {
  search?: string;
  page?: number;
  pageSize?: number;
  includeIds?: number[];
}, scope?: ViewerScope): Promise<PaginatedClientOptions> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(1, Math.min(filters.pageSize ?? 20, 50));
  const skip = (page - 1) * pageSize;
  const search = filters.search?.trim();
  const includeIds = Array.from(
    new Set(filters.includeIds?.filter((id) => id > 0) ?? [])
  );

  const baseWhere = withClientAccess(
    {
      isDeleted: false,
      ...(search
        ? {
          companyName: {
            contains: search,
            mode: "insensitive",
          },
        }
        : {}),
    },
    scope
  );

  const [pageClients, total, pinnedClients] = await Promise.all([
    prisma.client.findMany({
      where: baseWhere,
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.client.count({ where: baseWhere }),
    includeIds.length > 0
      ? prisma.client.findMany({
        where: {
          ...withClientAccess(
            {
              id: { in: includeIds },
              isDeleted: false,
            },
            scope
          ),
        },
        select: { id: true, companyName: true },
        orderBy: { companyName: "asc" },
      })
      : Promise.resolve([] as ClientSelectOption[]),
  ]);

  const clients = Array.from(
    new Map(
      [...pinnedClients, ...pageClients].map((client) => [client.id, client])
    ).values()
  );

  return {
    clients,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
