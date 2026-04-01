"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createClient,
  updateClient,
  softDeleteClient,
  addClientContact,
  deleteClientContact,
} from "@/lib/clients";
import { CreateClientInput, UpdateClientInput, CreateClientContactInput, CompanySize, ClientStatus } from "@/types/client";

// Helper: get current user ID
async function getCurrentUserId(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return Number(session.user.id);
}

function enumVal<T>(value: FormDataEntryValue | null): T | undefined {
  const s = value?.toString()?.trim();
  return s ? (s as T) : undefined;
}

function strVal(value: FormDataEntryValue | null): string | undefined {
  const s = value?.toString()?.trim();
  return s || undefined;
}

// ============================================================
// Client Actions
// ============================================================

export async function createClientAction(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean; id?: number }> {
  try {
    const userId = await getCurrentUserId();

    const input: CreateClientInput = {
      companyName: String(formData.get("companyName") ?? "").trim(),
      industry: strVal(formData.get("industry")),
      companySize: enumVal<CompanySize>(formData.get("companySize")),
      address: strVal(formData.get("address")),
      website: strVal(formData.get("website")),
      notes: strVal(formData.get("notes")),
      status: enumVal<ClientStatus>(formData.get("status")),
    };

    if (!input.companyName) return { error: "Tên doanh nghiệp không được để trống." };

    const client = await createClient(input, userId);
    revalidatePath("/clients");
    return { success: true, id: client.id };
  } catch (e) {
    console.error("createClientAction error:", e);
    return { error: "Đã có lỗi xảy ra khi tạo doanh nghiệp." };
  }
}

export async function updateClientAction(
  id: number,
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const input: UpdateClientInput = {
      companyName: String(formData.get("companyName") ?? "").trim(),
      industry: strVal(formData.get("industry")),
      companySize: enumVal<CompanySize>(formData.get("companySize")),
      address: strVal(formData.get("address")),
      website: strVal(formData.get("website")),
      notes: strVal(formData.get("notes")),
      status: enumVal<ClientStatus>(formData.get("status")),
    };

    if (!input.companyName) return { error: "Tên doanh nghiệp không được để trống." };

    await updateClient(id, input);
    revalidatePath(`/clients/${id}`);
    revalidatePath("/clients");
    return { success: true };
  } catch (e) {
    console.error("updateClientAction error:", e);
    return { error: "Đã có lỗi xảy ra khi cập nhật." };
  }
}

export async function deleteClientAction(id: number): Promise<void> {
  await getCurrentUserId();
  await softDeleteClient(id);
  revalidatePath("/clients");
  redirect("/clients");
}

// ============================================================
// Client Contact Actions
// ============================================================

export async function addClientContactAction(
  clientId: number,
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const input: CreateClientContactInput = {
      name: String(formData.get("name") ?? "").trim(),
      position: strVal(formData.get("position")),
      phone: strVal(formData.get("phone")),
      email: strVal(formData.get("email")),
      isPrimary: formData.get("isPrimary") === "on",
    };

    if (!input.name) return { error: "Tên người liên hệ không được để trống." };
    if (!input.phone && !input.email) return { error: "Vui lòng nhập Email hoặc SĐT." };

    await addClientContact(clientId, input);
    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  } catch (e) {
    console.error("addClientContactAction error:", e);
    return { error: "Đã có lỗi xảy ra khi thêm người liên hệ." };
  }
}

export async function deleteClientContactAction(id: number, clientId: number): Promise<void> {
  try {
    await deleteClientContact(id);
    revalidatePath(`/clients/${clientId}`);
  } catch (e) {
    console.error("deleteClientContactAction error:", e);
    throw new Error("Không thể xóa người liên hệ.");
  }
}
