import { revalidateTag, unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  OPTION_GROUPS,
  OPTION_SET_DEFINITIONS,
  type DefaultOptionItem,
  type OptionGroupKey,
  type OptionSetDefinition,
} from "@/lib/config-option-definitions";

export const CONFIG_OPTIONS_CACHE_TAG = "config-options";

export type ConfigOptionItem = {
  id?: number;
  setKey: OptionGroupKey;
  value: string;
  label: string;
  aliases: string[];
  description: string | null;
  isActive: boolean;
  showInPublic: boolean;
  isSystem: boolean;
  sortOrder: number;
  metadata: Prisma.JsonValue | null;
};

export type ConfigOptionSet = Omit<OptionSetDefinition, "items"> & {
  items: ConfigOptionItem[];
};

export type OptionChoice = {
  value: string;
  label: string;
};

const activeOptionSetKeys = new Set(
  OPTION_SET_DEFINITIONS.map((definition) => definition.key)
);

type OptionSetRow = Prisma.OptionSetGetPayload<{
  include: {
    items: {
      include: { aliases: true };
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }];
    };
  };
}>;

function typedSetKey(key: string): OptionGroupKey {
  return key as OptionGroupKey;
}

export function normalizeOptionText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function uniqueValues(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;

    const normalized = normalizeOptionText(trimmed);
    if (seen.has(normalized)) continue;

    seen.add(normalized);
    result.push(trimmed);
  }

  return result;
}

function definitionToItem(
  setKey: OptionGroupKey,
  item: DefaultOptionItem,
  index: number
): ConfigOptionItem {
  return {
    setKey,
    value: item.value,
    label: item.label,
    aliases: uniqueValues([...(item.aliases ?? []), item.label]),
    description: item.description ?? null,
    isActive: item.isActive ?? true,
    showInPublic: item.showInPublic ?? false,
    isSystem: item.isSystem ?? false,
    sortOrder: item.sortOrder ?? (index + 1) * 10,
    metadata: (item.metadata as Prisma.JsonValue | undefined) ?? null,
  };
}

function rowToSet(row: OptionSetRow): ConfigOptionSet {
  const definition = OPTION_SET_DEFINITIONS.find((item) => item.key === row.key);

  return {
    key: typedSetKey(row.key),
    label: row.label,
    description: row.description ?? definition?.description ?? "",
    valueType: row.valueType,
    allowCustomValues: row.allowCustomValues,
    isSystem: row.isSystem,
    sortOrder: row.sortOrder,
    items: row.items.map((item) => ({
      id: item.id,
      setKey: typedSetKey(item.setKey),
      value: item.value,
      label: item.label,
      aliases: uniqueValues(item.aliases.map((alias) => alias.alias)),
      description: item.description,
      isActive: item.isActive,
      showInPublic: item.showInPublic,
      isSystem: item.isSystem,
      sortOrder: item.sortOrder,
      metadata: item.metadata,
    })),
  };
}

function definitionFallbackSet(definition: OptionSetDefinition): ConfigOptionSet {
  return {
    ...definition,
    items: definition.items.map((item, index) =>
      definitionToItem(definition.key, item, index)
    ),
  };
}

const getCachedOptionSets = unstable_cache(
  async (): Promise<ConfigOptionSet[]> => {
    const optionSetDelegate = (
      prisma as unknown as {
        optionSet?: {
          findMany: typeof prisma.optionSet.findMany;
        };
      }
    ).optionSet;

    if (!optionSetDelegate) {
      return OPTION_SET_DEFINITIONS.map(definitionFallbackSet);
    }

    let rows: OptionSetRow[] = [];

    try {
      rows = await optionSetDelegate.findMany({
        where: { key: { in: [...activeOptionSetKeys] } },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        include: {
          items: {
            orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
            include: { aliases: true },
          },
        },
      });
    } catch (error) {
      console.warn("Config option tables are not ready; using default options.", error);
      return OPTION_SET_DEFINITIONS.map(definitionFallbackSet);
    }

    const dbSets = rows.map(rowToSet);
    const dbKeys = new Set(dbSets.map((item) => item.key));
    const fallbacks = OPTION_SET_DEFINITIONS.filter(
      (definition) => !dbKeys.has(definition.key)
    ).map(definitionFallbackSet);

    return [...dbSets, ...fallbacks].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.label.localeCompare(b.label, "vi");
    });
  },
  ["config-option-sets"],
  { revalidate: 60, tags: [CONFIG_OPTIONS_CACHE_TAG] }
);

