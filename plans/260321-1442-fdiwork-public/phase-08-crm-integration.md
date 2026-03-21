# Phase 08: CRM Integration (Import CV)
Status: ✅ Complete
Dependencies: Phase 07

## Objective
Kết nối web public với CRM — import CV ứng viên thành Candidate, link Employer → Client.

## Implementation Steps
1. [x] Build nút "Import to CRM" trên mỗi Application
2. [x] Logic: tạo Candidate từ Application data (name, email, phone, CV file)
3. [x] Check trùng email → link Candidate cũ thay vì tạo mới
4. [x] Auto-set source = "FDIWORK" cho candidate imported
5. [x] Update Application status = IMPORTED
6. [x] Build link Employer ↔ Client (admin link thủ công)
7. [x] Dashboard widget: "Applications chờ import" trên CRM dashboard

## Files to Modify
- `src/app/(dashboard)/dashboard/page.tsx` — Thêm widget Applications ✅
- `src/lib/moderation-actions.ts` — Thêm import logic ✅
- `prisma/schema.prisma` — FDIWORK đã có sẵn trong CandidateSource enum ✅

## Files to Create
- `src/app/(dashboard)/moderation/applications/page.tsx` ✅
- `src/app/(dashboard)/moderation/applications/import-button.tsx` ✅
- `src/app/(dashboard)/employers/link-employer-form.tsx` ✅

## Test Criteria
- [x] Import tạo Candidate mới trong CRM đúng data
- [x] Trùng email → link candidate cũ, không tạo mới
- [x] Application status chuyển IMPORTED
- [x] CV file được link sang Candidate
- [x] Widget "Applications mới" hiển thị trên dashboard

---
🎉 HOÀN THÀNH MVP!
