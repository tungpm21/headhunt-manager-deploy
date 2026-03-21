# Phase 08: CRM Integration (Import CV)
Status: ⬜ Pending
Dependencies: Phase 07

## Objective
Kết nối web public với CRM — import CV ứng viên thành Candidate, link Employer → Client.

## Implementation Steps
1. [ ] Build nút "Import to CRM" trên mỗi Application
2. [ ] Logic: tạo Candidate từ Application data (name, email, phone, CV file)
3. [ ] Check trùng email → link Candidate cũ thay vì tạo mới
4. [ ] Auto-set source = "FDIWORK" cho candidate imported
5. [ ] Update Application status = IMPORTED
6. [ ] Build link Employer ↔ Client (admin link thủ công)
7. [ ] Dashboard widget: "Applications chờ import" trên CRM dashboard

## Files to Modify
- `src/app/(dashboard)/page.tsx` — Thêm widget Applications
- `src/lib/moderation-actions.ts` — Thêm import logic
- `prisma/schema.prisma` — Thêm FDIWORK vào CandidateSource enum

## Files to Create
- `src/components/moderation/ImportButton.tsx`
- `src/components/dashboard/PendingApplications.tsx`

## Test Criteria
- [ ] Import tạo Candidate mới trong CRM đúng data
- [ ] Trùng email → link candidate cũ, không tạo mới
- [ ] Application status chuyển IMPORTED
- [ ] CV file được link sang Candidate
- [ ] Widget "Applications mới" hiển thị trên dashboard

---
🎉 HOÀN THÀNH MVP!
