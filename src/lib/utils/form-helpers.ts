export function strVal(value: FormDataEntryValue | null): string | undefined {
  const normalized = value?.toString().trim();
  return normalized || undefined;
}

export function intVal(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value?.toString());
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function dateVal(value: FormDataEntryValue | null): Date | null {
  const normalized = value?.toString().trim();

  if (!normalized) {
    return null;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function enumVal<T extends string>(
  value: FormDataEntryValue | null,
  validValues: readonly T[]
): T | undefined {
  const normalized = value?.toString().trim();

  if (!normalized || !validValues.includes(normalized as T)) {
    return undefined;
  }

  return normalized as T;
}
