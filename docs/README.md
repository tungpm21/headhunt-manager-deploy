# 📚 Documentation Index — Headhunt Project

> **Hướng dẫn:** File này giúp AI và người đọc nhanh chóng tìm đúng tài liệu cần đọc.

---

## 📂 Cấu trúc thư mục

```
docs/
├── README.md              ← 📍 BẠN ĐANG Ở ĐÂY
│
├── crm/                   ← 🟢 CRM Headhunt Manager (ĐÃ HOÀN THÀNH MVP)
│   ├── BRIEF.md           # Brief ban đầu của dự án CRM
│   ├── DESIGN.md          # Thiết kế DB, API, Flows (tài liệu gốc)
│   ├── design-specs.md    # Design tokens: colors, typography, spacing
│   ├── mockups/           # Screenshots UI mockup (5 files PNG)
│   └── reports/           # Audit reports (3 files)
│
├── fdiwork/               ← 🟡 FDIWork Public Website (MVP IN PROGRESS)
│   ├── BRIEF_FDIWORK_REBUILD.md   # Brief tổng thể: ý tưởng, gói dịch vụ, features
│   ├── FDIWORK_WEBSITE_EVALUATION.md  # Đánh giá web hiện tại fdiwork.com
│   ├── SPECS.md           # Đặc tả kỹ thuật: architecture, DB schema, phases
│   ├── DESIGN_FDIWORK.md  # ⭐ Thiết kế chi tiết: DB, API, Auth, Screens, Tests
│   └── design-system/     # Design tokens cho FDIWork public pages
│
└── archive/               ← ⬜ Lưu trữ (không cần đọc)
    ├── BRIEF_CV_FEATURE.md        # Brief CV feature (đã implement xong)
    ├── ideas.md                   # Ý tưởng ban đầu (đã merge vào BRIEF)
    ├── ui_mockups.html            # HTML mockup cũ (đã có mockups PNG)
    ├── FDIWork - Database .md     # Spec database gốc ban đầu (đã implement)
    └── demo-fdiwork-config/       # Ảnh demo cấu hình FDIWork gốc

plans/                     ← 📋 TẤT CẢ implementation plans (tập trung)
├── 260315-1634-headhunt-mvp/        # ✅ CRM MVP (6/6 phases done)
├── 260317-1542-candidate-details/   # ✅ Candidate Details (6/6 phases done)
├── 260319-1124-cv-management/       # ✅ CV Management (3/3 phases done)
└── 260321-1442-fdiwork-public/      # 🟡 FDIWork Public (5/8 phases done)
```

---

## 🎯 Đọc tài liệu nào TRƯỚC?

### Nếu làm việc với **CRM** (dashboard, candidates, clients, jobs):
1. `crm/DESIGN.md` — Kiến trúc DB, API, flows
2. `crm/design-specs.md` — Design tokens (colors, spacing)
3. `crm/reports/review_audit_260319.md` — Tổng quan code + audit mới nhất

### Nếu làm việc với **FDIWork Web** (public website, employer portal):
1. `fdiwork/SPECS.md` — ⭐ **Đọc file này trước!** Architecture, DB models, phases
2. `fdiwork/BRIEF_FDIWORK_REBUILD.md` — Context business: gói dịch vụ, user flows
3. `fdiwork/DESIGN_FDIWORK.md` — Thiết kế chi tiết
4. `fdiwork/design-system/` — Design tokens cho public pages

### Plans (kế hoạch implementation):
- Tất cả plans nằm tại: `plans/` (root project)
- **Active plan:** `plans/260321-1442-fdiwork-public/` — 🟡 5/8 phases done

---

## 📊 Trạng thái tổng quan

| Dự án | Trạng thái | Tài liệu chính |
|-------|:----------:|----------------|
| **CRM Headhunt Manager** | ✅ MVP Done | `crm/DESIGN.md` |
| **FDIWork Public Website** | 🟡 MVP In Progress | `fdiwork/SPECS.md` |

### CRM — Tính năng đã hoàn thành:
- ✅ Auth (NextAuth v5, JWT)
- ✅ Dashboard (chart, thống kê)
- ✅ Quản lý Ứng viên (CRUD, search, filter, tags, notes, level, skills)
- ✅ Upload & Preview CV (split-screen, zoom, resize)
- ✅ Quản lý Khách hàng (CRUD, contacts, status badge)
- ✅ Job Orders (CRUD, pipeline ứng viên, đổi stage, interview tracking)
- ✅ Import Excel
- ✅ Schema Gap-Fill: CandidateSeniority, ClientStatus, JobPriority, SubmissionResult

### FDIWork — Tiến độ Phases:
- ✅ Phase 01: Database Schema (Employer, Subscription, JobPosting, Application)
- ✅ Phase 02: Public Layout + Homepage
- ✅ Phase 03: Job Listing & Detail
- ✅ Phase 04: Company & Apply Form
- ⬜ Phase 05: Employer Auth & Dashboard
- ⬜ Phase 06: Employer Job Management
- ⬜ Phase 07: Admin Moderation & Packages
- ✅ Phase 08: CRM Integration (Import CV)

### Post-MVP (Tính năng tương lai):
- ⬜ Email Template — Tự động gửi email khi thay đổi Pipeline Status
- ⬜ Drag-n-drop Pipeline — Hiện dùng select dropdown
- ⬜ Performance Optimization — Candidate table khi data lớn

---

*Cập nhật lần cuối: 2026-04-01*
