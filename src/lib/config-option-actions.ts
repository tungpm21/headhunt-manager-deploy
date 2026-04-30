"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/authz";
import {
  CONFIG_OPTIONS_CACHE_TAG,
  getOptionUsageCount,
  normalizeOptionText,
  syncDefaultConfigOptions,
} from "@/lib/config-options";
import type { OptionGroupKey } from "@/lib/config-option-definitions";
import { prisma } from "@/lib/prisma";

type ActionState = { error?: string; success?: boolean } | undefined;

function strVal(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text || null;
}

function boolVal(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function intVal(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value?.toString());
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function parseAliases(value: FormDataEntryValue | null) {
  return Array.from(
    new Set(
      (value?.toString() ?? "")
        .split(/[\n,]/g)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

async function replaceAliases(itemId: number, setKey: string, aliases: string[]) {
  await prisma.optionAlias.deleteMany({ where: { itemId } });

  for (const alias of aliases) {
    const normalizedAlias = normalizeOptionText(alias);
    if (!normalizedAlias) continue;

    await prisma.optionAlias.upsert({
      where: {
        setKey_normalizedAlias: {
          setKey,
          normalizedAlias,
        },
      },
      create: {
        itemId,
        setKey,
        alias,
        normalizedAlias,
      },
      update: {
        itemId,
        alias,
      },
    });
  }
}

function revalidateConfigOptionRoutes() {
  revalidateTag(CONFIG_OPTIONS_CACHE_TAG, "max");

  for (const path of [
    "/settings/options",
    "/clients",
    "/jobs",
    "/candidates",
    "/employers",
    "/moderation",
    "/moderation/applications",
    "/packages",
    "/employer/company",
    "/employer/job-postings",
    "/viec-lam",
    "/cong-ty",
    "/",
  ]) {
    revalidatePath(path);
  }
}

export async function syncDefaultConfigOptionsAction(): Promise<ActionState> {
  try {
    await requireAdmin();
    await syncDefaultConfigOptions();
    revalidateConfigOptionRoutes();
    return { success: true };
  } catch (error) {
    console.error("syncDefaultConfigOptionsAction error:", error);
    return { error: "Không thể đồng bộ dữ liệu mặc định." };
  }
}

export async function syncDefaultConfigOptionsFormAction(): Promise<void> {
  await syncDefaultConfigOptionsAction();
}

export async function createOptionItemAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const setKey = strVal(formData.get("setKey"));
    const rawValue = strVal(formData.get("value"));
    const label = strVal(formData.get("label"));

    if (!setKey || !rawValue || !label) {
      return { error: "Nhóm, value và label là bắt buộc." };
    }

    const set = await prisma.optionSet.findUnique({ where: { key: setKey } });
    if (!set) return { error: "Không tìm thấy nhóm option." };
    if (!set.allowCustomValues || set.valueType === "ENUM") {
      return { error: "Nhóm enum/system không cho tạo value mới." };
    }

    const item = await prisma.optionItem.create({
      data: {
        setKey,
        value: rawValue,
        label,
        description: strVal(formData.get("description")),
        isActive: boolVal(formData.get("isActive")),
        showInPublic: boolVal(formData.get("showInPublic")),
        isSystem: false,
        sortOrder: intVal(formData.get("sortOrder"), 0),
        metadata: Prisma.JsonNull,
      },
    });

    await replaceAliases(item.id, setKey, parseAliases(formData.get("aliases")));
    revalidateConfigOptionRoutes();
    return { success: true };
  } catch (error) {
    console.error("createOptionItemAction error:", error);
    return { error: "Không thể tạo option mới. Kiểm tra value có bị trùng không." };
  }
}

export async function createOptionItemFormAction(formData: FormData): Promise<void> {
  await createOptionItemAction(undefined, formData);
}

export async function updateOptionItemAction(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();

    const item = await prisma.optionItem.findUnique({
      where: { id },
      include: { set: true },
    });

    if (!item) return { error: "Không tìm thấy option." };

    const label = strVal(formData.get("label"));
    if (!label) return { error: "Label là bắt buộc." };

    const canEditValue = item.set.allowCustomValues && item.set.valueType === "STRING" && !item.isSystem;
    const nextValue = canEditValue ? strVal(formData.get("value")) ?? item.value : item.value;

    await prisma.optionItem.update({
      where: { id },
      data: {
        value: nextValue,
        label,
        description: strVal(formData.get("description")),
        isActive: boolVal(formData.get("isActive")),
        showInPublic: boolVal(formData.get("showInPublic")),
        sortOrder: intVal(formData.get("sortOrder"), item.sortOrder),
      },
    });

    await replaceAliases(id, item.setKey, parseAliases(formData.get("aliases")));
    revalidateConfigOptionRoutes();
    return { success: true };
  } catch (error) {
    console.error("updateOptionItemAction error:", error);
    return { error: "Không thể cập nhật option. Kiểm tra value hoặc alias có bị trùng không." };
  }
}

export async function updateOptionItemFormAction(
  id: number,
  formData: FormData
): Promise<void> {
  await updateOptionItemAction(id, undefined, formData);
}

export async function deleteOptionItemAction(id: number): Promise<ActionState> {
  return deleteOptionItemWithUsageAction(id, false);
}

export async function deleteOptionItemWithUsageAction(
  id: number,
  forceDeleteUsed = false
): Promise<ActionState> {
  try {
    await requireAdmin();

    const item = await prisma.optionItem.findUnique({
      where: { id },
      include: { aliases: true, set: true },
    });

    if (!item) return { error: "Không tìm thấy option." };
    if (item.isSystem || item.set.valueType === "ENUM" || !item.set.allowCustomValues) {
      return { error: "Option hệ thống/enum không thể xóa. Hãy tắt Active nếu cần ẩn." };
    }

    const usageCount = await getOptionUsageCount(item.setKey as OptionGroupKey, {
      value: item.value,
      label: item.label,
      aliases: item.aliases.map((alias) => alias.alias),
    });

    if (usageCount > 0 && !forceDeleteUsed) {
      return {
        error: `Option đang được dùng ${usageCount} lần. Hãy tắt Active để giữ dữ liệu cũ an toàn.`,
      };
    }

    if (usageCount > 0) {
      const metadata =
        item.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata)
          ? (item.metadata as Prisma.JsonObject)
          : {};

      await prisma.optionItem.update({
        where: { id },
        data: {
          isActive: false,
          showInPublic: false,
          metadata: {
            ...metadata,
            deletedAt: new Date().toISOString(),
            deletedReason: "admin-force-delete-used-option",
            deletedUsageCount: usageCount,
          },
        },
      });
    } else {
      await prisma.$transaction([
        prisma.optionAlias.deleteMany({ where: { itemId: id } }),
        prisma.optionItem.delete({ where: { id } }),
      ]);
    }

    revalidateConfigOptionRoutes();
    return { success: true };
  } catch (error) {
    console.error("deleteOptionItemWithUsageAction error:", error);
    return { error: "Không thể xóa option lúc này." };
  }
}
