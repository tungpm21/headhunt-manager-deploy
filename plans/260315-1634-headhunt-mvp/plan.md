# Plan: Headhunt Manager MVP
Created: 2026-03-15 16:34
Status: 🟡 Planning

## Overview
Web App quản lý hồ sơ ứng viên và quy trình headhunt cho team 4 người.
Thay thế Excel hiện tại bằng hệ thống tập trung, dễ tìm kiếm, dễ phối hợp.

## Tech Stack
- **Frontend:** Next.js 15 + React 19 + TailwindCSS
- **Backend:** Next.js API Routes (Server Actions)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (email/password)
- **File Storage:** Local disk (CV uploads)
- **Deploy:** Có thể chạy local hoặc deploy lên VPS

## Phases

| Phase | Name | Status | Mô tả |
|-------|------|--------|--------|
| 01 | Setup & Foundation | ⬜ Pending | Tạo project, cài đặt, cấu trúc folder |
| 02 | Database & Auth | ⬜ Pending | Thiết kế DB, tạo bảng, đăng nhập |
| 03 | Candidate Management | ⬜ Pending | CRUD ứng viên, tìm kiếm, lọc, ghi chú |
| 04 | Client Management | ⬜ Pending | CRUD doanh nghiệp, người liên hệ |
| 05 | Job Order Management | ⬜ Pending | Tạo job, gán ứng viên, trạng thái |
| 06 | Excel Import & Polish | ⬜ Pending | Import data Excel, hoàn thiện UX |

## Tổng quan tính năng MVP

### 👤 Ứng viên (Candidates)
- Tạo/sửa/xóa hồ sơ ứng viên
- Thông tin: tên, SĐT, email, vị trí, công ty, ngành, kinh nghiệm, mức lương
- Upload CV (PDF/Word)
- Gắn tags/nhãn (ngành, vị trí, khu vực...)
- Tìm kiếm & lọc nâng cao
- Ghi chú & lịch sử trao đổi
- Trạng thái: Available / Đã có việc / Đang interview / Blacklist
- Nguồn: LinkedIn, TopCV, giới thiệu...

### 🏢 Khách hàng - Doanh nghiệp (Clients)
- Tạo/sửa/xóa hồ sơ doanh nghiệp
- Thông tin: tên công ty, ngành, quy mô, địa chỉ
- Nhiều người liên hệ cho mỗi DN
- Ghi chú về văn hóa DN, yêu cầu đặc biệt

### 📋 Đơn hàng tuyển dụng (Job Orders)
- Tạo job order: vị trí, JD, mức lương, deadline
- Liên kết với doanh nghiệp
- Gán ứng viên vào job order
- Trạng thái: Đang tuyển / Tạm dừng / Đã tuyển / Hủy
- Phí dịch vụ

### 🔐 Team & Auth
- 4 tài khoản (mở rộng được)
- Đăng nhập email/password
- Biết ai thêm/sửa dữ liệu

### 📥 Import
- Import ứng viên từ file Excel hiện tại

## Quick Commands
- Thiết kế DB chi tiết: `/design`
- Xem UI mockup: `/visualize`
- Bắt đầu code: `/code phase-01`
- Xem tiến độ: `/next`
