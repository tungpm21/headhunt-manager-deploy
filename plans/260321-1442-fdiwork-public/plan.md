# Plan: FDIWork Public Website
Created: 2026-03-21
Status: 🟡 Chờ Review

## Overview
Build public website cho FDIWork.com trong cùng project Headhunt Manager.
Thêm route groups `(public)` và `(employer)`, mở rộng database với 4 models mới.

## Tech Stack
- Framework: Next.js (App Router) — cùng CRM
- Database: PostgreSQL + Prisma — cùng CRM
- Styling: Tailwind CSS — cùng CRM
- Auth: NextAuth (thêm employer provider)
- Deploy: Vercel — cùng CRM

## Phases

| Phase | Name | Status | Tasks | Ước tính |
|:-----:|------|:------:|:-----:|:--------:|
| 01 | Database Schema | ✅ Complete | 5 | 1 session |
| 02 | Public Layout + Homepage | ✅ Complete | 8 | 1 session |
| 03 | Job Listing & Detail | ✅ Complete | 7 | 1 session |
| 04 | Company & Apply Form | ✅ Complete | 6 | 1 session |
| 05 | Employer Auth & Dashboard | ⬜ Pending | 10 | 2-3 sessions |
| 06 | Employer Job Management | ⬜ Pending | 8 | 1-2 sessions |
| 07 | Admin Moderation & Packages | ⬜ Pending | 7 | 1-2 sessions |
| 08 | CRM Integration | ⬜ Pending | 5 | 1 session |

**Tổng:** 56 tasks | Ước tính: ~10 sessions

## Quick Commands
- Bắt đầu Phase 1: `/code phase-01`
- Check tiến độ: `/next`
- Lưu context: `/save-brain`
