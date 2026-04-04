# CRM UX Implementation Walkthrough

> Ngày cập nhật: 2026-04-03  
> Scope: `docs/plans-crm-ux/*`  
> Trạng thái: Hoàn thành toàn bộ 5 plan + 1 commit ổn định hóa verification flow

---

## 1. Kết luận nhanh

Không còn hạng mục nào dang dở trong scope mà user yêu cầu:

- Đã implement hết các phase trong 5 plan CRM UX.
- Mỗi phase đã được commit riêng đúng thứ tự.
- `npm run build` đang pass ở trạng thái code hiện tại.
- Verification checklist đã được chạy theo từng cụm tính năng chính.

Những việc **chưa làm** nhưng nằm ngoài scope chính:

- Chưa `git push origin master`.
- Vẫn còn một số thay đổi bẩn/untracked trong worktree từ trước, không thuộc đợt này.
- Fixture verification trong Neon dev DB vẫn tồn tại, nhưng đã được reset về trạng thái trung tính `SOURCED/PENDING`.

---

## 2. Những gì đã triển khai

### Plan 01 — Dark Mode & Responsive

- Chuẩn hóa surface tokens trên dashboard/job/client UI.
- Thêm mobile sidebar và luồng đóng/mở trên mobile.
- Cải thiện responsive tables.
- Sửa layout form mobile theo `grid-cols-1` mặc định.
- Tinh chỉnh spacing/padding cho màn hình nhỏ.

### Plan 02 — Smart Dashboard

- Thêm pipeline summary widget.
- Thêm deadline alerts widget.
- Thêm activity feed widget.
- Thêm KPI row: placements, fill rate, avg fill time.
- Re-layout dashboard theo mockup.

### Plan 03 — Pipeline & Job Order Upgrade

- Chuẩn hóa surface tokens cho job pages.
- Thêm kanban pipeline bằng `@dnd-kit`.
- Thêm quick actions cho pipeline list view.
- Thêm email template modal cho các stage cần follow-up.
- Refactor job detail panel sang job info card + edit toggle.

### Plan 04 — Global Search & Notifications

- Thêm command palette search `Cmd+K / Ctrl+K`.
- Thêm notification bell + dropdown.
- Thêm badge counts ở sidebar.
- Thêm search trigger ở dashboard header.

### Plan 05 — Candidate Bulk Actions

- Thêm chọn nhiều ứng viên bằng checkbox.
- Thêm bulk action bar.
- Thêm quick view cho candidate row.
- Thêm duplicate detection khi tạo ứng viên.

### Commit bổ sung sau verification

- `2ae0c61` `fix: stabilize crm verification flows`

Mục đích:

- Sửa login server action để local auth flow hoạt động ổn định hơn khi test.
- Ổn định email modal flow trong `pipeline-view-switcher` bằng cơ chế queue qua `sessionStorage`.

---

## 3. Commit Ledger

### Darkmode / Responsive

- `b15cb2b` `feat: darkmode-responsive phase 1 — migrate dashboard surface tokens`
- `6eb0ffc` `feat: darkmode-responsive phase 2 — add mobile sidebar navigation`
- `e171d16` `feat: darkmode-responsive phase 3 — improve responsive data tables`
- `d35c5f8` `feat: darkmode-responsive phase 4 — refine mobile form layouts`
- `8d9995b` `feat: darkmode-responsive phase 5 — polish mobile content spacing`

### Smart Dashboard

- `41c2223` `feat: smart-dashboard phase 1 — add pipeline summary widget`
- `8150ff6` `feat: smart-dashboard phase 2 — add deadline alerts widget`
- `a6795f0` `feat: smart-dashboard phase 3 — add activity feed widget`
- `9d56abc` `feat: smart-dashboard phase 4 — add recruitment KPI row`
- `46f9ac9` `feat: smart-dashboard phase 5 — reorganize dashboard layout`

### Pipeline Upgrade

- `7adf28b` `feat: pipeline-upgrade phase 1 — verify job pages use surface tokens`
- `4130c36` `feat: pipeline-upgrade phase 2 — add kanban pipeline view`
- `81827b2` `feat: pipeline-upgrade phase 3 — add quick pipeline actions`
- `abbd901` `feat: pipeline-upgrade phase 4 — add pipeline email templates`
- `74b72de` `feat: pipeline-upgrade phase 5 — redesign job info panel`

### Global Search / Notifications

- `a5a1969` `feat: global-search-notif phase 1 — add command palette search`
- `0278e63` `feat: global-search-notif phase 2 — add notification bell`
- `1637c30` `feat: global-search-notif phase 3 — add sidebar notification badges`
- `670d8e7` `feat: global-search-notif phase 4 — add header search trigger`

### Candidate Bulk Actions

- `dfac7e6` `feat: candidate-bulk-actions phase 1 — add candidate selection checkboxes`
- `8931de5` `feat: candidate-bulk-actions phase 2 — add bulk action bar`
- `d3ba01e` `feat: candidate-bulk-actions phase 3 — add candidate quick view`
- `496f310` `feat: candidate-bulk-actions phase 4 — add duplicate candidate detection`

