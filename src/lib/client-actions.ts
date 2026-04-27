"use server";

import { ClientStatus, CompanySize } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireViewerScope } from "@/lib/authz";
import { OPTION_GROUPS } from "@/lib/config-option-definitions";
import { resolveConfigOptionValue } from "@/lib/config-options";
import {
  addClientContact,
  createClient,
  deleteClientContact,
  softDeleteClient,
  updateClient,
} from "@/lib/clients";
import {
  clientFormSchema,
  getFirstZodErrorMessage,
} from "@/lib/validation/forms";
import { enumVal, strVal } from "@/lib/utils/form-helpers";
import {
  CreateClientContactInput,
  CreateClientInput,
  UpdateClientInput,
} from "@/types/client";

async function parseClientInput(formData: FormData) {
  const industry = await resolveConfigOptionValue(
    OPTION_GROUPS.industry,
    strVal(formData.get("industry"))
  );

  return clientFormSchema.safeParse({
    companyName: String(formData.get("companyName") ?? "").trim(),
    industry,
    companySize: enumVal(
      formData.get("companySize"),
      Object.values(CompanySize)
    ),
    address: strVal(formData.get("address")),
    website: strVal(formData.get("website")),
    notes: strVal(formData.get("notes")),
    status: enumVal(formData.get("status"), Object.values(ClientStatus)),
  });
}

export async function createClientAction(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean; id?: number }> {
  try {
    const scope = await requireViewerScope();
    const userId = scope.userId;
    const parsedInput = await parseClientInput(formData);

    if (!parsedInput.success) {
      return { error: getFirstZodErrorMessage(parsedInput.error) };
    }

    const input: CreateClientInput = parsedInput.data;
    const client = await createClient(input, userId);

    revalidatePath("/clients");
    return { success: true, id: client.id };
  } catch (error) {
    console.error("createClientAction error:", error);
    return { error: "Da co loi xay ra khi tao doanh nghiep." };
  }
}

export async function updateClientAction(
  id: number,
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const scope = await requireViewerScope();
    const parsedInput = await parseClientInput(formData);

    if (!parsedInput.success) {
      return { error: getFirstZodErrorMessage(parsedInput.error) };
    }

    const input: UpdateClientInput = parsedInput.data;
    await updateClient(id, input, scope);

    revalidatePath(`/clients/${id}`);
    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    console.error("updateClientAction error:", error);
    return { error: "Da co loi xay ra khi cap nhat." };
  }
}

export async function deleteClientAction(id: number): Promise<void> {
  const scope = await requireViewerScope();
  await softDeleteClient(id, scope);
  revalidatePath("/clients");
  redirect("/clients");
}

export async function addClientContactAction(
  clientId: number,
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const scope = await requireViewerScope();
    const input: CreateClientContactInput = {
      name: String(formData.get("name") ?? "").trim(),
      position: strVal(formData.get("position")),
      phone: strVal(formData.get("phone")),
      email: strVal(formData.get("email")),
      isPrimary: formData.get("isPrimary") === "on",
    };

    if (!input.name) {
      return { error: "Ten nguoi lien he khong duoc de trong." };
    }

    if (!input.phone && !input.email) {
      return { error: "Vui long nhap Email hoac SDT." };
    }

    await addClientContact(clientId, input, scope);
    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  } catch (error) {
    console.error("addClientContactAction error:", error);
    return { error: "Da co loi xay ra khi them nguoi lien he." };
  }
}

export async function deleteClientContactAction(
  id: number,
  clientId: number
): Promise<void> {
  try {
    const scope = await requireViewerScope();
    await deleteClientContact(id, clientId, scope);
    revalidatePath(`/clients/${clientId}`);
  } catch (error) {
    console.error("deleteClientContactAction error:", error);
    throw new Error("Khong the xoa nguoi lien he.");
  }
}
