# Changelog

Mọi thay đổi đáng chú ý của dự án Headhunt Manager sẽ được ghi chép tại đây.

## [2026-04-01] - Project Review & AI Docs System

### Docs & Infra
- **CODEBASE.md**: Bản đồ toàn bộ source code (90+ files, 60+ server actions)
- **ARCHITECTURE.md**: System overview (auth, DB schema, data flow, conventions)
- **Workspace Rules**: `.agent/rules/headhunt-rules.md` — code conventions, DB rules, docs maintenance
- **Auto-gen Script**: `scripts/gen-codebase-map.ts` — tự động generate CODEBASE.md
- **Project Reorganization**: Dọn root, gộp plans, archive file cũ, cập nhật docs trạng thái

---

## [2026-03-31] - Schema Gap-Fill (Option A)

### Database
- **4 Enums mới**: `CandidateSeniority`, `ClientStatus`, `JobPriority`, `SubmissionResult`
- **9 Fields mới** trên Candidate (seniority, skills, gender), Client (status), JobOrder (priority), JobCandidate (result, interviewDate, notes)

### UI Updates
- Filter candidates thêm level/skills
- Client form có trường Status (Active/Inactive/Blacklisted)
- Job Pipeline: inline expandable panel cho interview tracking

---

## [2026-03-21] - FDIWork Public Website (Phases 01-04, 08)

### Thêm mới (Added)
- **Phase 01 - Database**: 4 models mới (Employer, Subscription, JobPosting, Application) + 5 enums
- **Phase 02 - Public Layout**: Homepage FDIWork (Hero, FeaturedJobs, TopEmployers, IndustryGrid)
- **Phase 03 - Job Listing**: /viec-lam (filter, sort, pagination) + /viec-lam/[slug] detail
- **Phase 04 - Company & Apply**: /cong-ty listing + profile, /ung-tuyen form CV upload
- **Phase 08 - CRM Integration**: Import CV từ FDIWork → CRM, Link Employer ↔ Client
- **Demo Data**: 8 employers + 22 realistic jobs seeded

### Quyết định
- Build cùng project CRM, dùng route groups tách biệt
- Vietnamese slugs: /viec-lam, /cong-ty, /ung-tuyen
- CRM dashboard route đổi sang /dashboard

---

## [2026-03-19] - Hoàn thiện MVP CRM (v1.0.0)

### Hạ tầng (Infrastructure)
- **Vercel Deployment**: Triển khai production trên Vercel
- **Vercel Blob Storage**: Chuyển file storage từ local → Cloud

### Thêm mới (Added)
- **Module Job Orders**: Pipeline SOURCED → PLACED
- **Import Excel**: Nạp hàng loạt ứng viên từ file .xlsx
- **Dashboard**: Widget thống kê nhanh
- Modal tìm kiếm và gán nhanh ứng viên

### Sửa lỗi (Fixed)
- Prisma import thiếu `createdBy`
- Enum Status đồng bộ toàn hệ thống
- UI padding/margin

---

## [2026-03-18] - Candidate & Client Management

### Thêm mới (Added)
- Module Ứng viên: Bảng danh sách, Card lưới, Form thêm
- Module Doanh nghiệp: CRUD Client + Contacts
- NextAuth.JS v5 cho Edge Runtime
- Database Schema trên PostgreSQL