# Phase 05: Employer Auth & Dashboard
Status: ⬜ Pending
Dependencies: Phase 04

## Objective
Hệ thống đăng ký/đăng nhập cho nhà tuyển dụng, dashboard riêng.

## Implementation Steps
1. [ ] Setup NextAuth với Employer provider (tách biệt CRM auth)
2. [ ] Build trang đăng ký `/employer/register`
3. [ ] Build trang đăng nhập `/employer/login`
4. [ ] Build employer layout với sidebar navigation
5. [ ] Build employer dashboard: tổng quan tin đăng, ứng viên mới, quota
6. [ ] Build trang quản lý profile công ty `/employer/company`
7. [ ] Form upload logo, mô tả, thông tin liên hệ
8. [ ] Build trang quản lý gói dịch vụ `/employer/subscription`
9. [ ] Hiển thị gói hiện tại, quota còn lại, ngày hết hạn
10.[ ] Middleware bảo vệ route employer (chỉ employer đã login)

## Files to Create
- `src/app/(employer)/layout.tsx`
- `src/app/(employer)/login/page.tsx`
- `src/app/(employer)/register/page.tsx`
- `src/app/(employer)/dashboard/page.tsx`
- `src/app/(employer)/company/page.tsx`
- `src/app/(employer)/subscription/page.tsx`
- `src/components/employer/EmployerSidebar.tsx`
- `src/components/employer/EmployerDashboard.tsx`
- `src/lib/employer-auth.ts`
- `src/lib/employer-actions.ts`

## Test Criteria
- [ ] Đăng ký tạo Employer trong database
- [ ] Đăng nhập hoạt động, session persist
- [ ] Dashboard hiển thị đúng số liệu
- [ ] Upload logo hoạt động
- [ ] Route protection: chưa login → redirect login

---
Next Phase: phase-06-employer-jobs.md