### Verification Stabilization

- `2ae0c61` `fix: stabilize crm verification flows`

---

## 4. Verification Ledger

### Build

- `npm run build` pass ở trạng thái code hiện tại vào ngày 2026-04-03.

### Checklist đã xác nhận

- Dark mode và responsive layout hoạt động đúng ở dashboard flow chính.
- Command palette search trả về đủ `candidate + client + job + employer`.
- Keyboard navigation trong search hoạt động.
- Notification bell + sidebar badges hoạt động đúng với fixture dev hiện tại.
- Bulk actions hoạt động: select, clear, export CSV BOM, assign job, quick view.
- Duplicate warning khi tạo candidate hoạt động.
- Pipeline list view:
  - quick action chuyển stage hoạt động,
  - email modal hiện đúng,
  - copy/mailto flow hoạt động.
- Pipeline kanban:
  - drag/drop update stage thành công,
  - email modal hiện đúng khi thao tác drag trong viewport phù hợp,
  - view toggle persist qua `localStorage`.

### Ghi chú quan trọng về automation

- Kanban board có `overflow-x-auto`, nên browser automation phải scroll ngang trước khi drag.
- Nếu không scroll đúng, `dnd-kit` có thể coi thao tác là drop lại vào card gốc hoặc cột khác.
- Đây là lưu ý cho script verify, không phải blocker của UI thật.

### Ghi chú về auth verification

- Login headless có thể bị dính rate limit nếu spam nhiều lần trong thời gian ngắn.
- Khi verify liên tục, nên tái sử dụng `auth-state.json` thay vì login mới mỗi lần.

---

## 5. File / Component đáng chú ý

### Final stabilization fix

- `src/components/jobs/pipeline-view-switcher.tsx`
- `src/lib/actions.ts`

### Khối pipeline

- `src/components/jobs/pipeline-kanban.tsx`
- `src/components/jobs/job-pipeline.tsx`
- `src/components/jobs/email-template-modal.tsx`
- `src/lib/email-templates.ts`
- `src/lib/job-actions.ts`

### Khối search / notifications

- `src/lib/global-search.ts`
- `src/components/global-search.tsx`
- `src/lib/notifications.ts`
- `src/components/notification-bell.tsx`

### Khối bulk candidate actions

- `src/components/candidates/candidate-table.tsx`
- `src/components/candidates/bulk-action-bar.tsx`
- `src/components/candidates/candidate-quick-view.tsx`
- `src/lib/candidate-actions.ts`
- `src/lib/candidate-export.ts`

---

## 6. Trạng thái môi trường dev tại thời điểm chốt

### Verification fixture trong DB

Đã dùng các record prefix:

- `ZZ VERIFY 20260403 Samsung Client`
- `ZZ VERIFY 20260403 Samsung Candidate`
- `ZZ VERIFY 20260403 Samsung Job`

Trạng thái hiện tại sau khi reset:

- chỉ giữ 1 candidate verify gắn với 1 verify job,
- `stage = SOURCED`,
- `result = PENDING`,
- `interviewDate = null`.

### Artifact local

Các artifact phục vụ verification vẫn còn trong `.tmp/`, ví dụ:

- `.tmp/verification-runner.js`
- `.tmp/verification-artifacts/verification-report.json`
- `.tmp/verification-artifacts/auth-state.json`
- `.tmp/verification-artifacts/verify-candidates.csv`

Giữ lại để trace audit; có thể xóa nếu muốn dọn workspace.

---

## 7. Worktree còn bẩn nhưng không thuộc scope này

Tại thời điểm chốt, repo vẫn có các thay đổi không phải do đợt CRM UX này và không bị revert:

- `.brain/session.json`
- `.brain/session_log.txt`
- `src/app/(dashboard)/employers/link-employer-form.tsx`
- `src/app/(dashboard)/moderation/applications/application-table.tsx`
- `src/app/(dashboard)/moderation/page.tsx`
- `src/proxy.ts`
- `docs/plans-crm-ux/`
- `src/app/(dashboard)/employers/[id]/`
- `docs/audit/`
- `.tmp/`

Nếu cần audit code change sạch tuyệt đối, nên tách đợt CRM UX này sang branch riêng hoặc squash/cherry-pick theo commit list ở mục 3.

---

## 8. Kết luận handoff

Nếu tiếp tục từ đây, thứ tự an toàn là:

1. Đọc file này.
2. Nếu cần verify lại nhanh, dùng `auth-state.json` sẵn có thay vì login mới.
3. Nếu cần verify pipeline drag, nhớ scroll ngang kanban trước khi kéo.
4. Nếu chuẩn bị release, việc còn lại chủ yếu là dọn artifact, review worktree bẩn, rồi push.

Scope CRM UX theo `docs/plans-crm-ux` được xem là hoàn tất.
