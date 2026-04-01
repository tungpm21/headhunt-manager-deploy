# HANDOVER DOCUMENT

📍 Đang làm: Security hardening + dependency remediation
🔢 Đến bước: Hoàn tất fix, chuẩn bị bàn giao

✅ ĐÃ XONG:
   - Audit full project và tạo báo cáo `docs/reports/audit_2026-04-01.md`
   - Khóa RBAC admin cho các khu moderation/admin
   - Bắt buộc `EMPLOYER_JWT_SECRET`, bỏ fallback secret mặc định
   - Thêm rate limit cho CRM login, employer auth, public upload/apply
   - Thêm unique constraint `Application(jobPostingId, email)` và deploy migration
   - Nâng `next`, `prisma`, `@prisma/adapter-pg`
   - Loại bỏ `xlsx`, chuyển import sang `read-excel-file` + `papaparse`
   - Đổi tên component import thành `SpreadsheetImporter`

⏳ CÒN LẠI:
   - Dọn backlog lint toàn repo
   - Cân nhắc siết SSL mode trong `DATABASE_URL`

🔧 QUYẾT ĐỊNH QUAN TRỌNG:
   - Không dùng `xlsx` nữa vì advisory high không có auto-fix
   - Chỉ giữ import `.xlsx` và `.csv`, bỏ `.xls`
   - Guard quyền phải nằm ở route + UI + server action, không chỉ ở giao diện

⚠️ LƯU Ý CHO SESSION SAU:
   - `npm audit` hiện sạch: 0 vulnerabilities
   - `npm run build` pass
   - `npm run lint` toàn repo vẫn fail do backlog cũ ngoài scope đợt fix

📁 FILES QUAN TRỌNG:
   - `docs/reports/audit_2026-04-01.md`
   - `src/lib/moderation-actions.ts`
   - `src/lib/employer-actions.ts`
   - `src/lib/public-apply-actions.ts`
   - `src/components/import/spreadsheet-importer.tsx`
   - `.brain/session.json`
   - `.brain/brain.json`

📍 Đã lưu! Để tiếp tục: gõ `/recap`