export async function getConfigOptionSets() {
  return getCachedOptionSets();
}

export async function getConfigOptionSet(setKey: OptionGroupKey) {
  const sets = await getConfigOptionSets();
  return (
    sets.find((set) => set.key === setKey) ??
    definitionFallbackSet(
      OPTION_SET_DEFINITIONS.find((definition) => definition.key === setKey)!
    )
  );
}

export async function getConfigOptionItems(
  setKey: OptionGroupKey,
  options: { includeInactive?: boolean } = {}
) {
  const set = await getConfigOptionSet(setKey);
  return set.items.filter((item) => options.includeInactive || item.isActive);
}

function matchesOption(item: ConfigOptionItem, value: string) {
  const normalized = normalizeOptionText(value);
  return (
    normalizeOptionText(item.value) === normalized ||
    normalizeOptionText(item.label) === normalized ||
    item.aliases.some((alias) => normalizeOptionText(alias) === normalized)
  );
}

export async function resolveConfigOptionValue(
  setKey: OptionGroupKey,
  value: string | null | undefined
) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const items = await getConfigOptionItems(setKey, { includeInactive: true });
  const match = items.find((item) => matchesOption(item, trimmed));
  return match?.value ?? trimmed;
}

export async function getOptionFilterValues(
  setKey: OptionGroupKey,
  value: string | null | undefined
) {
  const trimmed = value?.trim();
  if (!trimmed) return [];

  const items = await getConfigOptionItems(setKey, { includeInactive: true });
  const match = items.find((item) => matchesOption(item, trimmed));
  if (!match) return [trimmed];

  return uniqueValues([match.value, match.label, ...match.aliases, trimmed]);
}

export async function formatConfigOptionLabel(
  setKey: OptionGroupKey,
  value: string | null | undefined
) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const items = await getConfigOptionItems(setKey, { includeInactive: true });
  return items.find((item) => matchesOption(item, trimmed))?.label ?? trimmed;
}

export async function getOptionsForSelect(
  setKey: OptionGroupKey,
  options: { currentValue?: string | null; includeInactive?: boolean } = {}
): Promise<OptionChoice[]> {
  const items = await getConfigOptionItems(setKey, { includeInactive: true });
  const currentValue = options.currentValue?.trim();
  const visible = items.filter((item) => {
    if (options.includeInactive || item.isActive) return true;
    return currentValue ? matchesOption(item, currentValue) : false;
  });

  const choices = visible.map((item) => ({ value: item.value, label: item.label }));

  if (currentValue && !visible.some((item) => matchesOption(item, currentValue))) {
    choices.push({ value: currentValue, label: currentValue });
  }

  return choices;
}

export async function getPublicOptionsWithUsage(
  setKey: OptionGroupKey,
  usedValues: Array<string | null | undefined>
): Promise<OptionChoice[]> {
  const items = await getConfigOptionItems(setKey);
  const normalizedUsed = new Set(
    usedValues
      .map((value) => normalizeOptionText(value))
      .filter(Boolean)
  );
  const options: OptionChoice[] = [];

  for (const item of items) {
    const used =
      normalizedUsed.has(normalizeOptionText(item.value)) ||
      normalizedUsed.has(normalizeOptionText(item.label)) ||
      item.aliases.some((alias) => normalizedUsed.has(normalizeOptionText(alias)));

    if (item.showInPublic || used) {
      options.push({ value: item.value, label: item.label });
    }
  }

  for (const usedValue of uniqueValues(usedValues)) {
    const hasOption = options.some(
      (option) => normalizeOptionText(option.value) === normalizeOptionText(usedValue)
    );
    const known = items.some((item) => matchesOption(item, usedValue));
    if (!hasOption && !known) {
      options.push({ value: usedValue, label: usedValue });
    }
  }

  return options.sort((a, b) => a.label.localeCompare(b.label, "vi"));
}

