# Changelog

Mọi thay đổi đáng chú ý của dự án Headhunt Manager sẽ được ghi chép tại đây.

## [0.1.1] - 2026-04-27 — Accessibility Impeccable + Security Hardening

### Bảo mật (Security)
- **XSS fix**: Thay thế regex sanitizer thủ công trong trang blog bằng `isomorphic-dompurify` — loại bỏ các bypass vector như `onerror` không có khoảng trắng, URI `data:`, và các tag `<svg>`/`<form>`
- **Auth bypass fix**: Employer notifications API route không còn nuốt `NEXT_REDIRECT` — unauthenticated requests giờ được redirect đúng thay vì nhận JSON fallback `{total:0, items:[]}`
- **Focus ring scope fix**: Override `--color-primary` chuyển lên outer `<div>` trong public layout để `PublicHeader` focus rings cũng dùng FDI blue thay vì admin purple

### Truy cập (Accessibility — WCAG A/AA)
- **Skip link**: Thêm "Chuyển đến nội dung chính" link ẩn (sr-only) cho keyboard navigation
- **Touch targets**: Tất cả link/button public pages đảm bảo `min-h-11` (44px)
- **ARIA fixes**: `aria-label` trên search inputs, scroll buttons, carousel controls; xóa `role` không hợp lệ trên `<p>` và `<li>` elements
- **Heading structure**: Chuẩn hóa heading hierarchy trên homepage + trang chi tiết công việc/công ty
- **Pagination bug**: Số trang hiển thị đúng (không bị cộng dồn)
- **Prefers-reduced-motion**: CSS animation tắt khi user bật reduced motion
- **Focus ring tokens**: Dùng `var(--color-fdi-primary)` nhất quán thay vì màu Tailwind hardcoded
- **Vietnamese UTF-8**: Sửa các chuỗi thiếu dấu trong components

### Phụ thuộc (Dependencies)
- Thêm `isomorphic-dompurify ^3.10.0`

---

## [2026-04-04] - Diacritics Sweep + S3-10 Review

### Sửa lỗi (Fixed)
- **Quét dấu tiếng Việt**: Fix **37+ chuỗi thiếu dấu** trên 13 files (actions, API routes, components)
- **S3-10 BONUS Review**: Audit code quality cho BONUS 1-5 — tất cả logic sạch, chỉ lỗi dấu
- **TS Error Fix**: `deleteClientContact()` thiếu arg `clientId` (do S5 agent đổi signature)
- **Candidate Page**: Thêm Sort dropdown (6 options) + Skills autocomplete (`<datalist>` native)

---

## [2026-04-03] - Production Hardening + Sprint 3

### Bảo mật & Hạ tầng
- **JWT Hardening**: TTL 1 ngày, cookie httpOnly + sameSite strict
- **File Upload Security**: Magic byte validation cho ảnh + CV
- **Connection Pooling**: `DATABASE_POOLER_URL` cho Neon pooling mode
- **Sentry Integration**: Optional error tracking (NEXT_PUBLIC_SENTRY_DSN)

### UI/UX
- **Dark Mode**: CSS design tokens (`bg-surface`, `text-foreground`, etc.) toàn dashboard
- **Vietnamese UI**: Sửa dấu tiếng Việt trên Global Search, Dashboard, Client actions
- **PROJECT-TRACKER.md**: Khôi phục + cập nhật tiếng Việt có dấu đầy đủ

---

## [2026-04-02] - Admin Employer Management + BONUS Features

### Thêm mới (Added)
- **Admin Employer Mgmt (BONUS-6)**: 4 phases — FDIWork links, detail page, company editor, UX polish
- **BONUS-1 Smart Dashboard**: Pipeline Summary, Deadline Alerts, Activity Feed, Follow-up Reminders
- **BONUS-2 Pipeline Upgrade**: Optimistic updates, Email Template Modal, drag-to-stage
- **BONUS-3 Global Search**: Cmd+K palette, debounced search, keyboard navigation
- **BONUS-4 Bulk Actions**: Multi-select candidates, bulk assign job/tag
- **BONUS-5 Dark Mode + Responsive**: CSS tokens, responsive sidebar, mobile-friendly tables

---

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