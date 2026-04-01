# Plan: CV Management & Preview Feature
Created: 260319-1124
Status: ✅ Complete (3/3 phases done)

## Overview
Tích hợp tính năng Quản lý và Xem trước CV (PDF/Word) trực tiếp trên trang Chi tiết Ứng viên theo giao diện Split-Screen (Chia đôi màn hình). Giúp Headhunter xem CV và nhập form cùng lúc mà không cần chuyển tab.

## Tech Stack
- Frontend: Next.js App Router (React 19), Tailwind CSS v4, Lucide React
- Backend: (Đã có sẵn API `/api/candidates/[id]/cv` & CSDL `cvFileUrl` từ Phase 03)

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Split-Screen UI & Setup | ✅ Complete | 100% |
| 02 | CV Viewer Implementation | ✅ Complete | 100% |
| 03 | Testing & Polish | ✅ Complete | 100% |

## Quick Commands
- Bắt đầu Phase 1: Gõ `/code phase-01`
- Kiểm tra tiến độ: Gõ `/next`
- Lưu lại context cuối ngày: Gõ `/save-brain`