export async function formatOptionValuesForDisplay<T extends Record<string, unknown>>(
  rows: T[],
  mapping: Partial<Record<keyof T, OptionGroupKey>>
) {
  const entries = Object.entries(mapping) as Array<[keyof T, OptionGroupKey]>;
  const itemSets = new Map<OptionGroupKey, ConfigOptionItem[]>();

  for (const [, setKey] of entries) {
    if (!itemSets.has(setKey)) {
      itemSets.set(setKey, await getConfigOptionItems(setKey, { includeInactive: true }));
    }
  }

  return rows.map((row) => {
    const next: Record<string, unknown> = { ...row };

    for (const [field, setKey] of entries) {
      const value = row[field];
      if (typeof value !== "string" || !value.trim()) continue;

      const items = itemSets.get(setKey) ?? [];
      next[field as string] =
        items.find((item) => matchesOption(item, value))?.label ?? value;
    }

    return next as T;
  });
}

async function collectDistinctValues(setKey: OptionGroupKey) {
  if (setKey === OPTION_GROUPS.industry) {
    const [candidates, clients, jobs, employers, postings] = await Promise.all([
      prisma.candidate.findMany({ where: { industry: { not: null } }, select: { industry: true }, distinct: ["industry"] }),
      prisma.client.findMany({ where: { industry: { not: null } }, select: { industry: true }, distinct: ["industry"] }),
      prisma.jobOrder.findMany({ where: { industry: { not: null } }, select: { industry: true }, distinct: ["industry"] }),
      prisma.employer.findMany({ where: { industry: { not: null } }, select: { industry: true }, distinct: ["industry"] }),
      prisma.jobPosting.findMany({ where: { industry: { not: null } }, select: { industry: true }, distinct: ["industry"] }),
    ]);
    return uniqueValues([
      ...candidates.map((item) => item.industry),
      ...clients.map((item) => item.industry),
      ...jobs.map((item) => item.industry),
      ...employers.map((item) => item.industry),
      ...postings.map((item) => item.industry),
    ]);
  }

  if (setKey === OPTION_GROUPS.location) {
    const [candidates, clients, jobs, employers, postings] = await Promise.all([
      prisma.candidate.findMany({ where: { location: { not: null } }, select: { location: true }, distinct: ["location"] }),
      prisma.client.findMany({ where: { location: { not: null } }, select: { location: true }, distinct: ["location"] }),
      prisma.jobOrder.findMany({ where: { location: { not: null } }, select: { location: true }, distinct: ["location"] }),
      prisma.employer.findMany({ where: { location: { not: null } }, select: { location: true }, distinct: ["location"] }),
      prisma.jobPosting.findMany({ where: { location: { not: null } }, select: { location: true }, distinct: ["location"] }),
    ]);
    return uniqueValues([
      ...candidates.map((item) => item.location),
      ...clients.map((item) => item.location),
      ...jobs.map((item) => item.location),
      ...employers.map((item) => item.location),
      ...postings.map((item) => item.location),
    ]);
  }

  if (setKey === OPTION_GROUPS.workType) {
    const rows = await prisma.jobPosting.findMany({
      where: { workType: { not: null } },
      select: { workType: true },
      distinct: ["workType"],
    });
    return uniqueValues(rows.map((item) => item.workType));
  }

  if (setKey === OPTION_GROUPS.industrialZone) {
    const [clients, jobs, employers, postings] = await Promise.all([
      prisma.client.findMany({ where: { industrialZone: { not: null } }, select: { industrialZone: true }, distinct: ["industrialZone"] }),
      prisma.jobOrder.findMany({ where: { industrialZone: { not: null } }, select: { industrialZone: true }, distinct: ["industrialZone"] }),
      prisma.employer.findMany({ where: { industrialZone: { not: null } }, select: { industrialZone: true }, distinct: ["industrialZone"] }),
      prisma.jobPosting.findMany({ where: { industrialZone: { not: null } }, select: { industrialZone: true }, distinct: ["industrialZone"] }),
    ]);
    return uniqueValues([
      ...clients.map((item) => item.industrialZone),
      ...jobs.map((item) => item.industrialZone),
      ...employers.map((item) => item.industrialZone),
      ...postings.map((item) => item.industrialZone),
    ]);
  }

  if (setKey === OPTION_GROUPS.requiredLanguage) {
    const rows = await prisma.$queryRaw<Array<{ value: string }>>(Prisma.sql`
      SELECT DISTINCT unnest("requiredLanguages") AS value
      FROM "JobPosting"
      WHERE array_length("requiredLanguages", 1) > 0
    `);
    return uniqueValues(rows.map((item) => item.value));
  }

  if (setKey === OPTION_GROUPS.languageProficiency) {
    const rows = await prisma.jobPosting.findMany({
      where: { languageProficiency: { not: null } },
      select: { languageProficiency: true },
      distinct: ["languageProficiency"],
    });
    return uniqueValues(rows.map((item) => item.languageProficiency));
  }

  if (setKey === OPTION_GROUPS.shiftType) {
    const rows = await prisma.jobPosting.findMany({
      where: { shiftType: { not: null } },
      select: { shiftType: true },
      distinct: ["shiftType"],
    });
    return uniqueValues(rows.map((item) => item.shiftType));
  }

  return [];
}

