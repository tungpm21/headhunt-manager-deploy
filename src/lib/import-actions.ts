"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function importCandidatesAction(candidatesArray: any[]) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Yêu cầu đăng nhập để Import." };
    const userId = Number(session.user.id);

    let successCount = 0;
    let errorCount = 0;
    
    // Process records
    for (const record of candidatesArray) {
      if (!record.fullName) {
        errorCount++;
        continue;
      }
      
      const email = record.email || null;
      const phone = record.phone || null;

      // Very simple validation for duplicates based on email
      if (email) {
        const existing = await prisma.candidate.findFirst({ where: { email } });
        if (existing) {
          errorCount++;
          continue; // Skip existing
        }
      }

      await prisma.candidate.create({
        data: {
          fullName: String(record.fullName),
          email: email ? String(email) : null,
          phone: phone ? String(phone) : null,
          location: record.location ? String(record.location) : "Chưa xác định",
          industry: record.industry ? String(record.industry) : "Khác",
          currentPosition: record.currentPosition ? String(record.currentPosition) : null,
          currentCompany: record.currentCompany ? String(record.currentCompany) : null,
          status: "AVAILABLE", // default status for imported
          createdById: userId,
        }
      });
      successCount++;
    }

    revalidatePath("/candidates");
    return { 
      success: true, 
      successCount,
      errorCount,
      message: `Cập nhật thành công ${successCount} hồ sơ. Đóng hoặc F5 trang để xem kết quả.` 
    };
  } catch (e) {
    console.error("importCandidatesAction error:", e);
    return { error: "Có lỗi xảy ra kết nối Server khi chạy lệnh Import." };
  }
}
