# 📊 BÁO CÁO TỔNG QUAN DỰ ÁN — Headhunt Manager
> Ngày review: 2026-04-03 | Người review: Antigravity Project Analyst

---

## 🎯 App này làm gì?

**Headhunt Manager** là hệ thống CRM nội bộ cho công ty headhunting FDI, kết hợp với trang công việc công khai **FDIWork**. Hệ thống giúp recruiter quản lý ứng viên, khách hàng doanh nghiệp, đơn hàng tuyển dụng và pipeline phỏng vấn — đồng thời cho phép employer đăng tin tuyển dụng và ứng viên nộp CV trực tuyến.

---

## 🛠️ Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16.2.2 (App Router) |
| UI | React 19 + TailwindCSS v4 + Lucide React |
| Database | PostgreSQL (Neon) via Prisma ORM 7.6 |
| Auth | NextAuth v5 (CRM) + Custom JWT jose (Employer) |
| File Storage | Vercel Blob + local fallback |
| Error Tracking | Sentry (optional via SENTRY_DSN) |
| Rate Limiting | Upstash Redis |
| Deploy target | Vercel + Neon |

---

## 📁 Cấu trúc chính

```
src/
├── app/
│   ├── (auth)/         → Trang đăng nhập CRM
│   ├── (dashboard)/    → CRM nội bộ (candidates, clients, jobs, employers, dashboard)
│   ├── (employer)/     → Employer portal (đăng tin, xem ứng tuyển)
│   ├── (public)/       → FDIWork public (viec-lam, cong-ty, ung-tuyen)
│   └── api/            → REST endpoints (upload CV, avatar, public apply)
├── lib/                → Server actions + data layer
├── components/         → UI components theo domain
└── types/              → TypeScript types + Prisma enums
```

---

## 📍 Trạng thái hiện tại — Session gần nhất (2026-04-02)

- ✅ **Admin Employer Management** — Hoàn thành toàn bộ 4 phases:
  - Phase 1: Quick links FDIWork ↔ CRM
  - Phase 2: Employer detail page `/employers/[id]` (3 tabs: Job Postings, Subscription, Info)
  - Phase 3: Company editor `/employers/[id]/edit` với logo upload + updateEmployerInfo action
  - Phase 4: UX polish — Link Client dời vào Info tab, slim employers list
- ✅ **Build**: 32/32 pages, 0 TypeScript errors
- ✅ **Seed data**: Fixed mojibake encoding — 22 job postings + 2 applications clean

---

## 📊 Tiến độ Sprint

| Sprint | Tổng | Xong | Còn lại | Trạng thái |
|---|---|---|---|---|
| Sprint 1 — Audit Fixes (Tier 1-3) | 14 | 14 | 0 | ✅ Done |
| Sprint 2 — UX Recruiter | 5 | 5 | 0 | ✅ Done |
| Bonus — Agent Features | 5 | 5 | 0 | ✅ Done (chưa review đầy đủ) |
| **Sprint 3 — Production Deploy** | **10** | **7** | **3** | **🔄 Đang làm** |
| Sprint 4 — Real Users | 5 | 0 | 5 | ⏳ Chưa bắt đầu |
| Sprint 5 — Scale + Backlog | 14 | 0 | 14 | ⏳ Chưa bắt đầu |
| Sprint 6 — Growth | 5 | 0 | 5 | ⏳ Chưa bắt đầu |

### Sprint 3 — 3 tasks còn lại

| # | Task | Ghi chú |
|---|---|---|
| S3-8 | Deploy Vercel + Neon + domain | PM task |
| S3-9 | Seed/import data thật từ Excel/CSV | PM task |
| S3-10 | Review + cleanup BONUS features | Verify code quality trước deploy |

---

## ✅ Điểm mạnh

1. **Security hardened**: Rate limiting (Upstash), magic bytes validation, JWT TTL giảm xuống 1 ngày, IDOR fix avatar upload, enum cast an toàn
2. **Error tracking**: Sentry tích hợp optional — không crash khi chưa có DSN
3. **Build luôn xanh**: 100% builds pass từ Sprint 1 đến nay (28+ verified builds)
4. **Architecture rõ ràng**: Server actions → data layer tách biệt, không Prisma trực tiếp trong actions (đang refactor dần)
5. **Dark mode**: CSS design tokens (`bg-surface`, `text-foreground`) thay hardcoded classes
6. **FDIWork ↔ CRM integration**: Import CV, Link Employer ↔ Client hoạt động

---

## ⚠️ Vấn đề cần xử lý

| Vấn đề | Mức độ | Kế hoạch |
|---|---|---|
| 5 BONUS features chưa PM review code quality | 🟡 Trung bình | S3-10 trước deploy |
| Notification system chưa có | 🔴 Cao | Sprint 5-6 tùy business need |
| Prisma trực tiếp trong một số actions | 🟡 Trung bình | S5-13 (refactor backlog) |
| `getAllClients` chưa có pagination (khi >200) | 🟢 Thấp | S5-12 |
| SSL warning `sslmode=verify-full` chưa set | 🟢 Thấp | Pending task |
| Zod validation chưa toàn bộ | 🟢 Thấp | S5-3 |

---

## 🚀 Bước tiếp theo đề xuất

1. **[NGAY]** `S3-10` — Review code BONUS features (Smart Dashboard, Pipeline, Global Search, Bulk Actions, Dark Mode)
2. **[NGAY]** `S3-8` — Deploy Vercel + Neon (PM cần cấu hình domain + env vars)
3. **[SAU DEPLOY]** `S3-9` — Import data thật từ Excel
4. **[SAU DEPLOY]** Sprint 4 — Onboard recruiter nội bộ để lấy feedback thực tế

---

> 📋 File tracker đầy đủ: [PROJECT-TRACKER.md](./PROJECT-TRACKER.md)
> 📁 Audit docs: [docs/audit/README.md](./audit/README.md)