export async function syncDefaultConfigOptions() {
  const delegates = prisma as unknown as {
    optionSet?: typeof prisma.optionSet;
    optionItem?: typeof prisma.optionItem;
    optionAlias?: typeof prisma.optionAlias;
  };

  if (!delegates.optionSet || !delegates.optionItem || !delegates.optionAlias) {
    return;
  }

  try {
    for (const definition of OPTION_SET_DEFINITIONS) {
      await delegates.optionSet.upsert({
        where: { key: definition.key },
        create: {
          key: definition.key,
          label: definition.label,
          description: definition.description,
          valueType: definition.valueType,
          allowCustomValues: definition.allowCustomValues,
          isSystem: definition.isSystem,
          sortOrder: definition.sortOrder,
        },
        update: {
          description: definition.description,
          valueType: definition.valueType,
          allowCustomValues: definition.allowCustomValues,
          isSystem: definition.isSystem,
        },
      });

      for (const [index, item] of definition.items.entries()) {
        const savedItem = await delegates.optionItem.upsert({
          where: {
            setKey_value: {
              setKey: definition.key,
              value: item.value,
            },
          },
          create: {
            setKey: definition.key,
            value: item.value,
            label: item.label,
            description: item.description,
            isActive: item.isActive ?? true,
            showInPublic: item.showInPublic ?? false,
            isSystem: item.isSystem ?? definition.valueType === "ENUM",
            sortOrder: item.sortOrder ?? (index + 1) * 10,
            metadata: item.metadata
              ? (item.metadata as Prisma.InputJsonValue)
              : Prisma.JsonNull,
          },
          update: {
            isSystem: item.isSystem ?? definition.valueType === "ENUM",
          },
        });

        for (const alias of uniqueValues([...(item.aliases ?? []), item.label])) {
          const normalizedAlias = normalizeOptionText(alias);
          if (!normalizedAlias) continue;

          await delegates.optionAlias.upsert({
            where: {
              setKey_normalizedAlias: {
                setKey: definition.key,
                normalizedAlias,
              },
            },
            create: {
              itemId: savedItem.id,
              setKey: definition.key,
              alias,
              normalizedAlias,
            },
            update: {},
          });
        }
      }

      if (definition.valueType === "STRING") {
        const distinctValues = await collectDistinctValues(definition.key);
        const currentItems = await delegates.optionItem.findMany({
          where: { setKey: definition.key },
          include: { aliases: true },
        });

        for (const value of distinctValues) {
          const exists = currentItems.some((item) => {
            const normalized = normalizeOptionText(value);
            return (
              normalizeOptionText(item.value) === normalized ||
              normalizeOptionText(item.label) === normalized ||
              item.aliases.some((alias) => alias.normalizedAlias === normalized)
            );
          });

          if (exists) continue;

          await delegates.optionItem.create({
            data: {
              setKey: definition.key,
              value,
              label: value,
              isActive: true,
              showInPublic: false,
              isSystem: false,
              sortOrder: 10_000,
            },
          });
        }
      }
    }
  } catch (error) {
    console.warn("Config option sync skipped; tables are not ready.", error);
    return;
  }

  revalidateTag(CONFIG_OPTIONS_CACHE_TAG, "max");
}

