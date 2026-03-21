# Phase 04: Company Profiles & Apply Form
Status: ⬜ Pending
Dependencies: Phase 03

## Objective
Trang danh sách & profile công ty, form nộp CV cho ứng viên.

## Implementation Steps
1. [ ] Build trang danh sách công ty `/cong-ty`
2. [ ] Build trang profile công ty `/cong-ty/[slug]`
3. [ ] Hiển thị: logo, mô tả, ngành nghề, jobs đang tuyển
4. [ ] Build form nộ CV `/ung-tuyen`
5. [ ] Form fields: tên, email, phone, upload CV, cover letter
6. [ ] Server action lưu Application vào database
7. [ ] Upload CV file (Vercel Blob / local)
8. [ ] Success page sau khi nộp

## Files to Create
- `src/app/(public)/cong-ty/page.tsx`
- `src/app/(public)/cong-ty/[slug]/page.tsx`
- `src/app/(public)/ung-tuyen/page.tsx`
- `src/components/public/CompanyCard.tsx`
- `src/components/public/CompanyProfile.tsx`
- `src/components/public/ApplyForm.tsx`

## Test Criteria
- [ ] Danh sách công ty hiển thị đúng
- [ ] Profile công ty có đầy đủ info + jobs đang tuyển
- [ ] Form nộ CV validate đúng (required fields)
- [ ] File upload hoạt động
- [ ] Application lưu vào database thành công

---
Next Phase: phase-05-employer-auth.md
