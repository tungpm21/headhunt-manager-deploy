# 🗂️ CRM Admin UX Improvement Plans

> **Dự án:** Headhunt Manager (FDIWork)
> **Mục tiêu:** Nâng cấp UI/UX trang Admin để tối ưu luồng công việc cho team HR/Headhunt
> **Tạo ngày:** 2026-04-02
> **Tổng effort ước tính:** 36-48h

---

## 📋 Thứ tự triển khai (đề xuất)

| # | Plan | Mô tả | Effort | Lý do ưu tiên |
|---|------|-------|--------|---------------|
| 01 | [Dark Mode & Responsive](01-darkmode-responsive.md) | Fix `bg-white` hardcoded, hamburger sidebar, responsive tables | 6-7h | **Quick win**: fix nền trắng lạc lõng khi dark mode, mobile usable. Không phụ thuộc feature nào khác |
| 02 | [Smart Dashboard](02-smart-dashboard.md) | Pipeline summary, deadline alerts, activity feed, KPI cards | 7-10h | **Nền tảng**: Dashboard là trang đầu tiên team nhìn mỗi ngày. Cải thiện ở đây = impact cảm nhận cao nhất |
| 03 | [Pipeline Upgrade](03-pipeline-upgrade.md) | Kanban board (drag-drop), quick stage actions, email templates | 9-12h | **Core workflow**: Đây là tính năng team HR dùng hàng giờ. Kanban + email template tiết kiệm nhiều thời gian |
| 04 | [Global Search & Notifications](04-global-search-notif.md) | Cmd+K search palette, notification bell, sidebar badges | 7-9h | **Productivity**: Tìm nhanh mọi thứ + không miss việc. Cần sidebar đã ổn (sau Plan 01) |
| 05 | [Candidate Bulk Actions](05-candidate-bulk-actions.md) | Checkbox, bulk assign/export/tag, quick view, duplicate detect | 7-10h | **Power feature**: Team cần nhiều data trước khi bulk actions có giá trị. Triển khai cuối khi đã có đủ UV |

---

## 🔗 Phụ thuộc giữa các Plan

```
01 Dark Mode ──→ (không phụ thuộc gì)
02 Dashboard  ──→ (không phụ thuộc gì, song song với 01 được)
03 Pipeline   ──→ cần npm install @dnd-kit
04 Search     ──→ cần npm install use-debounce + sidebar từ Plan 01
05 Bulk       ──→ (không phụ thuộc, nhưng nên có nhiều data test)
```

> **Có thể song song:** Plan 01 + Plan 02 (2 dev khác nhau, không chạm file chung)

---

## 📦 Dependencies cần cài

```bash
# Plan 03 (Pipeline)
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Plan 04 (Global Search)
npm install use-debounce
```

---

## 🗄️ Schema Changes

**KHÔNG CẦN** migration cho cả 5 plans. Tất cả sử dụng aggregation queries trên schema hiện có.

Ngoại lệ (tương lai): Plan 02 Phase 3 Option B — bảng `ActivityLog` nếu muốn audit trail đầy đủ.

---

## ✅ Verification sau mỗi Plan

Mỗi plan có verification checklist chi tiết. Sau khi hoàn thành mỗi plan:
1. `npm run build` phải pass
2. Chạy qua checklist trong plan
3. Browser test thủ công trên desktop + mobile (nếu Plan 01/05)
4. Commit với message format: `feat: [plan-name] phase [N] — [mô tả]`
