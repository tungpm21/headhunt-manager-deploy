# Plan: Trang Chi tiết Ứng viên (Candidate Details)
Created: 2026-03-17 15:42
Status: 🟡 In Progress

## Overview
Xây dựng trang xem và chỉnh sửa thông tin chi tiết của một ứng viên `/candidates/[id]`. Đây là trung tâm quản lý ứng viên, cho phép xem lịch sử làm việc (Note), các tags, Job đang được gán, CV, và cập nhật trạng thái làm việc.

## Màn hình Layout
- **Header:** Tên ứng viên, Trạng thái (Pill), Nút "Sửa", Nút "Xóa"
- **Cột trái (Main Info):** 
  - Thẻ thông tin cơ bản (Avatar, SĐT, Email, Khu vực)
  - Box Nghề nghiệp (Công ty, Vị trí, Lương, Ngành)
  - Quản lý Tags
- **Cột phải (Activity & CV):** 
  - Tabs: [Ghi chú (Notes) | CV & Files | Trạng thái Jobs]
  - Form thêm Ghi chú / Timeline các ghi chú cũ

## Tech Stack
- Frontend: Next.js App Router (`app/(dashboard)/candidates/[id]/page.tsx`), TailwindCSS, Lucide Icons, React Hook Form.
- Backend: Server Actions (viết trong `src/lib/actions.ts`), Prisma ORM.

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Setup Layout & Load Data | ⬜ Pending | 0% |
| 02 | Basic Info View | ⬜ Pending | 0% |
| 03 | Tags Management | ⬜ Pending | 0% |
| 04 | Notes System (Timeline) | ⬜ Pending | 0% |
| 05 | Edit Form (Modal hoặc Inline) | ⬜ Pending | 0% |
| 06 | Delete & Status Logic | ⬜ Pending | 0% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
