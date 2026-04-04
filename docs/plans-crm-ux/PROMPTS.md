# 📝 Prompt Chỉ Đạo — CRM Admin UX Improvement

> Copy prompt dưới đây và gửi cho coder/AI để implement từng plan.
> Đổi số `[XX]` thành plan cần implement.

---

## 🟢 Prompt Template (dùng chung)

```
Đọc file plan tại docs/plans-crm-ux/[XX]-[tên-plan].md.

Triển khai TỪNG PHASE theo thứ tự trong plan. Mỗi phase:
1. Đọc kỹ yêu cầu + file paths (NEW/MODIFY) trong phase
2. Implement đúng theo code snippets và layout mockups
3. Sau mỗi phase: npm run build phải pass, không được skip
4. Commit riêng cho mỗi phase: feat: [tên-plan] phase [N] — [mô tả]

Quy tắc bắt buộc:
- Server actions phải có await requireAdmin() ở đầu
- Client components nhận serialized data (JSON.parse/stringify cho Date)
- Dùng design tokens (bg-surface, text-foreground, text-muted) — KHÔNG bg-white
- Error messages trả về { success: false, message: "..." } — không throw
- Icons dùng Lucide React
- UI text tiếng Việt có dấu

Sau khi xong TẤT CẢ phases: chạy verification checklist cuối plan.
```

---

## 📋 Prompt cụ thể cho từng Plan

### Plan 01 — Dark Mode & Responsive (Quick Win — Làm đầu tiên)

```
Đọc file docs/plans-crm-ux/01-darkmode-responsive.md và implement full 5 phases:

Phase 1: Thay tất cả bg-white hardcoded → bg-surface trong 5 file (jobs, clients, dashboard).
  grep -rn "bg-white" src/app/(dashboard)/ để verify.

Phase 2: Tạo components/mobile-sidebar.tsx — hamburger menu cho mobile.
  Mount vào (dashboard)/layout.tsx.

Phase 3: Thêm min-w-[800px] cho tables + ẩn cột ít quan trọng với hidden lg:table-cell.

Phase 4: Check tất cả forms responsive: grid-cols-1 default, sm:grid-cols-2.

Phase 5: Điều chỉnh padding main content cho mobile (p-4, pt-14 cho hamburger space).

Build + test dark mode toggle + resize browser xuống 375px.
```

---

### Plan 02 — Smart Dashboard

```
Đọc file docs/plans-crm-ux/02-smart-dashboard.md và implement full 5 phases:

Phase 1: Tạo components/dashboard/pipeline-summary.tsx
  Query: prisma.jobCandidate.groupBy by stage (where job OPEN).
  Bar chart ngang với STAGE_COLOR_MAP. Click stage → filter.

Phase 2: Tạo components/dashboard/deadline-alerts.tsx
  Query: jobs deadline ≤ 7 ngày + subscriptions endDate ≤ 14 ngày.
  Badge 🔴 ≤2 ngày, 🟡 ≤5 ngày, 🟠 ≤14 ngày.

Phase 3: Tạo components/dashboard/activity-feed.tsx
  Dùng Option A (aggregate từ 3 nguồn: candidate, application, jobCandidate).
  Merge + sort by timestamp.

Phase 4: Thêm KPI row: Placements, Fill Rate, Avg Fill Time.

Phase 5: Reorganize layout dashboard theo grid mockup trong plan.

Build + verify dashboard hiện đủ widgets.
```

---

### Plan 03 — Pipeline & Job Order Upgrade

```
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

Đọc file docs/plans-crm-ux/03-pipeline-upgrade.md và implement full 5 phases:

Phase 1: Thay bg-white → bg-surface trong jobs pages (đã ghi rõ line numbers).

Phase 2: Tạo components/jobs/pipeline-kanban.tsx
  Dùng @dnd-kit: mỗi cột = 1 stage, card = 1 ứng viên.
  Drop card sang cột khác → gọi updateCandidateStageAction.
  Thêm view toggle (List | Kanban) lưu localStorage.

Phase 3: Thêm "Next Stage →" button + reject/withdraw shortcuts vào job-pipeline.tsx.

Phase 4: Tạo lib/email-templates.ts + components/jobs/email-template-modal.tsx.
  Modal hiện khi chuyển stage CONTACTED/INTERVIEW/OFFERED/REJECTED.
  Nút: Copy | Mở Mail Client | Bỏ qua.

Phase 5: Tạo components/jobs/job-info-card.tsx — read-only view + nút Edit toggle sang JobForm.

Build + test drag-drop pipeline + email template modal.
```

---

### Plan 04 — Global Search & Notifications

```
npm install use-debounce

Đọc file docs/plans-crm-ux/04-global-search-notif.md và implement full 4 phases:

Phase 1: Tạo lib/global-search.ts (server action) + components/global-search.tsx (client).
  Cmd+K / Ctrl+K mở modal.
  Search 4 nguồn: candidates, clients, jobs, employers (parallel queries).
  Keyboard: ↑↓ navigate, Enter → navigate, ESC close.
  Debounce 300ms, min 2 chars.

Phase 2: Tạo lib/notifications.ts (getNotificationCounts) + components/notification-bell.tsx.
  Count: NEW applications, PENDING jobs, PENDING employers, expiring jobs.
  Bell badge + dropdown với 4 categories.

Phase 3: Sửa components/sidebar.tsx — thêm badge count cho Bài đăng, Applications, NTD.
  Data từ getNotificationCounts() truyền qua props.

Phase 4: Thêm search trigger button ở dashboard header: [🔍 Tìm kiếm... ⌘K].

Build + test Cmd+K search + bell notification.
```

---

### Plan 05 — Candidate Bulk Actions

```
Đọc file docs/plans-crm-ux/05-candidate-bulk-actions.md và implement full 4 phases:

Phase 1: Tạo wrapper client component cho CandidateTable.
  Thêm checkbox select all / từng row.
  State: Set<number> selectedIds.

Phase 2: Tạo components/candidates/bulk-action-bar.tsx (floating, sticky).
  3 actions:
  A. Bulk assign → modal chọn job → bulkAssignToJob() (skip duplicates)
  B. Export CSV (client-side Blob, UTF-8 BOM cho Excel VN)
  C. Bulk tag → modal chọn tag → createMany skipDuplicates

Phase 3: Tạo components/candidates/candidate-quick-view.tsx.
  Expandable row (pattern giống ApplicationTable).
  3 cột: info, skills/languages, CVs.
  Thêm cvs + languages vào getCandidates select.

Phase 4: Tạo checkDuplicate() trong lib/candidates.ts.
  Candidate form: onBlur email/phone → cảnh báo trùng.

Build + test bulk select → assign + export CSV mở trên Excel.
```

---

## 🔄 Sau mỗi Plan hoàn thành

```
1. npm run build (phải pass)
2. Chạy verification checklist trong plan
3. git add . && git commit -m "feat: plan-[XX] complete — [tóm tắt]"
4. git push origin master
```
