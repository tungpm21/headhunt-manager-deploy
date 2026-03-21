# HANDOVER DOCUMENT
Ngày: 2026-03-21 15:20

## 📍 Đang làm: FDIWork Public Website
## 🔢 Phase: 01/08 - Database Schema ✅ DONE

## ✅ ĐÃ XONG:
- Brainstorm + đánh giá web cũ fdiwork.com
- Tạo SPECS.md (đặc tả kỹ thuật)
- Tạo DESIGN_FDIWORK.md (thiết kế chi tiết: DB, API, Auth, Screens, Tests)
- Sắp xếp docs/ (crm/ + fdiwork/ + archive/)
- Plan 8 phases trong plans/260321-1442-fdiwork-public/
- Phase 01: Database Schema ✅
  - 5 enums mới + 4 models mới (Employer, Subscription, JobPosting, Application)
  - Migration init_with_fdiwork applied
  - Seed: 3 employers, 2 subscriptions, 5 job postings
- Design system generated (Poppins + Open Sans, Professional Blue)

## ⏳ CÒN LẠI:
- Phase 02: Public Layout + Homepage
- Phase 03: Job Listing & Detail
- Phase 04: Company & Apply Form
- Phase 05: Employer Auth & Dashboard
- Phase 06: Employer Job Management
- Phase 07: Admin Moderation & Packages
- Phase 08: CRM Integration (Import CV)

## 🔧 QUYẾT ĐỊNH QUAN TRỌNG:
- Employer Auth = Custom JWT cookie (không dùng NextAuth thứ 2)
- FDIWork color = Teal #0D9488 (CRM giữ Indigo)
- Subscription 1:1 với Employer (MVP đơn giản)
- Database reset rồi migrate fresh (dev DB)

## ⚠️ LƯU Ý CHO SESSION SAU:
- Prisma one-to-one cần @unique trên FK
- Named relation cần cho Client-Employer ("EmployerClient")
- Chạy `prisma generate` sau mỗi schema change trước khi seed
- Design system: design-system/fdiwork/MASTER.md

## 📁 FILES QUAN TRỌNG:
- docs/fdiwork/DESIGN_FDIWORK.md (thiết kế chính)
- docs/fdiwork/SPECS.md (đặc tả)
- plans/260321-1442-fdiwork-public/plan.md (tiến độ)
- prisma/schema.prisma (schema hiện tại)
- design-system/fdiwork/MASTER.md (design tokens)
- .brain/brain.json + session.json (context)

## 🔑 LOGIN INFO:
- CRM: admin@headhunt.com / headhunt123
- Employer: hr@samsung-vn.com / employer123
