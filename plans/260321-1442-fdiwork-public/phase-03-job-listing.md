# Phase 03: Job Listing & Detail
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Trang danh sách việc làm với bộ lọc và trang chi tiết việc làm.

## Implementation Steps
1. [ ] Build trang danh sách `/viec-lam` — grid/list view
2. [ ] Build sidebar bộ lọc: ngành nghề, vị trí, khu vực, mức lương
3. [ ] Build sorting: mới nhất, cũ nhất, lương cao
4. [ ] Build phân trang (pagination)
5. [ ] Build trang chi tiết `/viec-lam/[slug]`
6. [ ] Hiển thị: mô tả, yêu cầu, phúc lợi, thông tin công ty
7. [ ] Nút "Ứng tuyển ngay" (link sang form)
8. [ ] "Việc làm tương tự" ở cuối trang

## Files to Create
- `src/app/(public)/viec-lam/page.tsx`
- `src/app/(public)/viec-lam/[slug]/page.tsx`
- `src/components/public/JobCard.tsx`
- `src/components/public/JobFilters.tsx`
- `src/components/public/JobDetail.tsx`
- `src/lib/public-actions.ts` — Server actions cho web public

## Test Criteria
- [ ] Lọc theo ngành/vị trí/khu vực hoạt động
- [ ] Phân trang chuyển trang đúng
- [ ] Chi tiết job render đầy đủ thông tin
- [ ] SEO: title, meta description đúng cho từng job

---
Next Phase: phase-04-company-apply.md
