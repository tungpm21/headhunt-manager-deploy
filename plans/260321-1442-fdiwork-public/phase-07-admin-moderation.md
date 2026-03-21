# Phase 07: Admin Moderation & Package Management
Status: ⬜ Pending
Dependencies: Phase 06

## Objective
Thêm trang duyệt bài đăng và quản lý gói dịch vụ trong CRM dashboard.

## Implementation Steps
1. [ ] Thêm menu "FDIWork" vào sidebar CRM dashboard
2. [ ] Build trang duyệt bài đăng `/dashboard/moderation`
3. [ ] Danh sách tin chờ duyệt (PENDING) + preview nội dung
4. [ ] Nút Approve / Reject (+ input lý do từ chối)
5. [ ] Build trang quản lý Employer `/dashboard/employers`
6. [ ] Duyệt / khóa / mở khóa tài khoản employer
7. [ ] Build trang quản lý gói dịch vụ `/dashboard/packages`
8. [ ] Assign gói cho employer, theo dõi thanh toán (manual)

## Files to Create
- `src/app/(dashboard)/moderation/page.tsx`
- `src/app/(dashboard)/employers/page.tsx`
- `src/app/(dashboard)/packages/page.tsx`
- `src/components/moderation/ModerationList.tsx`
- `src/components/moderation/JobPostingPreview.tsx`
- `src/lib/moderation-actions.ts`

## Test Criteria
- [ ] Danh sách tin PENDING hiển thị đúng
- [ ] Approve → tin chuyển APPROVED, hiển thị trên web
- [ ] Reject → tin chuyển REJECTED, employer thấy lý do
- [ ] Quản lý employer: duyệt/khóa hoạt động
- [ ] Assign gói cho employer cập nhật quota

---
Next Phase: phase-08-crm-integration.md
