"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  importCandidatesForUser,
  importClientsForUser,
} from "@/lib/import-service";
import type { CandidateImportRow, ClientImportRow } from "@/types/import";

export async function importCandidatesAction(candidatesArray: CandidateImportRow[]) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Yeu cau dang nhap de import." };
    }

    const userId = Number(session.user.id);
    const result = await importCandidatesForUser(candidatesArray, userId);

    revalidatePath("/candidates");
    revalidatePath("/import");

    return result;
  } catch (e) {
    console.error("importCandidatesAction error:", e);
    return { error: "Co loi ket noi server khi chay import." };
  }
}

export async function importClientsAction(clientsArray: ClientImportRow[]) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Yeu cau dang nhap de import." };
    }

    const userId = Number(session.user.id);
    const result = await importClientsForUser(clientsArray, userId);

    revalidatePath("/clients");
    revalidatePath("/import");

    return result;
  } catch (e) {
    console.error("importClientsAction error:", e);
    return { error: "Co loi ket noi server khi chay import." };
  }
}