export async function getOptionUsageCount(
  setKey: OptionGroupKey,
  item: Pick<ConfigOptionItem, "value" | "label" | "aliases">
) {
  const textValues = uniqueValues([item.value, item.label, ...item.aliases]);
  const canonicalValues = uniqueValues([item.value]);
  if (textValues.length === 0) return 0;

  if (setKey === OPTION_GROUPS.industry) {
    const [candidates, clients, jobs, employers, postings] = await Promise.all([
      prisma.candidate.count({ where: { industry: { in: textValues }, isDeleted: false } }),
      prisma.client.count({ where: { industry: { in: textValues }, isDeleted: false } }),
      prisma.jobOrder.count({ where: { industry: { in: textValues } } }),
      prisma.employer.count({ where: { industry: { in: textValues } } }),
      prisma.jobPosting.count({ where: { industry: { in: textValues } } }),
    ]);
    return candidates + clients + jobs + employers + postings;
  }

  if (setKey === OPTION_GROUPS.location) {
    const [candidates, clients, jobs, employers, postings] = await Promise.all([
      prisma.candidate.count({ where: { location: { in: textValues }, isDeleted: false } }),
      prisma.client.count({ where: { location: { in: textValues }, isDeleted: false } }),
      prisma.jobOrder.count({ where: { location: { in: textValues } } }),
      prisma.employer.count({ where: { location: { in: textValues } } }),
      prisma.jobPosting.count({ where: { location: { in: textValues } } }),
    ]);
    return candidates + clients + jobs + employers + postings;
  }

  if (setKey === OPTION_GROUPS.workType) {
    return prisma.jobPosting.count({ where: { workType: { in: textValues } } });
  }

  if (setKey === OPTION_GROUPS.industrialZone) {
    const [clients, jobs, employers, postings] = await Promise.all([
      prisma.client.count({ where: { industrialZone: { in: textValues }, isDeleted: false } }),
      prisma.jobOrder.count({ where: { industrialZone: { in: textValues } } }),
      prisma.employer.count({ where: { industrialZone: { in: textValues } } }),
      prisma.jobPosting.count({ where: { industrialZone: { in: textValues } } }),
    ]);
    return clients + jobs + employers + postings;
  }

  if (setKey === OPTION_GROUPS.requiredLanguage) {
    return prisma.jobPosting.count({ where: { requiredLanguages: { hasSome: textValues } } });
  }

  if (setKey === OPTION_GROUPS.languageProficiency) {
    return prisma.jobPosting.count({ where: { languageProficiency: { in: textValues } } });
  }

  if (setKey === OPTION_GROUPS.shiftType) {
    return prisma.jobPosting.count({ where: { shiftType: { in: textValues } } });
  }

  if (setKey === OPTION_GROUPS.companySize) {
    const enumValues = canonicalValues as never[];
    const [clients, employers] = await Promise.all([
      prisma.client.count({ where: { companySize: { in: enumValues }, isDeleted: false } }),
      prisma.employer.count({ where: { companySize: { in: enumValues } } }),
    ]);
    return clients + employers;
  }

  const enumValues = canonicalValues as never[];
  const countByEnum: Partial<Record<OptionGroupKey, () => Promise<number>>> = {
    [OPTION_GROUPS.candidateStatus]: () =>
      prisma.candidate.count({ where: { status: { in: enumValues }, isDeleted: false } }),
    [OPTION_GROUPS.candidateSource]: () =>
      prisma.candidate.count({ where: { source: { in: enumValues }, isDeleted: false } }),
    [OPTION_GROUPS.candidateSeniority]: () =>
      prisma.candidate.count({ where: { level: { in: enumValues }, isDeleted: false } }),
    [OPTION_GROUPS.clientStatus]: () =>
      prisma.client.count({ where: { status: { in: enumValues }, isDeleted: false } }),
    [OPTION_GROUPS.jobStatus]: () =>
      prisma.jobOrder.count({ where: { status: { in: enumValues } } }),
    [OPTION_GROUPS.jobPriority]: () =>
      prisma.jobOrder.count({ where: { priority: { in: enumValues } } }),
    [OPTION_GROUPS.employerStatus]: () =>
      prisma.employer.count({ where: { status: { in: enumValues } } }),
    [OPTION_GROUPS.jobPostingStatus]: () =>
      prisma.jobPosting.count({ where: { status: { in: enumValues } } }),
    [OPTION_GROUPS.subscriptionTier]: () =>
      prisma.subscription.count({ where: { tier: { in: enumValues } } }),
    [OPTION_GROUPS.subscriptionStatus]: () =>
      prisma.subscription.count({ where: { status: { in: enumValues } } }),
    [OPTION_GROUPS.applicationStatus]: () =>
      prisma.application.count({ where: { status: { in: enumValues } } }),
  };

  return countByEnum[setKey]?.() ?? 0;
}
