# Phase 01: Database Schema
Status: ⬜ Pending
Dependencies: None

## Objective
Mở rộng Prisma schema để hỗ trợ Employer, Subscription, JobPosting, Application. Chạy migration.

## Implementation Steps
1. [ ] Thêm enums mới: EmployerStatus, JobPostingStatus, SubscriptionTier, SubscriptionStatus, ApplicationStatus
2. [ ] Thêm model Employer (tài khoản nhà tuyển dụng)
3. [ ] Thêm model Subscription (gói dịch vụ)
4. [ ] Thêm model JobPosting (tin tuyển dụng public)
5. [ ] Thêm model Application (ứng viên apply từ web)
6. [ ] Thêm relations mới vào Client, Candidate, JobOrder
7. [ ] Chạy `prisma migrate dev`
8. [ ] Seed data mẫu (2-3 employer, packages, sample jobs)

## Files to Create/Modify
- `prisma/schema.prisma` — Thêm models + enums
- `prisma/seed.ts` — Seed data mẫu (nếu chưa có)

## Test Criteria
- [ ] `prisma migrate dev` chạy không lỗi
- [ ] Prisma Studio hiển thị đúng các bảng mới
- [ ] Seed data tạo được employer + subscription + job postings

---
Next Phase: phase-02-public-layout.md
