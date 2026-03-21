# Phase 06: Employer Job Management
Status: ⬜ Pending
Dependencies: Phase 05

## Objective
Nhà tuyển dụng tự đăng tin tuyển dụng, quản lý tin đã đăng.

## Implementation Steps
1. [ ] Build trang danh sách tin đã đăng `/employer/job-postings`
2. [ ] Hiển thị trạng thái: Draft, Pending, Approved, Rejected, Expired
3. [ ] Build form đăng tin mới `/employer/job-postings/new`
4. [ ] Form fields: tiêu đề, mô tả, yêu cầu, phúc lợi, mức lương, ngành, vị trí, khu vực
5. [ ] Kiểm tra quota trước khi cho đăng (so với gói dịch vụ)
6. [ ] Submit tin → status PENDING → chờ admin duyệt
7. [ ] Build trang xem ứng viên đã apply vào từng tin
8. [ ] Tính năng ẩn/bật lại tin (PAUSED)

## Files to Create
- `src/app/(employer)/job-postings/page.tsx`
- `src/app/(employer)/job-postings/new/page.tsx`
- `src/app/(employer)/job-postings/[id]/page.tsx`
- `src/app/(employer)/job-postings/[id]/applicants/page.tsx`
- `src/components/employer/JobPostingForm.tsx`
- `src/components/employer/JobPostingList.tsx`
- `src/components/employer/ApplicantList.tsx`

## Test Criteria
- [ ] Tạo tin mới thành công, status = PENDING
- [ ] Không cho đăng khi hết quota
- [ ] Danh sách tin hiển thị đúng trạng thái
- [ ] Xem danh sách applicants hoạt động
- [ ] Pause/Resume tin hoạt động

---
Next Phase: phase-07-admin-moderation.md
